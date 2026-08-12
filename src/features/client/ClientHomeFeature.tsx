import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronRight,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  Truck,
} from 'lucide-react';
import logoImg from '../../assets/logo.jpg';

const categories = [
  { name: 'Thời trang nữ', count: '128 sản phẩm', tone: 'bg-[#fde8f1]', icon: '✦' },
  { name: 'Đồ gia dụng', count: '86 sản phẩm', tone: 'bg-[#f7e9f8]', icon: '⌂' },
  { name: 'Làm đẹp', count: '64 sản phẩm', tone: 'bg-[#fcebdc]', icon: '✿' },
  { name: 'Phụ kiện', count: '42 sản phẩm', tone: 'bg-[#e9f1f8]', icon: '◇' },
];

const products = [
  {
    name: 'Áo sơ mi linen cổ bèo',
    category: 'Thời trang nữ',
    price: '289.000đ',
    oldPrice: '349.000đ',
    badge: 'Bán chạy',
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'Nến thơm hoa mẫu đơn',
    category: 'Đồ gia dụng',
    price: '179.000đ',
    oldPrice: '',
    badge: 'Mới về',
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'Túi cói thủ công mùa hè',
    category: 'Phụ kiện',
    price: '325.000đ',
    oldPrice: '399.000đ',
    badge: 'Giảm 18%',
    image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'Bộ chăm sóc da dịu nhẹ',
    category: 'Làm đẹp',
    price: '459.000đ',
    oldPrice: '',
    badge: 'Được yêu thích',
    image: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=900&q=85',
  },
];

export const ClientHomeFeature: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#fff8fb] text-[#581333]">
      <div className="bg-[#831843] px-4 py-2 text-center text-xs font-semibold tracking-wide text-white">
        Miễn phí vận chuyển cho đơn hàng từ 399.000đ · Tặng quà cho 100 đơn đầu tiên
      </div>

      <header className="sticky top-0 z-20 border-b border-[#f6d4e4] bg-[#fff8fb]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-5 px-5 py-4 lg:px-8">
          <button className="rounded-xl p-2 text-[#831843] hover:bg-[#fce7f3] lg:hidden" aria-label="Mở menu">
            <Menu />
          </button>
          <Link to="/shop" className="flex shrink-0 items-center gap-3">
            <img src={logoImg} alt="Góc Nhà Linh" className="size-11 rounded-2xl object-cover shadow-md shadow-pink-200" />
            <span className="font-wedding pt-1 text-3xl leading-none text-[#831843]">Góc Nhà Linh</span>
          </Link>
          <nav className="ml-8 hidden items-center gap-7 text-sm font-semibold text-[#9d174d] lg:flex">
            <a href="#home" className="text-[#db2777]">Trang chủ</a>
            <a href="#categories" className="hover:text-[#db2777]">Danh mục</a>
            <a href="#products" className="hover:text-[#db2777]">Sản phẩm mới</a>
            <a href="#story" className="hover:text-[#db2777]">Câu chuyện nhà Linh</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button className="hidden items-center gap-2 rounded-full border border-[#f3c5da] bg-white px-4 py-2 text-sm text-[#be185d] sm:flex" aria-label="Tìm kiếm">
              <Search className="size-4" />
              <span>Tìm kiếm sản phẩm</span>
            </button>
            <button className="rounded-full p-2.5 text-[#831843] hover:bg-[#fce7f3]" aria-label="Yêu thích"><Heart className="size-5" /></button>
            <button className="relative rounded-full bg-[#ec4899] p-2.5 text-white shadow-lg shadow-pink-300/40" aria-label="Giỏ hàng"><ShoppingBag className="size-5" /><span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-[#831843] text-[10px] font-bold">2</span></button>
          </div>
        </div>
      </header>

      <main>
        <section id="home" className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-12 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pb-24 lg:pt-20">
          <div className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#fce7f3] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#be185d]"><Sparkles className="size-4" /> Chọn điều xinh xắn cho riêng mình</div>
            <h1 className="font-wedding text-7xl leading-[0.9] text-[#831843] sm:text-8xl">Một góc nhỏ,<br /><span className="text-[#ec4899]">nhiều yêu thương.</span></h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-[#9d174d]">Những món đồ được chọn bằng sự tinh tế — từ căn nhà nhỏ của Linh đến không gian sống và phong cách của bạn.</p>
            <div className="mt-8 flex flex-wrap items-center gap-4"><a href="#products" className="inline-flex items-center gap-2 rounded-2xl bg-[#ec4899] px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-pink-300/40 transition hover:-translate-y-0.5 hover:bg-[#db2777]">Khám phá ngay <ArrowRight className="size-4" /></a><a href="#story" className="text-sm font-bold text-[#9d174d] underline decoration-[#f3a8c7] underline-offset-8">Xem câu chuyện của Linh</a></div>
            <div className="mt-10 flex items-center gap-8 border-t border-[#f5d5e3] pt-6 text-xs text-[#be185d]"><div><strong className="block text-xl text-[#831843]">2.4k+</strong> khách hàng yêu thích</div><div><strong className="block text-xl text-[#831843]">4.9/5</strong> đánh giá tích cực</div></div>
          </div>
          <div className="relative mx-auto w-full max-w-[560px]">
            <div className="absolute -inset-5 rounded-[3rem] bg-[#fce7f3] blur-2xl" />
            <div className="relative overflow-hidden rounded-[2.5rem] border-8 border-white bg-[#f4d8e5] shadow-2xl shadow-[#be185d]/15"><img src="https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1200&q=90" alt="Không gian sống ấm áp của Góc Nhà Linh" className="aspect-[4/4.5] w-full object-cover" /><div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-2xl bg-white/90 p-4 backdrop-blur-md"><div><p className="text-xs font-semibold text-[#be185d]">Bộ sưu tập tháng 8</p><p className="mt-1 font-bold text-[#831843]">Nhà xinh, lòng cũng xinh</p></div><span className="grid size-10 place-items-center rounded-xl bg-[#fce7f3] text-[#db2777]"><ArrowRight className="size-4" /></span></div></div>
          </div>
        </section>

        <section id="categories" className="border-y border-[#f6d4e4] bg-white/60 py-14"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="mb-8 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#db2777]">Khám phá theo nhu cầu</p><h2 className="mt-2 text-2xl font-black text-[#831843]">Tìm một điều hợp với bạn</h2></div><a href="#products" className="hidden items-center gap-1 text-sm font-bold text-[#be185d] sm:flex">Xem tất cả <ChevronRight className="size-4" /></a></div><div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">{categories.map((category) => <a key={category.name} href="#products" className={`${category.tone} group rounded-3xl p-5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-100`}><span className="grid size-12 place-items-center rounded-2xl bg-white/70 text-2xl text-[#db2777]">{category.icon}</span><h3 className="mt-8 font-bold text-[#831843]">{category.name}</h3><p className="mt-1 text-xs text-[#be185d]">{category.count}</p><ArrowRight className="mt-4 size-4 text-[#db2777] transition group-hover:translate-x-1" /></a>)}</div></div></section>

        <section id="products" className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><div className="mb-8 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#db2777]">Được chọn nhiều nhất</p><h2 className="mt-2 text-3xl font-black text-[#831843]">Những món xinh đang chờ bạn</h2></div><a href="#products" className="hidden items-center gap-1 text-sm font-bold text-[#be185d] sm:flex">Tất cả sản phẩm <ChevronRight className="size-4" /></a></div><div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-6">{products.map((product) => <article key={product.name} className="group"><div className="relative overflow-hidden rounded-3xl bg-[#fce7f3]"><img src={product.image} alt={product.name} className="aspect-[.86] w-full object-cover transition duration-500 group-hover:scale-105" /><span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-[#be185d]">{product.badge}</span><button className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 text-[#831843] opacity-0 transition group-hover:opacity-100" aria-label={`Thêm ${product.name} vào yêu thích`}><Heart className="size-4" /></button></div><p className="mt-4 text-xs font-semibold text-[#be185d]">{product.category}</p><h3 className="mt-1 text-sm font-bold text-[#831843]">{product.name}</h3><div className="mt-2 flex items-center gap-2"><span className="font-black text-[#db2777]">{product.price}</span>{product.oldPrice && <del className="text-xs text-[#d49ab6]">{product.oldPrice}</del>}</div></article>)}</div></section>

        <section id="story" className="bg-[#831843] px-5 py-14 text-white lg:px-8"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-center"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f9a8d4]">Mua sắm nhẹ nhàng hơn</p><h2 className="mt-3 max-w-xl text-3xl font-black leading-tight">Mỗi đơn hàng đều được gói ghém như một món quà nhỏ.</h2></div><div className="flex shrink-0 items-center gap-3 rounded-2xl bg-white/10 px-5 py-4"><Truck className="size-6 text-[#f9a8d4]" /><div><p className="text-sm font-bold">Giao hàng tận nơi</p><p className="mt-1 text-xs text-pink-100">Đóng gói cẩn thận, giao nhanh 2–4 ngày</p></div></div></div></section>
      </main>

      <footer className="bg-[#fff8fb] px-5 py-10 lg:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-6 border-b border-[#f6d4e4] pb-8 md:flex-row md:items-center md:justify-between"><div className="flex items-center gap-3"><img src={logoImg} alt="Góc Nhà Linh" className="size-10 rounded-xl object-cover" /><span className="font-wedding pt-1 text-3xl text-[#831843]">Góc Nhà Linh</span></div><p className="max-w-md text-sm leading-6 text-[#be185d]">Một nơi nhỏ để bạn tìm thấy những điều đẹp đẽ, hữu ích và vừa vặn với cuộc sống của mình.</p><div className="flex gap-5 text-sm font-semibold text-[#9d174d]"><a href="#home">Chính sách</a><a href="#home">Liên hệ</a><a href="#home">Instagram</a></div></div><p className="mx-auto max-w-7xl pt-6 text-xs text-[#d49ab6]">© 2026 Góc Nhà Linh. Made with care.</p></footer>
    </div>
  );
};
