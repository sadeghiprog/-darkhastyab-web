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
  notificationCategories: `${API_BASE_URL}/notification/categories`,
  subscribe: `${API_BASE_URL}/notification/subscribe`,
  unsubscribe: `${API_BASE_URL}/notification/unsubscribe`,
};

function safeArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.categories)) return value.categories;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.result)) return value.result;
  return [];
}

function normalizeSelectedCategoryIds(payload) {
  return safeArray(payload)
    .map((item) => {
      if (typeof item === "number" || typeof item === "string") {
        return String(item);
      }

      if (item?.categoryId != null) {
        return String(item.categoryId);
      }

      if (item?.id != null) {
        return String(item.id);
      }

      return null;
    })
    .filter(Boolean);
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

function withTimeout(promise, timeout = 8000, fallback = null) {
  return Promise.race([
    promise,
    new Promise((resolve) => {
      setTimeout(() => resolve(fallback), timeout);
    }),
  ]);
}

async function getAllCategories() {
  const res = await fetchWithTimeout(API_ENDPOINTS.categories, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await safeJson(res);

  if (!res.ok) {
    throw new Error(data?.message || "خطا در دریافت دسته‌بندی‌ها.");
  }

  return safeArray(data);
}

async function getNotificationCategories() {
  const res = await fetchWithTimeout(API_ENDPOINTS.notificationCategories, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await safeJson(res);

  if (!res.ok) {
    throw new Error(data?.message || "خطا در دریافت تنظیمات نوتیفیکیشن.");
  }

  return normalizeSelectedCategoryIds(data);
}

async function saveNotificationCategories(categoryIds) {
  const res = await fetchWithTimeout(API_ENDPOINTS.notificationCategories, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      categoryIds: categoryIds.map((id) => Number(id)),
    }),
  });

  const data = await safeJson(res);

  if (!res.ok) {
    throw new Error(data?.message || "خطا در ذخیره دسته‌بندی‌های نوتیفیکیشن.");
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

  return navigator.serviceWorker.register("/service-worker.js");
}

async function getExistingSubscription() {
  try {
    if (typeof window === "undefined") return null;
    if (!("serviceWorker" in navigator)) return null;
    if (!("PushManager" in window)) return null;

    const registrations = await navigator.serviceWorker.getRegistrations();

    if (!registrations || registrations.length === 0) {
      return null;
    }

    for (const registration of registrations) {
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        return subscription;
      }
    }

    return null;
  } catch {
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

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("اجازه ارسال نوتیفیکیشن توسط کاربر داده نشد.");
  }

  const registration = await registerPushServiceWorker();
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  const res = await fetchWithTimeout(API_ENDPOINTS.subscribe, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      subscription: subscription.toJSON(),
    }),
  });

  const data = await safeJson(res);

  if (!res.ok) {
    throw new Error(data?.message || "خطا در ثبت اشتراک نوتیفیکیشن.");
  }

  return subscription;
}

async function unsubscribeFromPush() {
  const subscription = await getExistingSubscription();

  if (!subscription) return;

  const endpoint = subscription.endpoint;

  try {
    await fetchWithTimeout(API_ENDPOINTS.unsubscribe, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ endpoint }),
    });
  } finally {
    await subscription.unsubscribe();
  }
}

function getPermissionLabel(status) {
  if (status === "granted") return "فعال";
  if (status === "denied") return "مسدود شده";
  return "هنوز تعیین نشده";
}

function getCategoryLabel(category) {
  if (!category) return "بدون نام";
  return category.fullName || category.name || "بدون نام";
}

export default function NotificationSettingsPage() {
  const [categories, setCategories] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  const [selectedParentId, setSelectedParentId] = useState("");
  const [selectedChildId, setSelectedChildId] = useState("");

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

  const selectedCategories = useMemo(() => {
    return selectedIds
      .map((id) => flatCategories.find((category) => category.id === String(id)))
      .filter(Boolean);
  }, [selectedIds, flatCategories]);

  const hasSelectedCategories = selectedIds.length > 0;

  useEffect(() => {
    let isMounted = true;

    async function loadPage() {
      setInitLoading(true);
      setError("");
      setSuccessMessage("");

      try {
        if (typeof window !== "undefined" && "Notification" in window) {
          setPermissionStatus(Notification.permission);
        }

        const categoriesPromise = getAllCategories().catch((err) => {
          console.error("Categories error:", err);
          return [];
        });

        const selectedPromise = getNotificationCategories().catch((err) => {
          console.error("Notification categories error:", err);
          return [];
        });

        const subscriptionPromise = getExistingSubscription().catch((err) => {
          console.error("Subscription error:", err);
          return null;
        });

        const [allCategories, userSelectedIds, existingSubscription] =
          await withTimeout(
            Promise.all([
              categoriesPromise,
              selectedPromise,
              subscriptionPromise,
            ]),
            10000,
            [[], [], null]
          );

        if (!isMounted) return;

        setCategories(safeArray(allCategories));
        setSelectedIds(
          Array.isArray(userSelectedIds)
            ? userSelectedIds.map((id) => String(id))
            : []
        );
        setPushEnabled(Boolean(existingSubscription));
      } catch (err) {
        if (!isMounted) return;

        setCategories([]);
        setSelectedIds([]);
        setPushEnabled(false);
        setError(err?.message || "خطا در دریافت اطلاعات صفحه.");
      } finally {
        if (isMounted) {
          setInitLoading(false);
        }
      }
    }

    loadPage();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddCategory = () => {
    setError("");
    setSuccessMessage("");

    if (!selectedParentId) {
      setError("ابتدا دسته اصلی را انتخاب کنید.");
      return;
    }

    if (childCategories.length > 0 && !selectedChildId) {
      setError("لطفاً یک زیردسته انتخاب کنید.");
      return;
    }

    const targetId = selectedChildId || selectedParentId;

    if (selectedIds.includes(String(targetId))) {
      setError("این دسته‌بندی قبلاً انتخاب شده است.");
      return;
    }

    setSelectedIds((prev) => [...prev, String(targetId)]);
    setSelectedParentId("");
    setSelectedChildId("");
  };

  const handleRemoveCategory = (categoryId) => {
    setError("");
    setSuccessMessage("");

    setSelectedIds((prev) =>
      prev.filter((id) => String(id) !== String(categoryId))
    );
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      await saveNotificationCategories(selectedIds);

      setSuccessMessage("تنظیمات نوتیفیکیشن با موفقیت ذخیره شد.");
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

      if (!hasSelectedCategories) {
        throw new Error("ابتدا حداقل یک دسته‌بندی را انتخاب کنید.");
      }

      await saveNotificationCategories(selectedIds);
      await subscribeToPush();

      setPushEnabled(true);

      if (typeof window !== "undefined" && "Notification" in window) {
        setPermissionStatus(Notification.permission);
      }

      setSuccessMessage("نوتیفیکیشن مرورگر با موفقیت فعال شد.");
    } catch (err) {
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
            دسته‌بندی‌های موردنظر خود را انتخاب کنید تا هنگام انتشار درخواست خرید
            جدید، نوتیفیکیشن مرورگر دریافت کنید.
          </p>
        </div>

        <div className="mb-3 text-xs text-gray-400 text-center">
          API: {API_BASE_URL}
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
            دسترسی نوتیفیکیشن در مرورگر شما مسدود شده است. برای فعال‌سازی، باید
            از تنظیمات مرورگر مجوز اعلان را دوباره فعال کنید.
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
            انتخاب دسته‌بندی‌ها
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
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
              <label className="mb-2 block text-sm font-medium text-gray-700">
                زیردسته
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
                    : "انتخاب زیردسته"}
                </option>
                {childCategories.map((category) => (
                  <option key={category.id} value={String(category.id)}>
                    {category.name || category.title || "بدون نام"}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                onClick={handleAddCategory}
                className="w-full py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                افزودن به لیست
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-3 text-sm font-medium text-gray-700">
              دسته‌بندی‌های انتخاب‌شده
            </div>

            {selectedCategories.length === 0 ? (
              <div className="text-sm text-gray-500">
                هنوز هیچ دسته‌بندی‌ای انتخاب نشده است.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-sm text-blue-700"
                  >
                    <span>{getCategoryLabel(category)}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(category.id)}
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs text-blue-700 hover:bg-red-100 hover:text-red-600"
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
              دسته‌بندی‌ای از سرور دریافت نشد. آدرس API یا خروجی endpoint
              دسته‌بندی‌ها را بررسی کنید.
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
