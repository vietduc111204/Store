import type { Promotion } from "@/types/management";
import { DataShell, EmptyRow, PaginationFooter, RowActions, Toolbar, usePaginatedRows } from "./shared";

type Props = {
  promotions: Promotion[];
  query: string;
  onQueryChange: (value: string) => void;
  onCreate: () => void;
  onEdit: (promotion: Promotion) => void;
  onDelete: (promotion: Promotion) => void;
};

const formatDate = (value?: string | null) =>
  value ? new Intl.DateTimeFormat("vi-VN").format(new Date(value)) : "Không giới hạn";

const PromotionDashboard = ({ promotions, query, onQueryChange, onCreate, onEdit, onDelete }: Props) => {
  const { currentPage, pageRows, pageSize, setPage, totalPages } = usePaginatedRows(promotions);

  return (
  <>
    <Toolbar
      addLabel="Thêm khuyến mãi"
      onAdd={onCreate}
      onQueryChange={onQueryChange}
      placeholder="Tìm kiếm theo mã hoặc tên khuyến mãi..."
      query={query}
    />
    <DataShell footer={<PaginationFooter currentPage={currentPage} itemLabel="khuyến mãi" pageSize={pageSize} setPage={setPage} totalItems={promotions.length} totalPages={totalPages} />}>
      <thead className="bg-slate-100 text-left text-xs font-bold uppercase text-slate-600">
        <tr>
          <th className="px-8 py-5">Mã</th>
          <th className="px-6 py-5">Tên khuyến mãi</th>
          <th className="px-6 py-5">% giảm</th>
          <th className="px-6 py-5">Sản phẩm áp dụng</th>
          <th className="px-6 py-5">Thời hạn</th>
          <th className="px-6 py-5">Trạng thái</th>
          <th className="px-6 py-5">Thao tác</th>
        </tr>
      </thead>
      <tbody>
        {pageRows.map((promotion) => (
          <tr className="border-t border-slate-100" key={promotion.maKhuyenMai}>
            <td className="px-8 py-4 font-semibold">KM-{promotion.maKhuyenMai}</td>
            <td className="px-6 py-4 font-bold">{promotion.tenKhuyenMai}</td>
            <td className="px-6 py-4 font-bold text-sky-700">{Number(promotion.phanTramGiam || 0)}%</td>
            <td className="px-6 py-4 text-sm">
              <p className="font-bold text-slate-800">{Number(promotion.soSanPhamApDung || 0)} sản phẩm</p>
              <p className="mt-1 line-clamp-2 max-w-72 text-xs font-semibold text-slate-500">
                {promotion.sanPhamApDung || "Chưa gắn sản phẩm"}
              </p>
            </td>
            <td className="px-6 py-4 text-sm font-semibold text-slate-600">
              {formatDate(promotion.ngayBatDau)} - {formatDate(promotion.ngayKetThuc)}
            </td>
            <td className="px-6 py-4">
              <span
                className={
                  promotion.isActive
                    ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700"
                    : "rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600"
                }
              >
                {promotion.isActive ? "Còn hạn" : "Hết hạn"}
              </span>
            </td>
            <td className="px-6 py-4">
              <RowActions onDelete={() => onDelete(promotion)} onEdit={() => onEdit(promotion)} />
            </td>
          </tr>
        ))}
        {promotions.length === 0 ? <EmptyRow colSpan={7} /> : null}
      </tbody>
    </DataShell>
  </>
  );
};

export default PromotionDashboard;
