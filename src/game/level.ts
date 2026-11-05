export type SystemNode = { id: string; label: string; kind: string; status: string; detail: string }

export const flashSaleLevel = {
  campaign: 'Cứu shop trước giờ flash sale',
  mission: 'Ổn định hệ thống trước khi traffic tăng đột biến.',
  timeRemaining: '18:42',
  progress: 28,
  nodes: [
    { id: 'client', label: 'Client', kind: 'Traffic entry', status: 'healthy', detail: 'Web & mobile shoppers' },
    { id: 'app-server', label: 'App Server', kind: 'Compute', status: 'warning', detail: 'CPU đang tăng nhanh' },
    { id: 'database', label: 'Primary Database', kind: 'Storage', status: 'critical', detail: 'Connection pool gần đầy' },
  ] satisfies SystemNode[],
  tasks: ['Đọc sơ đồ hệ thống hiện tại', 'Tìm nút thắt cổ chai', 'Chọn action đầu tiên'],
}
