import type { Employee } from "@/types/management";
import { DataShell, EmptyRow, PaginationFooter, RowActions, Toolbar, usePaginatedRows } from "./shared";

type Props = {
  employees: Employee[];
  query: string;
  onQueryChange: (value: string) => void;
  onCreate: () => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
};

const EmployeeDashboard = ({ employees, query, onQueryChange, onCreate, onEdit, onDelete }: Props) => {
  const { currentPage, pageRows, pageSize, setPage, totalPages } = usePaginatedRows(employees);

  return (
    <>
      <Toolbar addLabel="Thêm nhân viên" onAdd={onCreate} onQueryChange={onQueryChange} placeholder="Tìm kiếm nhân viên..." query={query} />
      <DataShell footer={<PaginationFooter currentPage={currentPage} itemLabel="nhân viên" pageSize={pageSize} setPage={setPage} totalItems={employees.length} totalPages={totalPages} />}>
        <thead className="bg-slate-100 text-left text-xs font-bold uppercase text-slate-600">
          <tr>
            <th className="px-8 py-5">Nhân viên</th>
            <th className="px-6 py-5">Email</th>
            <th className="px-6 py-5">Số điện thoại</th>
            <th className="px-6 py-5">Địa chỉ</th>
            <th className="px-6 py-5">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {pageRows.map((employee) => (
            <tr className="border-t border-slate-100" key={employee.maNhanVien}>
              <td className="px-8 py-4 font-bold">{employee.tenNhanVien}</td>
              <td className="px-6 py-4 text-slate-600">{employee.email || "-"}</td>
              <td className="px-6 py-4">{employee.soDienThoai || "-"}</td>
              <td className="px-6 py-4">{employee.diaChi || "-"}</td>
              <td className="px-6 py-4"><RowActions onDelete={() => onDelete(employee)} onEdit={() => onEdit(employee)} /></td>
            </tr>
          ))}
          {employees.length === 0 ? <EmptyRow colSpan={5} /> : null}
        </tbody>
      </DataShell>
    </>
  );
};

export default EmployeeDashboard;
