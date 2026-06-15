import { CheckCircle, XCircle } from "lucide-react";
import { useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { writeCart } from "../utils";

export const PaymentSuccessView = () => {
  const [params] = useSearchParams();
  const status = params.get("status");
  const orderCode = params.get("orderCode");
  const cancelled = params.get("cancel") === "true" || status === "CANCELLED";

  useEffect(() => {
    if (!cancelled) writeCart([]);
  }, [cancelled]);

  if (cancelled) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <XCircle className="mb-4 size-16 text-red-400" />
        <h1 className="text-3xl font-black text-slate-900">Thanh toán bị huỷ</h1>
        <p className="mt-3 text-slate-500">Đơn hàng #{orderCode} chưa được thanh toán. Bạn có thể thử lại hoặc chọn phương thức khác.</p>
        <div className="mt-8 flex gap-4">
          <Link className="rounded-lg bg-[#0879a8] px-6 py-3 font-black text-white" to="/gio-hang">Quay lại giỏ hàng</Link>
          <Link className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700" to="/">Về trang chủ</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <CheckCircle className="mb-4 size-16 text-green-500" />
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-black text-slate-900">Thanh toán chuyển khoản thành công</h1>
        <span className="shrink-0 rounded-full bg-sky-100 px-3 py-1 text-sm font-black text-sky-800">Mới tạo</span>
      </div>
      <p className="mt-3 text-slate-500">
        Đơn hàng <span className="font-bold text-slate-700">#{orderCode}</span> đã được xác nhận thanh toán.
        Chúng tôi sẽ xử lý và giao hàng sớm nhất có thể.
      </p>
      <div className="mt-8 flex gap-4">
        <Link className="rounded-lg bg-[#0879a8] px-6 py-3 font-black text-white" to="/khach-hang">Xem đơn hàng</Link>
        <Link className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700" to="/">Tiếp tục mua sắm</Link>
      </div>
    </main>
  );
};
