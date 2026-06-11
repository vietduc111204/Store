import type { Product } from "@/types/management";
import { fieldValue } from "./shared";

export const dateInputValue = (value?: string | null) => (value ? String(value).slice(0, 10) : "");

export const formatDate = (value?: string | null) => {
  if (!value) return "Không giới hạn";
  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
};

export const specsToText = (value?: Product["thongSoKyThuat"]) => {
  if (!value) return "";

  try {
    const specs = JSON.parse(value);
    if (!Array.isArray(specs)) return "";

    return specs
      .map((spec) => `${fieldValue(spec.label)}: ${fieldValue(spec.value)}`)
      .join("\n");
  } catch {
    return fieldValue(value);
  }
};

export const normalizeMultilineText = (value?: string) =>
  fieldValue(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");

export const imagesToText = (value?: Product["anhPhu"]) => {
  if (!value) return "";

  try {
    const images = JSON.parse(value);
    if (!Array.isArray(images)) return "";

    return images.map((image) => fieldValue(image)).filter(Boolean).join("\n");
  } catch {
    return fieldValue(value);
  }
};
