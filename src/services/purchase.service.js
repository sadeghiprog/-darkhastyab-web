// services/purchase.service.js
import { apiFetch } from "../lib/api";

export const purchaseService = {
  createRequest(payload) {
    return apiFetch("/purchase-requests", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
};
