"use client";

import {
  Wallet,
  Boxes,
  CalendarDays,
  MapPin,
} from "lucide-react";
import DetailItem from "./DetailItem";
import { formatDate, formatPrice } from "../utils/formatters";

export default function RequestInfoGrid({ request }) {
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
        value={formatDate(request.expiresAt)}
      />

      <DetailItem
        icon={MapPin}
        label="محل تحویل"
        value={`${request.province?.name || "—"}${request.city?.name ? `، ${request.city.name}` : ""}`}
      />
    </div>
  );
}
