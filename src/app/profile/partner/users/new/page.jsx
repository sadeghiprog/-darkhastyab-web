"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "../../../../../components/ui/Input";
import Button from "../../../../../components/ui/Button";
import Alert from "../../../../../components/ui/Alert";
import Card from "../../../../../components/ui/Card";
import { apiFetch } from "../../../../../lib/api2";

const API_BASE = process.env.NEXT_PUBLIC_AVATAR_URL || "";
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const MAX_RESUME_LENGTH = 500;

function toAbsoluteUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  const normalizedUrl = url.startsWith("/") ? url : `/${url}`;
  return `${API_BASE}${normalizedUrl}`;
}

const initialForm = {
  phone: "",
  name: "",
  firstName: "",
  lastName: "",
  nationalCode: "",
  companyName: "",
  companyRegNo: "",
  activityField: "",
  address: "",
  resume: "",
};

export default function CreatePartnerUserPage() {
  const router = useRouter();

  const [formData, setFormData] = useState(initialForm);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "resume" && value.length > MAX_RESUME_LENGTH) {
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
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
      const formData = new FormData();
      formData.append("avatar", file);

      const result = await apiFetch("/upload/avatar", {
        method: "POST",
        body: formData,
      });

      const serverAvatarUrl =
        result?.avatarUrl ||
        result?.data?.avatarUrl ||
        result?.url ||
        result?.data?.url;

      if (serverAvatarUrl) {
        setAvatarUrl(serverAvatarUrl);
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

    if (!formData.phone.trim()) {
      setError("شماره موبایل الزامی است.");
      return;
    }

    if (formData.resume.length > MAX_RESUME_LENGTH) {
      setError(`رزومه نباید بیشتر از ${MAX_RESUME_LENGTH} کاراکتر باشد.`);
      return;
    }

    // حذف فیلدهای خالی تا سرور fallback خودش را اعمال کند
    const body = { ...formData };
    Object.keys(body).forEach(
      (k) => (body[k] === "" || body[k] === null) && delete body[k]
    );

    // اگر آواتار آپلود شده، به بدنه اضافه کن
    if (avatarUrl) {
      body.avatarUrl = avatarUrl;
    }

    try {
      setLoading(true);
      await apiFetch("/partner/users", {
        method: "POST",
        body: JSON.stringify(body),
      });

      alert("کاربر با موفقیت ثبت شد");
      router.push("/profile/partner/users");
    } catch (err) {
      setError(err?.message || "خطا در ثبت کاربر");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl p-4">
      <Card>
        <h1 className="mb-6 text-center text-2xl font-bold">
          ثبت کاربر جدید
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* آواتار */}
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
                : "برای انتخاب عکس کاربر روی آن کلیک کنید"}
            </span>
          </div>

          <Input
            label="شماره موبایل *"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="09xxxxxxxxx"
            required
          />

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
              placeholder="سوابق کاری، مهارت‌ها، تخصص‌ها و تجربیات کاربر را بنویسید..."
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
            ثبت کاربر
          </Button>
        </form>
      </Card>
    </main>
  );
}
