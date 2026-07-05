"use client";

import { useEffect, useState } from "react";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Alert from "../../../components/ui/Alert";
import Card from "../../../components/ui/Card";
import { profileService } from "../../../services/profile.service";

const API_BASE = process.env.NEXT_PUBLIC_AVATAR_URL || "";
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

function toAbsoluteUrl(url) {
  if (!url) return "";

  if (/^https?:\/\//i.test(url)) return url;

  const normalizedUrl = url.startsWith("/") ? url : `/${url}`;
  return `${API_BASE}${normalizedUrl}`;
}

export default function EditProfilePage() {
  const [formData, setFormData] = useState({
    name: "",
    firstName: "",
    lastName: "",
    nationalCode: "",
    companyName: "",
    companyRegNo: "",
    address: "",
    
  });

  const [avatarPreview, setAvatarPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [error, setError] = useState("");



  useEffect(() => {
    let mounted = true;

    async function fetchProfile() {
      try {
        const data = await profileService.getProfile();

        const topProfile = data?.profile;
        const nestedProfile = topProfile?.profile;

        if (!mounted) return;

        setFormData({
          name: topProfile?.name || "",
          firstName: nestedProfile?.firstName || "",
          lastName: nestedProfile?.lastName || "",
          nationalCode: nestedProfile?.nationalCode || "",
          companyName: nestedProfile?.companyName || "",
          companyRegNo: nestedProfile?.companyRegNo || "",
          address: nestedProfile?.address || "",
        });

        if (nestedProfile?.avatarUrl) {
          
          setAvatarPreview(toAbsoluteUrl(nestedProfile.avatarUrl));
        }
      } catch (err) {
        if (mounted) {
          setError(err?.message || "خطا در دریافت اطلاعات پروفایل");
        }
      } finally {
        if (mounted) {
          setInitLoading(false);
        }
      }
    }

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!avatarPreview.startsWith("blob:")) return;

    return () => {
      URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file) return;

    console.log("[avatar] selected file:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    if (!file.type.startsWith("image/")) {
      setError("فقط فایل تصویری مجاز است.");
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setError("حجم تصویر نباید بیشتر از 2MB باشد.");
      return;
    }

    const previousPreview = avatarPreview;
    const localPreviewUrl = URL.createObjectURL(file);

    setError("");
    setAvatarPreview(localPreviewUrl);
    setAvatarUploading(true);

    try {
      console.log("[avatar] start upload request");
      const result = await profileService.uploadAvatar(file);
      console.log("[avatar] upload response:", result);

      const serverAvatarUrl =
        result?.avatarUrl ||
        result?.profile?.avatarUrl ||
        result?.profile?.profile?.avatarUrl;

      if (serverAvatarUrl) {
        setAvatarPreview(toAbsoluteUrl(serverAvatarUrl));
      } else {
        console.warn("[avatar] response did not include avatar url");
      }
    } catch (err) {
      console.error("[avatar] upload failed:", err);
      setAvatarPreview(previousPreview);
      setError(err?.message || "خطا در آپلود آواتار");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      await profileService.updateProfile(formData);
      alert("اطلاعات با موفقیت ذخیره شد");
    } catch (err) {
      setError(err?.message || "خطا در ذخیره اطلاعات");
    } finally {
      setLoading(false);
    }
  };

  if (initLoading) {
    return <div className="text-center p-10">در حال بارگذاری اطلاعات...</div>;
  }

  return (
    <main className="max-w-2xl mx-auto p-4">
      <Card>
        <h1 className="text-2xl font-bold mb-6 text-center">
          ویرایش اطلاعات حساب
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-3">
            <label className="cursor-pointer">
              <div className="w-28 h-28 rounded-full overflow-hidden border border-gray-300 bg-gray-50">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="avatar preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm text-center px-2">
                    انتخاب عکس
                  </div>
                )}
              </div>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={avatarUploading}
              />
            </label>

            <span className="text-xs text-gray-500">
              {avatarUploading ? "در حال آپلود..." : "برای تغییر عکس روی آن کلیک کنید"}
            </span>
          </div>

          <Input
            label="نام نمایشی"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />

          <Input
            label="نام"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />

          <Input
            label="نام خانوادگی"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />

          <Input
            label="کد ملی"
            name="nationalCode"
            value={formData.nationalCode}
            onChange={handleChange}
          />

          <Input
            label="نام شرکت"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
          />

          <Input
            label="شماره ثبت شرکت"
            name="companyRegNo"
            value={formData.companyRegNo}
            onChange={handleChange}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              آدرس
            </label>

            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Alert message={error} />

          <Button
            type="submit"
            loading={loading}
            className="w-full py-3 text-lg"
            disabled={avatarUploading}
          >
            ذخیره اطلاعات
          </Button>
        </form>
      </Card>
    </main>
  );
}
