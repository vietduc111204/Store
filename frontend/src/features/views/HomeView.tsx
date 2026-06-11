import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { Category, Product } from "@/types/customer";
import { ProductCard } from "../components/ProductCard";
import { SectionTitle } from "../components/SectionTitle";

const categoryVisuals = [
  {
    match: ["camera", "an ninh", "security"],
    image: "/smart%20home.avif",
    description: "Camera thông minh giúp giám sát nhà cửa rõ nét, cảnh báo nhanh và an tâm hơn mỗi ngày.",
  },
  {
    match: ["cảm biến", "cam bien", "sensor", "khói", "khoi", "gas"],
    image: "/smart%20sensor.avif",
    description: "Cảm biến cửa, chuyển động, khói và khí gas giúp tự động hóa nhà ở và phát hiện rủi ro kịp thời.",
  },
  {
    match: ["chiếu sáng", "chieu sang", "đèn", "den", "led", "light"],
    image: "/lamp.avif",
    description: "Đèn và công tắc thông minh cho phép điều chỉnh ánh sáng, màu sắc và ngữ cảnh chỉ bằng một chạm.",
  },
  {
    match: ["điều khiển", "dieu khien", "trung tâm", "trung tam", "hub", "ổ cắm", "o cam", "rèm", "rem"],
    image: "/circuit.avif",
    description: "Bộ điều khiển trung tâm, ổ cắm và rèm tự động kết nối các thiết bị thành một hệ sinh thái liền mạch.",
  },
  {
    match: ["khóa", "khoa", "chuông cửa", "chuong cua", "door", "lock"],
    image: "/smart%20lock.avif",
    description: "Khóa cửa và chuông cửa thông minh tăng bảo mật, quản lý ra vào linh hoạt và tiện lợi hơn.",
  },
  {
    match: ["gia dụng", "gia dung", "robot", "lọc không khí", "loc khong khi", "appliance"],
    image: "/vacuum%20cleaner.avif",
    description: "Thiết bị gia dụng thông minh hỗ trợ dọn dẹp, lọc không khí và chăm sóc không gian sống tự động.",
  },
  {
    match: ["âm thanh", "am thanh", "giải trí", "giai tri", "loa", "speaker", "màn hình", "man hinh"],
    image: "/speaker.avif",
    description: "Loa, màn hình và thiết bị giải trí thông minh giúp điều khiển bằng giọng nói và kết nối cả gia đình.",
  },
  {
    match: ["mạng", "mang", "kết nối", "ket noi", "wifi", "router", "zigbee"],
    image: "/wifi.avif",
    description: "Router, mesh WiFi và thiết bị mở rộng sóng giữ kết nối ổn định cho toàn bộ hệ thống smarthome.",
  },
];

const defaultCategoryVisual = {
  image: "/default%20visual.avif",
  description: "Thiết bị smarthome được chọn lọc kỹ, dễ lắp đặt và phù hợp cho nhiều không gian sống.",
};

const heroSlides = [
  {
    alt: "Smart home living room",
    cta: "Xem sản phẩm giảm giá",
    description: "Nâng tầm cuộc sống với hệ sinh thái thiết bị thông minh, an toàn và dễ điều khiển cho mọi không gian.",
    eyebrow: "Khuyến mãi mùa hè - giảm đến 40%",
    href: "/san-pham?discount=1",
    image: "/home.avif",
    title: "SmartHome",
  },
  {
    alt: "Smart security camera",
    cta: "Xem camera an ninh",
    description: "Theo dõi nhà cửa rõ nét, nhận cảnh báo nhanh và kiểm soát an ninh ngay trên điện thoại.",
    eyebrow: "An ninh thông minh",
    href: "/san-pham?q=camera",
    image: "/smart%20home.avif",
    title: "Camera bảo vệ 24/7",
  },
  {
    alt: "Smart lighting",
    cta: "Xem đèn thông minh",
    description: "Tạo ngữ cảnh ánh sáng phù hợp cho làm việc, thư giãn và sinh hoạt gia đình chỉ bằng một chạm.",
    eyebrow: "Chiếu sáng thông minh",
    href: "/san-pham?q=LED",
    image: "/lamp.avif",
    title: "Không gian sáng theo ý bạn",
  },
  {
    alt: "Smart cleaning robot",
    cta: "Xem thiết bị gia dụng",
    description: "Tự động hóa việc dọn dẹp, lọc không khí và chăm sóc căn nhà với các thiết bị gia dụng thông minh.",
    eyebrow: "Gia dụng tự động",
    href: "/san-pham?q=robot",
    image: "/vacuum%20cleaner.avif",
    title: "Nhà sạch hơn, rảnh tay hơn",
  },
];

const getCategoryVisual = (categoryName: string) => {
  const normalized = categoryName.toLowerCase();
  return categoryVisuals.find((visual) => visual.match.some((keyword) => normalized.includes(keyword))) || defaultCategoryVisual;
};

export const HomeView = ({ categories, onAdd, products }: { categories: Category[]; onAdd: (product: Product) => void; products: Product[] }) => {
  const [heroIndex, setHeroIndex] = useState(0);
  const featured = products.slice(0, 4);
  const hero = heroSlides[heroIndex];
  const categoryProducts = categories.slice(0, 5).map((category, index) => ({
    category,
    product: products.find((item) => item.maDanhMuc === category.maDanhMuc) || products[index],
  }));
  const showPreviousHero = () => setHeroIndex((current) => (current - 1 + heroSlides.length) % heroSlides.length);
  const showNextHero = () => setHeroIndex((current) => (current + 1) % heroSlides.length);

  useEffect(() => {
    const timer = window.setInterval(showNextHero, 5000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="relative min-h-[430px] overflow-hidden rounded-2xl bg-slate-950">
          <Link className="group block min-h-[430px]" to={hero.href}>
            {heroSlides.map((slide, index) => (
              <img
                alt={slide.alt}
                className={
                  index === heroIndex
                    ? "absolute inset-0 h-full w-full object-cover opacity-65 transition-all duration-1000 ease-in-out group-hover:scale-105"
                    : "absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-1000 ease-in-out group-hover:scale-105"
                }
                key={slide.href}
                src={slide.image}
              />
            ))}
            <div className="relative flex max-w-2xl flex-col justify-center px-8 py-20 text-white transition-opacity duration-700 sm:px-12">
              <span className="mb-5 w-fit rounded-full bg-[#0879a8] px-4 py-2 text-xs font-black uppercase">{hero.eyebrow}</span>
              <h1 className="text-4xl font-black leading-tight sm:text-6xl">{hero.title}</h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-white/90">{hero.description}</p>
              <div className="mt-8 flex flex-wrap gap-4">
                <span className="rounded-lg bg-white/15 px-6 py-3 font-bold text-white ring-1 ring-white/30">{hero.cta}</span>
              </div>
            </div>
          </Link>
          <button
            className="absolute left-4 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur hover:bg-white/25"
            onClick={showPreviousHero}
            type="button"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            className="absolute right-4 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur hover:bg-white/25"
            onClick={showNextHero}
            type="button"
          >
            <ChevronRight size={22} />
          </button>
          <div className="absolute bottom-5 left-8 flex gap-2 sm:left-12">
            {heroSlides.map((slide, index) => (
              <button
                aria-label={`Chuyển tới banner ${index + 1}: ${slide.title}`}
                className={index === heroIndex ? "h-2.5 w-8 rounded-full bg-white" : "size-2.5 rounded-full bg-white/45 hover:bg-white/75"}
                key={slide.href}
                onClick={() => setHeroIndex(index)}
                type="button"
              />
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <SectionTitle eyebrow="Danh mục nổi bật" title="Sản phẩm phù hợp cho từng phong cách" link="/san-pham" />
        <div className="grid gap-6 md:grid-cols-3">
          {categoryProducts.map(({ category, product }, index) => {
            const visual = getCategoryVisual(category.tenDanhMuc);

            return (
            <Link className={index === 0 ? "group relative min-h-[280px] overflow-hidden rounded-lg md:col-span-2" : "group relative min-h-[280px] overflow-hidden rounded-lg"} key={category.maDanhMuc} to="/san-pham">
              <img alt={category.tenDanhMuc} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" src={product?.anh || visual.image} />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 to-slate-950/10" />
              <div className="absolute bottom-0 max-w-sm p-8 text-white">
                <h3 className="text-2xl font-black">{category.tenDanhMuc}</h3>
                <p className="mt-3 text-sm leading-6 text-white/85">{visual.description}</p>
                <span className="mt-5 inline-flex rounded-full bg-white p-3 text-[#075f83]"><ArrowRight size={18} /></span>
              </div>
            </Link>
            );
          })}
        </div>
      </section>
      <section className="bg-[#eef4ff] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle eyebrow="Mới nhất tháng 10" title="Sản phẩm mới ra mắt" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product, index) => <ProductCard compact index={index} key={product.maSanPham} onAdd={onAdd} product={product} />)}
          </div>
        </div>
      </section>
    </>
  );
};


