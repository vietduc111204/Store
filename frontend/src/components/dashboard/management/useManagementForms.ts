import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import api from "@/libs/axios";
import type {
  Category,
  Customer,
  Employee,
  FormMode,
  FormValues,
  ModalState,
  Order,
  Product,
  Promotion,
} from "@/types/management";
import { fieldValue } from "./shared";
import { dateInputValue, formatDate, imagesToText, normalizeMultilineText, specsToText } from "./formUtils";

type CollectionKey = "categories" | "customers" | "employees" | "products" | "promotions";

type UseManagementFormsParams = {
  categories: Category[];
  categoryFilter: string;
  customers: Customer[];
  products: Product[];
  promotions: Promotion[];
  query: string;
  removeLocalRecord: (collection: CollectionKey, id: number) => void;
  reloadActiveView: () => Promise<void>;
  setCategoryFilter: (value: string) => void;
  setQuery: (value: string) => void;
};

export const useManagementForms = ({
  categories,
  categoryFilter,
  customers,
  products,
  promotions,
  query,
  removeLocalRecord,
  reloadActiveView,
  setCategoryFilter,
  setQuery,
}: UseManagementFormsParams) => {
  const [modal, setModal] = useState<ModalState>(null);

  const categoryOptions = [
    { label: "Tất cả danh mục", value: "all" },
    ...categories.map((category) => ({
      label: category.tenDanhMuc,
      value: String(category.maDanhMuc),
    })),
  ];

  const promotionOptions = [
    { label: "Không áp dụng", value: "" },
    ...promotions.map((promotion) => ({
      label: `${promotion.tenKhuyenMai} - giảm ${Number(promotion.phanTramGiam || 0)}% (${formatDate(promotion.ngayBatDau)} - ${formatDate(promotion.ngayKetThuc)})`,
      value: String(promotion.maKhuyenMai),
    })),
  ];

  const productOptions = products.map((product) => ({
    label: `${product.tenSanPham} - còn ${Number(product.soLuong) || 0}${product.phanTramGiam ? ` - giảm ${Number(product.phanTramGiam)}%` : ""}`,
    value: String(product.maSanPham),
  }));

  const promotionProductOptions = products.map((product) => ({
    label: `${product.tenSanPham}${product.tenKhuyenMai ? ` - hiện: ${product.tenKhuyenMai}` : ""}`,
    value: String(product.maSanPham),
  }));

  const customerOptions = customers.map((customer) => ({
    label: `${customer.tenThanhVien} - KH-${customer.maThanhVien}`,
    value: String(customer.maThanhVien),
  }));

  const productHasDiscount = (maSanPham?: string) =>
    products.some(
      (product) => String(product.maSanPham) === String(maSanPham || "") && Number(product.phanTramGiam || 0) > 0
    );

  const validCategoryValue = (maDanhMuc?: number | null) =>
    categories.some((category) => category.maDanhMuc === maDanhMuc) ? fieldValue(maDanhMuc) : "";

  const validPromotionValue = (maKhuyenMai?: number | null) =>
    promotions.some((promotion) => promotion.maKhuyenMai === maKhuyenMai) ? fieldValue(maKhuyenMai) : "";

  const filteredProducts =
    categoryFilter === "all"
      ? products
      : products.filter((product) => String(product.maDanhMuc || "") === categoryFilter);

  const saveAndReload = async (message: string) => {
    toast.success(message);
    setModal(null);
    await reloadActiveView();
  };

  const selectedProductIds = (value?: string) =>
    new Set(
      String(value || "")
        .split(",")
        .map((item) => Number(item.trim()))
        .filter((id) => Number.isInteger(id) && id > 0)
    );

  const syncPromotionProductAssignments = async (promotionId: number, selectedValue?: string) => {
    const selected = selectedProductIds(selectedValue);
    const affectedProducts = products.filter(
      (product) => selected.has(product.maSanPham) || Number(product.maKhuyenMai) === Number(promotionId)
    );

    await Promise.all(
      affectedProducts.map((product) =>
        api.put(`/san-pham/sua/${product.maSanPham}`, {
          maKhuyenMai: selected.has(product.maSanPham) ? String(promotionId) : "",
        })
      )
    );
  };

  const removeRecord = async (url: string, message: string, onDeleted: () => void) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa dữ liệu này?")) return;
    try {
      await api.delete(url);
      onDeleted();
      toast.success(message);
    } catch (error) {
      const msg = axios.isAxiosError(error) ? error.response?.data?.message : null;
      if (msg?.includes("foreign key") || msg?.includes("violates")) {
        toast.error("Không thể xóa vì dữ liệu này đang được sử dụng ở nơi khác");
      } else {
        toast.error(msg || "Không xóa được dữ liệu");
      }
    }
  };

  const openCategoryForm = (mode: FormMode, category?: Category) => {
    setModal({
      title: mode === "create" ? "Thêm danh mục" : "Sửa danh mục",
      mode,
      submitLabel: mode === "create" ? "Thêm" : "Lưu",
      fields: [{ name: "tenDanhMuc", label: "Tên danh mục" }],
      values: { tenDanhMuc: fieldValue(category?.tenDanhMuc) },
      onSubmit: async (values) => {
        if (mode === "create") await api.post("/danh-muc/them", values);
        else await api.put(`/danh-muc/sua/${category?.maDanhMuc}`, values);
        await saveAndReload("Đã lưu danh mục");
      },
    });
  };

  const openProductForm = (mode: FormMode, product?: Product) => {
    setModal({
      title: mode === "create" ? "Thêm sản phẩm" : "Sửa sản phẩm",
      mode,
      submitLabel: mode === "create" ? "Thêm" : "Lưu",
      fields: [
        { name: "tenSanPham", label: "Tên sản phẩm" },
        { name: "gia", label: "Giá bán", type: "number", min: 0 },
        { name: "soLuong", label: "Số lượng", type: "number", min: 0, step: 1 },
        { name: "anh", label: "Ảnh", type: "file" },
        { name: "anhPhu", label: "Ảnh phụ", type: "image-list" },
        { name: "maDanhMuc", label: "Danh mục", type: "select", options: categoryOptions.slice(1) },
        { name: "maKhuyenMai", label: "Khuyến mãi", type: "select", options: promotionOptions },
        { name: "thongSoKyThuat", label: "Thông số kỹ thuật", type: "textarea" },
      ],
      values: {
        tenSanPham: fieldValue(product?.tenSanPham),
        gia: fieldValue(product?.gia),
        soLuong: fieldValue(product?.soLuong),
        anh: fieldValue(product?.anh),
        anhPhu: imagesToText(product?.anhPhu),
        maDanhMuc: validCategoryValue(product?.maDanhMuc),
        maKhuyenMai: validPromotionValue(product?.maKhuyenMai),
        thongSoKyThuat: specsToText(product?.thongSoKyThuat),
      },
      onSubmit: async (values) => {
        const quantity = Number(values.soLuong);
        if (!Number.isInteger(quantity) || quantity < 0) {
          toast.error("Số lượng sản phẩm phải là số nguyên không âm");
          return;
        }

        const payload = {
          ...values,
          anhPhu: normalizeMultilineText(values.anhPhu),
          thongSoKyThuat: normalizeMultilineText(values.thongSoKyThuat),
        };
        if (mode === "create") await api.post("/san-pham/them", payload);
        else await api.put(`/san-pham/sua/${product?.maSanPham}`, payload);
        await saveAndReload("Đã lưu sản phẩm");
      },
    });
  };

  const openCustomerForm = (mode: FormMode, customer?: Customer) => {
    setModal({
      title: mode === "create" ? "Thêm khách hàng" : "Sửa khách hàng",
      mode,
      submitLabel: mode === "create" ? "Thêm" : "Lưu",
      fields: [
        { name: "tenKhachHang", label: "Tên khách hàng" },
        { name: "soDienThoai", label: "Số điện thoại" },
        { name: "email", label: "Email" },
        { name: "diaChi", label: "Địa chỉ" },
        ...(mode === "create" ? [{ name: "password", label: "Mật khẩu", type: "password" as const }] : []),
        { name: "maQuyen", label: "Mã quyền", type: "number", disabled: true },
      ],
      values: {
        tenKhachHang: fieldValue(customer?.tenThanhVien),
        soDienThoai: fieldValue(customer?.soDienThoai),
        email: fieldValue(customer?.email),
        diaChi: fieldValue(customer?.diaChi),
        ...(mode === "create" ? { password: "" } : {}),
        maQuyen: "3",
      },
      onSubmit: async (values) => {
        if (mode === "create") await api.post("/tai-khoan/khach-hang/them", values);
        else await api.put(`/tai-khoan/khach-hang/sua/${customer?.maThanhVien}`, values);
        await saveAndReload("Đã lưu khách hàng");
      },
    });
  };

  const openEmployeeForm = (mode: FormMode, employee?: Employee) => {
    setModal({
      title: mode === "create" ? "Thêm nhân viên" : "Sửa nhân viên",
      mode,
      submitLabel: mode === "create" ? "Thêm" : "Lưu",
      fields: [
        { name: "tenNhanVien", label: "Tên nhân viên" },
        { name: "soDienThoai", label: "Số điện thoại" },
        { name: "diaChi", label: "Địa chỉ" },
        ...(mode === "create" ? [{ name: "email", label: "Email" }, { name: "password", label: "Mat khau", type: "password" as const }] : []),
        { name: "maQuyen", label: "Ma quyen", type: "number", disabled: true },
      ],
      values: {
        tenNhanVien: fieldValue(employee?.tenNhanVien),
        soDienThoai: fieldValue(employee?.soDienThoai),
        diaChi: fieldValue(employee?.diaChi),
        ...(mode === "create" ? { email: "", password: "" } : {}),
        maQuyen: "2",
      },
      onSubmit: async (values) => {
        if (mode === "create") await api.post("/tai-khoan/nhan-vien/them", values);
        else await api.put(`/tai-khoan/nhan-vien/sua/${employee?.maNhanVien}`, values);
        await saveAndReload("Đã lưu nhân viên");
      },
    });
  };

  const openOrderForm = (order?: Order) => {
    const isCreate = !order;
    setModal({
      title: isCreate ? "Thêm đơn hàng" : "Sửa đơn hàng",
      mode: isCreate ? "create" : "edit",
      submitLabel: isCreate ? "Thêm" : "Lưu",
      fields: [
        { name: "maKhachHang", label: "Khách hàng", type: "select", options: customerOptions },
        ...(isCreate
          ? [
              {
                name: "maSanPham",
                label: "Sản phẩm",
                type: "select" as const,
                options: productOptions,
                onValueChange: (value: string, values: FormValues) => ({
                  ...values,
                  maSanPham: value,
                  maKhuyenMai: productHasDiscount(value) ? "" : values.maKhuyenMai,
                }),
              },
              { name: "soLuong", label: "Số lượng", type: "number" as const, min: 1, step: 1 },
            ]
          : []),
        {
          name: "maKhuyenMai",
          label: "Khuyến mãi đơn hàng",
          type: "select",
          options: promotionOptions,
          disabledWhen: (values) => (isCreate ? productHasDiscount(values.maSanPham) : !!order?.hasProductDiscount),
          helperText:
            "Không thể áp dụng khuyến mãi đơn hàng nếu sản phẩm đã có khuyến mãi riêng. Vui lòng chọn sản phẩm trước khi chọn khuyến mãi đơn hàng.",
        },
        { name: "trangThai", label: "Trạng thái" },
      ],
      values: isCreate
        ? { maKhachHang: "", maSanPham: "", soLuong: "1", maKhuyenMai: "", trangThai: "Mới tạo" }
        : {
            maKhachHang: fieldValue(order.maKhachHang),
            maSanPham: "",
            soLuong: "1",
            maKhuyenMai: order.hasProductDiscount ? "" : fieldValue(order.maKhuyenMai),
            trangThai: fieldValue(order.trangThai),
          },
      onSubmit: async (values) => {
        if (isCreate) {
          const quantity = Number(values.soLuong);
          const selectedProduct = products.find((product) => String(product.maSanPham) === String(values.maSanPham));
          if (!Number.isInteger(quantity) || quantity <= 0) {
            toast.error("Số lượng đơn hàng phải là số nguyên dương");
            return;
          }
          if (!selectedProduct) {
            toast.error("Vui lòng chọn sản phẩm");
            return;
          }
          if (quantity > (Number(selectedProduct.soLuong) || 0)) {
            toast.error(`Sản phẩm chỉ còn ${Number(selectedProduct.soLuong) || 0} trong kho`);
            return;
          }
        }

        if (isCreate) await api.post("/don-hang/them", values);
        else await api.put(`/don-hang/sua/${order.maDonHang}`, values);
        await saveAndReload(isCreate ? "Đã thêm đơn hàng" : "Đã lưu đơn hàng");
      },
    });
  };

  const openPromotionForm = (mode: FormMode, promotion?: Promotion) => {
    setModal({
      title: mode === "create" ? "Thêm khuyến mãi" : "Sửa khuyến mãi",
      mode,
      submitLabel: mode === "create" ? "Thêm" : "Lưu",
      fields: [
        {
          name: "tenKhuyenMai",
          label: "Tên khuyến mãi",
          helperText: "Mã này chỉ áp dụng cho các sản phẩm được chọn bên dưới.",
        },
        { name: "phanTramGiam", label: "Phần trăm giảm", type: "number", min: 0, max: 100 },
        { name: "ngayBatDau", label: "Ngày bắt đầu", type: "date" },
        { name: "ngayKetThuc", label: "Ngày kết thúc", type: "date" },
        {
          name: "maSanPhamApDung",
          label: "Sản phẩm áp dụng",
          type: "multi-select",
          options: promotionProductOptions,
          helperText: "Chọn một hoặc nhiều sản phẩm được phép dùng mã khuyến mãi này.",
        },
      ],
      values: {
        tenKhuyenMai: fieldValue(promotion?.tenKhuyenMai),
        phanTramGiam: fieldValue(promotion?.phanTramGiam ?? 0),
        ngayBatDau: dateInputValue(promotion?.ngayBatDau),
        ngayKetThuc: dateInputValue(promotion?.ngayKetThuc),
        maSanPhamApDung: fieldValue(promotion?.maSanPhamApDung),
      },
      onSubmit: async (values) => {
        if (!values.tenKhuyenMai.trim()) {
          toast.error("Vui lòng nhập tên khuyến mãi");
          return;
        }

        const discount = Number(values.phanTramGiam);
        if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
          toast.error("Phần trăm giảm phải từ 0 đến 100");
          return;
        }

        if (values.ngayBatDau && values.ngayKetThuc && values.ngayKetThuc < values.ngayBatDau) {
          toast.error("Ngày kết thúc không được trước ngày bắt đầu");
          return;
        }

        const res = mode === "create"
          ? await api.post<Promotion>("/khuyen-mai/them", values)
          : await api.put<Promotion>(`/khuyen-mai/sua/${promotion?.maKhuyenMai}`, values);
        const promotionId = Number(res.data.maKhuyenMai || promotion?.maKhuyenMai);
        if (promotionId) await syncPromotionProductAssignments(promotionId, values.maSanPhamApDung);
        await saveAndReload("Đã lưu khuyến mãi");
      },
    });
  };

  const updateOrderStatus = async (order: Order, trangThai: string) => {
    await api.patch(`/don-hang/cap-nhat-trang-thai/${order.maDonHang}`, { trangThai });
    toast.success("Đã cập nhật trạng thái");
    await reloadActiveView();
  };

  const cancelOrder = async (order: Order) => {
    await api.patch(`/don-hang/huy/${order.maDonHang}`);
    toast.success("Đã hủy đơn hàng");
    await reloadActiveView();
  };

  return {
    modal,
    setModal,
    productDashboardProps: {
      products: filteredProducts,
      query,
      categoryFilter,
      categoryOptions,
      onQueryChange: setQuery,
      onCategoryFilterChange: setCategoryFilter,
      onCreate: () => openProductForm("create"),
      onEdit: (product: Product) => openProductForm("edit", product),
      onDelete: (product: Product) =>
        void removeRecord(`/san-pham/xoa/${product.maSanPham}`, "Đã xóa sản phẩm", () =>
          removeLocalRecord("products", product.maSanPham)
        ),
    },
    handlers: {
      cancelOrder: (order: Order) => void cancelOrder(order),
      openCategoryForm: (category?: Category) => openCategoryForm(category ? "edit" : "create", category),
      openCustomerForm: (customer?: Customer) => openCustomerForm(customer ? "edit" : "create", customer),
      openEmployeeForm: (employee?: Employee) => openEmployeeForm(employee ? "edit" : "create", employee),
      openOrderForm,
      openPromotionForm: (promotion?: Promotion) => openPromotionForm(promotion ? "edit" : "create", promotion),
      removeCategory: (category: Category) =>
        void removeRecord(`/danh-muc/xoa/${category.maDanhMuc}`, "Đã xóa danh mục", () =>
          removeLocalRecord("categories", category.maDanhMuc)
        ),
      removeCustomer: (customer: Customer) =>
        void removeRecord(`/tai-khoan/khach-hang/xoa/${customer.maThanhVien}`, "Đã xóa khách hàng", () =>
          removeLocalRecord("customers", customer.maThanhVien)
        ),
      removeEmployee: (employee: Employee) =>
        void removeRecord(`/tai-khoan/nhan-vien/xoa/${employee.maNhanVien}`, "Đã xóa nhân viên", () =>
          removeLocalRecord("employees", employee.maNhanVien)
        ),
      removePromotion: (promotion: Promotion) =>
        void removeRecord(`/khuyen-mai/xoa/${promotion.maKhuyenMai}`, "Đã xóa khuyến mãi", () =>
          removeLocalRecord("promotions", promotion.maKhuyenMai)
        ),
      updateOrderStatus: (order: Order, status: string) => void updateOrderStatus(order, status),
    },
  };
};
