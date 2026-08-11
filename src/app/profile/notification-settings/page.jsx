"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Alert from "../../../components/ui/Alert";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY || "";

const API_ENDPOINTS = {
  categories: `${API_BASE_URL}/categories`,
  provinces: `${API_BASE_URL}/locations/provinces`,
  provincesFallback: `${API_BASE_URL}/provinces`,
  cities: (provinceId) =>
    `${API_BASE_URL}/locations/cities?provinceId=${provinceId}`,
  citiesFallback: (provinceId) =>
    `${API_BASE_URL}/provinces/${provinceId}/cities`,
  notificationCategories: `${API_BASE_URL}/notification/categories`,
  subscribe: `${API_BASE_URL}/notification/subscribe`,
  unsubscribe: `${API_BASE_URL}/notification/unsubscribe`,
};

function safeArray(value) {
  if (Array.isArray(value)) return value;

  if (value && typeof value === "object") {
    if (Array.isArray(value.data)) return value.data;
    if (Array.isArray(value.categories)) return value.categories;
    if (Array.isArray(value.provinces)) return value.provinces;
    if (Array.isArray(value.cities)) return value.cities;
    if (Array.isArray(value.items)) return value.items;
    if (Array.isArray(value.result)) return value.result;
    if (Array.isArray(value.results)) return value.results;
  }

  return [];
}

function normalizeId(value) {
  if (value === undefined || value === null || value === "") return null;
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? null : numberValue;
}

function flattenCategories(items, result = [], parentName = "") {
  if (!Array.isArray(items)) return result;

  items.forEach((item) => {
    if (!item || item.id == null) return;

    const name = item.name || item.title || "بدون نام";
    const fullName = parentName ? `${parentName} / ${name}` : name;

    result.push({
      id: String(item.id),
      name,
      fullName,
      parentId: item.parentId != null ? String(item.parentId) : null,
    });

    if (Array.isArray(item.children) && item.children.length > 0) {
      flattenCategories(item.children, result, fullName);
    }
  });

  return result;
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchWithTimeout(url, options = {}, timeout = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

function withTimeout(promise, timeout = 12000, fallback = null) {
  return Promise.race([
    promise,
    new Promise((resolve) => {
      setTimeout(() => resolve(fallback), timeout);
    }),
  ]);
}

function debugLog(label, ...args) {
  console.log(`[NotificationSettings][${label}]`, ...args);
}

async function fetchListFromUrl(url, label, errorMessage) {
  debugLog(label, "fetch start:", url);

  const res = await fetchWithTimeout(url, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  const data = await safeJson(res);

  debugLog(label, "response status:", res.status);
  debugLog(label, "raw response:", data);

  if (!res.ok) {
    throw new Error(data?.message || errorMessage || "خطا در دریافت داده‌ها.");
  }

  const list = safeArray(data);
  debugLog(label, "parsed count:", list.length);

  return list;
}

async function getAllCategories() {
  return fetchListFromUrl(
    API_ENDPOINTS.categories,
    "categories",
    "خطا در دریافت دسته‌بندی‌ها."
  );
}

async function getAllProvinces() {
  try {
    const primary = await fetchListFromUrl(
      API_ENDPOINTS.provinces,
      "provinces",
      "خطا در دریافت استان‌ها."
    );

    if (primary.length > 0) return primary;

    debugLog("provinces", "primary endpoint returned empty array");
    return primary;
  } catch (err) {
    debugLog("provinces", "primary endpoint failed, trying fallback:", err);

    try {
      return await fetchListFromUrl(
        API_ENDPOINTS.provincesFallback,
        "provinces-fallback",
        "خطا در دریافت استان‌ها از مسیر قدیمی."
      );
    } catch (fallbackErr) {
      debugLog("provinces", "fallback endpoint failed:", fallbackErr);
      throw err;
    }
  }
}

async function getCitiesOfProvince(provinceId) {
  if (!provinceId) return [];

  try {
    const primary = await fetchListFromUrl(
      API_ENDPOINTS.cities(provinceId),
      `cities:${provinceId}`,
      "خطا در دریافت شهرها."
    );

    if (primary.length > 0) return primary;

    debugLog(`cities:${provinceId}`, "primary endpoint returned empty array");
    return primary;
  } catch (err) {
    debugLog(
      `cities:${provinceId}`,
      "primary endpoint failed, trying fallback:",
      err
    );

    try {
      return await fetchListFromUrl(
        API_ENDPOINTS.citiesFallback(provinceId),
        `cities-fallback:${provinceId}`,
        "خطا در دریافت شهرها از مسیر قدیمی."
      );
    } catch (fallbackErr) {
      debugLog(`cities:${provinceId}`, "fallback endpoint failed:", fallbackErr);
      throw err;
    }
  }
}

async function getNotificationSettings() {
  const res = await fetchWithTimeout(API_ENDPOINTS.notificationCategories, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  const data = await safeJson(res);

  debugLog("notification-settings", "response status:", res.status);
  debugLog("notification-settings", "raw response:", data);

  if (!res.ok) {
    throw new Error(data?.message || "خطا در دریافت تنظیمات نوتیفیکیشن.");
  }

  const list = safeArray(data);
  debugLog("notification-settings", "parsed count:", list.length);

  return list;
}

async function saveNotificationSettings(items) {
  const payload = {
    items: items.map((item) => ({
      categoryId: Number(item.categoryId),
      provinceId: normalizeId(item.provinceId),
      cityId: normalizeId(item.cityId),
    })),
  };

  debugLog("save-settings", "payload:", payload);

  const res = await fetchWithTimeout(API_ENDPOINTS.notificationCategories, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await safeJson(res);

  debugLog("save-settings", "response status:", res.status);
  debugLog("save-settings", "raw response:", data);

  if (!res.ok) {
    throw new Error(data?.message || "خطا در ذخیره تنظیمات نوتیفیکیشن.");
  }

  return data;
}

async function registerPushServiceWorker() {
  if (typeof window === "undefined") {
    throw new Error("محیط مرورگر در دسترس نیست.");
  }

  if (!("serviceWorker" in navigator)) {
    throw new Error("مرورگر شما از Service Worker پشتیبانی نمی‌کند.");
  }

  debugLog("push", "registering service worker...");

  const registration = await navigator.serviceWorker.register("/service-worker.js");

  debugLog("push", "service worker registered:", registration.scope);

  return registration;
}

async function getExistingSubscription() {
  try {
    if (typeof window === "undefined") return null;
    if (!("serviceWorker" in navigator)) return null;
    if (!("PushManager" in window)) return null;

    const registrations = await navigator.serviceWorker.getRegistrations();

    debugLog("push", "registrations count:", registrations?.length || 0);

    if (!registrations || registrations.length === 0) return null;

    for (const registration of registrations) {
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        debugLog("push", "existing subscription found:", subscription.endpoint);
        return subscription;
      }
    }

    debugLog("push", "no existing subscription found");

    return null;
  } catch (err) {
    debugLog("push", "getExistingSubscription error:", err);
    return null;
  }
}

async function subscribeToPush() {
  if (typeof window === "undefined") {
    throw new Error("محیط مرورگر در دسترس نیست.");
  }

  if (!("Notification" in window)) {
    throw new Error("مرورگر شما از Notification پشتیبانی نمی‌کند.");
  }

  if (!("PushManager" in window)) {
    throw new Error("مرورگر شما از Push Notification پشتیبانی نمی‌کند.");
  }

  if (!VAPID_PUBLIC_KEY) {
    throw new Error("کلید عمومی VAPID در فرانت تنظیم نشده است.");
  }

  debugLog("push", "requesting permission...");

  const permission = await Notification.requestPermission();

  debugLog("push", "permission result:", permission);

  if (permission !== "granted") {
    throw new Error("اجازه ارسال نوتیفیکیشن توسط کاربر داده نشد.");
  }

  const registration = await registerPushServiceWorker();

  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    debugLog("push", "creating new subscription...");

    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  } else {
    debugLog("push", "reusing existing subscription...");
  }

  debugLog("push", "subscription endpoint:", subscription.endpoint);

  const res = await fetchWithTimeout(API_ENDPOINTS.subscribe, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription: subscription.toJSON() }),
  });

  const data = await safeJson(res);

  debugLog("push", "subscribe response status:", res.status);
  debugLog("push", "subscribe raw response:", data);

  if (!res.ok) {
    throw new Error(data?.message || "خطا در ثبت اشتراک نوتیفیکیشن.");
  }

  return subscription;
}

async function unsubscribeFromPush() {
  const subscription = await getExistingSubscription();

  if (!subscription) {
    debugLog("push", "no subscription to unsubscribe");
    return;
  }

  const endpoint = subscription.endpoint;

  debugLog("push", "unsubscribing endpoint:", endpoint);

  try {
    await fetchWithTimeout(API_ENDPOINTS.unsubscribe, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint }),
    });
  } finally {
    await subscription.unsubscribe();
    debugLog("push", "local subscription unsubscribed");
  }
}

function getPermissionLabel(status) {
  if (status === "granted") return "فعال";
  if (status === "denied") return "مسدود شده";
  return "هنوز تعیین نشده";
}

export default function NotificationSettingsPage() {
  const [categories, setCategories] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);

  const [selectedItems, setSelectedItems] = useState([]);

  const [selectedParentId, setSelectedParentId] = useState("");
  const [selectedChildId, setSelectedChildId] = useState("");
  const [selectedProvinceId, setSelectedProvinceId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");

  const [permissionStatus, setPermissionStatus] = useState("default");
  const [pushEnabled, setPushEnabled] = useState(false);

  const [initLoading, setInitLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const flatCategories = useMemo(() => {
    return flattenCategories(categories);
  }, [categories]);

  const parentCategories = useMemo(() => {
    return safeArray(categories).filter((item) => item?.id != null);
  }, [categories]);

  const childCategories = useMemo(() => {
    if (!selectedParentId) return [];

    const parent = parentCategories.find(
      (item) => String(item.id) === String(selectedParentId)
    );

    return Array.isArray(parent?.children) ? parent.children : [];
  }, [parentCategories, selectedParentId]);

  useEffect(() => {
    let isMounted = true;

    async function loadPage() {
      debugLog("init", "page loading started");

      setInitLoading(true);
      setError("");
      setSuccessMessage("");

      try {
        if (typeof window !== "undefined" && "Notification" in window) {
          setPermissionStatus(Notification.permission);
          debugLog("init", "notification permission:", Notification.permission);
        }

        const results = await withTimeout(
          Promise.allSettled([
            getAllCategories(),
            getAllProvinces(),
            getNotificationSettings(),
            getExistingSubscription(),
          ]),
          12000,
          null
        );

        if (!results) {
          throw new Error("زمان دریافت اطلاعات اولیه تمام شد.");
        }

        const [
          categoriesResult,
          provincesResult,
          settingsResult,
          subscriptionResult,
        ] = results;

        debugLog("init", "Promise.allSettled result:", {
          categoriesResult,
          provincesResult,
          settingsResult,
          subscriptionResult,
        });

        if (!isMounted) return;

        const categoriesData =
          categoriesResult?.status === "fulfilled" ? categoriesResult.value : [];

        const provincesData =
          provincesResult?.status === "fulfilled" ? provincesResult.value : [];

        const settingsData =
          settingsResult?.status === "fulfilled" ? settingsResult.value : [];

        const subscriptionData =
          subscriptionResult?.status === "fulfilled"
            ? subscriptionResult.value
            : null;

        debugLog("init", "categories count:", categoriesData.length);
        debugLog("init", "provinces count:", provincesData.length);
        debugLog("init", "settings count:", settingsData.length);
        debugLog("init", "has subscription:", Boolean(subscriptionData));

        setCategories(safeArray(categoriesData));
        setProvinces(safeArray(provincesData));
        setSelectedItems(safeArray(settingsData));
        setPushEnabled(Boolean(subscriptionData));
      } catch (err) {
        debugLog("init", "fatal error:", err);

        if (!isMounted) return;

        setError(err?.message || "خطا در دریافت اطلاعات اولیه.");
      } finally {
        if (isMounted) {
          setInitLoading(false);
          debugLog("init", "page loading finished");
        }
      }
    }

    loadPage();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedProvinceId) return;

    let isMounted = true;

    async function loadCities() {
      setLoadingCities(true);
      setError("");

      debugLog("cities", "loading for province:", selectedProvinceId);

      try {
        const data = await getCitiesOfProvince(selectedProvinceId);

        if (!isMounted) return;

        debugLog("cities", "loaded count:", data.length);
        debugLog("cities", "loaded data:", data);

        setCities(safeArray(data));
      } catch (err) {
        debugLog("cities", "error:", err);

        if (!isMounted) return;

        setCities([]);
        setError(err?.message || "خطا در دریافت شهرها.");
      } finally {
        if (isMounted) {
          setLoadingCities(false);
        }
      }
    }

    loadCities();

    return () => {
      isMounted = false;
    };
  }, [selectedProvinceId]);

  const handleAddItem = () => {
    setError("");
    setSuccessMessage("");

    if (!selectedParentId) {
      setError("ابتدا دسته اصلی را انتخاب کنید.");
      return;
    }

    const targetCategoryId = selectedChildId || selectedParentId;
    const targetProvinceId = normalizeId(selectedProvinceId);
    const targetCityId = normalizeId(selectedCityId);

    if (Number.isNaN(Number(targetCategoryId))) {
      setError("شناسه دسته معتبر نیست.");
      return;
    }

    const isDuplicate = selectedItems.some((item) => {
      return (
        Number(item.categoryId) === Number(targetCategoryId) &&
        normalizeId(item.provinceId) === targetProvinceId &&
        normalizeId(item.cityId) === targetCityId
      );
    });

    if (isDuplicate) {
      setError("این ترکیب دسته‌بندی و موقعیت جغرافیایی قبلاً در لیست شما وجود دارد.");
      return;
    }

    const categoryObj = flatCategories.find(
      (category) => String(category.id) === String(targetCategoryId)
    );

    const provinceObj =
      targetProvinceId !== null
        ? provinces.find((province) => String(province.id) === String(targetProvinceId))
        : null;

    const cityObj =
      targetCityId !== null
        ? cities.find((city) => String(city.id) === String(targetCityId))
        : null;

    const newItem = {
      categoryId: Number(targetCategoryId),
      provinceId: targetProvinceId,
      cityId: targetCityId,
      _tempCategoryName: categoryObj?.fullName || "دسته نامشخص",
      _tempProvinceName: provinceObj?.name || null,
      _tempCityName: cityObj?.name || null,
    };

    debugLog("ui", "adding item:", newItem);

    setSelectedItems((prev) => [...prev, newItem]);

    setSelectedParentId("");
    setSelectedChildId("");
    setSelectedProvinceId("");
    setSelectedCityId("");
    setCities([]);
  };

  const handleRemoveItem = (indexToRemove) => {
    setError("");
    setSuccessMessage("");
    setSelectedItems((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const getItemLabel = (item) => {
    const category =
      item._tempCategoryName ||
      flatCategories.find((categoryItem) => {
        return String(categoryItem.id) === String(item.categoryId);
      })?.fullName ||
      item.category?.name ||
      item.category?.title ||
      `شناسه دسته: ${item.categoryId}`;

    const provinceId = normalizeId(item.provinceId);
    const cityId = normalizeId(item.cityId);

    if (provinceId === null) {
      return `${category} ← [سراسر کشور]`;
    }

    const provinceName =
      item._tempProvinceName ||
      item.province?.name ||
      provinces.find((province) => String(province.id) === String(provinceId))?.name ||
      `استان ${provinceId}`;

    if (cityId === null) {
      return `${category} ← [کل استان ${provinceName}]`;
    }

    const cityName =
      item._tempCityName ||
      item.city?.name ||
      cities.find((city) => String(city.id) === String(cityId))?.name ||
      `شهر ${cityId}`;

    return `${category} ← [${provinceName} / ${cityName}]`;
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      if (selectedItems.length === 0) {
        throw new Error("ابتدا حداقل یک فیلتر را به لیست اضافه کنید.");
      }

      await saveNotificationSettings(selectedItems);

      setSuccessMessage("تنظیمات اعلان‌ها با موفقیت ذخیره شد.");
    } catch (err) {
      setError(err?.message || "خطا در ذخیره تنظیمات.");
    } finally {
      setSaving(false);
    }
  };

  const handleEnablePush = async () => {
    try {
      setPushLoading(true);
      setError("");
      setSuccessMessage("");

      if (selectedItems.length === 0) {
        throw new Error("ابتدا حداقل یک ترکیب دسته‌بندی و لوکیشن را انتخاب و اضافه کنید.");
      }

      await saveNotificationSettings(selectedItems);
      await subscribeToPush();

      setPushEnabled(true);

      if (typeof window !== "undefined" && "Notification" in window) {
        setPermissionStatus(Notification.permission);
      }

      setSuccessMessage("نوتیفیکیشن مرورگر با موفقیت فعال شد.");
    } catch (err) {
      debugLog("push", "enable error:", err);
      setError(err?.message || "خطا در فعال‌سازی نوتیفیکیشن.");
    } finally {
      setPushLoading(false);
    }
  };

  const handleDisablePush = async () => {
    try {
      setPushLoading(true);
      setError("");
      setSuccessMessage("");

      await unsubscribeFromPush();

      setPushEnabled(false);

      if (typeof window !== "undefined" && "Notification" in window) {
        setPermissionStatus(Notification.permission);
      }

      setSuccessMessage("نوتیفیکیشن مرورگر غیرفعال شد.");
    } catch (err) {
      debugLog("push", "disable error:", err);
      setError(err?.message || "خطا در غیرفعال‌سازی نوتیفیکیشن.");
    } finally {
      setPushLoading(false);
    }
  };

  if (initLoading) {
    return (
      <main className="max-w-3xl mx-auto p-4" dir="rtl">
        <Card>
          <div className="text-center p-10 text-gray-500">
            در حال بارگذاری تنظیمات نوتیفیکیشن...
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-4" dir="rtl">
      <Card>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-3">
            تنظیمات نوتیفیکیشن
          </h1>

          <p className="text-sm text-gray-500 text-center leading-7">
            دسته‌بندی‌ها و مناطق جغرافیایی مورد نظر خود را مشخص کنید تا به محض
            انتشار درخواست‌های منطبق، مطلع شوید.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-500 mb-1">
              وضعیت دسترسی مرورگر
            </div>
            <div className="font-semibold text-gray-800">
              {getPermissionLabel(permissionStatus)}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-500 mb-1">وضعیت اشتراک Push</div>
            <div className="font-semibold text-gray-800">
              {pushEnabled ? "فعال" : "غیرفعال"}
            </div>
          </div>
        </div>

        {permissionStatus === "denied" && (
          <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
            دسترسی نوتیفیکیشن در مرورگر شما مسدود شده است. برای فعال‌سازی مجدد،
            باید مجوزها را در بخش تنظیمات آدرس‌بار مرورگر خود آزاد کنید.
          </div>
        )}

        {error && <Alert message={error} />}

        {successMessage && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
            {successMessage}
          </div>
        )}

        <div className="space-y-4 mb-8">
          <h2 className="text-base font-bold text-gray-800">
            پیکربندی فیلتر جدید
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                دسته اصلی
              </label>

              <select
                value={selectedParentId}
                onChange={(e) => {
                  setSelectedParentId(e.target.value);
                  setSelectedChildId("");
                  setError("");
                  setSuccessMessage("");
                }}
                className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="">انتخاب دسته اصلی</option>

                {parentCategories.map((category) => (
                  <option key={category.id} value={String(category.id)}>
                    {category.name || category.title || "بدون نام"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                زیردسته اختیاری
              </label>

              <select
                value={selectedChildId}
                onChange={(e) => {
                  setSelectedChildId(e.target.value);
                  setError("");
                  setSuccessMessage("");
                }}
                disabled={!selectedParentId || childCategories.length === 0}
                className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">
                  {!selectedParentId
                    ? "ابتدا دسته اصلی را انتخاب کنید"
                    : childCategories.length === 0
                      ? "این دسته زیردسته ندارد"
                      : "همه زیردسته‌ها"}
                </option>

                {childCategories.map((category) => (
                  <option key={category.id} value={String(category.id)}>
                    {category.name || category.title || "بدون نام"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                استان اختیاری
              </label>

              <select
                value={selectedProvinceId}
                onChange={(e) => {
                  const value = e.target.value;

                  debugLog("ui", "province changed:", value);

                  setSelectedProvinceId(value);
                  setSelectedCityId("");
                  setCities([]);
                  setError("");
                  setSuccessMessage("");
                }}
                className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="">سراسر کشور</option>

                {provinces.map((province) => (
                  <option key={province.id} value={String(province.id)}>
                    {province.name || province.title || `استان ${province.id}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                شهر اختیاری
              </label>

              <select
                value={selectedCityId}
                onChange={(e) => {
                  setSelectedCityId(e.target.value);
                  setError("");
                  setSuccessMessage("");
                }}
                disabled={!selectedProvinceId || loadingCities || cities.length === 0}
                className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">
                  {!selectedProvinceId
                    ? "ابتدا استان را انتخاب کنید"
                    : loadingCities
                      ? "در حال بارگذاری شهرها..."
                      : cities.length === 0
                        ? "شهری یافت نشد"
                        : "همه شهرهای استان"}
                </option>

                {cities.map((city) => (
                  <option key={city.id} value={String(city.id)}>
                    {city.name || city.title || `شهر ${city.id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              onClick={handleAddItem}
              className="w-full md:w-auto px-8 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
            >
              افزودن این فیلتر به لیست
            </Button>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 mt-4">
            <div className="mb-3 text-sm font-medium text-gray-700">
              لیست اشتراک‌های شما
            </div>

            {selectedItems.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-4">
                هنوز هیچ فیلتر اعلانی ایجاد نکرده‌اید.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {selectedItems.map((item, index) => (
                  <div
                    key={`${item.categoryId}-${item.provinceId ?? "all"}-${
                      item.cityId ?? "all"
                    }-${index}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-blue-100 bg-blue-50/50 px-4 py-2.5 text-sm text-blue-800"
                  >
                    <span className="font-medium text-right leading-6">
                      {getItemLabel(item)}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-base font-bold text-blue-700 transition-colors hover:bg-red-100 hover:text-red-600"
                      title="حذف فیلتر"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {flatCategories.length === 0 && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
              داده‌ای از دسته‌بندی‌ها دریافت نشد. لطفاً ارتباط با سرور را بررسی کنید.
            </div>
          )}

          {provinces.length === 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              هیچ استانی دریافت نشد. لطفاً لاگ کنسول مرورگر و پاسخ API را بررسی کنید.
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-3 pt-4 border-t border-gray-100">
          <Button
            type="button"
            onClick={handleSaveSettings}
            loading={saving}
            className="flex-1 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            ذخیره تنظیمات
          </Button>

          {!pushEnabled ? (
            <Button
              type="button"
              onClick={handleEnablePush}
              loading={pushLoading}
              className="flex-1 py-2.5 text-white bg-green-600 hover:bg-green-700 rounded-lg"
            >
              فعال‌سازی نوتیفیکیشن
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleDisablePush}
              loading={pushLoading}
              variant="outline"
              className="flex-1 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              غیرفعال‌سازی نوتیفیکیشن
            </Button>
          )}
        </div>
      </Card>
    </main>
  );
}
