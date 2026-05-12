interface FormatOptions {
  locale?: string;
  currency?: string;
}

export function formatCurrency(amount: number, options?: FormatOptions): string {
  return new Intl.NumberFormat(options?.locale || "vi-VN", {
    style: "currency",
    currency: options?.currency || "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("vi-VN").format(num);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
