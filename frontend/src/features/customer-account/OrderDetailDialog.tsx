import { Package, ReceiptText, X } from "lucide-react";
import type { CustomerOrder, CustomerOrderDetail } from "@/types/customer";
import { fallbackImages, formatMoney } from "../utils";

const OrderDetailDialog = ({
  details,
  onClose,
  order,
}: {
  details: CustomerOrderDetail[];
  onClose: () => void;
  order: CustomerOrder;
}) => {
  const status = (order.trangThai || "Mới tạo").trim();
  const productCount = details.reduce((total, detail) => total + (Number(detail.soLuong) || 1), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6">
      <section className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 px-6 py-5">
          <div>
            <p className="text-sm font-bold uppercase text-[#075f83]">Chi tiết đơn hàng</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">Đơn hàng DH-{order.maDonHang}</h2>
          </div>
          <button className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-slate-900" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[calc(90vh-96px)] overflow-y-auto">
          <div className="grid gap-4 border-b border-slate-100 px-6 py-5 sm:grid-cols-2">
            <InfoItem icon={<ReceiptText size={18} />} label="Trạng thái" value={status} />
            <InfoItem icon={<Package size={18} />} label="Số lượng" value={`${productCount || details.length || 0} sản phẩm`} />
          </div>

          <div className="divide-y divide-slate-100 px-6">
            {details.length ? (
              details.map((detail, index) => {
                const quantity = Number(detail.soLuong) || 1;
                const originalPrice = Number(detail.gia) || 0;
                const lineTotal = Number(detail.thanhTien) || 0;
                const finalUnitPrice = quantity ? Math.round(lineTotal / quantity) : lineTotal;
                const hasDiscount = originalPrice > finalUnitPrice;

                return (
                  <div className="grid gap-4 py-5 sm:grid-cols-[92px_1fr_auto] sm:items-center" key={`${detail.maDonHang}-${detail.maSanPham}`}>
                    <img
                      alt={detail.tenSanPham}
                      className="size-20 rounded-lg object-cover ring-1 ring-slate-200"
                      src={detail.anh || fallbackImages[(order.maDonHang + index) % fallbackImages.length]}
                    />
                    <div>
                      <h3 className="font-black leading-6 text-slate-950">{detail.tenSanPham}</h3>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                        <span>Mã sản phẩm: SP-{detail.maSanPham}</span>
                        <span>Số lượng: x{quantity}</span>
                      </div>
                      {detail.tenKhuyenMai ? (
                        <p className="mt-2 text-sm font-semibold text-[#075f83]">
                          Khuyến mãi: {detail.tenKhuyenMai}
                          {Number(detail.phanTramGiam) ? ` - Giảm ${Number(detail.phanTramGiam)}%` : ""}
                        </p>
                      ) : null}
                    </div>
                    <div className="text-right">
                      {hasDiscount ? <p className="text-sm text-slate-400 line-through">{formatMoney(originalPrice * quantity)}</p> : null}
                      <p className="text-sm text-slate-500">Đơn giá: {formatMoney(finalUnitPrice)}</p>
                      <p className="mt-1 text-lg font-black text-[#075f83]">{formatMoney(lineTotal)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-sm font-semibold text-slate-500">Chưa có chi tiết sản phẩm cho đơn hàng này.</div>
            )}
          </div>

          <div className="border-t border-slate-100 bg-slate-50 px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-600">Tổng thanh toán</span>
              <span className="text-2xl font-black text-[#075f83]">{formatMoney(order.tongGia)}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex gap-3 rounded-lg bg-white p-4 ring-1 ring-slate-200">
    <span className="text-[#075f83]">{icon}</span>
    <div>
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-black text-slate-950">{value}</p>
    </div>
  </div>
);

export default OrderDetailDialog;
