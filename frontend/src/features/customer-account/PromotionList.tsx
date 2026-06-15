import { useState } from "react";
import { ChevronLeft, ChevronRight, Gift } from "lucide-react";
import { Link } from "react-router";
import type { Promotion } from "@/types/customer";
import AccountEmptyState from "./AccountEmptyState";
import { promotionCodeText, promotionDateText } from "./accountUtils";

const PAGE_SIZE = 4;

const PromotionList = ({ loading, promotions }: { loading: boolean; promotions: Promotion[] }) => {
  const [page, setPage] = useState(1);

  if (loading) return <AccountEmptyState title="Đang tải khuyến mãi" text="Vui lòng chờ trong giây lát." />;
  if (!promotions.length) return <AccountEmptyState title="Chưa có mã khuyến mãi" text="Mã giảm giá mới sẽ được cập nhật tại đây." />;

  const totalPages = Math.max(1, Math.ceil(promotions.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = promotions.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="mt-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {pageItems.map((promotion) => (
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={promotion.maKhuyenMai}>
            <div className="flex items-center justify-between gap-3">
              <Gift className="text-[#0879a8]" size={24} />
              <span className="rounded bg-[#0879a8] px-3 py-1 text-sm font-black text-white">
                -{Number(promotion.phanTramGiam || 0)}%
              </span>
            </div>
            <h2 className="mt-5 text-lg font-black text-slate-950">{promotion.tenKhuyenMai}</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">Hạn dùng: {promotionDateText(promotion)}</p>
            <p className="mt-2 text-sm font-semibold text-slate-600">
              Áp dụng cho {Number(promotion.soSanPhamApDung || 0)} sản phẩm{promotion.sanPhamApDung ? `: ${promotion.sanPhamApDung}` : "."}
            </p>
            <div className="mt-4 rounded-lg bg-sky-50 px-4 py-3 ring-1 ring-sky-100">
              <p className="text-xs font-black uppercase text-slate-500">Mã khuyến mãi</p>
              <p className="mt-1 break-all text-lg font-black text-[#075f83]">{promotionCodeText(promotion)}</p>
            </div>
            <Link className="mt-5 inline-flex rounded-lg bg-[#0879a8] px-4 py-2.5 text-sm font-black text-white" to="/san-pham">
              Mua sắm ngay
            </Link>
          </article>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 disabled:opacity-40"
            disabled={safePage === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft size={16} /> Trước
          </button>
          <span className="text-sm font-semibold text-slate-500">
            Trang {safePage} / {totalPages}
          </span>
          <button
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 disabled:opacity-40"
            disabled={safePage === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Tiếp <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PromotionList;
