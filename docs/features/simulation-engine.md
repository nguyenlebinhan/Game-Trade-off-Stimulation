# Feature 3 — Deterministic simulation engine

## Mục tiêu và phạm vi

Feature 3 cung cấp engine TypeScript thuần, không phụ thuộc React:

```ts
simulateScenario(configuration: ScenarioConfiguration): SimulationResult
```

Input gồm request rate, read ratio, capacity read/write của database, capacity scale-up, số read replica, số shard và phân bố traffic giữa các shard. Output immutable gồm metrics trước/sau, tải theo node, queue/error, events, cost/complexity, giải thích nhanh/kỹ thuật, assumptions và limitations.

Feature này không thay đổi UI. Input controls, animation, run/step/pause và hiển thị metrics thuộc feature tích hợp riêng.

## Quy tắc mô phỏng

### Baseline

`before` luôn mô phỏng một primary, chưa scale-up, chưa replica và chưa shard. Read/write load được tính từ `requestsPerSecond × readRatio` và phần còn lại là writes.

### Scale up

`scaleUpCapacity` được cộng vào read/write capacity của mỗi database node. Cost unit tăng theo tổng capacity bổ sung chia 500.

### Read replica

- Reads được chia đều cho primary và các read replica trong cùng shard.
- Writes chỉ đi vào primary; replica không giải quyết write bottleneck.
- Replication lag ước tính: `40ms + write load / total primary write capacity × 120ms`.
- Stale-read rate tăng theo lag và read ratio, tối đa 20%.

### Sharding

- `even` chia traffic bằng nhau giữa các shard.
- Mảng distribution phải có đúng `shardCount` phần tử, không âm và tổng bằng 1.
- Một shard là hot shard nếu nhận nhiều hơn 125% phần tải đều lý tưởng.
- Sharding tăng cost và complexity; event nhắc rõ cross-shard query/transaction cần coordination.

### Queue, error và latency

- Node queue/error bằng phần read hoặc write load vượt capacity tương ứng.
- Summary cộng queue/error của tất cả node; served rps bằng request rate trừ error rps.
- Latency là chỉ báo deterministic dựa trên utilization và error rate, không phải queueing benchmark.

## Interface chính

- `ScenarioConfiguration`: input readonly và được validate.
- `SimulationResult.before` / `after`: snapshot so sánh baseline với kiến trúc được cấu hình.
- `NodeLoad`: read/write load, capacity, utilization, queue và errors theo primary/replica.
- `SimulationEvent`: event có code, severity và message ổn định.
- `quickExplanation` và `technicalExplanation`: giải thích dành cho hai mức độ đọc.

Engine clone input vào result và đóng băng sâu output; không mutate hoặc freeze object input. Cùng input luôn tạo result deep-equal.

## Tiêu chí và kiểm tra

Các case trong `src/game/simulation-engine.test.ts`:

- Low load không tạo queue/error.
- Baseline overload tạo metrics và event chính xác.
- Read-heavy workload hưởng lợi từ replica, đồng thời có lag/stale-read risk.
- Write-heavy workload không được replica giải quyết.
- Even sharding phân tải đều và tăng complexity.
- Hot shard vẫn overload dù aggregate capacity đủ.
- Scale-up cộng đúng capacity/cost.
- Deterministic và immutable.

```bash
npm test
npm run build
```

## Assumptions và limitations

- Requests độc lập; distribution đã đại diện cho routing/key skew.
- Capacity là rps cố định, không tự thay đổi theo thời gian.
- Replica eventual-consistent và chỉ phục vụ reads.
- Network, cache, failover, lock contention, transaction coordination và storage growth được giản lược.
- Kết quả dùng cho học trade-off kiến trúc, không dùng làm sizing hoặc benchmark production.

## Trạng thái

Feature 3 hoàn tất ở mức engine và tests/docs. Chưa tích hợp input/metrics/explanations vào game shell.
