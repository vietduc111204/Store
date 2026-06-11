import { Link } from "react-router";
import type { Product, Promotion } from "@/types/customer";
import type { FavoriteCategory } from "../utils";
import AccountEmptyState from "./AccountEmptyState";
import { promotionCodeText, promotionDateText } from "./accountUtils";

export type FavoriteProductNotice = {
  category: FavoriteCategory;
  products: Product[];
};

const AccountNoticeList = ({
  favoriteNotices,
  loading,
  promotions,
}: {
  favoriteNotices: FavoriteProductNotice[];
  loading: boolean;
  promotions: Promotion[];
}) => {
  if (loading) return <AccountEmptyState title="Đang tải thông báo" text="Vui lòng chờ trong giây lát." />;
  if (!promotions.length && !favoriteNotices.length) {
    return (
      <AccountEmptyState
        title="Chưa có thông báo mới"
        text="Khi có mã giảm giá hoặc sản phẩm thuộc danh mục bạn yêu thích, thông báo sẽ hiển thị tại đây."
      />
    );
  }

  return (
    <div className="mt-6 grid gap-4">
      {favoriteNotices.map((notice) => (
        <article className="rounded-lg border border-red-100 bg-red-50/70 p-5" key={notice.category.key}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase text-red-700">Danh mục yêu thích</p>
              <h2 className="mt-2 text-lg font-black text-slate-950">
                Có sản phẩm thuộc danh mục {notice.category.tenDanhMuc}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Hiện có {notice.products.length} sản phẩm trong danh mục bạn đã yêu thích.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {notice.products.slice(0, 3).map((product) => (
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-red-100" key={product.maSanPham}>
                    {product.tenSanPham}
                  </span>
                ))}
              </div>
            </div>
            <Link className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-black text-white" to="/san-pham">
              Xem sản phẩm
            </Link>
          </div>
        </article>
      ))}
      {promotions.map((promotion) => (
        <article className="rounded-lg border border-sky-100 bg-sky-50/70 p-5" key={promotion.maKhuyenMai}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase text-[#075f83]">Mã giảm giá mới</p>
              <h2 className="mt-2 text-lg font-black text-slate-950">{promotion.tenKhuyenMai}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Bạn có mã khuyến mãi giảm {Number(promotion.phanTramGiam || 0)}% đang khả dụng cho đơn hàng.
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-500">Hạn dùng: {promotionDateText(promotion)}</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-black text-[#075f83] ring-1 ring-sky-100">
                <span className="text-slate-500">Mã khuyến mãi</span>
                <span>{promotionCodeText(promotion)}</span>
              </div>
            </div>
            <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white">
              -{Number(promotion.phanTramGiam || 0)}%
            </span>
          </div>
        </article>
      ))}
    </div>
  );
};

export default AccountNoticeList;
