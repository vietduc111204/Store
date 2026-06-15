import { FileSpreadsheet, Printer } from "lucide-react";
import type { ProductStats, RevenueStats } from "@/types/management";
import { exportExcel, printReport } from "./reportExport";
import { formatMoney, PAGE_SIZE, PaginationFooter, StatBox, usePaginatedRows } from "./shared";

const ReportDashboard = ({ revenueStats, productStats }: { revenueStats: RevenueStats; productStats: ProductStats }) => {
  const bestSelling = productStats.bestSelling || [];
  const { currentPage, pageRows, pageSize, setPage, totalPages } = usePaginatedRows(bestSelling, PAGE_SIZE);

  return (
    <div>
      <div className="mb-5 flex justify-end gap-2">
        <button
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50"
          onClick={() => printReport(revenueStats, productStats)}
        >
          <Printer size={16} />
          In báo cáo
        </button>
        <button
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-black text-white shadow-sm hover:bg-emerald-700"
          onClick={() => exportExcel(revenueStats, productStats)}
        >
          <FileSpreadsheet size={16} />
          Xuất Excel
        </button>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Tổng doanh thu</p>
          <strong className="mt-2 block text-3xl text-slate-950">{formatMoney(revenueStats.totalRevenue)}</strong>
          <div className="mt-6 divide-y divide-slate-100">
            {(revenueStats.revenueByStatus || []).map((item) => (
              <div className="flex items-center justify-between py-3" key={item.trangThai}>
                <span className="font-medium">{item.trangThai}</span>
                <span className="text-sm text-slate-500">{item.soDonHang} đơn - {formatMoney(item.doanhThu)}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Thống kê sản phẩm</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <StatBox label="Sản phẩm" value={productStats.summary?.tongSanPham || 0} />
            <StatBox label="Tồn kho" value={productStats.summary?.tongTonKho || 0} />
            <StatBox label="Giá TB" value={formatMoney(productStats.summary?.giaTrungBinh)} />
          </div>
          <div className="mt-6 divide-y divide-slate-100">
            {pageRows.map((item) => (
              <div className="flex items-center justify-between gap-4 py-3" key={item.maSanPham}>
                <span className="font-medium">{item.tenSanPham}</span>
                <span className="shrink-0 text-sm text-slate-500">{item.soLuongDaBan} bán - {formatMoney(item.doanhThu)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-slate-100 pt-5 text-sm text-slate-600">
            <PaginationFooter
              currentPage={currentPage}
              itemLabel="sản phẩm"
              pageSize={pageSize}
              setPage={setPage}
              totalItems={bestSelling.length}
              totalPages={totalPages}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default ReportDashboard;
