import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import type { ProductStats, RevenueStats } from "@/types/management";

const buildReportHTML = (revenueStats: RevenueStats, productStats: ProductStats, now: string) => {
  const revenueByStatus = revenueStats.revenueByStatus || [];
  const revenueByDay = revenueStats.revenueByDay || [];
  const bestSelling = productStats.bestSelling || [];
  const byCategory = productStats.byCategory || [];
  const summary = productStats.summary;

  const fmt = (v?: string | number | null) => `${Number(v || 0).toLocaleString("vi-VN")} đ`;
  const row = (cells: string[]) => `<tr>${cells.map((c) => `<td style="padding:7px 10px;border-bottom:1px solid #f1f5f9">${c}</td>`).join("")}</tr>`;
  const thead = (cols: string[]) =>
    `<thead><tr>${cols.map((c) => `<th style="padding:7px 10px;background:#f8fafc;font-size:11px;text-transform:uppercase;color:#64748b;text-align:left;border-bottom:1px solid #e2e8f0">${c}</th>`).join("")}</tr></thead>`;
  const table = (cols: string[], rows: string[]) =>
    `<table style="width:100%;border-collapse:collapse;margin-top:12px">${thead(cols)}<tbody>${rows.join("")}</tbody></table>`;
  const section = (title: string, body: string) =>
    `<div style="margin-bottom:28px"><h2 style="font-size:15px;font-weight:800;color:#0f172a;margin-bottom:4px">${title}</h2>${body}</div>`;

  const totalOrders = revenueByStatus.reduce((s, r) => s + r.soDonHang, 0);

  return `<div style="font-family:Arial,sans-serif;font-size:13px;color:#1e293b;padding:36px;width:794px;background:#fff">
  <h1 style="font-size:22px;font-weight:900;color:#0879a8;margin:0">SmartHome — Báo cáo thống kê</h1>
  <p style="color:#64748b;font-size:12px;margin-top:4px">Xuất lúc: ${now}</p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0" />

  ${section(
    "Doanh thu",
    `<p style="font-size:26px;font-weight:900;color:#0879a8;margin:8px 0 12px">${fmt(revenueStats.totalRevenue)}</p>
    ${table(
      ["Trạng thái", "Số đơn", "Doanh thu"],
      [
        ...revenueByStatus.map((r) => row([r.trangThai, String(r.soDonHang), fmt(r.doanhThu)])),
        `<tr style="background:#f0f9ff;font-weight:700"><td style="padding:7px 10px">Tổng cộng</td><td style="padding:7px 10px">${totalOrders}</td><td style="padding:7px 10px">${fmt(revenueStats.totalRevenue)}</td></tr>`,
      ]
    )}`
  )}

  ${revenueByDay.length ? section(
    "Doanh thu theo ngày",
    table(
      ["Ngày", "Số đơn", "Doanh thu"],
      revenueByDay.map((d) => row([d.ngay, String(d.soDonHang), fmt(d.doanhThu)]))
    )
  ) : ""}

  ${section(
    "Thống kê sản phẩm",
    `${summary ? `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:12px 0">
      ${[["Tổng sản phẩm", summary.tongSanPham], ["Tồn kho", summary.tongTonKho], ["Giá trung bình", fmt(summary.giaTrungBinh)]]
        .map(([label, value]) => `<div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px 14px">
          <div style="font-size:11px;color:#64748b;text-transform:uppercase;font-weight:700">${label}</div>
          <div style="font-size:18px;font-weight:900;margin-top:4px">${value}</div>
        </div>`).join("")}
    </div>` : ""}
    ${byCategory.length ? table(
      ["Danh mục", "Số sản phẩm", "Tồn kho"],
      byCategory.map((c) => row([c.tenDanhMuc, String(c.soSanPham), String(c.tongTonKho)]))
    ) : ""}
    ${bestSelling.length ? `<h3 style="font-size:14px;font-weight:800;margin-top:20px;margin-bottom:4px">Sản phẩm bán chạy</h3>
    ${table(
      ["#", "Sản phẩm", "Đã bán", "Doanh thu"],
      bestSelling.map((p, i) => row([String(i + 1), p.tenSanPham, String(p.soLuongDaBan), fmt(p.doanhThu)]))
    )}` : ""}
  `)}
</div>`;
};

export const exportPDF = async (revenueStats: RevenueStats, productStats: ProductStats) => {
  const now = new Date().toLocaleString("vi-VN");
  const el = document.createElement("div");
  el.style.cssText = "position:absolute;left:-9999px;top:0;background:#fff";
  el.innerHTML = buildReportHTML(revenueStats, productStats, now);
  document.body.appendChild(el);

  try {
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgH = (canvas.height * pageW) / canvas.width;
    let remaining = imgH;
    let offsetY = 0;

    pdf.addImage(imgData, "PNG", 0, offsetY, pageW, imgH);
    remaining -= pageH;
    while (remaining > 0) {
      offsetY -= pageH;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, offsetY, pageW, imgH);
      remaining -= pageH;
    }

    pdf.save("bao-cao-thong-ke.pdf");
  } finally {
    document.body.removeChild(el);
  }
};

export const exportExcel = (revenueStats: RevenueStats, productStats: ProductStats) => {
  const wb = XLSX.utils.book_new();
  const now = new Date().toLocaleString("vi-VN");

  // Sheet 1: Revenue
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

  // Sheet 2: Revenue by day (if available)
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

  // Sheet 3: Products
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

  // Sheet 4: By category (if available)
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
