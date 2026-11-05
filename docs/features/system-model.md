# Feature 2 — System model state

## Mục tiêu và phạm vi

Tách topology và trạng thái màn chơi khỏi React để UI hiện tại và simulation engine trong tương lai có thể dùng chung một nguồn dữ liệu. Feature này quản lý:

- Ba node ban đầu: Client, App Server và Primary Database.
- Hai connection có hướng: Client → App Server → Primary Database.
- Node đang được chọn, mặc định là App Server.
- Khởi tạo, chọn node và reset về trạng thái ban đầu.

Không triển khai rule scale-up, replica, sharding, tính điểm, tick mô phỏng hay persistence.

## Thiết kế

`src/game/system-model.ts` là public seam của model:

- `initialSystemConfiguration`: baseline readonly và được đóng băng.
- `createInitialSystemState()`: tạo graph mới từ baseline.
- `selectNode(state, nodeId)`: trả state mới với node được chọn.
- `resetSystemState(state)`: trả graph mới ở trạng thái ban đầu.
- `systemStateReducer(state, action)`: adapter cho React, hỗ trợ `select-node` và `reset`.

Node chứa metadata hiển thị và metric `requestsPerSecond`; connection tham chiếu node bằng `sourceId`/`targetId`. State và các object/array con được đóng băng để tránh mutation ngoài ý muốn. Mỗi lần khởi tạo/reset tạo node và connection mới, không chia sẻ reference mutable với baseline.

## Tích hợp UI

`GameShell` dùng reducer của model thay cho state giữ nguyên object node. Diagram lấy nodes/connections từ `SystemState`; detail panel tìm node qua `selectedNodeId`. Nút **Reset system model** trên toolbar đưa selection và topology về baseline.

## Tiêu chí và kiểm tra

- Initial model có đúng ba node, hai connection và chọn App Server.
- Chọn node trả state mới và cập nhật detail panel.
- Reset trả về initial state bằng graph mới.
- Baseline/state được đóng băng; các lần khởi tạo không chia sẻ node reference.

```bash
npm test
npm run build
```

Test chính:

- `src/game/system-model.test.ts`: hành vi public của model.
- `src/ui/GameShell.test.tsx`: tích hợp selection/reset với UI.

## Trạng thái và giới hạn

Feature 2 hoàn tất ở mức state model dùng lại được. Các topology mutation và quy tắc simulation phải được triển khai trong feature riêng.
