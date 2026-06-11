import { ArrowRight, Bell, ClipboardCheck, Gift, LockKeyhole, Package, UserRound } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import api from "@/libs/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import type { CartItem, CustomerOrder, CustomerOrderDetail, Product, Promotion } from "@/types/customer";
import AccountNoticeList from "../customer-account/AccountNoticeList";
import CancelDetailDialog from "../customer-account/CancelDetailDialog";
import OrderHistoryCard from "../customer-account/OrderHistoryCard";
import ProfileField from "../customer-account/ProfileField";
import PromotionList from "../customer-account/PromotionList";
import { readSeenBadges, writeSeenBadges, type SeenBadges } from "../customer-account/accountUtils";
import { readCart, readFavoriteCategories, writeCart, type FavoriteCategory } from "../utils";

export const CustomerAccountView = () => {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const location = useLocation();
  const navigate = useNavigate();
  const [active, setActive] = useState("orders");
  const [orderTab, setOrderTab] = useState("all");
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [orderDetails, setOrderDetails] = useState<Record<number, CustomerOrderDetail[]>>({});
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [favoriteCategories, setFavoriteCategories] = useState<FavoriteCategory[]>([]);
  const [loadingPromotions, setLoadingPromotions] = useState(false);
  const [cancelDetailOrder, setCancelDetailOrder] = useState<CustomerOrder | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [seenBadges, setSeenBadges] = useState<SeenBadges>(() => readSeenBadges());
  const [profileForm, setProfileForm] = useState({
    name: user?.tenThanhVien || "",
    phone: user?.soDienThoaiKhachHang || "",
    address: user?.diaChiKhachHang || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (location.state && typeof location.state === "object" && "accountSection" in location.state) {
      setActive(String(location.state.accountSection || "orders"));
    }
  }, [location.state]);

  useEffect(() => {
    setProfileForm({
      name: user?.tenThanhVien || "",
      phone: user?.soDienThoaiKhachHang || "",
      address: user?.diaChiKhachHang || "",
    });
  }, [user?.diaChiKhachHang, user?.soDienThoaiKhachHang, user?.tenThanhVien]);

  useEffect(() => {
    if (!user?.maKhachHang) return;

    const loadOrders = async () => {
      try {
        setLoadingOrders(true);
        const res = await api.get<CustomerOrder[]>("/don-hang/tim-kiem", {
          params: { maKhachHang: user.maKhachHang },
        });
        setOrders(res.data);
        const detailsEntries = await Promise.all(
          res.data.map(async (order) => {
            const detailRes = await api.get<CustomerOrderDetail[]>(`/don-hang/${order.maDonHang}/chi-tiet`);
            return [order.maDonHang, detailRes.data] as const;
          })
        );
        setOrderDetails(Object.fromEntries(detailsEntries));
      } catch (error) {
        console.error(error);
        toast.error("Không tải được đơn hàng của bạn");
      } finally {
        setLoadingOrders(false);
      }
    };

    void loadOrders();
  }, [user?.maKhachHang]);

  useEffect(() => {
    const loadPromotions = async () => {
      try {
        setLoadingPromotions(true);
        const [promotionRes, productRes] = await Promise.all([
          api.get<Promotion[]>("/khuyen-mai/tim-kiem", { params: { activeOnly: true } }),
          api.get<Product[]>("/san-pham/tim-kiem"),
        ]);
        setPromotions(promotionRes.data);
        setProducts(productRes.data);
      } catch (error) {
        console.error(error);
        toast.error("Không tải được thông báo tài khoản");
      } finally {
        setLoadingPromotions(false);
      }
    };

    setFavoriteCategories(readFavoriteCategories());
    void loadPromotions();
  }, []);

  const favoriteProductNotices = favoriteCategories
    .map((category) => ({
      category,
      products: products.filter((product) =>
        category.maDanhMuc
          ? product.maDanhMuc === category.maDanhMuc
          : (product.tenDanhMuc || "SmartHome").toLowerCase() === category.tenDanhMuc.toLowerCase()
      ),
    }))
    .filter((notice) => notice.products.length);
  const notificationCount = promotions.length + favoriteProductNotices.length;

  const normalizeStatus = (status?: string | null) => (status || "Mới tạo").trim().toLowerCase();
  const newOrderCount = orders.filter((order) => normalizeStatus(order.trangThai) === "mới tạo").length;
  const orderTabs = [
    { key: "all", label: "Tất cả" },
    { key: "pending", label: "Đang xử lý" },
    { key: "shipping", label: "Đang giao" },
    { key: "completed", label: "Hoàn thành" },
    { key: "cancelled", label: "Đã hủy" },
  ];
  const visibleOrders = orders.filter((order) => {
    const status = normalizeStatus(order.trangThai);
    if (orderTab === "pending") return status === "mới tạo" || status === "đang xử lý" || status === "chờ thanh toán";
    if (orderTab === "shipping") return status === "đang giao";
    if (orderTab === "completed") return status === "hoàn thành" || status === "đã thanh toán";
    if (orderTab === "cancelled") return status === "đã hủy";
    return true;
  });

  const cancelCustomerOrder = async (order: CustomerOrder) => {
    if (!window.confirm(`Bạn chắc chắn muốn hủy đơn hàng DH-${order.maDonHang}?`)) return;

    const previousStatus = order.trangThai;
    setOrders((current) =>
      current.map((item) => item.maDonHang === order.maDonHang ? { ...item, trangThai: "Đã hủy" } : item)
    );
    setOrderTab("cancelled");

    try {
      const res = await api.patch<CustomerOrder>(`/don-hang/huy/${order.maDonHang}`);
      setOrders((current) =>
        current.map((item) => item.maDonHang === order.maDonHang ? { ...item, ...res.data, trangThai: res.data.trangThai || "Đã hủy" } : item)
      );
      toast.success("Đã hủy đơn hàng");
    } catch (error) {
      console.error(error);
      setOrders((current) =>
        current.map((item) => item.maDonHang === order.maDonHang ? { ...item, trangThai: previousStatus } : item)
      );
      toast.error("Không hủy được đơn hàng");
    }
  };

  const buyAgain = (order: CustomerOrder) => {
    const details = orderDetails[order.maDonHang] || [];
    if (!details.length) {
      toast.error("Không có sản phẩm để mua lại");
      return;
    }

    const currentCart = readCart();
    const nextCart = details.reduce<CartItem[]>((items, detail) => {
      const quantity = Math.max(1, Number(detail.soLuong) || 1);
      const price = Number(detail.gia) || Math.round((Number(detail.thanhTien) || 0) / quantity);
      const product: Product = {
        maSanPham: detail.maSanPham,
        tenSanPham: detail.tenSanPham,
        gia: price,
        soLuong: quantity,
        anh: detail.anh,
        tenKhuyenMai: detail.tenKhuyenMai,
        phanTramGiam: detail.phanTramGiam,
      };
      const existing = items.find((item) => item.product.maSanPham === detail.maSanPham);

      if (existing) {
        return items.map((item) =>
          item.product.maSanPham === detail.maSanPham
            ? { ...item, product: { ...item.product, ...product }, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...items, { product, quantity }];
    }, currentCart);

    writeCart(nextCart);
    toast.success("Đã thêm sản phẩm vào giỏ hàng");
    navigate("/gio-hang");
  };

  const updateProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.maKhachHang) {
      toast.error("Không tìm thấy tài khoản khách hàng");
      return;
    }

    const name = profileForm.name.trim();
    const phone = profileForm.phone.trim();
    const address = profileForm.address.trim();

    if (!name) {
      toast.error("Vui lòng nhập họ tên");
      return;
    }

    try {
      setSavingProfile(true);
      await api.put(`/tai-khoan/khach-hang/sua/${user.maKhachHang}`, {
        tenKhachHang: name,
        soDienThoai: phone || null,
        diaChi: address || null,
        email: user.email,
      });
      updateUser({
        tenThanhVien: name,
        soDienThoaiKhachHang: phone || null,
        diaChiKhachHang: address || null,
      });
      toast.success("Đã cập nhật thông tin cá nhân");
    } catch (error) {
      console.error(error);
      toast.error("Không cập nhật được thông tin cá nhân");
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const currentPassword = passwordForm.currentPassword.trim();
    const newPassword = passwordForm.newPassword.trim();
    const confirmPassword = passwordForm.confirmPassword.trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Vui lòng nhập đầy đủ thông tin mật khẩu");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("Mật khẩu mới phải khác mật khẩu hiện tại");
      return;
    }

    try {
      setSavingPassword(true);
      await api.post("/auth/change-password", { currentPassword, newPassword });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Đã đổi mật khẩu");
    } catch (error) {
      console.error(error);
      toast.error("Không đổi được mật khẩu. Vui lòng kiểm tra mật khẩu hiện tại");
    } finally {
      setSavingPassword(false);
    }
  };

  const notificationBadge = Math.max(0, notificationCount - seenBadges.notifications);
  const promotionBadge = Math.max(0, promotions.length - seenBadges.promotions);
  const hasUnseenNewOrder = newOrderCount > seenBadges.orders;

  const markMenuSeen = (key: string) => {
    setActive(key);

    const next = {
      ...seenBadges,
      notifications: key === "notifications" ? notificationCount : seenBadges.notifications,
      orders: key === "orders" ? newOrderCount : seenBadges.orders,
      promotions: key === "promotions" ? promotions.length : seenBadges.promotions,
    };

    setSeenBadges(next);
    writeSeenBadges(next);
  };

  const menu = [
    { key: "notifications", label: "Thông báo", icon: Bell, badge: notificationBadge ? String(notificationBadge) : "" },
    { key: "promotions", label: "Khuyến mãi", icon: Gift, badge: promotionBadge ? String(promotionBadge) : "" },
    { key: "profile", label: "Tài khoản của tôi", icon: UserRound },
    { key: "password", label: "Đổi mật khẩu", icon: LockKeyhole },
    { key: "orders", label: "Đơn mua", icon: Package, badge: hasUnseenNewOrder ? "Mới" : "" },
  ];

  const activeLabel = menu.find((item) => item.key === active)?.label || "Đơn mua";

  const emptyText = active === "orders"
    ? "Hiện tại bạn chưa có đơn hàng nào. Hãy tiếp tục mua sắm cùng SmartHome."
    : "Hiện tại chưa có thông báo mới.";

  return (
    <main className="bg-[#f4f7ff]">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[250px_1fr]">
        <aside className="h-fit rounded-lg bg-white p-5 ring-1 ring-slate-200">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
            <div className="flex size-12 items-center justify-center rounded-full bg-sky-50 text-[#075f83] ring-1 ring-sky-100">
              <UserRound size={22} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-950">{user?.tenThanhVien || user?.email || "Khách hàng"}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-1">
            {menu.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  className={
                    active === item.key
                      ? "flex items-center gap-3 rounded-md bg-sky-100 px-3 py-2.5 text-left text-sm font-bold text-[#075f83]"
                      : "flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  }
                  key={item.key}
                  onClick={() => markMenuSeen(item.key)}
                  type="button"
                >
                  <Icon size={17} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? <span className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-black text-white">{item.badge}</span> : null}
                </button>
              );
            })}
          </div>
        </aside>

        <section className="min-h-[520px] rounded-lg bg-white p-6 ring-1 ring-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h1 className="text-lg font-black text-slate-950">{activeLabel}</h1>
              <p className="mt-1 text-sm text-slate-500">Theo dõi hoạt động và thông tin tài khoản SmartHome của bạn.</p>
            </div>
            <Link className="inline-flex items-center gap-2 rounded-lg bg-[#0879a8] px-4 py-2.5 text-sm font-bold text-white" to="/san-pham">
              Tiếp tục mua sắm <ArrowRight size={16} />
            </Link>
          </div>

          {active === "profile" ? (
            <div className="mt-8 grid gap-8">
              <form className="max-w-2xl space-y-5" onSubmit={updateProfile}>
                <ProfileField
                  label="Họ tên"
                  onChange={(value) => setProfileForm((current) => ({ ...current, name: value }))}
                  required
                  value={profileForm.name}
                />
                <ProfileField disabled label="Email" value={user?.email || ""} />
                <ProfileField
                  label="Số điện thoại"
                  onChange={(value) => setProfileForm((current) => ({ ...current, phone: value }))}
                  value={profileForm.phone}
                />
                <ProfileField
                  label="Địa chỉ"
                  onChange={(value) => setProfileForm((current) => ({ ...current, address: value }))}
                  value={profileForm.address}
                />
                <div className="flex justify-end border-t border-slate-100 pt-5">
                  <button
                    className="rounded-lg bg-[#0879a8] px-6 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={savingProfile}
                    type="submit"
                  >
                    {savingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </form>
            </div>
          ) : active === "password" ? (
            <form className="mt-8 max-w-2xl space-y-5" onSubmit={changePassword}>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-sky-50 text-[#075f83]">
                  <LockKeyhole size={18} />
                </div>
                <div>
                  <h2 className="font-black text-slate-950">Đổi mật khẩu</h2>
                  <p className="mt-1 text-sm text-slate-500">Cập nhật mật khẩu đăng nhập cho tài khoản khách hàng.</p>
                </div>
              </div>
              <ProfileField
                label="Mật khẩu hiện tại"
                onChange={(value) => setPasswordForm((current) => ({ ...current, currentPassword: value }))}
                required
                type="password"
                value={passwordForm.currentPassword}
              />
              <ProfileField
                label="Mật khẩu mới"
                onChange={(value) => setPasswordForm((current) => ({ ...current, newPassword: value }))}
                required
                type="password"
                value={passwordForm.newPassword}
              />
              <ProfileField
                label="Nhập lại mật khẩu mới"
                onChange={(value) => setPasswordForm((current) => ({ ...current, confirmPassword: value }))}
                required
                type="password"
                value={passwordForm.confirmPassword}
              />
              <div className="flex justify-end border-t border-slate-100 pt-5">
                <button
                  className="rounded-lg bg-slate-950 px-6 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={savingPassword}
                  type="submit"
                >
                  {savingPassword ? "Đang đổi..." : "Đổi mật khẩu"}
                </button>
              </div>
            </form>
          ) : active === "notifications" ? (
            <AccountNoticeList favoriteNotices={favoriteProductNotices} loading={loadingPromotions} promotions={promotions} />
          ) : active === "promotions" ? (
            <PromotionList loading={loadingPromotions} promotions={promotions} />
          ) : active === "orders" ? (
            <div className="mt-6">
              <div className="grid overflow-hidden rounded-lg border border-slate-200 bg-white text-center text-sm font-bold text-slate-700 sm:grid-cols-5">
                {orderTabs.map((tab) => (
                  <button
                    className={orderTab === tab.key ? "border-b-2 border-[#0879a8] px-4 py-4 text-[#075f83]" : "px-4 py-4 hover:bg-slate-50"}
                    key={tab.key}
                    onClick={() => setOrderTab(tab.key)}
                    type="button"
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {visibleOrders.length ? (
                <div className="mt-5 grid gap-5">
                  {visibleOrders.map((order) => (
                    <OrderHistoryCard
                      details={orderDetails[order.maDonHang] || []}
                      key={order.maDonHang}
                      onCancel={cancelCustomerOrder}
                      onBuyAgain={buyAgain}
                      onViewCancelDetail={setCancelDetailOrder}
                      order={order}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
                  <div className="flex size-20 items-center justify-center rounded-full bg-sky-50 text-[#0879a8] ring-8 ring-sky-100/70">
                    {loadingOrders ? <Package size={30} /> : <ClipboardCheck size={32} />}
                  </div>
                  <h2 className="mt-6 text-lg font-black text-slate-950">{loadingOrders ? "Đang tải dữ liệu" : "Chưa có đơn hàng"}</h2>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">{loadingOrders ? "Vui lòng chờ trong giây lát." : emptyText}</p>
                  <Link className="mt-6 rounded-lg bg-[#0879a8] px-6 py-3 text-sm font-black text-white" to="/san-pham">
                    Tiếp tục mua sắm
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
              <div className="flex size-24 items-center justify-center rounded-full bg-sky-50 text-[#0879a8] ring-8 ring-sky-100/70">
                {loadingOrders ? <Package size={34} /> : <ClipboardCheck size={36} />}
              </div>
              <h2 className="mt-7 text-xl font-black text-slate-950">{loadingOrders ? "Đang tải dữ liệu" : "Thông báo trống"}</h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">{loadingOrders ? "Vui lòng chờ trong giây lát." : emptyText}</p>
              <Link className="mt-7 rounded-lg bg-[#0879a8] px-6 py-3 text-sm font-black text-white" to="/san-pham">
                Tiếp tục mua sắm
              </Link>
            </div>
          )}
        </section>
      </div>
      {cancelDetailOrder ? (
        <CancelDetailDialog
          details={orderDetails[cancelDetailOrder.maDonHang] || []}
          onClose={() => setCancelDetailOrder(null)}
          order={cancelDetailOrder}
        />
      ) : null}
    </main>
  );
};

