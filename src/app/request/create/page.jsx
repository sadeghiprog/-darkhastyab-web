// app/purchase-requests/create/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Alert from "../../../components/ui/Alert";
import Card from "../../../components/ui/Card";
import { lookupService } from "../../../services/lookup.service";
import { purchaseService } from "../../../services/purchase.service";
import { ROUTES } from "../../../constants/routes";
import { useAuth } from "../../../context/AuthContext";
import { apiFetch } from "../../../lib/api";

export default function CreatePurchaseRequestPage() {
  const router = useRouter();
  const { user } = useAuth();

  // --- مدیریت مراحل فرم (۱ تا ۴) ---
  const [step, setStep] = useState(1);

  // --- تشخیص نقش ادمین / پارتنر ---
  const canCreateForCustomer = ["ADMIN", "PARTNER"].includes(user?.status);

  // --- States برای داده‌های اولیه از سرور ---
  const [categories, setCategories] = useState([]); // دسته‌بندی‌های اصلی
  const [subCategories, setSubCategories] = useState([]); // زیردسته‌های دسته‌بندی انتخاب‌شده
  const [units, setUnits] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);

  // --- States برای مقادیر فرم ---
  const [formData, setFormData] = useState({
    customerName: "", // مخصوص ادمین/پارتنر (اختیاری)
    customerPhone: "", // مخصوص ادمین/پارتنر (اختیاری)
    title: "",
    categoryId: "", // شناسه دسته اصلی
    subCategoryId: "", // شناسه زیردسته
    unitId: "",
    quantity: "",
    budgetAmount: "0",
    expiresInDays: "100000", // پیش‌فرض بدون انقضا
    provinceId: "",
    cityId: "",
    description: "",
  });

  // --- States برای مدیریت وضعیت صفحه ---
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // پیام موفقیت بعد از ثبت

  // ۱. دریافت داده‌های اولیه هنگام لود صفحه
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

  // ۲. هر زمان استان تغییر کرد، لیست شهرهای آن را بگیر
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

  // ۳. مدیریت تغییر دسته اصلی و به‌روزرسانی زیردسته‌ها
  const handleCategoryChange = (e) => {
    const selectedCatId = e.target.value;
    const selectedCategory = categories.find(
      (cat) => cat.id === parseInt(selectedCatId)
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

  // ۴. هندلر تغییرات بقیه ورودی‌ها
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  // ۵. اعتبارسنجی مراحل قبل از رفتن به مرحله بعد
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

  // جلوگیری از ارسال فرم با فشردن دکمه Enter در فیلدها
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
      e.preventDefault();
    }
  };

  // ۶. ارسال نهایی فرم در مرحله چهارم
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
        title: formData.title,
        categoryId: parseInt(formData.subCategoryId),
        unitId: parseInt(formData.unitId),
        quantity: parseFloat(formData.quantity),
        budgetAmount: formData.budgetAmount
          ? parseFloat(formData.budgetAmount)
          : null,
        expiresInDays:
          formData.expiresInDays === "0"
            ? null
            : parseInt(formData.expiresInDays),
        provinceId: parseInt(formData.provinceId),
        cityId: parseInt(formData.cityId),
        description: formData.description,
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

  if (initLoading)
    return (
      <div className="text-center p-10 text-gray-500">
        در حال بارگذاری اطلاعات اولیه...
      </div>
    );

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
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="مثلاً: 50"
                  required
                />
              </div>
            </div>
          )}

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

          {step === 4 && (
            <div className="space-y-4 animate-fadeIn">
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
                  توضیحات تکمیلی
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-700"
                  placeholder="جزئیات بیشتر، برند مورد نظر یا شرایط خاص را اینجا بنویسید..."
                ></textarea>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-semibold animate-pulse">
              {successMessage}
            </div>
          )}

          {error && <Alert message={error} />}

          <div className="flex justify-between items-center gap-4 pt-4 border-t border-gray-100">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="w-1/3 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
                disabled={loading}
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
