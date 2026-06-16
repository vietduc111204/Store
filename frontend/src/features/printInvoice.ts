import type { Order, OrderDetail } from "@/types/management";

const formatMoney = (value?: string | number | null) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(Number(value) || 0);

const formatDate = (value?: string | null) => {
  if (!value) return new Date().toLocaleDateString("vi-VN");
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toLocaleDateString("vi-VN") : date.toLocaleDateString("vi-VN");
};

const statusBadge = (status?: string | null) => {
  const s = (status || "Mới tạo").trim();
  const map: Record<string, string> = {
    "Hoàn thành": "badge-green",
    "Đang giao": "badge-blue",
    "Đang xử lý": "badge-orange",
    "Đã hủy": "badge-red",
  };
  return `<span class="badge ${map[s] ?? "badge-default"}">${s}</span>`;
};

export const printInvoice = (order: Order, details: OrderDetail[]) => {
  const itemRows = details
    .map((detail) => {
      const qty = Number(detail.soLuong) || 1;
      const unitPrice = Number(detail.gia) || 0;
      const lineTotal = Number(detail.thanhTien) || 0;
      const finalUnit = qty ? Math.round(lineTotal / qty) : lineTotal;
      const hasDiscount = unitPrice > finalUnit;
      const priceCell = hasDiscount
        ? `<span style="text-decoration:line-through;color:#94a3b8;font-size:11px;">${formatMoney(unitPrice)}</span><br/><strong>${formatMoney(finalUnit)}</strong>`
        : `<strong>${formatMoney(finalUnit)}</strong>`;
      const promoCell = detail.tenKhuyenMai
        ? `<span style="color:#075f83;font-size:11px;">${detail.tenKhuyenMai}${Number(detail.phanTramGiam) ? ` -${Number(detail.phanTramGiam)}%` : ""}</span>`
        : `<span style="color:#94a3b8;">-</span>`;
      return `<tr>
        <td>${detail.tenSanPham}<br/><span style="color:#94a3b8;font-size:11px;">SP-${detail.maSanPham}</span></td>
        <td class="text-center">${qty}</td>
        <td class="text-right">${priceCell}</td>
        <td class="text-center">${promoCell}</td>
        <td class="text-right"><strong>${formatMoney(lineTotal)}</strong></td>
      </tr>`;
    })
    .join("");

  const promoRow = order.tenKhuyenMai
    ? `<div class="total-row"><span>Mã khuyến mãi (${order.tenKhuyenMai})</span><span style="color:#075f83;">-${Number(order.phanTramGiam || 0)}%</span></div>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Hóa đơn DH-${order.maDonHang}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 13px; color: #1e293b; }
    .invoice { max-width: 800px; margin: 32px auto; padding: 36px 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
    .store-name { font-size: 22px; font-weight: 900; color: #075f83; }
    .store-sub { font-size: 12px; color: #64748b; margin-top: 4px; }
    .invoice-meta { text-align: right; }
    .invoice-meta h1 { font-size: 18px; font-weight: 900; color: #1e293b; letter-spacing: 1px; }
    .invoice-meta p { font-size: 12px; color: #64748b; margin-top: 4px; }
    hr { border: none; border-top: 2px solid #e2e8f0; margin: 20px 0; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .info-section h3 { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #94a3b8; letter-spacing: .5px; margin-bottom: 6px; }
    .info-section p { font-size: 13px; color: #1e293b; line-height: 1.7; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    thead th { background: #f8fafc; padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: .4px; border-bottom: 2px solid #e2e8f0; }
    tbody td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; vertical-align: middle; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .totals { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; margin-top: 4px; }
    .total-row { display: flex; gap: 60px; font-size: 13px; }
    .total-row span:first-child { color: #64748b; min-width: 180px; text-align: right; }
    .total-row.grand { font-size: 16px; font-weight: 900; color: #075f83; border-top: 2px solid #e2e8f0; padding-top: 10px; margin-top: 4px; }
    .footer { text-align: center; margin-top: 36px; padding-top: 20px; border-top: 1px dashed #e2e8f0; color: #94a3b8; font-size: 11px; line-height: 1.8; }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
    .badge-green { background:#dcfce7; color:#166534; }
    .badge-blue { background:#dbeafe; color:#1e40af; }
    .badge-orange { background:#fed7aa; color:#c2410c; }
    .badge-red { background:#fee2e2; color:#b91c1c; }
    .badge-default { background:#f1f5f9; color:#475569; }
    @media print {
      html, body { margin: 0; padding: 0; }
      .invoice { margin: 10mm; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div>
        <div class="store-name">SmartHome Store</div>
        <div class="store-sub">Thiết bị nhà thông minh chính hãng</div>
      </div>
      <div class="invoice-meta">
        <h1>HÓA ĐƠN BÁN HÀNG</h1>
        <p>Mã đơn: <strong>DH-${order.maDonHang}</strong></p>
        <p>Ngày in: ${formatDate()}</p>
      </div>
    </div>
    <hr/>
    <div class="info-grid">
      <div class="info-section">
        <h3>Thông tin khách hàng</h3>
        <p><strong>${order.tenThanhVien || `Khách hàng KH-${order.maKhachHang}`}</strong></p>
        ${order.email ? `<p>${order.email}</p>` : ""}
        ${order.soDienThoai ? `<p>${order.soDienThoai}</p>` : ""}
      </div>
      <div class="info-section">
        <h3>Thông tin đơn hàng</h3>
        <p>Trạng thái: ${statusBadge(order.trangThai)}</p>
        ${order.tenKhuyenMai ? `<p style="margin-top:4px;">Mã KM: <strong>${order.tenKhuyenMai}</strong></p>` : ""}
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Sản phẩm</th>
          <th class="text-center">Số lượng</th>
          <th class="text-right">Đơn giá</th>
          <th class="text-center">Khuyến mãi</th>
          <th class="text-right">Thành tiền</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows || `<tr><td colspan="5" style="text-align:center;padding:20px;color:#94a3b8;">Chưa có chi tiết</td></tr>`}
      </tbody>
    </table>
    <div class="totals">
      ${promoRow}
      <div class="total-row grand">
        <span>Tổng thanh toán</span>
        <span>${formatMoney(order.tongGia)}</span>
      </div>
    </div>
    <div class="footer">
      <p>Cảm ơn quý khách đã mua hàng tại SmartHome Store!</p>
      <p>Mọi thắc mắc vui lòng liên hệ bộ phận chăm sóc khách hàng.</p>
    </div>
  </div>
  <script>window.onload = () => { window.print(); };</script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;
  win.document.write(html);
  win.document.close();
};
