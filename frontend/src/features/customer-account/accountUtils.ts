import type { Promotion } from "@/types/customer";

export const SEEN_BADGES_KEY = "smarthome-account-seen-badges";

export type SeenBadges = {
  notifications: number;
  orders: number;
  promotions: number;
};

export const readSeenBadges = (): SeenBadges => {
  try {
    const raw = window.localStorage.getItem(SEEN_BADGES_KEY);
    return raw
      ? { notifications: 0, orders: 0, promotions: 0, ...JSON.parse(raw) }
      : { notifications: 0, orders: 0, promotions: 0 };
  } catch {
    return { notifications: 0, orders: 0, promotions: 0 };
  }
};

export const writeSeenBadges = (value: SeenBadges) => window.localStorage.setItem(SEEN_BADGES_KEY, JSON.stringify(value));

export const formatDate = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("vi-VN");
};

export const promotionDateText = (promotion: Promotion) => {
  const start = formatDate(promotion.ngayBatDau);
  const end = formatDate(promotion.ngayKetThuc);
  if (start && end) return `Hiệu lực từ ${start} đến ${end}`;
  if (start) return `Bắt đầu từ ${start}`;
  if (end) return `Hết hạn vào ${end}`;
  return "Hết hạn vào 31/12/2026";
};

export const promotionCodeText = (promotion: Promotion) => promotion.tenKhuyenMai.trim() || `KM-${promotion.maKhuyenMai}`;
