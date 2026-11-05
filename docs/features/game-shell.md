# Feature 1 — Game shell

## Mục tiêu và phạm vi

Khung giao diện responsive cho campaign **Cứu shop trước giờ flash sale**: status bar, objective panel, action toolbar, sơ đồ Client/App Server/Primary Database, simulation controls và component detail. Dữ liệu level nằm riêng trong `src/game/level.ts` để UI có thể thay level sau này.

Chưa triển khai simulation engine, hành động thay đổi kiến trúc, persistence, routing hay backend.

## Quyết định và giả định

- Dựng nền tảng tối thiểu Vite + React + TypeScript vì repository ban đầu chỉ có commit rỗng.
- Mô hình ban đầu gồm ba node và hai connection trực quan; App Server là node được chọn mặc định.
- Click node chỉ đổi detail panel; nút play/pause chỉ biểu đạt trạng thái UI, chưa chạy mô phỏng.
- Màu trạng thái đi cùng text và icon/nhãn, các node là button để hỗ trợ bàn phím.
- Breakpoint 850px/560px chuyển layout sang panel xếp dọc, phù hợp màn hình nhỏ.

## Tiêu chí hoàn thành

- Shell hiển thị đầy đủ các vùng UI và campaign data.
- Chọn node cập nhật detail; toggle simulation có accessible name và đổi trạng thái.
- Responsive layout, tương phản nền tối, focus/click target cơ bản.
- Test UI và production build pass.

## File chính và kiểm tra

- `src/ui/GameShell.tsx`, `src/ui/styles.css`: shell và presentation.
- `src/game/level.ts`: dữ liệu màn chơi.
- `src/ui/GameShell.test.tsx`: các seam UI chính.

```bash
npm install
npm test
npm run build
```

## Trạng thái / việc còn thiếu

Feature 1 hoàn tất ở mức shell MVP. Cần feature riêng cho simulation engine, rule/action model, persistence, accessibility audit bằng trình đọc màn hình và visual regression.
