// app/purchase-requests/create/page.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Alert from "../../../components/ui/Alert";
import Card from "../../../components/ui/Card";
import { lookupService } from "../../../services/lookup.service";
import { purchaseService } from "../../../services/purchase.service";
import { ROUTES } from "../../../constants/routes";
import { useAuth } from "../../../context/AuthContext";
import { apiFetch } from "../../../lib/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://darkhastyab.com/api";

export default function CreatePurchaseRequestPage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  // --- مدیریت مراحل فرم (۱ تا ۴) ---
  const [step, setStep] = useState(1);

  // --- تشخیص نقش ادمین / پارتنر ---
  const canCreateForCustomer = ["ADMIN", "PARTNER"].includes(user?.status);

  // --- States برای داده‌های اولیه از سرور ---
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);

  // --- States برای مقادیر فرم ---
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    title: "",
    categoryId: "",
    subCategoryId: "",
    unitId: "",
    quantity: "",
    budgetAmount: "",
    expiresInDays: "100000", // پیش‌فرض بدون انقضا
    provinceId: "",
    cityId: "",
    description: "",
  });

  // --- مدیریت آپلود تصاویر ---
  // ساختار آیتم‌ها: { url, thumbnailUrl, sortOrder }
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // --- States وضعیت صفحه ---
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ۱. دریافت اطلاعات اولیه (دسته‌بندی‌ها، واحدها، استان‌ها)
  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [catsData, uns, provs] = await Promise.all([
          lookupService.getCategories(),
          lookupService.getUnits(),
          lookupService.getProvinces(),
        ]);

        const mainCats = catsData.categories || catsData;
        setCategories(mainCats);
        setUnits(uns);
        setProvinces(provs);
      } catch (err) {
        setError("خطا در دریافت اطلاعات اولیه از سرور");
      } finally {
        setInitLoading(false);
      }
    }
    fetchInitialData();
  }, []);

  // ۲. دریافت لیست شهرها با انتخاب استان
  useEffect(() => {
    async function fetchCities() {
      if (!formData.provinceId) {
        setCities([]);
        return;
      }
      try {
        const data = await lookupService.getCities(formData.provinceId);
        setCities(data);
      } catch (err) {
        console.error("خطا در دریافت لیست شهرها");
      }
    }
    fetchCities();
  }, [formData.provinceId]);

  // ۳. تغییر دسته اصلی و تنظیم زیردسته‌ها
  const handleCategoryChange = (e) => {
    const selectedCatId = e.target.value;
    const selectedCategory = categories.find(
      (cat) => cat.id === parseInt(selectedCatId, 10)
    );

    setFormData((prev) => ({
      ...prev,
      categoryId: selectedCatId,
      subCategoryId: "",
    }));

    if (selectedCategory && selectedCategory.children) {
      setSubCategories(selectedCategory.children);
    } else {
      setSubCategories([]);
    }
  };

  // ۴. هندلر ورودی‌ها
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  // ۵. منطق آپلود مستقل تصاویر
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (uploadedImages.length + files.length > 10) {
      setError("حداکثر می‌توانید 10 تصویر برای درخواست بارگذاری کنید.");
      return;
    }

    try {
      setUploadingImage(true);
      setError("");

      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          setError("لطفاً فقط فایل تصویر انتخاب کنید.");
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          setError("حجم هر تصویر باید کمتر از ۵ مگابایت باشد.");
          continue;
        }

        const data = new FormData();
        data.append("image", file);

        const res = await apiFetch("/upload/purchase-request", {
          method: "POST",
          body: data,
        });

        if (res && res.url) {
          setUploadedImages((prev) => [
            ...prev,
            {
              url: res.url,
              thumbnailUrl: res.thumbnailUrl || res.url,
              sortOrder: prev.length,
            },
          ]);
        }
      }
    } catch (err) {
      setError(err.message || "خطا در بارگذاری تصویر روی سرور");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // ۶. حذف تصویر از لیست و از دیسک سرور
  const handleRemoveImage = async (indexToRemove) => {
    const targetImage = uploadedImages[indexToRemove];
    if (!targetImage) return;

    try {
      // ارسال درخواست حذف به بک‌اند
      await apiFetch("/upload/remove", {
        method: "POST",
        body: JSON.stringify({ url: targetImage.url }),
      }).catch((err) => console.warn("حذف فیزیکی فایل با خطا مواجه شد:", err));

      setUploadedImages((prev) =>
        prev
          .filter((_, idx) => idx !== indexToRemove)
          .map((img, idx) => ({ ...img, sortOrder: idx }))
      );
    } catch (err) {
      console.error("خطا در حذف تصویر", err);
    }
  };

  // ۷. اعتبارسنجی فیلدهای هر مرحله
  const validateStep = (currentStep) => {
    setError("");

    if (currentStep === 1) {
      if (canCreateForCustomer) {
        const hasPhone = formData.customerPhone.trim().length > 0;
        const hasName = formData.customerName.trim().length > 0;

        if (hasPhone || hasName) {
          if (!hasPhone) {
            setError("در صورت ثبت برای مشتری، وارد کردن شماره موبایل الزامی است.");
            return false;
          }
          if (formData.customerPhone.trim().length < 11) {
            setError("شماره موبایل مشتری باید حداقل ۱۱ رقم باشد.");
            return false;
          }
          if (!hasName) {
            setError("در صورت ثبت برای مشتری، وارد کردن نام مشتری الزامی است.");
            return false;
          }
        }
      }

      if (!formData.title.trim()) {
        setError("لطفاً عنوان درخواست را وارد کنید.");
        return false;
      }
      if (!formData.unitId) {
        setError("لطفاً واحد اندازه‌گیری را مشخص کنید.");
        return false;
      }
      if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
        setError("لطفاً مقدار معتبر و بزرگتر از صفر وارد کنید.");
        return false;
      }
    }

    if (currentStep === 2) {
      if (!formData.categoryId) {
        setError("لطفاً دسته‌بندی اصلی را انتخاب کنید.");
        return false;
      }
      if (!formData.subCategoryId) {
        setError("لطفاً زیر دسته‌بندی مورد نظر را انتخاب کنید.");
        return false;
      }
    }

    if (currentStep === 3) {
      if (!formData.provinceId) {
        setError("لطفاً استان محل تحویل را مشخص کنید.");
        return false;
      }
      if (!formData.cityId) {
        setError("لطفاً شهر محل تحویل را مشخص کنید.");
        return false;
      }
    }

    if (currentStep === 4) {
      const desc = formData.description.trim();

      if (!desc) {
        setError("لطفاً توضیحات تکمیلی را وارد کنید.");
        return false;
      }

      if (desc.length < 10) {
        setError("توضیحات باید حداقل ۱۰ کاراکتر باشد.");
        return false;
      }
    }

    return true;
  };

  const handleNext = (e) => {
    if (e) e.preventDefault();
    if (validateStep(step)) {
      setError("");
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = (e) => {
    if (e) e.preventDefault();
    setError("");
    setStep((prev) => prev - 1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
      e.preventDefault();
    }
  };

  // ۸. ثبت نهایی اطلاعات
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (
      !validateStep(1) ||
      !validateStep(2) ||
      !validateStep(3) ||
      !validateStep(4)
    ) {
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: formData.title.trim(),
        categoryId: parseInt(formData.subCategoryId, 10),
        unitId: parseInt(formData.unitId, 10),
        quantity: parseFloat(formData.quantity),
        budgetAmount: formData.budgetAmount ? parseFloat(formData.budgetAmount) : 0,
        expiresInDays:
          formData.expiresInDays === "100000"
            ? 100000
            : parseInt(formData.expiresInDays, 10),
        provinceId: parseInt(formData.provinceId, 10),
        cityId: parseInt(formData.cityId, 10),
        description: formData.description.trim(),
        images: uploadedImages.map((img, index) => ({
          url: img.url,
          thumbnailUrl: img.thumbnailUrl || img.url,
          sortOrder: index,
        })),
      };

      const hasCustomerInfo =
        canCreateForCustomer && formData.customerPhone.trim().length > 0;

      if (hasCustomerInfo) {
        payload.customerPhone = formData.customerPhone.trim();
        payload.customerName = formData.customerName.trim();

        await apiFetch("/purchase-requests/admin-create", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } else {
        await purchaseService.createRequest(payload);
      }

      setSuccessMessage(
        "درخواست خرید شما با موفقیت ثبت گردید. در حال انتقال به داشبورد..."
      );

      setTimeout(() => {
        router.push(ROUTES.DASHBOARD);
      }, 2000);
    } catch (err) {
      setError(err.message || "خطا در ثبت درخواست. لطفاً مقادیر ورودی را بررسی کنید.");
    } finally {
      setLoading(false);
    }
  };

  if (initLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px] text-gray-500 text-sm">
        در حال بارگذاری اطلاعات اولیه...
      </div>
    );
  }

  const stepsTitle = ["مشخصات کالا", "دسته‌بندی کالا", "محل تحویل", "جزئیات نهایی"];

  return (
    <main className="max-w-2xl mx-auto p-4" dir="rtl">
      <Card>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
            {canCreateForCustomer
              ? "ثبت درخواست خرید جدید (پنل مدیریت / پارتنر)"
              : "ثبت درخواست خرید جدید"}
          </h1>

          {/* نوار مراحل */}
          <div className="flex items-center justify-between w-full relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
            <div
              className="absolute top-5 right-0 h-0.5 bg-blue-600 transition-all duration-300 -z-10"
              style={{
                width: `${((step - 1) / (stepsTitle.length - 1)) * 100}%`,
              }}
            />

            {stepsTitle.map((title, idx) => {
              const stepNumber = idx + 1;
              const isActive = step === stepNumber;
              const isCompleted = step > stepNumber;

              return (
                <div key={stepNumber} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all z-10 ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg ring-4 ring-blue-100"
                        : isCompleted
                        ? "bg-green-500 text-white"
                        : "bg-white border-2 border-gray-300 text-gray-400"
                    }`}
                  >
                    {isCompleted ? "✓" : stepNumber}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium hidden md:inline transition-all ${
                      isActive ? "text-blue-600 font-bold" : "text-gray-500"
                    }`}
                  >
                    {title}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-3 md:hidden">
            <span className="text-xs text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full">
              گام {step} از ۴: {stepsTitle[step - 1]}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6">
          {/* مرحله ۱: مشخصات اولیه کالا */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              {canCreateForCustomer && (
                <div className="p-4 bg-amber-50/75 rounded-xl border border-amber-100 space-y-4 mb-4">
                  <p className="text-xs font-semibold text-amber-800">
                    ثبت به نام مشتری (در صورت خالی گذاشتن، درخواست به نام خود شما ثبت خواهد شد):
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="نام و نام خانوادگی مشتری (اختیاری)"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      placeholder="مثلاً: علی محمدی"
                    />
                    <Input
                      label="شماره موبایل مشتری (اختیاری)"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleChange}
                      placeholder="مثلاً: 09123456789"
                    />
                  </div>
                </div>
              )}

              <Input
                label="عنوان درخواست (مثلاً: نیاز به میلگرد ۱۰) *"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="خلاصه نیاز خود را بنویسید"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    واحد اندازه‌گیری *
                  </label>
                  <select
                    name="unitId"
                    value={formData.unitId}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-700"
                    required
                  >
                    <option value="">انتخاب کنید...</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="مقدار مورد نیاز *"
                  name="quantity"
                  type="number"
                  step="any"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="مثلاً: 50"
                  required
                />
              </div>
            </div>
          )}

          {/* مرحله ۲: دسته‌بندی */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    دسته‌بندی اصلی *
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleCategoryChange}
                    className="w-full p-2.5 border border-gray-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-700"
                    required
                  >
                    <option value="">انتخاب کنید...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    زیر دسته‌بندی *
                  </label>
                  <select
                    name="subCategoryId"
                    value={formData.subCategoryId}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-700 disabled:bg-gray-50 disabled:text-gray-400"
                    required
                    disabled={!formData.categoryId || subCategories.length === 0}
                  >
                    <option value="">
                      {subCategories.length === 0
                        ? "ابتدا دسته اصلی را انتخاب کنید"
                        : "انتخاب زیردسته..."}
                    </option>
                    {subCategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* مرحله ۳: محل تحویل */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    استان محل تحویل *
                  </label>
                  <select
                    name="provinceId"
                    value={formData.provinceId}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-700"
                    required
                  >
                    <option value="">انتخاب استان...</option>
                    {provinces.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    شهر محل تحویل *
                  </label>
                  <select
                    name="cityId"
                    value={formData.cityId}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-700 disabled:bg-gray-50 disabled:text-gray-400"
                    required
                    disabled={!formData.provinceId}
                  >
                    <option value="">انتخاب شهر...</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* مرحله ۴: جزئیات نهایی و تصاویر */}
          {step === 4 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="بودجه تقریبی (تومان) - اختیاری"
                  name="budgetAmount"
                  type="number"
                  value={formData.budgetAmount}
                  onChange={handleChange}
                  placeholder="مثلاً: 100000000"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    معتبر تا چند روز آینده؟
                  </label>
                  <select
                    name="expiresInDays"
                    value={formData.expiresInDays}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1">۱ روز</option>
                    <option value="3">۳ روز</option>
                    <option value="7">۷ روز</option>
                    <option value="14">۱۴ روز</option>
                    <option value="30">۳۰ روز</option>
                    <option value="100000">بدون انقضا</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  توضیحات تکمیلی *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-700"
                  placeholder="جزئیات بیشتر، مشخصات فنی، برند مورد نظر یا شرایط پرداخت را بنویسید..."
                  required
                ></textarea>
              </div>

              {/* بخش آپلود تصاویر */}
              <div className="space-y-3 pt-2">
                <label className="block text-sm font-medium text-gray-700">
                  تصاویر کالا یا پیش‌فاکتور (اختیاری - حداکثر 10 تصویر)
                </label>

                <div className="flex flex-wrap items-center gap-3">
                  {uploadedImages.map((img, index) => {
                    const displaySrc = img.url.startsWith("http")
                      ? img.url
                      : `${API_BASE_URL.replace("/api", "")}${img.url}`;

                    return (
                      <div
                        key={img.url || index}
                        className="relative w-20 h-20 rounded-lg border border-gray-200 overflow-hidden group bg-gray-50"
                      >
                        <img
                          src={displaySrc}
                          alt={`تصویر شماره ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-90 hover:opacity-100 transition-opacity"
                          title="حذف تصویر"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}

                  {uploadedImages.length < 10 && (
                    <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-colors">
                      <svg
                        className="w-6 h-6 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span className="text-[10px] text-gray-500 mt-1">
                        {uploadingImage ? "در حال آپلود..." : "افزودن عکس"}
                      </span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={uploadingImage}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-semibold animate-pulse">
              {successMessage}
            </div>
          )}

          {error && <Alert message={error} />}

          {/* دکمه‌های ناوبری مراحل */}
          <div className="flex justify-between items-center gap-4 pt-4 border-t border-gray-100">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="w-1/3 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
                disabled={loading || uploadingImage}
              >
                بازگشت
              </Button>
            ) : (
              <div className="w-1/3" />
            )}

            {step < 4 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="w-2/3 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                مرحله بعد
              </Button>
            ) : (
              <Button
                type="submit"
                loading={loading}
                disabled={uploadingImage}
                className="w-2/3 py-2.5 text-white bg-green-600 hover:bg-green-700 rounded-lg"
              >
                ثبت نهایی درخواست
              </Button>
            )}
          </div>
        </form>
      </Card>
    </main>
  );
}
