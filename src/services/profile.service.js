import { apiFetch } from "../lib/api";

export const profileService = {

  // دریافت اطلاعات پروفایل
  getProfile: async () => {
    return apiFetch("/profile/me", {
      method: "GET",
    });
  },

  // بروزرسانی اطلاعات پروفایل
  updateProfile: async (data) => {

    return apiFetch("/profile/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

  },

  // آپلود آواتار
  uploadAvatar: async (file) => {

    const formData = new FormData();
    formData.append("avatar", file);

    return apiFetch("/profile/avatar", {
      method: "POST",
      body: formData,
    });

  },

};
