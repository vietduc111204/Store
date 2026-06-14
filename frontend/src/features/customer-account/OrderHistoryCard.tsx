import type { CustomerOrder, CustomerOrderDetail } from "@/types/customer";
import { fallbackImages, formatMoney } from "../utils";

const OrderHistoryCard = ({
  details,
  onCancel,
  onBuyAgain,
  onViewDetail,
  onViewCancelDetail,
  order,
}: {
  details: CustomerOrderDetail[];
  onCancel: (order: CustomerOrder) => void;
  onBuyAgain: (order: CustomerOrder) => void;
  onViewDetail: (order: CustomerOrder) => void;
  onViewCancelDetail: (order: CustomerOrder) => void;
  order: CustomerOrder;
}) => {
  const status = (order.trangThai || "Mới tạo").trim();
  const normalized = status.toLowerCase();
  const cancelled = normalized === "đã hủy";
  const completed = normalized === "hoàn thành" || normalized === "đã thanh toán";
  const canCancel = normalized === "mới tạo" || normalized === "đang xử lý" || normalized === "chờ thanh toán";
  const statusText = cancelled ? "Đã hủy" : completed ? "Giao hàng thành công | Hoàn thành" : status;
  return (
    <article className="overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
        <div>
          <p className="text-sm font-black text-slate-950">Đơn hàng DH-{order.maDonHang}</p>
        </div>
        <span className={cancelled ? "text-sm font-black uppercase text-red-700" : "text-sm font-black uppercase text-[#075f83]"}>
          {statusText}
        </span>
      </div>

      <div className="divide-y divide-slate-100 px-4">
        {details.map((detail, index) => (
          <div className="grid gap-4 py-5 sm:grid-cols-[96px_1fr_auto] sm:items-center" key={`${detail.maDonHang}-${detail.maSanPham}`}>
            <img
              alt={detail.tenSanPham}
              className="size-20 rounded-lg object-cover ring-1 ring-slate-200"
              src={detail.anh || fallbackImages[(order.maDonHang + index) % fallbackImages.length]}
            />
            <div>
              <h3 className="font-black leading-6 text-slate-950">{detail.tenSanPham}</h3>
              {detail.tenKhuyenMai ? <p className="mt-1 text-sm text-slate-500">Khuyến mãi: {detail.tenKhuyenMai}</p> : null}
              <p className="mt-1 text-sm text-slate-700">x{detail.soLuong || 1}</p>
            </div>
            <div className="text-right">
              {detail.gia ? <p className="text-sm text-slate-400 line-through">{formatMoney(detail.gia)}</p> : null}
              <p className="text-lg font-black text-[#075f83]">{formatMoney(detail.thanhTien)}</p>
            </div>
          </div>
        ))}
        {!details.length ? <div className="py-5 text-sm font-semibold text-slate-500">Chưa có chi tiết sản phẩm cho đơn hàng này.</div> : null}
      </div>

      <div className="border-t border-slate-100 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-semibold text-slate-700">
          <span>{details.length || 1} sản phẩm</span>
          <span>
            Thành tiền: <span className="ml-2 text-xl font-black text-[#075f83]">{formatMoney(order.tongGia)}</span>
          </span>
        </div>
      </div>

      {cancelled ? <p className="px-4 pb-2 text-sm italic text-slate-500">Đã hủy bởi bạn</p> : null}

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 px-4 py-4">
        <button className="rounded-lg bg-[#0879a8] px-6 py-3 text-sm font-black text-white" onClick={() => onBuyAgain(order)} type="button">
          Mua lại
        </button>
        <button
          className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-bold text-slate-800"
          onClick={() => (cancelled ? onViewCancelDetail(order) : onViewDetail(order))}
          type="button"
        >
          {cancelled ? "Xem chi tiết hủy đơn" : "Xem chi tiết"}
        </button>
        {canCancel ? (
          <button
            className="rounded-lg border border-red-200 px-6 py-3 text-sm font-bold text-red-700 hover:bg-red-50"
            onClick={() => onCancel(order)}
            type="button"
          >
            Hủy đơn
          </button>
        ) : null}
      </div>
    </article>
  );
};

export default OrderHistoryCard;
