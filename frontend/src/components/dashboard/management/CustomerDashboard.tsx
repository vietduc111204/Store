import type { Customer } from "@/types/management";
import { DataShell, EmptyRow, PaginationFooter, RowActions, Toolbar, usePaginatedRows } from "./shared";

type Props = {
  customers: Customer[];
  query: string;
  onQueryChange: (value: string) => void;
  onCreate: () => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
};

const CustomerDashboard = ({ customers, query, onQueryChange, onCreate, onEdit, onDelete }: Props) => {
  const { currentPage, pageRows, pageSize, setPage, totalPages } = usePaginatedRows(customers);

  return (
  <>
    <Toolbar
      addLabel="Thêm khách hàng"
      onAdd={onCreate}
      onQueryChange={onQueryChange}
      placeholder="Tìm kiếm khách hàng..."
      query={query}
    />
    <DataShell footer={<PaginationFooter currentPage={currentPage} itemLabel="khách hàng" pageSize={pageSize} setPage={setPage} totalItems={customers.length} totalPages={totalPages} />}>
      <thead className="bg-slate-100 text-left text-xs font-bold uppercase text-slate-600">
        <tr>
          <th className="px-8 py-5">Khách hàng</th>
          <th className="px-6 py-5">Email</th>
          <th className="px-6 py-5">Số điện thoại</th>
          <th className="px-6 py-5">Địa chỉ</th>
          <th className="px-6 py-5">Thao tác</th>
        </tr>
      </thead>
      <tbody>
        {pageRows.map((customer) => (
          <tr className="border-t border-slate-100" key={customer.maThanhVien}>
            <td className="px-8 py-4 font-bold">{customer.tenThanhVien}</td>
            <td className="px-6 py-4">{customer.email || "-"}</td>
            <td className="px-6 py-4">{customer.soDienThoai || "-"}</td>
            <td className="px-6 py-4">{customer.diaChi || "-"}</td>
            <td className="px-6 py-4">
              <RowActions onDelete={() => onDelete(customer)} onEdit={() => onEdit(customer)} />
            </td>
          </tr>
        ))}
        {customers.length === 0 ? <EmptyRow colSpan={5} /> : null}
      </tbody>
    </DataShell>
  </>
  );
};

export default CustomerDashboard;
