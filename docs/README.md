# Game Trade-off Stimulation

## Tài liệu

- [Feature 1: Game shell](features/game-shell.md)
- [Feature 2: System model state](features/system-model.md)
- [Feature 3: Deterministic simulation engine](features/simulation-engine.md)
- [Feature 4: Metrics and explanations UI](features/metrics-and-explanations.md)
- [Feature 5: Simulation playback and campaign persistence](features/simulation-playback.md)
- [Feature 7: Campaign map](features/campaign-map.md)

## Trạng thái

Repository dùng React + TypeScript + Vite. MVP hiện có game shell responsive, campaign map cho **Cứu shop trước giờ flash sale** với Database overload playable và các level sau locked/coming soon, system model state tái sử dụng được, simulation engine deterministic và UI tích hợp cho workload, architecture actions, purposeful playback animation, run/step/pause/reset, metrics trước/sau, explanations và validated localStorage persistence cho campaign configuration. Feature 7 chỉ hiển thị tiến trình “In progress” khi cấu hình Feature 5 đã được lưu; completion persistence và nội dung level sau vẫn deferred.

## Lệnh phát triển

```bash
npm install
npm run dev
npm test
npm run build
```

Feature 8 adds local completion persistence for the playable Database overload level. Completion requires a zero-error after-state; future levels remain locked.
