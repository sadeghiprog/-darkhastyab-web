"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "../../../../../lib/api2";
import PageHeader from "../../../../../components/ui/PageHeader";

const SUPPLIER_STATUS_LABEL = {
  NOT_REQUESTED: "بدون درخواست",
  PENDING: "در انتظار تأیید",
  REJECTED: "رد شده",
  APPROVED: "تأیید شده",
};

const SUPPLIER_STATUS_CLASS = {
  NOT_REQUESTED: "bg-slate-100 text-slate-600",
  PENDING: "bg-amber-100 text-amber-700",
  REJECTED: "bg-red-100 text-red-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
};

const ACCOUNT_STATUS_LABEL = {
  ACTIVE: "فعال",
  INACTIVE: "غیرفعال",
  SUSPENDED: "مسدود",
  USER: "کاربر",
  PARTNER: "همکار",
};

const API_BASE = process.env.NEXT_PUBLIC_AVATAR_URL || "";

const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_RESUME_LENGTH = 500;

function toAbsoluteUrl(url) {
  if (!url) return "";

  if (/^https?:\/\//i.test(url)) return url;

  const normalizedUrl = url.startsWith("/") ? url : `/${url}`;
  return `${API_BASE}${normalizedUrl}`;
}

const EMPTY_FORM = {
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

function getSupplierLabel(status) {
  return SUPPLIER_STATUS_LABEL[status] || status || "نامشخص";
}

function getSupplierClass(status) {
  return SUPPLIER_STATUS_CLASS[status] || "bg-slate-100 text-slate-600";
}

function getAccountLabel(status) {
  return ACCOUNT_STATUS_LABEL[status] || status || "—";
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("fa-IR");
}

export default function PartnerUserDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const [uploading, setUploading] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState({ type: "", text: "" });

  const [avatarPreview, setAvatarPreview] = useState("");
  const fileInputRef = useRef(null);

  const isApproved = user?.supplierStatus === "APPROVED";

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError("");

      const res = await apiFetch(`/partner/users/${id}`);
      const u = res.data || res;

      const profile = u.profile || {};

      setUser(u);
      setForm({
        name: u.name || "",
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        nationalCode: profile.nationalCode || "",
        companyName: profile.companyName || "",
        companyRegNo: profile.companyRegNo || "",
        activityField: profile.activityField || "",
        address: profile.address || "",
        resume: profile.resume || "",
      });
      if (profile?.avatarUrl) {
        setAvatarPreview(toAbsoluteUrl(profile.avatarUrl));
      }
    } catch (err) {
      setLoadError(err?.message || "دریافت اطلاعات کاربر با خطا مواجه شد.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isApproved) {
      setMsg({
        type: "error",
        text: "این کاربر تأیید شده است و امکان ویرایش آن وجود ندارد.",
      });
      return;
    }

    setSaving(true);
    setMsg({ type: "", text: "" });

    // اعتبارسنجی سمت کلاینت
    if (form.nationalCode && !/^\d{10}$/.test(form.nationalCode)) {
      setMsg({ type: "error", text: "کد ملی باید دقیقاً ۱۰ رقم باشد." });
      setSaving(false);
      return;
    }

    if (form.companyRegNo && !/^\d{3,20}$/.test(form.companyRegNo)) {
      setMsg({
        type: "error",
        text: "شماره ثبت شرکت باید بین ۳ تا ۲۰ رقم باشد.",
      });
      setSaving(false);
      return;
    }

    // بدنه تخت (flat) — مطابق ورودی validator
    const body = {
      name: form.name.trim(),
      firstName: form.firstName.trim() || null,
      lastName: form.lastName.trim() || null,
      nationalCode: form.nationalCode.trim() || null,
      companyName: form.companyName.trim() || null,
      companyRegNo: form.companyRegNo.trim() || null,
      activityField: form.activityField.trim() || null,
      address: form.address.trim() || null,
      resume: form.resume.trim() || null,
    };

    try {
      await apiFetch(`/partner/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });

      setMsg({ type: "success", text: "تغییرات ذخیره شد." });
      await load();
    } catch (err) {
      setMsg({
        type: "error",
        text: err?.message || "ذخیره تغییرات با خطا مواجه شد.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChooseAvatar = () => {
    if (isApproved) return;
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];

    // برای اینکه انتخاب همان فایل دوباره ممکن باشد
    event.target.value = "";

    if (!file) return;

    setAvatarMsg({ type: "", text: "" });

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setAvatarMsg({
        type: "error",
        text: "فرمت مجاز نیست. فقط JPG، PNG یا WebP مجاز است.",
      });
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarMsg({
        type: "error",
        text: "حجم تصویر باید حداکثر ۲ مگابایت باشد.",
      });
      return;
    }

    const previousPreview = avatarPreview;
    const previewUrl = URL.createObjectURL(file);

    setAvatarPreview(previewUrl);
    setUploading(true);

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await apiFetch(`/partner/users/${id}/avatar`, {
        method: "POST",
        body: formData,
      });

      const data = res.data || res;
      const newAvatarUrl = data?.avatarUrl || data?.profile?.avatarUrl || "";

      // نمایش آواتار قطعی از سرور
      setAvatarPreview(toAbsoluteUrl(newAvatarUrl));
      setAvatarMsg({ type: "success", text: "آواتار با موفقیت آپلود شد." });

      // به‌روزرسانی اطلاعات کاربر بدون بارگذاری کامل
      setUser((prev) =>
        prev
          ? { ...prev, profile: { ...prev.profile, avatarUrl: newAvatarUrl } }
          : prev
      );
    } catch (err) {
      // بازگردانی پیش‌نمایش قبلی در صورت خطا
      setAvatarPreview(previousPreview);
      setAvatarMsg({
        type: "error",
        text: err?.message || "آپلود آواتار با خطا مواجه شد.",
      });
    } finally {
      setUploading(false);
      URL.revokeObjectURL(previewUrl);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-sm text-slate-400">
        در حال بارگذاری…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="py-20 text-center text-sm text-red-500">{loadError}</div>
    );
  }

  const supplierStatus = user?.supplierStatus;
  const adminNote = user?.supplierRequest?.adminNote;
  const supplierUpdatedAt = user?.supplierRequest?.updatedAt;

  return (
    <div>
      <PageHeader
        title={user?.name || "جزئیات کاربر"}
        description={`کاربرِ ثبت‌شده توسط شما • ${user?.phone || "—"}`}
        action={
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            بازگشت
          </button>
        }
      />

      {/* کارت‌های وضعیت */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
          <p className="text-xs text-slate-500">وضعیت تأمین‌کننده</p>

          <span
            className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-black ${getSupplierClass(
              supplierStatus
            )}`}
          >
            {getSupplierLabel(supplierStatus)}
          </span>
        </div>

        <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-5 text-center">
          <p className="text-xs text-slate-500">تاریخ ثبت</p>
          <p className="mt-2 text-lg font-black text-cyan-700">
            {formatDate(user?.createdAt)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
          <p className="text-xs text-slate-500">وضعیت حساب</p>
          <p className="mt-2 text-lg font-black text-slate-700">
            {getAccountLabel(user?.status)}
          </p>
        </div>
      </div>

      {/* هشدار کاربر تأییدشده */}
      {isApproved && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          این کاربر تأیید شده است و امکان ویرایش اطلاعات و آپلود آواتار وجود
          ندارد.
        </div>
      )}

      {/* نمایش یادداشت مدیر (adminNote) */}
      {supplierStatus === "REJECTED" && adminNote && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 shrink-0 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <h4 className="text-sm font-bold text-red-800">
              علت رد درخواست تأمین‌کننده
            </h4>
          </div>

          <p className="mt-2 rounded-lg bg-white/70 p-3 text-sm leading-6 text-red-800">
            {adminNote}
          </p>

          {supplierUpdatedAt && (
            <p className="mt-2 text-[11px] text-red-400">
              آخرین به‌روزرسانی: {formatDate(supplierUpdatedAt)}
            </p>
          )}
        </div>
      )}

      {/* آواتار */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 font-bold text-slate-800">آواتار</h3>

        <div className="flex items-center gap-5">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-300">
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarPreview}
                alt="آواتار کاربر"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-3xl font-black">
                {(user?.name || "?").slice(0, 1)}
              </span>
            )}
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />

            <button
              type="button"
              onClick={handleChooseAvatar}
              disabled={uploading || isApproved}
              className="rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? "در حال آپلود…" : "انتخاب و آپلود آواتار"}
            </button>

            <p className="mt-2 text-xs text-slate-400">
              فرمت‌های مجاز: JPG، PNG، WebP — حداکثر ۲ مگابایت
            </p>

            {avatarMsg.text && (
              <p
                className={`mt-2 text-sm ${
                  avatarMsg.type === "success"
                    ? "text-emerald-600"
                    : "text-red-500"
                }`}
              >
                {avatarMsg.text}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* فرم ویرایش */}
      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-5"
      >
        <h3 className="mb-4 font-bold text-slate-800">ویرایش اطلاعات</h3>

        <div className="grid gap-4 md:grid-cols-2">
          {/* موبایل: فقط نمایش */}
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-600">
              شماره موبایل
            </label>

            <input
              disabled
              dir="ltr"
              value={user?.phone || ""}
              className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-left text-sm text-slate-500"
            />

            <p className="mt-1 text-[11px] text-slate-400">
              شماره موبایل شناسه کاربر است و قابل ویرایش نیست.
            </p>
          </div>

          {/* نام نمایشی (top-level) */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              نام کاربر
            </label>

            <input
              required
              disabled={isApproved}
              value={form.name}
              maxLength={80}
              onChange={(event) => updateField("name", event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-cyan-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
              placeholder="مثال: علی رضایی"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              نام
            </label>

            <input
              disabled={isApproved}
              value={form.firstName}
              maxLength={50}
              onChange={(event) => updateField("firstName", event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-cyan-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
              placeholder="نام کوچک"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              نام خانوادگی
            </label>

            <input
              disabled={isApproved}
              value={form.lastName}
              maxLength={50}
              onChange={(event) => updateField("lastName", event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-cyan-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
              placeholder="نام خانوادگی"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              کد ملی
            </label>

            <input
              dir="ltr"
              inputMode="numeric"
              disabled={isApproved}
              value={form.nationalCode}
              maxLength={10}
              onChange={(event) =>
                updateField(
                  "nationalCode",
                  event.target.value.replace(/\D/g, "")
                )
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm focus:border-cyan-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
              placeholder="۱۰ رقم"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              نام شرکت
            </label>

            <input
              disabled={isApproved}
              value={form.companyName}
              maxLength={120}
              onChange={(event) => updateField("companyName", event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-cyan-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
              placeholder="نام شرکت"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              شماره ثبت شرکت
            </label>

            <input
              dir="ltr"
              inputMode="numeric"
              disabled={isApproved}
              value={form.companyRegNo}
              maxLength={20}
              onChange={(event) =>
                updateField(
                  "companyRegNo",
                  event.target.value.replace(/\D/g, "")
                )
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm focus:border-cyan-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
              placeholder="بین ۳ تا ۲۰ رقم"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              زمینه فعالیت
            </label>

            <input
              disabled={isApproved}
              value={form.activityField}
              maxLength={120}
              onChange={(event) => updateField("activityField", event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-cyan-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
              placeholder="زمینه فعالیت"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-600">
              آدرس
            </label>

            <textarea
              disabled={isApproved}
              value={form.address}
              maxLength={500}
              rows={2}
              onChange={(event) => updateField("address", event.target.value)}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-cyan-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
              placeholder="آدرس"
            />
          </div>

          <div className="md:col-span-2">
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-xs font-medium text-slate-600">
                رزومه / سوابق
              </label>

              <span
                className={`text-[11px] ${
                  form.resume.length >= MAX_RESUME_LENGTH
                    ? "text-red-500"
                    : "text-slate-400"
                }`}
              >
                {form.resume.length} / {MAX_RESUME_LENGTH}
              </span>
            </div>

            <textarea
              disabled={isApproved}
              value={form.resume}
              maxLength={MAX_RESUME_LENGTH}
              rows={4}
              onChange={(event) => updateField("resume", event.target.value)}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-cyan-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
              placeholder="رزومه، سوابق و توضیحات"
            />
          </div>
        </div>

        {msg.text && (
          <p
            className={`mt-3 text-sm ${
              msg.type === "success" ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {msg.text}
          </p>
        )}

        <button
          type="submit"
          disabled={saving || isApproved}
          className="mt-4 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "در حال ذخیره…" : "ذخیره تغییرات"}
        </button>
      </form>
    </div>
  );
}
