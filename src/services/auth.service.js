import { apiFetch } from "../lib/api";

export const authService = {
  sendOtp(phone) {
    return apiFetch("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ phone }),
    });
  },

  verifyOtp(phone, code) {
    return apiFetch("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phone, code }),
    });
  },

  me() {
    return apiFetch("/auth/me", {
      method: "GET",
    });
  },

  completeProfile(name) {
    return apiFetch("/auth/complete-profile", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  },

  logout() {
    return apiFetch("/auth/logout", {
      method: "POST",
    });
  },
};
