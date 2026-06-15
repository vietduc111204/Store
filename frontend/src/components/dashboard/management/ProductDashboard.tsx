import { Package } from "lucide-react";
import type { Product } from "@/types/management";
import { cx, DataShell, EmptyRow, formatMoney, PaginationFooter, RowActions, Toolbar, usePaginatedRows } from "./shared";

type Props = {
  products: Product[];
  query: string;
  categoryFilter: string;
  categoryOptions: Array<{ label: string; value: string }>;
  onQueryChange: (value: string) => void;
  onCategoryFilterChange: (value: string) => void;
  onCreate: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

const formatDateRange = (start?: string | null, end?: string | null) => {
  const formatDate = (value?: string | null) =>
    value ? new Intl.DateTimeFormat("vi-VN").format(new Date(value)) : "";
  const startText = formatDate(start);
  const endText = formatDate(end);
  if (startText && endText) return `${startText} - ${endText}`;
  if (startText) return `Từ ${startText}`;
  if (endText) return `Đến ${endText}`;
  return "Không giới hạn thời gian";
};

const ProductDashboard = ({ products, query, categoryFilter, categoryOptions, onQueryChange, onCategoryFilterChange, onCreate, onEdit, onDelete }: Props) => {
  const { currentPage, pageRows, pageSize, setPage, totalPages } = usePaginatedRows(products);

  return (
    <>
      <Toolbar addLabel="Thêm sản phẩm" categoryFilter={categoryFilter} categoryOptions={categoryOptions} onAdd={onCreate} onCategoryFilterChange={onCategoryFilterChange} onQueryChange={onQueryChange} placeholder="Tìm kiếm sản phẩm..." query={query} />
      <DataShell footer={<PaginationFooter currentPage={currentPage} itemLabel="sản phẩm" pageSize={pageSize} setPage={setPage} totalItems={products.length} totalPages={totalPages} />}>
        <thead className="bg-slate-100 text-left text-xs font-bold uppercase text-slate-600">
          <tr>
            <th className="px-8 py-5">Hình ảnh</th>
            <th className="px-6 py-5">Tên sản phẩm</th>
            <th className="px-6 py-5">Danh mục</th>
            <th className="px-6 py-5">Giá bán</th>
            <th className="px-6 py-5">Kho hàng</th>
            <th className="px-6 py-5">Trạng thái</th>
            <th className="px-6 py-5">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {pageRows.map((product) => {
            const discount = Number(product.phanTramGiam || 0);
            return (
            <tr className="border-t border-slate-100" key={product.maSanPham}>
              <td className="px-8 py-4">
                {product.anh ? (
                  <img alt={product.tenSanPham} className="size-14 rounded-lg border border-slate-200 object-cover" src={product.anh} />
                ) : (
                  <div className="flex size-14 items-center justify-center rounded-lg bg-sky-100 text-sky-700"><Package size={22} /></div>
                )}
              </td>
              <td className="px-6 py-4">
                <p className="font-bold text-slate-950">{product.tenSanPham}</p>
                <p className="mt-1 text-sm text-slate-500">Mã: SP-{product.maSanPham}</p>
              </td>
              <td className="px-6 py-4 text-sm">{product.tenDanhMuc || "Chưa phân loại"}</td>
              <td className="px-6 py-4">
                <p className="font-bold">{formatMoney(product.gia)}</p>
                {discount ? <p className="mt-1 text-xs font-bold text-red-700">Đang giảm giá -{discount}%</p> : null}
              </td>
              <td className="px-6 py-4">
                <span className={cx("rounded-full px-4 py-2 text-sm font-bold", Number(product.soLuong) > 0 ? "bg-sky-100 text-sky-900" : "bg-red-100 text-red-700")}>{product.soLuong}</span>
              </td>
              <td className="px-6 py-4">
                <span className={cx("rounded-full px-4 py-2 text-sm font-bold", discount ? "bg-red-50 text-red-700" : "bg-blue-100 text-slate-800")}>
                  {discount ? "Đang được giảm giá" : Number(product.soLuong) > 0 ? "Đang bán" : "Hết hàng"}
                </span>
                {discount ? <p className="mt-2 text-xs font-semibold text-slate-500">{formatDateRange(product.ngayBatDau, product.ngayKetThuc)}</p> : null}
              </td>
              <td className="px-6 py-4"><RowActions onDelete={() => onDelete(product)} onEdit={() => onEdit(product)} /></td>
            </tr>
          )})}
          {products.length === 0 ? <EmptyRow colSpan={7} /> : null}
        </tbody>
      </DataShell>
    </>
  );
};

export default ProductDashboard;
