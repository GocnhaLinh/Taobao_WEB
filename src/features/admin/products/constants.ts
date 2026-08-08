export const getProductTabOptions = (activeCount: number, deletedCount: number) => [
  {
    id: 'ACTIVE',
    label: 'Đang hoạt động',
    count: activeCount,
  },
  {
    id: 'DELETED',
    label: 'Thùng rác',
    count: deletedCount,
  },
];
