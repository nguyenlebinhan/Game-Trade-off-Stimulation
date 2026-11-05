export const flashSaleLevel = {
  campaign: 'Cứu shop trước giờ flash sale',
  mission: 'Ổn định hệ thống trước khi traffic tăng đột biến.',
  timeRemaining: '18:42',
  progress: 28,
  tasks: ['Đọc sơ đồ hệ thống hiện tại', 'Tìm nút thắt cổ chai', 'Chọn action đầu tiên'],
}

export const campaignLevels = [
  { id: 'database-overload', number: 1, title: 'Database overload', status: 'playable' as const, description: 'Find the bottleneck before the flash sale starts.' },
  { id: 'cache-storm', number: 2, title: 'Cache storm', status: 'locked' as const, description: 'Coming soon' },
  { id: 'queue-backlog', number: 3, title: 'Queue backlog', status: 'locked' as const, description: 'Coming soon' },
]
