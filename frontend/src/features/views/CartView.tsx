import { ArrowRight, Banknote, Lock, PackageCheck, Trash2, Truck, WalletCards } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import axios from "axios";
import api from "@/libs/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import type { CartItem, Promotion } from "@/types/customer";
import { finalPrice, formatMoney, productImage } from "../utils";
import { EmptyState } from "../components/EmptyState";

export const CartView = ({ cart, onClear, onQuantity, onRemove, promotions }: { cart: CartItem[]; onClear: () => void; onQuantity: (id: number, quantity: number) => void; onRemove: (id: number) => void; promotions: Promotion[] }) => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<Promotion | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "cod">("cod");
  const [form, setForm] = useState({ name: user?.tenThanhVien || "", phone: user?.soDienThoaiKhachHang || "", address: user?.diaChiKhachHang || "", city: "Hồ Chí Minh", district: "Quận 1" });
  const subtotal = cart.reduce((total, item) => total + finalPrice(item.product) * item.quantity, 0);
  const discount = Math.round(subtotal * (Number(appliedPromo?.phanTramGiam) || 0) / 100);
  const total = Math.max(0, subtotal - discount);

  const applyPromo = () => {
    const normalized = promoCode.trim().toLowerCase();
    const found = promotions.find((promo) => promo.tenKhuyenMai.trim().toLowerCase() === normalized);
    if (!found) {
      toast.error("Mã khuyến mãi không hợp lệ hoặc đã hết hạn");
      return;
    }
    setAppliedPromo(found);
    toast.success("Đã áp dụng khuyến mãi");
  };

  const submitOrder = async () => {
    if (!cart.length) return toast.error("Giỏ hàng đang trống");
    const requiredFields = [
      { label: "họ và tên", value: form.name },
      { label: "số điện thoại", value: form.phone },
      { label: "địa chỉ nhận hàng", value: form.address },
      { label: "tỉnh/thành phố", value: form.city },
      { label: "quận/huyện", value: form.district },
    ];
    const missingField = requiredFields.find((field) => !field.value.trim());
    if (missingField) {
      toast.error(`Vui lòng nhập ${missingField.label}`);
      return;
    }

    if (!user?.maKhachHang) {
      toast.error("Vui lòng đăng nhập bằng tài khoản khách hàng để đặt hàng");
      navigate("/signin", { state: { from: location } });
      return;
    }
    try {
      await api.post("/don-hang/them", {
        maKhachHang: user.maKhachHang,
        maKhuyenMai: appliedPromo?.maKhuyenMai || null,
        trangThai: "Mới tạo",
        items: cart.map((item) => ({ maSanPham: item.product.maSanPham, soLuong: item.quantity })),
      });
      onClear();
      toast.success("Đặt hàng thành công");
      navigate("/khach-hang", { state: { accountSection: "orders" } });
    } catch (error) {
      console.error(error);
      const message = axios.isAxiosError<{ message?: string }>(error) ? error.response?.data?.message : "";
      toast.error(message || "Không tạo được đơn hàng");
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="text-sm text-slate-500">Cửa hàng <span className="mx-2">›</span> <span className="font-bold text-[#075f83]">Thanh toán</span></p>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <section className="rounded-lg bg-white p-6 ring-1 ring-slate-200">
            <h1 className="text-2xl font-black">Giỏ hàng của bạn ({cart.length})</h1>
            <div className="mt-6 divide-y divide-slate-200">
              {cart.map((item, index) => (
                <div className="grid gap-4 py-5 sm:grid-cols-[120px_1fr_auto] sm:items-center" key={item.product.maSanPham}>
                  <img alt={item.product.tenSanPham} className="size-28 rounded-lg object-cover" src={productImage(item.product, index)} />
                  <div>
                    <h3 className="font-black">{item.product.tenSanPham}</h3>
                    <p className="mt-1 text-sm text-slate-500">{item.product.tenDanhMuc || "Thiết bị thông minh"} | Bảo hành 2 năm</p>
                    <div className="mt-5 inline-grid grid-cols-3 rounded-lg bg-white ring-1 ring-slate-200">
                      <button className="px-4 py-2" onClick={() => onQuantity(item.product.maSanPham, item.quantity - 1)}>-</button>
                      <span className="px-5 py-2 text-center font-bold">{item.quantity}</span>
                      <button className="px-4 py-2" onClick={() => onQuantity(item.product.maSanPham, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-[#075f83]">{formatMoney(finalPrice(item.product) * item.quantity)}</p>
                    <button className="mt-8 inline-flex items-center gap-2 text-sm text-red-700" onClick={() => onRemove(item.product.maSanPham)}><Trash2 size={15} /> Xóa</button>
                  </div>
                </div>
              ))}
            </div>
            {cart.length === 0 ? <EmptyState text="Giỏ hàng đang trống." /> : null}
          </section>
          <section className="rounded-lg bg-white p-6 ring-1 ring-slate-200">
            <h2 className="flex items-center gap-2 text-2xl font-black"><Truck className="text-[#075f83]" /> Thông tin giao hàng</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <CheckoutInput label="Họ và tên" onChange={(value) => setForm({ ...form, name: value })} required value={form.name} />
              <CheckoutInput label="Số điện thoại" onChange={(value) => setForm({ ...form, phone: value })} required value={form.phone} />
              <CheckoutInput className="sm:col-span-2" label="Địa chỉ nhận hàng" onChange={(value) => setForm({ ...form, address: value })} required value={form.address} />
              <CheckoutInput label="Tỉnh/Thành phố" onChange={(value) => setForm({ ...form, city: value })} required value={form.city} />
              <CheckoutInput label="Quận/Huyện" onChange={(value) => setForm({ ...form, district: value })} required value={form.district} />
            </div>
          </section>
          <section className="rounded-lg bg-white p-6 ring-1 ring-slate-200">
            <h2 className="flex items-center gap-2 text-2xl font-black"><WalletCards className="text-[#075f83]" /> Phương thức thanh toán</h2>
            <div className="mt-6 grid gap-4">
              <PaymentOption
                checked={paymentMethod === "bank"}
                icon={<Banknote />}
                onChange={() => setPaymentMethod("bank")}
                title="Chuyển khoản ngân hàng"
                text="Quét mã QR để thanh toán nhanh"
              />
              {paymentMethod === "bank" ? (
                <div className="grid gap-5 rounded-lg border border-sky-100 bg-sky-50 p-5 sm:grid-cols-[220px_1fr] sm:items-center">
                  <img
                    alt="Mã QR thanh toán chuyển khoản"
                    className="mx-auto aspect-square w-full max-w-[220px] rounded-lg bg-white object-contain p-3 ring-1 ring-sky-200"
                    src="/thanhtoan.jpg"
                  />
                  <div>
                    <h3 className="font-black text-slate-950">Quét QR để chuyển khoản</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Vui lòng chuyển khoản đúng số tiền <span className="font-black text-[#075f83]">{formatMoney(total)}</span>, sau đó bấm hoàn tất đặt hàng.
                    </p>
                  </div>
                </div>
              ) : null}
              <PaymentOption
                checked={paymentMethod === "cod"}
                icon={<WalletCards />}
                onChange={() => setPaymentMethod("cod")}
                title="Thanh toán khi nhận hàng (COD)"
                text="Bấm hoàn tất đặt hàng để thanh toán khi nhận hàng"
              />
            </div>
          </section>
        </div>
        <aside className="h-fit rounded-lg bg-[#e4f2ff] p-6 ring-1 ring-sky-200">
          <h2 className="text-2xl font-black">Tổng đơn hàng</h2>
          <SummaryRow label="Tạm tính" value={formatMoney(subtotal)} />
          <SummaryRow label="Phí vận chuyển" value="Miễn phí" />
          <SummaryRow label="Giảm giá" value={`- ${formatMoney(discount)}`} danger />
          <div className="my-5 border-t border-sky-200" />
          <div className="flex justify-between text-2xl font-black text-[#075f83]"><span>Tổng cộng</span><span>{formatMoney(total)}</span></div>
          <label className="mt-8 block text-xs font-black uppercase text-slate-700">Mã khuyến mãi</label>
          <div className="mt-3 flex gap-2">
            <input className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none" onChange={(event) => setPromoCode(event.target.value)} placeholder="SMART2024" value={promoCode} />
            <button className="rounded-lg bg-slate-950 px-5 font-black text-white" onClick={applyPromo}>Áp dụng</button>
          </div>
          {appliedPromo ? (
            <p className="mt-3 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-[#075f83] ring-1 ring-sky-200">
              Đã áp dụng mã {promotionCodeText(appliedPromo)} - giảm {Number(appliedPromo.phanTramGiam || 0)}%.
            </p>
          ) : null}
          {promotions.length ? (
            <div className="mt-4 grid gap-3">
              <p className="text-xs font-black uppercase text-slate-700">Mã khuyến mãi khả dụng</p>
              {promotions.map((promotion) => (
                <button
                  className="rounded-lg bg-white p-3 text-left ring-1 ring-sky-200 transition hover:ring-[#0879a8]"
                  key={promotion.maKhuyenMai}
                  onClick={() => setPromoCode(promotionCodeText(promotion))}
                  type="button"
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="break-all text-sm font-black text-[#075f83]">{promotionCodeText(promotion)}</span>
                    <span className="shrink-0 rounded bg-red-50 px-2 py-1 text-xs font-black text-red-700">
                      -{Number(promotion.phanTramGiam || 0)}%
                    </span>
                  </span>
                  <span className="mt-2 block text-xs font-semibold text-slate-500">Hạn dùng: {promotionDateText(promotion)}</span>
                </button>
              ))}
            </div>
          ) : null}
          <button className="mt-7 flex w-full items-center justify-center gap-3 rounded-lg bg-[#0879a8] px-6 py-5 text-xl font-black text-white shadow-sm" onClick={() => void submitOrder()}>
            {paymentMethod === "cod" ? "Thanh toán khi nhận hàng" : "Tôi đã chuyển khoản"} <ArrowRight />
          </button>
          <p className="mt-5 text-center text-sm leading-6 text-slate-600">Bằng cách đặt hàng, bạn đồng ý với Điều khoản dịch vụ của chúng tôi.</p>
          <div className="mt-8 flex justify-center gap-5 text-sm text-slate-500"><span className="flex items-center gap-1"><Lock size={16} /> Bảo mật SSL</span><span className="flex items-center gap-1"><PackageCheck size={16} /> 7 ngày đổi trả</span></div>
        </aside>
      </div>
    </main>
  );
};

const CheckoutInput = ({ className = "", label, onChange, required, value }: { className?: string; label: string; onChange: (value: string) => void; required?: boolean; value: string }) => (
  <label className={className}>
    <span className="text-xs font-black uppercase text-slate-700">{label}{required ? <span className="text-red-600"> *</span> : null}</span>
    <input className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-4 outline-none focus:border-[#0879a8]" onChange={(event) => onChange(event.target.value)} required={required} value={value} />
  </label>
);

const PaymentOption = ({ checked = false, icon, onChange, text, title }: { checked?: boolean; icon: ReactNode; onChange: () => void; text: string; title: string }) => (
  <label className={checked ? "flex cursor-pointer items-center gap-4 rounded-lg border border-[#0879a8] bg-sky-50 p-5 ring-1 ring-sky-200" : "flex cursor-pointer items-center gap-4 rounded-lg border border-slate-200 bg-white p-5 hover:border-sky-200"}>
    <input checked={checked} onChange={onChange} type="radio" />
    <span className="text-slate-700">{icon}</span>
    <span><span className="block font-black">{title}</span><span className="text-sm text-slate-500">{text}</span></span>
  </label>
);

const SummaryRow = ({ danger, label, value }: { danger?: boolean; label: string; value: string }) => (
  <div className="mt-5 flex justify-between text-lg"><span>{label}</span><span className={danger ? "font-bold text-red-700" : "font-semibold"}>{value}</span></div>
);

const promotionCodeText = (promotion: Promotion) => promotion.tenKhuyenMai.trim() || `KM-${promotion.maKhuyenMai}`;

const promotionDateText = (promotion: Promotion) => {
  const start = formatDate(promotion.ngayBatDau);
  const end = formatDate(promotion.ngayKetThuc);
  if (start && end) return `${start} - ${end}`;
  if (start) return `Từ ${start}`;
  if (end) return `Đến ${end}`;
  return "Đến 31/12/2026";
};

const formatDate = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("vi-VN");
};


