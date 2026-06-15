import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import type { ProductStats, RevenueStats } from "@/types/management";

const fmt = (v?: string | number | null) =>
  `${Number(v || 0).toLocaleString("vi-VN")} đ`;

const buildPrintHTML = (
  revenueStats: RevenueStats,
  productStats: ProductStats,
  now: string
) => {
  const revenueByStatus = revenueStats.revenueByStatus || [];
  const revenueByDay = revenueStats.revenueByDay || [];
  const bestSelling = productStats.bestSelling || [];
  const byCategory = productStats.byCategory || [];
  const summary = productStats.summary;
  const totalOrders = revenueByStatus.reduce((s, r) => s + r.soDonHang, 0);

  const tdStyle = `padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:12px`;
  const thStyle = `padding:7px 10px;background:#f8fafc;font-size:10px;text-transform:uppercase;color:#64748b;text-align:left;border-bottom:1px solid #e2e8f0;font-weight:700`;

  return `<!DOCTYPE html>
<html lang="vi"><head><meta charset="UTF-8"/>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,sans-serif;font-size:13px;color:#1e293b;padding:32px;width:794px}
  h1{font-size:20px;font-weight:900;color:#0879a8}
  h2{font-size:14px;font-weight:800;color:#0f172a;margin:20px 0 8px}
  h3{font-size:13px;font-weight:800;margin:16px 0 6px}
  table{width:100%;border-collapse:collapse;margin-bottom:16px}
  .revenue-total{font-size:24px;font-weight:900;color:#0879a8;margin:8px 0 12px}
  .meta{color:#64748b;font-size:11px;margin-top:4px}
  hr{border:none;border-top:1px solid #e2e8f0;margin:18px 0}
  .stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:8px 0 16px}
  .stat-box{border:1px solid #e2e8f0;border-radius:6px;padding:10px 12px}
  .stat-box .lbl{font-size:10px;color:#64748b;text-transform:uppercase;font-weight:700}
  .stat-box .val{font-size:17px;font-weight:900;margin-top:3px}
  .total-row{background:#f0f9ff;font-weight:700}
</style></head><body>
<h1>SmartHome — Báo cáo thống kê</h1>
<p class="meta">Xuất lúc: ${now}</p>
<hr/>

<h2>Doanh thu</h2>
<p class="revenue-total">${fmt(revenueStats.totalRevenue)}</p>
${revenueByStatus.length ? `
<table>
  <thead><tr>
    <th style="${thStyle}">Trạng thái</th>
    <th style="${thStyle}">Số đơn</th>
    <th style="${thStyle}">Doanh thu</th>
  </tr></thead>
  <tbody>
    ${revenueByStatus.map((r) => `<tr>
      <td style="${tdStyle}">${r.trangThai}</td>
      <td style="${tdStyle}">${r.soDonHang}</td>
      <td style="${tdStyle}">${fmt(r.doanhThu)}</td>
    </tr>`).join("")}
    <tr class="total-row">
      <td style="${tdStyle}">Tổng cộng</td>
      <td style="${tdStyle}">${totalOrders}</td>
      <td style="${tdStyle}">${fmt(revenueStats.totalRevenue)}</td>
    </tr>
  </tbody>
</table>` : ""}

${revenueByDay.length ? `
<h2>Doanh thu theo ngày</h2>
<table>
  <thead><tr>
    <th style="${thStyle}">Ngày</th>
    <th style="${thStyle}">Số đơn</th>
    <th style="${thStyle}">Doanh thu</th>
  </tr></thead>
  <tbody>
    ${revenueByDay.map((d) => `<tr>
      <td style="${tdStyle}">${d.ngay}</td>
      <td style="${tdStyle}">${d.soDonHang}</td>
      <td style="${tdStyle}">${fmt(d.doanhThu)}</td>
    </tr>`).join("")}
  </tbody>
</table>` : ""}

<h2>Thống kê sản phẩm</h2>
${summary ? `
<div class="stat-grid">
  <div class="stat-box"><div class="lbl">Tổng sản phẩm</div><div class="val">${summary.tongSanPham}</div></div>
  <div class="stat-box"><div class="lbl">Tồn kho</div><div class="val">${summary.tongTonKho}</div></div>
  <div class="stat-box"><div class="lbl">Giá trung bình</div><div class="val">${fmt(summary.giaTrungBinh)}</div></div>
</div>` : ""}

${byCategory.length ? `
<h3>Theo danh mục</h3>
<table>
  <thead><tr>
    <th style="${thStyle}">Danh mục</th>
    <th style="${thStyle}">Số sản phẩm</th>
    <th style="${thStyle}">Tồn kho</th>
  </tr></thead>
  <tbody>
    ${byCategory.map((c) => `<tr>
      <td style="${tdStyle}">${c.tenDanhMuc}</td>
      <td style="${tdStyle}">${c.soSanPham}</td>
      <td style="${tdStyle}">${c.tongTonKho}</td>
    </tr>`).join("")}
  </tbody>
</table>` : ""}

${bestSelling.length ? `
<h3>Sản phẩm bán chạy</h3>
<table>
  <thead><tr>
    <th style="${thStyle}">#</th>
    <th style="${thStyle}">Sản phẩm</th>
    <th style="${thStyle}">Đã bán</th>
    <th style="${thStyle}">Doanh thu</th>
  </tr></thead>
  <tbody>
    ${bestSelling.map((p, i) => `<tr>
      <td style="${tdStyle}">${i + 1}</td>
      <td style="${tdStyle}">${p.tenSanPham}</td>
      <td style="${tdStyle}">${p.soLuongDaBan}</td>
      <td style="${tdStyle}">${fmt(p.doanhThu)}</td>
    </tr>`).join("")}
  </tbody>
</table>` : ""}
</body></html>`;
};

export const exportPDF = async (
  revenueStats: RevenueStats,
  productStats: ProductStats
) => {
  const now = new Date().toLocaleString("vi-VN");

  const el = document.createElement("div");
  el.style.cssText =
    "position:fixed;top:0;left:0;width:794px;background:#fff;z-index:-1;pointer-events:none;visibility:hidden";
  el.innerHTML = buildPrintHTML(revenueStats, productStats, now);
  document.body.appendChild(el);

  // Let the browser lay out the element
  await new Promise<void>((resolve) => setTimeout(resolve, 200));

  return new Promise<void>((resolve, reject) => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    doc.html(el, {
      callback: (pdf) => {
        try {
          pdf.save("bao-cao-thong-ke.pdf");
          resolve();
        } catch (err) {
          reject(err);
        } finally {
          if (document.body.contains(el)) document.body.removeChild(el);
        }
      },
      x: 5,
      y: 5,
      width: 200,
      windowWidth: 794,
      html2canvas: {
        scale: 0.75,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        removeContainer: true,
      },
      autoPaging: "text",
    });
  });
};

// --- Print window (existing) ---
export const printReport = (
  revenueStats: RevenueStats,
  productStats: ProductStats
) => {
  const now = new Date().toLocaleString("vi-VN");
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;
  win.document.write(buildPrintHTML(revenueStats, productStats, now));
  win.document.close();
  win.focus();
  win.print();
};

// --- Excel export ---
export const exportExcel = (
  revenueStats: RevenueStats,
  productStats: ProductStats
) => {
  const wb = XLSX.utils.book_new();
  const now = new Date().toLocaleString("vi-VN");

  const revenueByStatus = revenueStats.revenueByStatus || [];
  const totalOrders = revenueByStatus.reduce((s, r) => s + r.soDonHang, 0);
  const ws1 = XLSX.utils.aoa_to_sheet([
    [`Báo cáo doanh thu — ${now}`],
    [],
    ["Trạng thái", "Số đơn hàng", "Doanh thu (đ)"],
    ...revenueByStatus.map((r) => [r.trangThai, r.soDonHang, Number(r.doanhThu || 0)]),
    ["Tổng cộng", totalOrders, Number(revenueStats.totalRevenue || 0)],
  ]);
  ws1["!cols"] = [{ wch: 24 }, { wch: 14 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws1, "Doanh thu");

  const revenueByDay = revenueStats.revenueByDay || [];
  if (revenueByDay.length) {
    const ws2 = XLSX.utils.aoa_to_sheet([
      [`Doanh thu theo ngày — ${now}`],
      [],
      ["Ngày", "Số đơn hàng", "Doanh thu (đ)"],
      ...revenueByDay.map((d) => [d.ngay, d.soDonHang, Number(d.doanhThu || 0)]),
    ]);
    ws2["!cols"] = [{ wch: 16 }, { wch: 14 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws2, "Theo ngày");
  }

  const bestSelling = productStats.bestSelling || [];
  const summary = productStats.summary;
  const rows: (string | number)[][] = [
    [`Thống kê sản phẩm — ${now}`],
    [],
  ];
  if (summary) {
    rows.push(["Tổng sản phẩm", summary.tongSanPham]);
    rows.push(["Tổng tồn kho", summary.tongTonKho]);
    rows.push(["Giá trung bình (đ)", Number(summary.giaTrungBinh || 0)]);
    rows.push([]);
  }
  if (bestSelling.length) {
    rows.push(["#", "Sản phẩm", "Đã bán", "Doanh thu (đ)"]);
    bestSelling.forEach((p, i) =>
      rows.push([i + 1, p.tenSanPham, p.soLuongDaBan, Number(p.doanhThu || 0)])
    );
  }
  const ws3 = XLSX.utils.aoa_to_sheet(rows);
  ws3["!cols"] = [{ wch: 6 }, { wch: 36 }, { wch: 12 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws3, "Sản phẩm");

  const byCategory = productStats.byCategory || [];
  if (byCategory.length) {
    const ws4 = XLSX.utils.aoa_to_sheet([
      [`Sản phẩm theo danh mục — ${now}`],
      [],
      ["Danh mục", "Số sản phẩm", "Tồn kho"],
      ...byCategory.map((c) => [c.tenDanhMuc, c.soSanPham, c.tongTonKho]),
    ]);
    ws4["!cols"] = [{ wch: 28 }, { wch: 14 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, ws4, "Danh mục");
  }

  XLSX.writeFile(wb, "bao-cao-thong-ke.xlsx");
};
