const PENDING_PHONE_KEY = "pending_phone";
const REDIRECT_AFTER_LOGIN_KEY = "redirect_after_login";


export const authSession = {
  setPendingPhone(phone) {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(PENDING_PHONE_KEY, phone);
  },

  getPendingPhone() {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(PENDING_PHONE_KEY);
  },

  clearPendingPhone() {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(PENDING_PHONE_KEY);
  },

setRedirectAfterLogin(url) {
    if (typeof window !== "undefined" && url) {
      localStorage.setItem(REDIRECT_AFTER_LOGIN_KEY, url);
    }
  },

  getRedirectAfterLogin() {
    if (typeof window !== "undefined") {
      return localStorage.getItem(REDIRECT_AFTER_LOGIN_KEY);
    }
    return null;
  },

  clearRedirectAfterLogin() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(REDIRECT_AFTER_LOGIN_KEY);
    }
  },

};
