// services/lookup.service.js
import { apiFetch } from "../lib/api";

export const lookupService = {
  async getCategories() {
    const res = await apiFetch("/categories");
    // اگر پاسخ مستقیم آرایه است همان را بده، وگرنه اگر فیلد categories دارد آن را بده، در غیر این صورت آرایه خالی
    return Array.isArray(res) ? res : (res?.categories || []);
  },
  
  async getUnits() {
    const res = await apiFetch("/units");
    return Array.isArray(res) ? res : (res?.units || []);
  },
  
  async getProvinces() {
    const res = await apiFetch("/locations/provinces");
    return Array.isArray(res) ? res : (res?.provinces || []);
  },
  
  async getCities(provinceId) {
    if (!provinceId) return [];
    const res = await apiFetch(`/locations/cities?provinceId=${provinceId}`);
    return Array.isArray(res) ? res : (res?.cities || []);
  }
};
