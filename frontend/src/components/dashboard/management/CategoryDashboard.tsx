import type { Category } from "@/types/management";
import { DataShell, EmptyRow, PaginationFooter, RowActions, Toolbar, usePaginatedRows } from "./shared";

type Props = {
  categories: Category[];
  query: string;
  onQueryChange: (value: string) => void;
  onCreate: () => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
};

const CategoryDashboard = ({ categories, query, onQueryChange, onCreate, onEdit, onDelete }: Props) => {
  const { currentPage, pageRows, pageSize, setPage, totalPages } = usePaginatedRows(categories);

  return (
    <>
      <Toolbar addLabel="Thêm danh mục" onAdd={onCreate} onQueryChange={onQueryChange} placeholder="Tìm kiếm danh mục..." query={query} />
      <DataShell footer={<PaginationFooter currentPage={currentPage} itemLabel="danh mục" pageSize={pageSize} setPage={setPage} totalItems={categories.length} totalPages={totalPages} />}>
        <thead className="bg-slate-100 text-left text-xs font-bold uppercase text-slate-600">
          <tr>
            <th className="px-8 py-5">Mã</th>
            <th className="px-6 py-5">Tên danh mục</th>
            <th className="px-6 py-5">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {pageRows.map((category) => (
            <tr className="border-t border-slate-100" key={category.maDanhMuc}>
              <td className="px-8 py-4 font-semibold">DM-{category.maDanhMuc}</td>
              <td className="px-6 py-4 font-bold">{category.tenDanhMuc}</td>
              <td className="px-6 py-4"><RowActions onDelete={() => onDelete(category)} onEdit={() => onEdit(category)} /></td>
            </tr>
          ))}
          {categories.length === 0 ? <EmptyRow colSpan={3} /> : null}
        </tbody>
      </DataShell>
    </>
  );
};

export default CategoryDashboard;
