import { Package, X } from "lucide-react";
import type { CustomerOrder, CustomerOrderDetail } from "@/types/customer";
import { fallbackImages, formatMoney } from "../utils";

const CancelDetailDialog = ({
  details,
  onClose,
  order,
}: {
  details: CustomerOrderDetail[];
  onClose: () => void;
  order: CustomerOrder;
}) => {
  const requestBy = order.huyBoi || "Người mua";
  const paymentMethod = order.phuongThucThanhToan || "COD";
  const orderCode = `DH-${order.maDonHang}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6">
      <section className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 bg-[#fffaf2] px-6 py-6">
          <div>
            <h2 className="text-xl font-semibold text-red-600">Đã hủy đơn hàng</h2>
          </div>
          <button className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-slate-900" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[calc(90vh-112px)] overflow-y-auto bg-white">
          <div className="px-6 py-5">
            <div className="flex items-center gap-2 text-sm font-black text-slate-950">
              <Package size={17} className="text-slate-700" />
              <span>Đơn hàng {orderCode}</span>
            </div>
          </div>

          <div className="mx-6 border-t border-slate-200" />

          <div className="divide-y divide-slate-100 px-6">
            {details.length ? (
              details.map((detail, index) => (
                <div className="grid gap-4 py-5 sm:grid-cols-[84px_1fr_auto] sm:items-center" key={`${detail.maDonHang}-${detail.maSanPham}`}>
                  <img
                    alt={detail.tenSanPham}
                    className="size-20 rounded object-cover ring-1 ring-slate-200"
                    src={detail.anh || fallbackImages[(order.maDonHang + index) % fallbackImages.length]}
                  />
                  <div>
                    <h3 className="font-medium leading-6 text-slate-950">{detail.tenSanPham}</h3>
                    {detail.tenKhuyenMai ? <p className="mt-2 text-sm text-slate-500">{detail.tenKhuyenMai}</p> : null}
                    <p className="mt-2 text-sm text-slate-700">x{detail.soLuong || 1}</p>
                  </div>
                  <div className="text-right">
                    {detail.gia ? <span className="text-sm text-slate-400 line-through">{formatMoney(detail.gia)}</span> : null}
                    <span className="ml-2 font-semibold text-slate-950">{formatMoney(detail.thanhTien)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-sm font-semibold text-slate-500">Chưa có chi tiết sản phẩm cho đơn hàng này.</div>
            )}
          </div>

          <div className="border-t border-slate-200">
            <CancelInfoRow label="Yêu cầu bởi" value={requestBy} />
            <CancelInfoRow label="Phương thức thanh toán" value={paymentMethod} />
            <CancelInfoRow accent label="Mã đơn hàng" value={orderCode} />
          </div>
        </div>
      </section>
    </div>
  );
};

const CancelInfoRow = ({ accent, label, value }: { accent?: boolean; label: string; value: string }) => (
  <div className="grid grid-cols-[1fr_220px] border-b border-slate-100 text-sm last:border-b-0">
    <div className="border-r border-slate-100 px-6 py-4 text-right text-slate-500">{label}</div>
    <div className={accent ? "px-6 py-4 text-right font-medium text-red-600" : "px-6 py-4 text-right font-medium text-slate-950"}>{value}</div>
  </div>
);

export default CancelDetailDialog;
