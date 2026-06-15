import { BadgeCheck, Minus, ShieldCheck, Star, Truck } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import api from "@/libs/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import type { CustomerOrder, CustomerOrderDetail, Product } from "@/types/customer";
import { discountPercent, fallbackImages, finalPrice, formatMoney, productImage, productPromotionDateText } from "../utils";
import { EmptyState } from "../components/EmptyState";
import { ProductCard } from "../components/ProductCard";
import { SectionTitle } from "../components/SectionTitle";
import { AiAdvisor } from "../components/AiAdvisor";

type ProductSpec = {
  label: string;
  value: string;
};

type ProductReview = {
  accountKey?: string;
  author: string;
  comment: string;
  date: string;
  rating: number;
};

const CUSTOMER_REVIEWS_KEY = "smarthome-product-reviews";

const readCustomerReviews = (productId: number): ProductReview[] => {
  try {
    const raw = window.localStorage.getItem(CUSTOMER_REVIEWS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return Array.isArray(parsed[productId]) ? parsed[productId].filter((review: ProductReview) => review.accountKey) : [];
  } catch {
    return [];
  }
};

const writeCustomerReviews = (productId: number, reviews: ProductReview[]) => {
  try {
    const raw = window.localStorage.getItem(CUSTOMER_REVIEWS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    window.localStorage.setItem(CUSTOMER_REVIEWS_KEY, JSON.stringify({ ...parsed, [productId]: reviews }));
  } catch {
    // Local reviews are optional; ignore storage failures.
  }
};

const formatSoldCount = (value?: number | null) => {
  const count = Number(value) || 0;
  if (count >= 1000) return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}k`;
  return String(count);
};

const productSpecs: Record<number, ProductSpec[]> = {
  1: [
    { label: "Độ phân giải", value: "2K QHD" },
    { label: "Kết nối", value: "Wi-Fi 2.4GHz / LAN" },
    { label: "Chống nước", value: "IP66" },
    { label: "Tầm nhìn đêm", value: "Hồng ngoại 20m" },
  ],
  2: [
    { label: "Góc quay", value: "Xoay 360 độ" },
    { label: "Độ phân giải", value: "Full HD 1080p" },
    { label: "Tính năng AI", value: "Phát hiện chuyển động" },
    { label: "Lưu trữ", value: "Thẻ nhớ / Cloud" },
  ],
  3: [
    { label: "Chuẩn kết nối", value: "Zigbee 3.0" },
    { label: "Pin", value: "CR2032" },
    { label: "Khoảng cách nhận tín hiệu", value: "Tối đa 30m" },
    { label: "Cảnh báo", value: "Mở cửa / đóng cửa" },
  ],
  4: [
    { label: "Cảm biến", value: "Hồng ngoại PIR" },
    { label: "Góc quét", value: "120 độ" },
    { label: "Khoảng cách phát hiện", value: "Tối đa 7m" },
    { label: "Kết nối", value: "Zigbee" },
  ],
  5: [
    { label: "Công suất", value: "9W" },
    { label: "Màu sắc", value: "RGB + trắng ấm/lạnh" },
    { label: "Kết nối", value: "Wi-Fi 2.4GHz" },
    { label: "Điều khiển", value: "App / giọng nói" },
  ],
  6: [
    { label: "Số nút", value: "3 nút cảm ứng" },
    { label: "Nguồn điện", value: "220V AC" },
    { label: "Kết nối", value: "Wi-Fi" },
    { label: "Mặt kính", value: "Cường lực chống xước" },
  ],
  7: [
    { label: "Giao thức", value: "Zigbee / Matter" },
    { label: "Nguồn điện", value: "USB Type-C" },
    { label: "Số thiết bị hỗ trợ", value: "Tối đa 128 thiết bị" },
    { label: "Điều khiển", value: "App SmartHome" },
  ],
  8: [
    { label: "Công suất tải", value: "Tối đa 2500W" },
    { label: "Đo điện năng", value: "Có" },
    { label: "Kết nối", value: "Wi-Fi 2.4GHz" },
    { label: "Hẹn giờ", value: "Theo lịch / đếm ngược" },
  ],
  9: [
    { label: "Mở khóa", value: "Vân tay / mã PIN / app" },
    { label: "Nguồn điện", value: "Pin lithium sạc lại" },
    { label: "Cảnh báo", value: "Cạy phá / pin yếu" },
    { label: "Kết nối", value: "Wi-Fi" },
  ],
  10: [
    { label: "Màn hình", value: "IPS 4.3 inch" },
    { label: "Camera", value: "1080p góc rộng" },
    { label: "Đàm thoại", value: "2 chiều" },
    { label: "Kết nối", value: "Wi-Fi" },
  ],
  11: [
    { label: "Lực hút", value: "4000Pa" },
    { label: "Dung lượng pin", value: "5200mAh" },
    { label: "Chức năng", value: "Hút bụi + lau nhà" },
    { label: "Điều hướng", value: "Laser LDS" },
  ],
  12: [
    { label: "Màng lọc", value: "HEPA H13" },
    { label: "Diện tích phù hợp", value: "35-45m²" },
    { label: "Cảm biến", value: "PM2.5" },
    { label: "Kết nối", value: "Wi-Fi" },
  ],
  13: [
    { label: "Công suất loa", value: "15W" },
    { label: "Điều khiển", value: "Giọng nói / app" },
    { label: "Kết nối", value: "Wi-Fi / Bluetooth" },
    { label: "Micro", value: "Khử ồn trường xa" },
  ],
  14: [
    { label: "Màn hình", value: "8 inch cảm ứng" },
    { label: "Độ phân giải", value: "1280 x 800" },
    { label: "Kết nối", value: "Wi-Fi / Bluetooth" },
    { label: "Lắp đặt", value: "Tường / để bàn" },
  ],
  15: [
    { label: "Chuẩn Wi-Fi", value: "Wi-Fi 6" },
    { label: "Tốc độ", value: "AX3000" },
    { label: "Phủ sóng", value: "Tối đa 180m²" },
    { label: "Mesh", value: "Có" },
  ],
  16: [
    { label: "Giao thức", value: "Zigbee 3.0" },
    { label: "Nguồn điện", value: "USB 5V" },
    { label: "Chức năng", value: "Mở rộng vùng phủ sóng" },
    { label: "Khoảng cách", value: "Tối đa 20m" },
  ],
  17: [
    { label: "Tải trọng rèm", value: "Tối đa 50kg" },
    { label: "Điều khiển", value: "App / remote / giọng nói" },
    { label: "Kết nối", value: "Wi-Fi" },
    { label: "Hẹn giờ", value: "Theo lịch" },
  ],
  18: [
    { label: "Cảm biến", value: "Khói + khí gas" },
    { label: "Âm báo", value: "85dB" },
    { label: "Kết nối", value: "Wi-Fi / Zigbee" },
    { label: "Nguồn điện", value: "Pin AA" },
  ],
};

const defaultSpecs: ProductSpec[] = [
  { label: "Kết nối", value: "Wi-Fi 2.4GHz / Zigbee" },
  { label: "Nguồn điện", value: "USB Type-C" },
  { label: "Bảo hành", value: "24 tháng" },
];

const parseProductSpecs = (product: Product): ProductSpec[] => {
  const rawSpecs = product.thongSoKyThuat;

  if (typeof rawSpecs === "string" && rawSpecs.trim()) {
    try {
      const specs = JSON.parse(rawSpecs);
      if (Array.isArray(specs) && specs.length) {
        return specs
          .map((spec) => ({
            label: String(spec?.label || "").trim(),
            value: String(spec?.value || "").trim(),
          }))
          .filter((spec) => spec.label && spec.value);
      }
    } catch {
      const specs = rawSpecs
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [label, ...rest] = line.split(":");
          return { label: label.trim(), value: rest.join(":").trim() };
        })
        .filter((spec) => spec.label && spec.value);

      if (specs.length) return specs;
    }
  }

  try {
    const specs = rawSpecs;
    if (Array.isArray(specs) && specs.length) {
      return specs
        .map((spec) => ({
          label: String(spec?.label || "").trim(),
          value: String(spec?.value || "").trim(),
        }))
        .filter((spec) => spec.label && spec.value);
    }
  } catch {
    // Fall back to local defaults when old data is not valid JSON.
  }

  return productSpecs[product.maSanPham] || defaultSpecs;
};

const parseProductImages = (product: Product): string[] => {
  const images = [productImage(product, 1)];
  const rawImages = product.anhPhu;

  if (typeof rawImages === "string" && rawImages.trim()) {
    try {
      const extraImages = JSON.parse(rawImages);
      if (Array.isArray(extraImages)) {
        images.push(
          ...extraImages
            .map((image) => String(image || "").trim())
            .filter(Boolean)
        );
      }
    } catch {
      images.push(
        ...rawImages
          .split("\n")
          .map((image) => image.trim())
          .filter(Boolean)
      );
    }
  }

  try {
    const extraImages = rawImages;
    if (Array.isArray(extraImages)) {
      images.push(
        ...extraImages
          .map((image) => String(image || "").trim())
          .filter(Boolean)
      );
    }
  } catch {
    // Ignore invalid legacy image data and keep the main product image.
  }

  return Array.from(new Set(images)).filter(Boolean);
};

export const ProductDetailView = ({ onAdd, products }: { onAdd: (product: Product, quantity?: number) => void; products: Product[] }) => {
  const params = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const product = products.find((item) => String(item.maSanPham) === params.id) || products[0];
  const related = products.filter((item) => item.maSanPham !== product?.maSanPham).slice(0, 4);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"details" | "specs" | "reviews">("details");
  const [customerReviews, setCustomerReviews] = useState<ProductReview[]>([]);
  const [canReviewCompletedOrder, setCanReviewCompletedOrder] = useState(false);
  const [checkingReviewPermission, setCheckingReviewPermission] = useState(false);
  const [editingReview, setEditingReview] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [reviewForm, setReviewForm] = useState({ author: "", comment: "", rating: "5" });

  useEffect(() => {
    if (product?.maSanPham) setCustomerReviews(readCustomerReviews(product.maSanPham));
    setEditingReview(false);
    setSelectedImage("");
    setReviewForm({ author: "", comment: "", rating: "5" });
    setQuantity(1);
  }, [product?.maSanPham]);

  useEffect(() => {
    if (!product?.maSanPham || user?.loaiTaiKhoan !== "khach_hang" || !user.maKhachHang) {
      setCanReviewCompletedOrder(false);
      return;
    }

    const checkCompletedPurchase = async () => {
      try {
        setCheckingReviewPermission(true);
        const orderRes = await api.get<CustomerOrder[]>("/don-hang/tim-kiem", {
          params: { maKhachHang: user.maKhachHang },
        });
        const completedOrders = orderRes.data.filter((order) =>
          (order.trangThai || "").trim().toLowerCase() === "hoàn thành"
        );
        const detailEntries = await Promise.all(
          completedOrders.map((order) => api.get<CustomerOrderDetail[]>(`/don-hang/${order.maDonHang}/chi-tiet`))
        );
        setCanReviewCompletedOrder(
          detailEntries.some((entry) => entry.data.some((detail) => detail.maSanPham === product.maSanPham))
        );
      } catch (error) {
        console.error(error);
        setCanReviewCompletedOrder(false);
      } finally {
        setCheckingReviewPermission(false);
      }
    };

    void checkCompletedPurchase();
  }, [product?.maSanPham, user?.loaiTaiKhoan, user?.maKhachHang]);

  if (!product) return <EmptyState text="Chưa có sản phẩm để hiển thị." />;
  const isCustomerAccount = user?.loaiTaiKhoan === "khach_hang";
  const accountName = isCustomerAccount ? user?.tenThanhVien || user?.email || "" : "";
  const accountKey = isCustomerAccount ? String(user?.maTaiKhoan || user?.email || "") : "";
  const specs = [...parseProductSpecs(product), { label: "Tồn kho", value: String(product.soLuong) }];
  const reviews = customerReviews;
  const currentUserReview = accountKey ? reviews.find((review) => review.accountKey === accountKey) : undefined;
  const hasReviewed = Boolean(currentUserReview);
  const averageRating = reviews.length
    ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
    : 0;
  const soldCount = Number(product.soLuongDaBan) || 0;
  const stock = Math.max(0, Number(product.soLuong) || 0);
  const discount = discountPercent(product);
  const galleryImages = parseProductImages(product);
  const mainImage = selectedImage || galleryImages[0] || productImage(product, 1);
  const tabs = [
    { key: "details" as const, label: "Chi tiết sản phẩm" },
    { key: "specs" as const, label: "Thông số kỹ thuật" },
    { key: "reviews" as const, label: `Đánh giá (${reviews.length})` },
  ];
  const submitReview = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const author = accountName || reviewForm.author.trim();
    const comment = reviewForm.comment.trim();
    const rating = Number(reviewForm.rating);

    if (!isCustomerAccount) {
      toast.error("Vui lòng đăng nhập bằng tài khoản khách hàng để đánh giá");
      return;
    }

    if (!canReviewCompletedOrder) {
      toast.error("Chỉ khách hàng có đơn hàng hoàn thành chứa sản phẩm này mới được đánh giá");
      return;
    }

    if (hasReviewed && !editingReview) {
      toast.error("Mỗi tài khoản chỉ được đánh giá sản phẩm này một lần");
      return;
    }

    if (!author || !comment) {
      toast.error("Vui lòng nhập tên và nội dung đánh giá");
      return;
    }

    const nextReview = {
      accountKey,
      author,
      comment,
      date: new Date().toLocaleDateString("vi-VN"),
      rating: Math.min(Math.max(rating || 5, 1), 5),
    };
    const nextReviews = editingReview
      ? customerReviews.map((review) => review.accountKey === accountKey ? nextReview : review)
      : [...customerReviews, nextReview];

    setCustomerReviews(nextReviews);
    writeCustomerReviews(product.maSanPham, nextReviews);
    setReviewForm({ author: "", comment: "", rating: "5" });
    setEditingReview(false);
    toast.success(editingReview ? "Đã cập nhật đánh giá của bạn" : "Đã thêm đánh giá của bạn");
  };

  const startEditReview = (review: ProductReview) => {
    setReviewForm({
      author: review.author,
      comment: review.comment,
      rating: String(review.rating || 5),
    });
    setEditingReview(true);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="text-sm text-slate-500">Trang chủ <span className="mx-2">›</span> {product.tenDanhMuc || "Sản phẩm"} <span className="mx-2">›</span> {product.tenSanPham}</p>
      <section className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_0.85fr]">
        <div>
          <div className="rounded-lg bg-white p-6 ring-1 ring-slate-200">
            <img alt={product.tenSanPham} className="aspect-square w-full rounded-md object-cover" src={mainImage} />
          </div>
          <div className="mt-5 grid grid-cols-4 gap-5">
            {galleryImages.slice(0, 4).map((image, index) => (
              <button
                className={image === mainImage ? "overflow-hidden rounded-md ring-2 ring-[#0879a8]" : "overflow-hidden rounded-md ring-1 ring-slate-200 hover:ring-[#0879a8]"}
                key={`${image}-${index}`}
                onClick={() => setSelectedImage(image)}
                type="button"
              >
                <img alt={`${product.tenSanPham} ${index + 1}`} className="aspect-square w-full object-cover" src={image} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-black uppercase text-[#075f83]">Sản phẩm mới</span>
          <h1 className="mt-4 text-3xl font-black leading-tight text-slate-950">{product.tenSanPham}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span className="flex text-amber-700">{Array.from({ length: 5 }).map((_, index) => <Star fill={index < Math.round(averageRating) ? "currentColor" : "none"} key={index} size={17} />)}</span>
            <span>({reviews.length} đánh giá)</span>
            <span>Đã bán {formatSoldCount(soldCount)}</span>
          </div>
          <div className="mt-5 flex flex-wrap items-end gap-3">
            <p className="text-4xl font-black text-[#075f83]">{formatMoney(finalPrice(product))}</p>
            {discount ? <><p className="pb-1 text-lg text-slate-400 line-through">{formatMoney(product.gia)}</p><span className="mb-1 rounded bg-red-50 px-2 py-1 text-sm font-bold text-red-700">Đang giảm giá -{discount}%</span></> : null}
          </div>
          {discount ? (
            <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700 ring-1 ring-red-100">
              Khuyến mãi áp dụng trong thời gian: {productPromotionDateText(product)}
            </p>
          ) : null}
          <div className="mt-6 rounded-lg bg-[#f4f8ff] p-5 ring-1 ring-slate-200">
            <h3 className="font-black">Mô tả ngắn</h3>
            <ul className="mt-4 grid gap-3 text-sm text-slate-700">
              <li className="flex gap-2"><BadgeCheck className="text-[#0879a8]" size={18} /> Điều khiển từ xa, tự động hóa theo lịch.</li>
              <li className="flex gap-2"><BadgeCheck className="text-[#0879a8]" size={18} /> Kết nối ổn định với hệ sinh thái SmartHome.</li>
              <li className="flex gap-2"><BadgeCheck className="text-[#0879a8]" size={18} /> Thiết kế tối giản, phù hợp không gian hiện đại.</li>
            </ul>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-[120px_1fr]">
            <div className="grid grid-cols-3 rounded-lg bg-white ring-1 ring-slate-200">
              <button onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus className="mx-auto" size={17} /></button>
              <span className="py-3 text-center font-bold">{quantity}</span>
              <button className="disabled:cursor-not-allowed disabled:text-slate-300" disabled={quantity >= stock} onClick={() => setQuantity((value) => Math.min(stock, value + 1))}>+</button>
            </div>
            <button className="rounded-lg bg-[#0879a8] px-5 py-3 font-black text-white disabled:cursor-not-allowed disabled:bg-slate-400" disabled={stock <= 0} onClick={() => { onAdd(product, quantity); navigate("/gio-hang"); }}>Mua ngay</button>
            <button className="rounded-lg border border-[#075f83] px-5 py-3 font-black text-[#075f83] disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400 sm:col-span-2" disabled={stock <= 0} onClick={() => onAdd(product, quantity)}>Thêm vào giỏ hàng</button>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <InfoPill icon={<Truck size={19} />} title="Miễn phí vận chuyển" text="Cho đơn hàng từ 500k" />
            <InfoPill icon={<ShieldCheck size={19} />} title="Bảo hành 24 tháng" text="1 đổi 1 trong 30 ngày" />
          </div>
        </div>
      </section>
      <section className="mt-14 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="flex gap-8 border-b border-slate-200 text-sm font-bold">
            {tabs.map((tab) => (
              <button
                className={activeTab === tab.key ? "border-b-2 border-[#0879a8] pb-4 text-[#075f83]" : "pb-4 text-slate-500 hover:text-[#075f83]"}
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
          {activeTab === "details" ? (
            <>
              <p className="mt-8 leading-8 text-slate-700">{product.tenSanPham} là giải pháp nhà thông minh giúp tự động hóa thói quen hằng ngày, tiết kiệm năng lượng và tăng mức an toàn cho gia đình.</p>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <FeatureCard image={fallbackImages[2]} title="Nhận diện AI thông minh" />
                <FeatureCard image={fallbackImages[3]} title="Tầm nhìn ban đêm hồng ngoại" />
              </div>
            </>
          ) : null}
          {activeTab === "specs" ? (
            <div className="mt-8 overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
              {specs.map((spec) => (
                <div className="grid gap-2 border-b border-slate-100 px-5 py-4 text-sm last:border-b-0 sm:grid-cols-[220px_1fr]" key={spec.label}>
                  <span className="font-bold text-slate-600">{spec.label}</span>
                  <span className="font-black text-slate-950">{spec.value}</span>
                </div>
              ))}
            </div>
          ) : null}
          {activeTab === "reviews" ? (
            <div className="mt-8 grid gap-5">
              <div className="rounded-lg bg-white p-6 ring-1 ring-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-black text-slate-950">Đánh giá khách hàng</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-[#075f83]">{averageRating.toFixed(1)}/5</p>
                    <div className="mt-1 flex justify-end text-amber-700">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star fill={index < Math.round(averageRating) ? "currentColor" : "none"} key={index} size={17} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                {reviews.length ? reviews.map((review, index) => (
                  <article className="rounded-lg bg-white p-5 ring-1 ring-slate-200" key={`${review.author}-${review.date}-${index}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h4 className="font-black text-slate-950">{review.author}</h4>
                        <p className="mt-1 text-xs font-semibold text-slate-500">{review.date}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex text-amber-700">
                          {Array.from({ length: 5 }).map((_, starIndex) => (
                            <Star fill={starIndex < review.rating ? "currentColor" : "none"} key={starIndex} size={16} />
                          ))}
                        </div>
                        {accountKey && review.accountKey === accountKey ? (
                          <button
                            className="rounded-md border border-[#0879a8] px-3 py-1 text-xs font-black text-[#075f83] hover:bg-sky-50"
                            onClick={() => startEditReview(review)}
                            type="button"
                          >
                            Sửa đánh giá
                          </button>
                        ) : null}
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-700">{review.comment}</p>
                  </article>
                )) : (
                  <div className="rounded-lg bg-white p-6 text-sm font-semibold text-slate-500 ring-1 ring-slate-200">
                    Chưa có đánh giá nào từ khách hàng.
                  </div>
                )}
              </div>

              {isCustomerAccount && canReviewCompletedOrder && (!hasReviewed || editingReview) ? (
              <form className="rounded-lg bg-white p-5 ring-1 ring-slate-200" onSubmit={submitReview}>
                <h3 className="font-black text-slate-950">{editingReview ? "Sửa đánh giá" : "Viết đánh giá"}</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_140px]">
                  <input
                    className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#0879a8] disabled:bg-slate-100 disabled:text-slate-500"
                    disabled={!!accountName}
                    onChange={(event) => setReviewForm((current) => ({ ...current, author: event.target.value }))}
                    placeholder="Tên của bạn"
                    value={accountName || reviewForm.author}
                  />
                  <select
                    className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-bold outline-none focus:border-[#0879a8]"
                    onChange={(event) => setReviewForm((current) => ({ ...current, rating: event.target.value }))}
                    value={reviewForm.rating}
                  >
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <option key={rating} value={rating}>{rating} sao</option>
                    ))}
                  </select>
                </div>
                <textarea
                  className="mt-4 min-h-28 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#0879a8]"
                  onChange={(event) => setReviewForm((current) => ({ ...current, comment: event.target.value }))}
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm"
                  value={reviewForm.comment}
                />
                <div className="mt-4 flex justify-end gap-3">
                  {editingReview ? (
                    <button
                      className="rounded-lg border border-slate-200 px-5 py-3 text-sm font-black text-slate-600 hover:bg-slate-50"
                      onClick={() => {
                        setEditingReview(false);
                        setReviewForm({ author: "", comment: "", rating: "5" });
                      }}
                      type="button"
                    >
                      Hủy
                    </button>
                  ) : null}
                  <button className="rounded-lg bg-[#0879a8] px-5 py-3 text-sm font-black text-white" type="submit">
                    {editingReview ? "Cập nhật đánh giá" : "Gửi đánh giá"}
                  </button>
                </div>
              </form>
              ) : (
                <div className="rounded-lg bg-white p-5 text-sm font-semibold text-slate-600 ring-1 ring-slate-200">
                  {!isCustomerAccount
                    ? "Vui lòng đăng nhập bằng tài khoản khách hàng để viết đánh giá."
                    : hasReviewed
                      ? "Tài khoản của bạn đã đánh giá sản phẩm này."
                      : checkingReviewPermission
                        ? "Đang kiểm tra điều kiện đánh giá..."
                        : "Bạn chỉ có thể đánh giá sau khi bạn đã mua đơn hàng này."}
                </div>
              )}
            </div>
          ) : null}
        </div>
        <aside className="space-y-5">
          <div className="rounded-lg bg-[#e8f4ff] p-6">
            <h3 className="text-xl font-black">Thông số kỹ thuật</h3>
            {specs.map((spec) => (
              <p className="flex justify-between gap-4 border-b border-sky-200 py-4 text-sm" key={spec.label}>
                <span className="font-semibold text-slate-600">{spec.label}</span>
                <span className="text-right font-bold text-slate-950">{spec.value}</span>
              </p>
            ))}
          </div>
        </aside>
      </section>
      <section className="mt-16">
        <SectionTitle eyebrow="Sản phẩm liên quan" title="Các thiết bị phối hợp hoàn hảo" link="/san-pham" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{related.map((item, index) => <ProductCard compact index={index} key={item.maSanPham} onAdd={onAdd} product={item} />)}</div>
      </section>

      <AiAdvisor
        product={{
          maSanPham: product.maSanPham,
          tenSanPham: product.tenSanPham,
          tenDanhMuc: product.tenDanhMuc || "",
          gia: Number(product.gia) || 0,
          giaSauGiam: finalPrice(product),
          soLuong: product.soLuong,
          soLuongDaBan: Number(product.soLuongDaBan) || 0,
          specs,
        }}
      />
    </main>
  );
};

const InfoPill = ({ icon, text, title }: { icon: ReactNode; text: string; title: string }) => (
  <div className="flex gap-3 rounded-lg bg-white p-4 ring-1 ring-slate-200">
    <span className="text-[#075f83]">{icon}</span>
    <div><p className="text-sm font-black">{title}</p><p className="text-xs text-slate-500">{text}</p></div>
  </div>
);

const FeatureCard = ({ image, title }: { image: string; title: string }) => (
  <article className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
    <img alt={title} className="aspect-video w-full object-cover" src={image} />
    <div className="p-5"><h3 className="font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">Tối ưu trải nghiệm sử dụng và gửi cảnh báo chính xác khi cần.</p></div>
  </article>
);
