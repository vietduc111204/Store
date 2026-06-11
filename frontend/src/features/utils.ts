export const CART_KEY = "smarthome-cart";
export const FAVORITE_CATEGORY_KEY = "smarthome-favorite-categories";

import type { CartItem, Product } from "@/types/customer";

export type FavoriteCategory = {
  key: string;
  maDanhMuc?: number | null;
  tenDanhMuc: string;
};

export const fallbackImages = [
  "/smart%20home.avif",
  "/smart%20sensor.avif",
  "/lamp.avif",
  "/smart%20lock.avif",
  "/vacuum%20cleaner.avif",
  "/speaker.avif",
  "/wifi.avif",
  "/circuit.avif",
];

export const formatMoney = (value: string | number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(Number(value) || 0);

export const productImage = (product?: Product, index = 0) => product?.anh || fallbackImages[index % fallbackImages.length];

export const discountPercent = (product?: Product) => Math.min(Math.max(Number(product?.phanTramGiam) || 0, 0), 100);

export const finalPrice = (product: Product) => Math.round((Number(product.gia) || 0) * (100 - discountPercent(product)) / 100);

export const readCart = (): CartItem[] => {
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const writeCart = (items: CartItem[]) => window.localStorage.setItem(CART_KEY, JSON.stringify(items));

export const readFavoriteCategories = (): FavoriteCategory[] => {
  try {
    const raw = window.localStorage.getItem(FAVORITE_CATEGORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const writeFavoriteCategories = (items: FavoriteCategory[]) =>
  window.localStorage.setItem(FAVORITE_CATEGORY_KEY, JSON.stringify(items));

export const favoriteCategoryFromProduct = (product: Product): FavoriteCategory => {
  const tenDanhMuc = product.tenDanhMuc || "SmartHome";
  return {
    key: product.maDanhMuc ? `id:${product.maDanhMuc}` : `name:${tenDanhMuc.toLowerCase()}`,
    maDanhMuc: product.maDanhMuc,
    tenDanhMuc,
  };
};

export const hasFavoriteCategory = (product: Product) => {
  const favorite = favoriteCategoryFromProduct(product);
  return readFavoriteCategories().some((item) => item.key === favorite.key);
};

export const toggleFavoriteCategory = (product: Product) => {
  const favorite = favoriteCategoryFromProduct(product);
  const current = readFavoriteCategories();
  const exists = current.some((item) => item.key === favorite.key);
  const next = exists ? current.filter((item) => item.key !== favorite.key) : [...current, favorite];

  writeFavoriteCategories(next);
  return { active: !exists, category: favorite };
};

