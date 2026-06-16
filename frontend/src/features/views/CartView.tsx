import { ArrowRight, Banknote, Lock, PackageCheck, Trash2, Truck, WalletCards } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import axios from "axios";
import api from "@/libs/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import type { CartItem, Promotion } from "@/types/customer";
import { finalPrice, formatMoney, productImage } from "../utils";
import { EmptyState } from "../components/EmptyState";

type GHNProvince = { ProvinceID: number; ProvinceName: string };
type GHNDistrict = { DistrictID: number; DistrictName: string };
type GHNWard = { WardCode: string; WardName: string };

export const CartView = ({ cart, onClear, onQuantity, onRemove, promotions }: { cart: CartItem[]; onClear: () => void; onQuantity: (id: number, quantity: number) => void; onRemove: (id: number) => void; promotions: Promotion[] }) => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<Promotion | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "cod">("cod");
  const [form, setForm] = useState({ name: user?.tenThanhVien || "", phone: user?.soDienThoaiKhachHang || "", streetAddress: user?.diaChiKhachHang || "" });

  const [provinces, setProvinces] = useState<GHNProvince[]>([]);
  const [districts, setDistricts] = useState<GHNDistrict[]>([]);
  const [wards, setWards] = useState<GHNWard[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<GHNProvince | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<GHNDistrict | null>(null);
  const [selectedWard, setSelectedWard] = useState<GHNWard | null>(null);
  const [shippingFee, setShippingFee] = useState<number | null>(null);
  const [calculatingFee, setCalculatingFee] = useState(false);

  useEffect(() => {
    api.get<GHNProvince[]>("/van-chuyen/tinh-thanh").then((res) => {
      setProvinces(res.data);
      const savedProvinceId = user?.maTinhThanhKhachHang;
      const savedProvinceName = user?.tenTinhThanhKhachHang;
      if (savedProvinceId) {
        const found = res.data.find((p) => p.ProvinceID === savedProvinceId);
        if (found) setSelectedProvince(found);
      } else if (savedProvinceName) {
        const found = res.data.find((p) => p.ProvinceName === savedProvinceName);
        if (found) setSelectedProvince(found);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setSelectedDistrict(null);
    setSelectedWard(null);
    setDistricts([]);
    setWards([]);
    setShippingFee(null);
    if (!selectedProvince) return;
    api.get<GHNDistrict[]>(`/van-chuyen/quan-huyen?provinceId=${selectedProvince.ProvinceID}`)
      .then((res) => {
        setDistricts(res.data);
        const savedId = user?.maQuanHuyenKhachHang;
        if (savedId) {
          const found = res.data.find((d) => d.DistrictID === savedId);
          if (found) setSelectedDistrict(found);
        }
      }).catch(() => {});
  }, [selectedProvince]);

  useEffect(() => {
    setSelectedWard(null);
    setWards([]);
    setShippingFee(null);
    if (!selectedDistrict) return;
    api.get<GHNWard[]>(`/van-chuyen/phuong-xa?districtId=${selectedDistrict.DistrictID}`)
      .then((res) => {
        setWards(res.data);
        const savedCode = user?.maPhuongXaKhachHang;
        if (savedCode) {
          const found = res.data.find((w) => w.WardCode === savedCode);
          if (found) setSelectedWard(found);
        }
      }).catch(() => {});
  }, [selectedDistrict]);

  useEffect(() => {
    setShippingFee(null);
    if (!selectedDistrict || !selectedWard) return;
    setCalculatingFee(true);
    api.post<{ phiVanChuyen: number }>("/van-chuyen/tinh-phi", {
      toDistrictId: selectedDistrict.DistrictID,
      toWardCode: selectedWard.WardCode,
    })
      .then((res) => setShippingFee(res.data.phiVanChuyen))
      .catch(() => toast.error("Không tính được phí vận chuyển"))
      .finally(() => setCalculatingFee(false));
  }, [selectedWard]);
  // Item is eligible for promo if product is linked to that promo code
  const isPromoItem = (item: CartItem) =>
    !!appliedPromo && Number(item.product.maKhuyenMai) === Number(appliedPromo.maKhuyenMai);
  // Promo code gives additional discount on top of the already-discounted finalPrice
  const promoFinalPrice = (item: CartItem) =>
    finalPrice(item.product) * (1 - Number(appliedPromo?.phanTramGiam || 0) / 100);
  const subtotal = cart.reduce((sum, item) => sum + finalPrice(item.product) * item.quantity, 0);
  const promoPct = Number(appliedPromo?.phanTramGiam || 0);
  const discount = cart
    .filter(isPromoItem)
    .reduce((sum, item) => sum + finalPrice(item.product) * (promoPct / 100) * item.quantity, 0);
  const total = Math.max(0, subtotal - discount + (shippingFee ?? 0));
  const invalidStockItem = cart.find((item) => item.quantity > Math.max(0, Number(item.product.soLuong) || 0));
  const appliedPromoItemCount = appliedPromo
    ? cart.filter((item) => Number(item.product.maKhuyenMai) === Number(appliedPromo.maKhuyenMai)).length
    : 0;
  const applicablePromotions = promotions.filter((promo) =>
    Number(promo.phanTramGiam || 0) > 0 &&
    cart.some((item) => Number(item.product.maKhuyenMai) === Number(promo.maKhuyenMai))
  );

  const applyPromo = () => {
    const normalized = promoCode.trim().toLowerCase();
    const found = promotions.find((promo) => promo.tenKhuyenMai.trim().toLowerCase() === normalized);
    if (!found) {
      toast.error("Mã khuyến mãi không hợp lệ hoặc đã hết hạn");
      return;
    }
    const eligibleItems = cart.filter(
      (item) => Number(item.product.maKhuyenMai) === Number(found.maKhuyenMai)
    );
    if (!eligibleItems.length) {
      toast.error("Mã khuyến mãi không áp dụng cho sản phẩm trong giỏ hàng");
      return;
    }
    setAppliedPromo(found);
    toast.success(`Đã áp dụng mã cho ${eligibleItems.length} sản phẩm phù hợp`);
  };

  const submitOrder = async () => {
    if (!cart.length) return toast.error("Giỏ hàng đang trống");
    if (invalidStockItem) {
      toast.error(`Sản phẩm ${invalidStockItem.product.tenSanPham} chỉ còn ${Math.max(0, Number(invalidStockItem.product.soLuong) || 0)} trong kho`);
      return;
    }

    const requiredFields = [
      { label: "họ và tên", value: form.name },
      { label: "số điện thoại", value: form.phone },
      { label: "địa chỉ nhận hàng", value: form.streetAddress },
      { label: "tỉnh/thành phố", value: selectedProvince?.ProvinceName || "" },
      { label: "quận/huyện", value: selectedDistrict?.DistrictName || "" },
      { label: "phường/xã", value: selectedWard?.WardName || "" },
    ];
    const missingField = requiredFields.find((field) => !field.value.trim());
    if (missingField) {
      toast.error(`Vui lòng chọn ${missingField.label}`);
      return;
    }
    if (shippingFee === null) {
      toast.error("Vui lòng chờ tính phí vận chuyển");
      return;
    }

    if (!user?.maKhachHang) {
      toast.error("Vui lòng đăng nhập bằng tài khoản khách hàng để đặt hàng");
      navigate("/signin", { state: { from: location } });
      return;
    }
    try {
      const orderRes = await api.post("/don-hang/them", {
        maKhachHang: user.maKhachHang,
        maKhuyenMai: appliedPromo?.maKhuyenMai || null,
        trangThai: "Mới tạo",
        items: cart.map((item) => ({ maSanPham: item.product.maSanPham, soLuong: item.quantity })),
        diaChiGiaoHang: form.streetAddress,
        tenTinhThanh: selectedProvince?.ProvinceName || "",
        tenQuanHuyen: selectedDistrict?.DistrictName || "",
        tenPhuongXa: selectedWard?.WardName || "",
        maQuanHuyen: selectedDistrict?.DistrictID || null,
        maPhuongXa: selectedWard?.WardCode || null,
        phiVanChuyen: shippingFee,
      });

      if (paymentMethod === "bank") {
        const payRes = await api.post("/payment/create-link", { maDonHang: orderRes.data.maDonHang });
        window.location.href = payRes.data.checkoutUrl;
        return;
      }

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
                      <button className="px-4 py-2 disabled:cursor-not-allowed disabled:text-slate-300" disabled={item.quantity >= Math.max(0, Number(item.product.soLuong) || 0)} onClick={() => onQuantity(item.product.maSanPham, item.quantity + 1)}>+</button>
                    </div>
                    <p className="mt-2 text-xs font-semibold text-slate-500">Còn {Math.max(0, Number(item.product.soLuong) || 0)} trong kho</p>
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
              <CheckoutInput className="sm:col-span-2" label="Địa chỉ cụ thể (số nhà, tên đường)" onChange={(value) => setForm({ ...form, streetAddress: value })} required value={form.streetAddress} />
              <CheckoutSelect
                label="Tỉnh/Thành phố"
                placeholder="Chọn tỉnh/thành phố"
                options={provinces.map((p) => ({ value: String(p.ProvinceID), label: p.ProvinceName }))}
                value={selectedProvince ? String(selectedProvince.ProvinceID) : ""}
                onChange={(val) => setSelectedProvince(provinces.find((p) => String(p.ProvinceID) === val) ?? null)}
                required
              />
              <CheckoutSelect
                label="Quận/Huyện"
                placeholder={selectedProvince ? "Chọn quận/huyện" : "Chọn tỉnh/thành trước"}
                options={districts.map((d) => ({ value: String(d.DistrictID), label: d.DistrictName }))}
                value={selectedDistrict ? String(selectedDistrict.DistrictID) : ""}
                onChange={(val) => setSelectedDistrict(districts.find((d) => String(d.DistrictID) === val) ?? null)}
                disabled={!selectedProvince}
                required
              />
              <CheckoutSelect
                className="sm:col-span-2"
                label="Phường/Xã"
                placeholder={selectedDistrict ? "Chọn phường/xã" : "Chọn quận/huyện trước"}
                options={wards.map((w) => ({ value: w.WardCode, label: w.WardName }))}
                value={selectedWard?.WardCode ?? ""}
                onChange={(val) => setSelectedWard(wards.find((w) => w.WardCode === val) ?? null)}
                disabled={!selectedDistrict}
                required
              />
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
                <div className="rounded-lg border border-sky-100 bg-sky-50 p-5">
                  <h3 className="font-black text-slate-950">Thanh toán qua PayOS</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Bạn sẽ được chuyển đến trang thanh toán an toàn của PayOS với số tiền{" "}
                    <span className="font-black text-[#075f83]">{formatMoney(total)}</span>. Hỗ trợ tất cả ngân hàng và ví điện tử.
                  </p>
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
        <aside className="h-fit rounded-lg bg-[#e4f2ff] p-6 ring-1 ring-sky-200" data-section="order-summary">
          <h2 className="text-2xl font-black">Tổng đơn hàng</h2>
          <div className="mt-4 space-y-3">
            {cart.map((item) => {
              const directDiscountPct = Number(item.product.phanTramGiam || 0);
              const isItemPromo = isPromoItem(item);
              const displayPrice = isItemPromo ? promoFinalPrice(item) : finalPrice(item.product);
              return (
                <div className="flex items-start justify-between gap-3 text-sm" key={item.product.maSanPham}>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-tight text-slate-800">{item.product.tenSanPham}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      SL: {item.quantity} ·{" "}
                      {isItemPromo ? (
                        <>
                          <span className="line-through">{formatMoney(finalPrice(item.product))}</span>
                          {" → "}
                          <span className="font-bold text-red-600">{formatMoney(promoFinalPrice(item))}/sp <span className="whitespace-nowrap">(-{promoPct}% {promotionCodeText(appliedPromo!)})</span></span>
                        </>
                      ) : (
                        <>
                          {formatMoney(finalPrice(item.product))}/sp
                          {directDiscountPct > 0 && <span className="ml-1 font-bold text-slate-400">(-{directDiscountPct}%)</span>}
                        </>
                      )}
                    </p>
                  </div>
                  <p className="shrink-0 font-bold text-slate-800">{formatMoney(displayPrice * item.quantity)}</p>
                </div>
              );
            })}
          </div>
          <div className="my-4 border-t border-sky-200" />
          <SummaryRow label="Tạm tính" value={formatMoney(subtotal)} />
          <SummaryRow
            label="Phí vận chuyển"
            value={calculatingFee ? "Đang tính..." : shippingFee !== null ? formatMoney(shippingFee) : "Chọn địa chỉ"}
          />
          <SummaryRow label={appliedPromo ? `Giảm giá (${promotionCodeText(appliedPromo)})` : "Giảm giá"} value={`- ${formatMoney(discount)}`} danger />
          <div className="my-5 border-t border-sky-200" />
          <div className="flex justify-between text-2xl font-black text-[#075f83]"><span>Tổng cộng</span><span>{formatMoney(total)}</span></div>
          <label className="mt-8 block text-xs font-black uppercase text-slate-700">Mã khuyến mãi</label>
          <div className="mt-3 flex gap-2">
            <input className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none" onChange={(event) => setPromoCode(event.target.value)} placeholder="SMART2024" value={promoCode} />
            <button className="rounded-lg bg-slate-950 px-5 font-black text-white" onClick={applyPromo}>Áp dụng</button>
          </div>
          {appliedPromo ? (
            <p className="mt-3 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-[#075f83] ring-1 ring-sky-200">
              Mã {promotionCodeText(appliedPromo)} giảm thêm {promoPct}% cho {appliedPromoItemCount} sản phẩm phù hợp.
            </p>
          ) : null}
          {applicablePromotions.length ? (
            <div className="mt-4">
              <p className="mb-2 text-xs font-black uppercase text-slate-500">Mã khả dụng cho giỏ hàng của bạn</p>
              <div className="max-h-52 overflow-y-auto rounded-lg border border-sky-100 bg-sky-50/50">
                {applicablePromotions.map((promotion, idx) => (
                  <button
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-sky-100 ${idx !== 0 ? "border-t border-sky-100" : ""}`}
                    key={promotion.maKhuyenMai}
                    onClick={() => setPromoCode(promotionCodeText(promotion))}
                    type="button"
                  >
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="font-black text-[#075f83]">{promotionCodeText(promotion)}</span>
                      <span className="mt-0.5 truncate text-xs text-slate-500">Hết hạn {promotionDateText(promotion).split(" - ")[1] || promotionDateText(promotion)}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-red-600 px-2.5 py-1 text-xs font-black text-white">-{Number(promotion.phanTramGiam || 0)}%</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <button className="mt-7 flex w-full items-center justify-center gap-3 rounded-lg bg-[#0879a8] px-6 py-5 text-xl font-black text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-400" disabled={!!invalidStockItem} onClick={() => void submitOrder()}>
            {paymentMethod === "cod" ? "Thanh toán khi nhận hàng" : "Thanh toán qua PayOS"} <ArrowRight />
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

const CheckoutSelect = ({ className = "", label, onChange, options, placeholder, disabled, required, value }: { className?: string; label: string; onChange: (value: string) => void; options: { value: string; label: string }[]; placeholder: string; disabled?: boolean; required?: boolean; value: string }) => (
  <label className={className}>
    <span className="text-xs font-black uppercase text-slate-700">{label}{required ? <span className="text-red-600"> *</span> : null}</span>
    <select
      className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-4 outline-none focus:border-[#0879a8] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      value={value}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
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


