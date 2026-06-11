import { ChevronDown, ChevronLeft, ChevronRight, Edit3, Plus, Search, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

export const formatMoney = (value?: string | number | null) =>
  `${Number(value || 0).toLocaleString("vi-VN")} đ`;

export const fieldValue = (value: unknown) =>
  value === null || value === undefined ? "" : String(value);

export const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export const PAGE_SIZE = 8;

export const usePaginatedRows = <T,>(rows: T[], pageSize = PAGE_SIZE) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  useEffect(() => {
    setPage(1);
  }, [rows]);

  const pageRows = useMemo(
    () => rows.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, pageSize, rows]
  );

  return { currentPage, pageRows, pageSize, setPage, totalPages };
};

export const PaginationFooter = ({
  currentPage,
  itemLabel,
  pageSize,
  setPage,
  totalItems,
  totalPages,
}: {
  currentPage: number;
  itemLabel: string;
  pageSize: number;
  setPage: (page: number) => void;
  totalItems: number;
  totalPages: number;
}) => {
  const from = totalItems ? (currentPage - 1) * pageSize + 1 : 0;
  const to = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span>
        Hiển thị {from}-{to} / {totalItems} {itemLabel}
      </span>
      {totalPages > 1 ? (
        <div className="flex items-center gap-2">
          <button
            className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
            type="button"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <button
              className={
                pageNumber === currentPage
                  ? "min-w-9 rounded-lg bg-sky-700 px-3 py-2 text-sm font-black text-white"
                  : "min-w-9 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
              }
              key={pageNumber}
              onClick={() => setPage(pageNumber)}
              type="button"
            >
              {pageNumber}
            </button>
          ))}
          <button
            className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={currentPage === totalPages}
            onClick={() => setPage(currentPage + 1)}
            type="button"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      ) : null}
    </div>
  );
};

export const DataShell = ({ children, footer }: { children: ReactNode; footer: ReactNode }) => (
  <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
    <div className="min-h-[560px] overflow-x-auto">
      <table className="w-full min-w-[920px] border-collapse text-sm">{children}</table>
    </div>
    <div className="border-t border-slate-100 px-6 py-5 text-sm text-slate-600">{footer}</div>
  </section>
);

export const EmptyRow = ({ colSpan }: { colSpan: number }) => (
  <tr className="border-t border-slate-100">
    <td className="px-6 py-12 text-center text-sm font-semibold text-slate-500" colSpan={colSpan}>
      Không tìm thấy dữ liệu
    </td>
  </tr>
);

export const StatBox = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-lg bg-slate-50 p-4">
    <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
    <strong className="mt-2 block text-xl text-slate-950">{value}</strong>
  </div>
);

export const Toolbar = ({
  placeholder,
  query,
  onQueryChange,
  onAdd,
  addLabel,
  categoryOptions,
  categoryFilter,
  onCategoryFilterChange,
}: {
  placeholder: string;
  query: string;
  onQueryChange: (value: string) => void;
  onAdd?: () => void;
  addLabel?: string;
  categoryOptions?: Array<{ label: string; value: string }>;
  categoryFilter?: string;
  onCategoryFilterChange?: (value: string) => void;
}) => (
  <section className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm xl:flex-row xl:items-center">
    <label className="relative min-w-0 flex-1">
      <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-500" />
      <input
        className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm outline-none focus:border-sky-500 focus:bg-white"
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={placeholder}
        value={query}
      />
    </label>
    {categoryOptions && categoryFilter && onCategoryFilterChange ? (
      <label className="relative">
        <select
          className="h-12 min-w-56 appearance-none rounded-lg border border-slate-200 bg-slate-50 px-4 pr-10 text-sm outline-none focus:border-sky-500"
          onChange={(event) => onCategoryFilterChange(event.target.value)}
          value={categoryFilter}
        >
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-600" />
      </label>
    ) : null}
    {onAdd ? (
      <button
        className="flex h-12 items-center justify-center gap-2 rounded-lg bg-sky-700 px-5 text-sm font-bold text-white hover:bg-sky-800"
        onClick={onAdd}
        type="button"
      >
        <Plus size={18} />
        {addLabel}
      </button>
    ) : null}
  </section>
);

export const RowActions = ({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) => (
  <div className="flex items-center gap-2">
    <button className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-sky-700 hover:bg-sky-50" onClick={onEdit} title="Sửa" type="button">
      <Edit3 size={16} />
    </button>
    <button className="flex size-9 items-center justify-center rounded-lg border border-red-100 text-red-600 hover:bg-red-50" onClick={onDelete} title="Xóa" type="button">
      <Trash2 size={16} />
    </button>
  </div>
);
