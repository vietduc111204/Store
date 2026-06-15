import { Printer } from "lucide-react";
import type { ProductStats, RevenueStats } from "@/types/management";
import { formatMoney, PAGE_SIZE, PaginationFooter, StatBox, usePaginatedRows } from "./shared";

const printReport = (revenueStats: RevenueStats, productStats: ProductStats) => {
  const now = new Date().toLocaleString("vi-VN");
  const bestSelling = productStats.bestSelling || [];
  const revenueByStatus = revenueStats.revenueByStatus || [];
  const revenueByDay = revenueStats.revenueByDay || [];
  const summary = productStats.summary;
  const byCategory = productStats.byCategory || [];

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Báo cáo thống kê - SmartHome</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 13px; color: #1e293b; padding: 32px; }
    h1 { font-size: 22px; font-weight: 900; color: #0879a8; }
    .meta { margin-top: 4px; color: #64748b; font-size: 12px; }
    hr { border: none; border-top: 1px solid #e2e8f0; margin: 20px 0; }
    h2 { font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 12px; }
    .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
    .stat-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; }
    .stat-box .label { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; }
    .stat-box .value { font-size: 20px; font-weight: 900; color: #0f172a; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; padding: 8px 12px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
    td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }
    .total-row td { font-weight: 700; background: #f0f9ff; }
    .section { margin-bottom: 28px; }
    .revenue-total { font-size: 28px; font-weight: 900; color: #0879a8; margin-bottom: 12px; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <h1>SmartHome — Báo cáo thống kê</h1>
  <p class="meta">Xuất lúc: ${now}</p>
  <hr />

  <div class="section">
    <h2>Doanh thu</h2>
    <div class="revenue-total">${Number(revenueStats.totalRevenue || 0).toLocaleString("vi-VN")} đ</div>
    ${revenueByStatus.length ? `
    <table>
      <thead><tr><th>Trạng thái</th><th>Số đơn</th><th>Doanh thu</th></tr></thead>
      <tbody>
        ${revenueByStatus.map((r) => `
          <tr>
            <td>${r.trangThai}</td>
            <td>${r.soDonHang}</td>
            <td>${Number(r.doanhThu || 0).toLocaleString("vi-VN")} đ</td>
          </tr>`).join("")}
        <tr class="total-row">
          <td>Tổng cộng</td>
          <td>${revenueByStatus.reduce((s, r) => s + r.soDonHang, 0)}</td>
          <td>${Number(revenueStats.totalRevenue || 0).toLocaleString("vi-VN")} đ</td>
        </tr>
      </tbody>
    </table>` : ""}
  </div>

  ${revenueByDay.length ? `
  <div class="section">
    <h2>Doanh thu theo ngày</h2>
    <table>
      <thead><tr><th>Ngày</th><th>Số đơn</th><th>Doanh thu</th></tr></thead>
      <tbody>
        ${revenueByDay.map((d) => `
          <tr>
            <td>${d.ngay}</td>
            <td>${d.soDonHang}</td>
            <td>${Number(d.doanhThu || 0).toLocaleString("vi-VN")} đ</td>
          </tr>`).join("")}
      </tbody>
    </table>
  </div>` : ""}

  <div class="section">
    <h2>Thống kê sản phẩm</h2>
    ${summary ? `
    <div class="stat-grid">
      <div class="stat-box"><div class="label">Sản phẩm</div><div class="value">${summary.tongSanPham}</div></div>
      <div class="stat-box"><div class="label">Tồn kho</div><div class="value">${summary.tongTonKho}</div></div>
      <div class="stat-box"><div class="label">Giá trung bình</div><div class="value">${Number(summary.giaTrungBinh || 0).toLocaleString("vi-VN")} đ</div></div>
    </div>` : ""}

    ${byCategory.length ? `
    <table style="margin-bottom:20px">
      <thead><tr><th>Danh mục</th><th>Số sản phẩm</th><th>Tồn kho</th></tr></thead>
      <tbody>
        ${byCategory.map((c) => `
          <tr>
            <td>${c.tenDanhMuc}</td>
            <td>${c.soSanPham}</td>
            <td>${c.tongTonKho}</td>
          </tr>`).join("")}
      </tbody>
    </table>` : ""}

    ${bestSelling.length ? `
    <h2>Sản phẩm bán chạy</h2>
    <table>
      <thead><tr><th>#</th><th>Sản phẩm</th><th>Đã bán</th><th>Doanh thu</th></tr></thead>
      <tbody>
        ${bestSelling.map((p, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${p.tenSanPham}</td>
            <td>${p.soLuongDaBan}</td>
            <td>${Number(p.doanhThu || 0).toLocaleString("vi-VN")} đ</td>
          </tr>`).join("")}
      </tbody>
    </table>` : ""}
  </div>
</body>
</html>`;

  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
};

const ReportDashboard = ({ revenueStats, productStats }: { revenueStats: RevenueStats; productStats: ProductStats }) => {
  const bestSelling = productStats.bestSelling || [];
  const { currentPage, pageRows, pageSize, setPage, totalPages } = usePaginatedRows(bestSelling, PAGE_SIZE);

  return (
    <div>
      <div className="mb-5 flex justify-end">
        <button
          className="flex items-center gap-2 rounded-lg bg-[#0879a8] px-4 py-2.5 text-sm font-black text-white shadow-sm hover:bg-[#075f83]"
          onClick={() => printReport(revenueStats, productStats)}
        >
          <Printer size={16} />
          In báo cáo
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
