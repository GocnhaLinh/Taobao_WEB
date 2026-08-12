export type Product = { id: string; name: string; brand: string; category: string; price: number; oldPrice?: number; rating: number; reviews: number; colors: string[]; sizes: string[]; image: string; description: string }
export const products: Product[] = [
  { id: 'linen-set', name: 'Bộ ga gối Linen Mây', brand: 'Góc Nhà Linh', category: 'Phòng ngủ', price: 890000, oldPrice: 1090000, rating: 4.9, reviews: 128, colors: ['Kem', 'Hồng phấn'], sizes: ['160x200', '180x200'], image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=900&q=80', description: 'Bộ ga gối linen mềm mát, tạo cảm giác thư thái cho phòng ngủ.' },
  { id: 'ceramic-cup', name: 'Cốc gốm Men Sữa', brand: 'Nhà Gốm', category: 'Bếp & bàn ăn', price: 185000, rating: 4.8, reviews: 86, colors: ['Trắng kem', 'Hồng đất'], sizes: ['350ml'], image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=900&q=80', description: 'Cốc gốm thủ công với lớp men mịn, phù hợp cho cà phê và trà mỗi sáng.' },
  { id: 'scented-candle', name: 'Nến thơm Gỗ Tuyết Tùng', brand: 'Linh Scent', category: 'Nến & hương', price: 320000, rating: 4.7, reviews: 54, colors: ['Nâu gỗ'], sizes: ['180g'], image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=900&q=80', description: 'Hương tuyết tùng ấm áp, giúp căn phòng trở nên dịu dàng hơn.' },
  { id: 'rattan-basket', name: 'Giỏ mây đan thủ công', brand: 'Mây Việt', category: 'Trang trí', price: 420000, oldPrice: 490000, rating: 4.6, reviews: 41, colors: ['Tự nhiên'], sizes: ['M', 'L'], image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=900&q=80', description: 'Chiếc giỏ mây đa năng cho góc phòng, bàn làm việc hoặc phòng tắm.' },
  { id: 'table-lamp', name: 'Đèn bàn Ánh Sương', brand: 'Luma Home', category: 'Trang trí', price: 690000, rating: 4.9, reviews: 73, colors: ['Kem', 'Đen'], sizes: ['Tiêu chuẩn'], image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900&q=80', description: 'Đèn bàn ánh sáng vàng ấm với thiết kế tối giản, thanh lịch.' },
  { id: 'cotton-throw', name: 'Chăn cotton Kẻ Nhỏ', brand: 'Góc Nhà Linh', category: 'Phòng ngủ', price: 590000, rating: 4.8, reviews: 62, colors: ['Hồng', 'Xanh nhạt'], sizes: ['130x170'], image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2a2?w=900&q=80', description: 'Chăn cotton nhẹ và thoáng, điểm nhấn xinh xắn cho sofa hoặc giường ngủ.' },
]
export const categories = ['Tất cả', 'Phòng ngủ', 'Bếp & bàn ăn', 'Nến & hương', 'Trang trí']
export const brands = ['Góc Nhà Linh', 'Nhà Gốm', 'Linh Scent', 'Mây Việt', 'Luma Home']
export const user = { name: 'Nguyễn Minh Anh', email: 'minhanh@example.com', phone: '0901 234 567' }
export const addresses = [
  { id: 'a1', label: 'Nhà riêng', name: 'Nguyễn Minh Anh', phone: '0901 234 567', detail: '25 Nguyễn Trãi, Thanh Xuân, Hà Nội', isDefault: true },
  { id: 'a2', label: 'Văn phòng', name: 'Nguyễn Minh Anh', phone: '0901 234 567', detail: 'Tầng 8, 72 Láng Hạ, Đống Đa, Hà Nội', isDefault: false },
]
export const orders = [
  { id: '#GLN-240812', date: '12/08/2026', status: 'Đang giao', total: 1085000, items: ['Bộ ga gối Linen Mây', 'Nến thơm Gỗ Tuyết Tùng'] },
  { id: '#GLN-240730', date: '30/07/2026', status: 'Đã giao', total: 605000, items: ['Cốc gốm Men Sữa', 'Giỏ mây đan thủ công'] },
  { id: '#GLN-240618', date: '18/06/2026', status: 'Đã hủy', total: 890000, items: ['Bộ ga gối Linen Mây'] },
]
export const money = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
export const stars = (rating: number) => '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating))
