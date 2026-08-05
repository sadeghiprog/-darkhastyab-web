"use client";

import { useEffect, useState } from "react";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Alert from "../../../components/ui/Alert";
import Card from "../../../components/ui/Card";
import { profileService } from "../../../services/profile.service";

const API_BASE = process.env.NEXT_PUBLIC_AVATAR_URL || "";
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const MAX_RESUME_LENGTH = 500;

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
    activityField: "",
    address: "",
    resume: "",
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

        const topProfile = data?.profile || data;
        const nestedProfile = topProfile?.profile || topProfile;

        if (!mounted) return;

        setFormData({
          name: topProfile?.name || "",
          firstName: nestedProfile?.firstName || "",
          lastName: nestedProfile?.lastName || "",
          nationalCode: nestedProfile?.nationalCode || "",
          companyName: nestedProfile?.companyName || "",
          companyRegNo: nestedProfile?.companyRegNo || "",
          activityField: nestedProfile?.activityField || "",
          address: nestedProfile?.address || "",
          resume: nestedProfile?.resume || "",
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

    if (name === "resume" && value.length > MAX_RESUME_LENGTH) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file) return;

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
      const result = await profileService.uploadAvatar(file);

      const serverAvatarUrl =
        result?.avatarUrl ||
        result?.profile?.avatarUrl ||
        result?.profile?.profile?.avatarUrl;

      if (serverAvatarUrl) {
        setAvatarPreview(toAbsoluteUrl(serverAvatarUrl));
      } else {
        setAvatarPreview(previousPreview);
        setError("آدرس آواتار از سرور دریافت نشد.");
      }
    } catch (err) {
      setAvatarPreview(previousPreview);
      setError(err?.message || "خطا در آپلود آواتار");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.resume.length > MAX_RESUME_LENGTH) {
      setError(`رزومه نباید بیشتر از ${MAX_RESUME_LENGTH} کاراکتر باشد.`);
      return;
    }

    try {
      setLoading(true);

      await profileService.updateProfile({
        name: formData.name,
        firstName: formData.firstName,
        lastName: formData.lastName,
        nationalCode: formData.nationalCode,
        companyName: formData.companyName,
        companyRegNo: formData.companyRegNo,
        activityField: formData.activityField,
        address: formData.address,
        resume: formData.resume,
      });

      alert("اطلاعات با موفقیت ذخیره شد");
    } catch (err) {
      setError(err?.message || "خطا در ذخیره اطلاعات");
    } finally {
      setLoading(false);
    }
  };

  if (initLoading) {
    return <div className="p-10 text-center">در حال بارگذاری اطلاعات...</div>;
  }

  return (
    <main className="mx-auto max-w-2xl p-4">
      <Card>
        <h1 className="mb-6 text-center text-2xl font-bold">
          ویرایش اطلاعات حساب
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-3">
            <label className="cursor-pointer">
              <div className="h-28 w-28 overflow-hidden rounded-full border border-gray-300 bg-gray-50">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="avatar preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center px-2 text-center text-sm text-gray-400">
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
              {avatarUploading
                ? "در حال آپلود..."
                : "برای تغییر عکس روی آن کلیک کنید"}
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

          <Input
            label="حوزه فعالیت"
            name="activityField"
            value={formData.activityField}
            onChange={handleChange}
            placeholder="مثلاً تولید قطعات صنعتی، بازرگانی، مواد غذایی و..."
          />

          <div>
            <label
              htmlFor="address"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              آدرس
            </label>

            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border p-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between gap-3">
              <label
                htmlFor="resume"
                className="block text-sm font-medium text-gray-700"
              >
                رزومه
              </label>

              <span
                className={`text-xs ${
                  formData.resume.length >= MAX_RESUME_LENGTH
                    ? "text-red-500"
                    : "text-gray-500"
                }`}
              >
                {formData.resume.length} / {MAX_RESUME_LENGTH}
              </span>
            </div>

            <textarea
              id="resume"
              name="resume"
              value={formData.resume}
              onChange={handleChange}
              rows={7}
              maxLength={MAX_RESUME_LENGTH}
              placeholder="سوابق کاری، مهارت‌ها، تخصص‌ها و تجربیات خود را بنویسید..."
              className="w-full resize-y rounded-lg border p-2 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <p className="mt-1 text-xs text-gray-500">حداکثر 500 کاراکتر</p>
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
