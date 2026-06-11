import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import api from "@/libs/axios";
import type { Order, OrderDetail } from "@/types/management";
import { DataShell, EmptyRow, formatMoney, PaginationFooter, Toolbar, usePaginatedRows } from "./shared";

type Props = {
  orders: Order[];
  query: string;
  onQueryChange: (value: string) => void;
  onCreate: () => void;
  onEdit: (order: Order) => void;
  onCancel: (order: Order) => void;
  onStatusChange: (order: Order, status: string) => void;
};

const OrderDashboard = ({ orders, query, onQueryChange, onCreate, onEdit, onCancel, onStatusChange }: Props) => {
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [details, setDetails] = useState<OrderDetail[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const { currentPage, pageRows, pageSize, setPage, totalPages } = usePaginatedRows(orders);

  const openDetails = async (order: Order) => {
    setDetailOrder(order);
    setDetails([]);
    setDetailLoading(true);

    try {
      const res = await api.get<OrderDetail[]>(`/don-hang/${order.maDonHang}/chi-tiet`);
      setDetails(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải chi tiết đơn hàng");
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <>
      <Toolbar
        addLabel="Thêm đơn hàng"
        onAdd={onCreate}
        onQueryChange={onQueryChange}
        placeholder="Tìm kiếm theo mã đơn hàng..."
        query={query}
      />
      <DataShell footer={<PaginationFooter currentPage={currentPage} itemLabel="đơn hàng" pageSize={pageSize} setPage={setPage} totalItems={orders.length} totalPages={totalPages} />}>
        <thead className="bg-slate-100 text-left text-xs font-bold uppercase text-slate-600">
          <tr>
            <th className="px-8 py-5">Mã đơn</th>
            <th className="px-6 py-5">Khách hàng</th>
            <th className="px-6 py-5">Khuyến mãi</th>
            <th className="px-6 py-5">Tổng giá</th>
            <th className="px-6 py-5">Trạng thái</th>
            <th className="px-6 py-5">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {pageRows.map((order) => (
            <tr
              className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
              key={order.maDonHang}
              onClick={() => void openDetails(order)}
            >
              <td className="px-8 py-4 font-bold">DH-{order.maDonHang}</td>
              <td className="px-6 py-4">
                <p className="font-semibold">{order.tenThanhVien || `KH-${order.maKhachHang}`}</p>
                <p className="text-sm text-slate-500">{order.email || order.soDienThoai || "-"}</p>
              </td>
              <td className="px-6 py-4">
                {order.tenKhuyenMai ? (
                  <>
                    <p className="font-bold">{order.tenKhuyenMai}</p>
                    <p className="text-sm text-sky-700">Giảm {Number(order.phanTramGiam || 0)}%</p>
                  </>
                ) : (
                  <span className="text-sm text-slate-500">Không áp dụng</span>
                )}
              </td>
              <td className="px-6 py-4 font-bold">{formatMoney(order.tongGia)}</td>
              <td className="px-6 py-4">
                <select
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold"
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) => onStatusChange(order, event.target.value)}
                  value={order.trangThai || ""}
                >
                  <option value="">Chưa cập nhật</option>
                  <option value="Mới tạo">Mới tạo</option>
                  <option value="Đang xử lý">Đang xử lý</option>
                  <option value="Đang giao">Đang giao</option>
                  <option value="Hoàn thành">Hoàn thành</option>
                  <option value="Đã hủy">Đã hủy</option>
                </select>
              </td>
              <td className="px-6 py-4">
                <button
                  className="mr-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-sky-700 hover:bg-sky-50"
                  onClick={(event) => {
                    event.stopPropagation();
                    onEdit(order);
                  }}
                  type="button"
                >
                  Sửa
                </button>
                <button
                  className="rounded-lg border border-red-100 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
                  onClick={(event) => {
                    event.stopPropagation();
                    onCancel(order);
                  }}
                  type="button"
                >
                  Hủy đơn
                </button>
              </td>
            </tr>
          ))}
          {orders.length === 0 ? <EmptyRow colSpan={6} /> : null}
        </tbody>
      </DataShell>

      {detailOrder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <section className="w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-950">Chi tiết đơn hàng DH-{detailOrder.maDonHang}</h3>
                <p className="text-sm text-slate-500">
                  {detailOrder.tenThanhVien || `KH-${detailOrder.maKhachHang}`} - {formatMoney(detailOrder.tongGia)}
                </p>
              </div>
              <button
                className="flex size-9 items-center justify-center rounded-lg hover:bg-slate-100"
                onClick={() => setDetailOrder(null)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-slate-100 text-left text-xs font-bold uppercase text-slate-600">
                  <tr>
                    <th className="px-5 py-4">Sản phẩm</th>
                    <th className="px-5 py-4">Số lượng</th>
                    <th className="px-5 py-4">Giá</th>
                    <th className="px-5 py-4">Khuyến mãi</th>
                    <th className="px-5 py-4">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {detailLoading ? (
                    <tr>
                      <td className="px-5 py-10 text-center font-semibold text-slate-500" colSpan={5}>
                        Đang tải chi tiết...
                      </td>
                    </tr>
                  ) : details.length ? (
                    details.map((detail) => (
                      <tr className="border-t border-slate-100" key={`${detail.maDonHang}-${detail.maSanPham}`}>
                        <td className="px-5 py-4 font-bold">{detail.tenSanPham}</td>
                        <td className="px-5 py-4">{detail.soLuong}</td>
                        <td className="px-5 py-4">{formatMoney(detail.gia)}</td>
                        <td className="px-5 py-4">
                          {detail.tenKhuyenMai ? `${detail.tenKhuyenMai} - ${Number(detail.phanTramGiam || 0)}%` : "-"}
                        </td>
                        <td className="px-5 py-4 font-bold">{formatMoney(detail.thanhTien)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-5 py-10 text-center font-semibold text-slate-500" colSpan={5}>
                        Đơn hàng chưa có chi tiết
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
};

export default OrderDashboard;
