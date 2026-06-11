import { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "@/libs/axios";
import type { Category, Product, Promotion } from "@/types/customer";

type ProductStatistics = {
  bestSelling?: Array<{ maSanPham: number; soLuongDaBan: number }>;
};

export const useStorefrontData = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [productRes, categoryRes, promotionRes, statsRes] = await Promise.all([
          api.get<Product[]>("/san-pham/tim-kiem"),
          api.get<Category[]>("/danh-muc/tim-kiem"),
          api.get<Promotion[]>("/khuyen-mai/tim-kiem", { params: { activeOnly: true } }),
          api.get<ProductStatistics>("/thong-ke/san-pham"),
        ]);
        const soldByProduct = new Map(
          (statsRes.data.bestSelling || []).map((item) => [item.maSanPham, item.soLuongDaBan])
        );
        setProducts(productRes.data.map((product) => ({
          ...product,
          soLuongDaBan: soldByProduct.get(product.maSanPham) || 0,
        })));
        setCategories(categoryRes.data);
        setPromotions(promotionRes.data);
      } catch (error) {
        console.error(error);
        toast.error("Không tải được dữ liệu cửa hàng");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  return { categories, loading, products, promotions };
};


