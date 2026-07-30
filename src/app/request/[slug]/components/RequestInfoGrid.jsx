"use client";

import { Wallet, Boxes, CalendarDays, MapPin } from "lucide-react";
import DetailItem from "./DetailItem";
import { formatDate, formatPrice } from "../utils/formatters";

export default function RequestInfoGrid({ request }) {
  // استفاده از مقادیری که دارید
  const isExpired = request?.isExpired;
  const daysRemaining = typeof request?.daysRemaining === "number" ? request.daysRemaining : null;

  // تابعی برای تعیین متن تاریخ
  const getExpiryLabel = () => {
    if (!request?.expiresAt) return "—";
    
    // اگر تعداد روزها بیشتر از ۱۰,۰۰۰ است یا شرایط خاص بدون انقضا را دارید
    if (daysRemaining !== null && daysRemaining > 10000) {
      return "بدون انقضا";
    }
    
    // اگر منقضی شده
    if (isExpired) {
      return "منقضی شده";
    }
    
    // در غیر این صورت تاریخ را فرمت کن
    return formatDate(request.expiresAt);
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <DetailItem
        icon={Wallet}
        label="بودجه پیشنهادی"
        value={
          request.budgetAmount != null
            ? `${formatPrice(request.budgetAmount)} تومان`
            : "—"
        }
      />

      <DetailItem
        icon={Boxes}
        label="مقدار / واحد"
        value={
          request.quantity != null
            ? `${formatPrice(request.quantity)} ${request.unit?.name || ""}`
            : request.unit?.name || "—"
        }
      />

      <DetailItem
        icon={CalendarDays}
        label="تاریخ انقضا"
        value={getExpiryLabel()} // استفاده از منطق جدید
      />

      <DetailItem
        icon={MapPin}
        label="محل تحویل"
        value={`${request.province?.name || "—"}${
          request.city?.name ? `، ${request.city.name}` : ""
        }`}
      />
    </div>
  );
}
