"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Wallet,
  Boxes,
  CalendarDays,
  MapPin,
  Layers,
  PhoneCall,
  Star,
  User2,
} from "lucide-react";
import RequestCard2 from "../../../components/common/RequestCard2";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

/* ============================
   Supply Messages
============================ */
const supplyMessages = {
  notSupplier: {
    title: "دسترسی تامین کننده ندارید",
    text: "برای تامین کردن ابتدا باید پروفایل خود را تکمیل کرده و درخواست تامین کننده شدن ثبت نمایید. پس از تایید مدیر سایت می‌توانید درخواست‌ها را تامین کنید.",
    action: "تکمیل پروفایل",
    actionLink: "/profile",
  },
  noCredit: {
    title: "اعتبار کافی ندارید",
    text: "برای ارسال پیشنهاد تامین نیاز به حداقل یک اعتبار دارید.",
    action: "خرید اعتبار",
    actionLink: "/wallet",
  },
  confirmUseCredit: {
    title: "ارسال پیشنهاد",
    text: "با ارسال پیشنهاد یک اعتبار از حساب شما کسر می‌شود. ادامه می‌دهید؟",
  },
  success: {
    title: "پیشنهاد ارسال شد",
    text: "پیشنهاد شما با موفقیت ثبت شد.",
  },
};

/* ============================
   Toast Component
============================ */
function Toast({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <div className="relative w-[320px] rounded-3xl border bg-white p-5 shadow-2xl">
        <div className="mb-2 text-sm font-black text-slate-800">
          {message.title}
        </div>
        <div className="text-xs leading-6 text-slate-500">{message.text}</div>
        {message.action && (
          <a
            href={message.actionLink}
            className="mt-4 inline-block text-xs font-black text-cyan-600"
          >
            {message.action}
          </a>
        )}
        <button
          onClick={onClose}
          className="absolute left-3 top-3 text-xs text-slate-400"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

/* ============================
   Supply Modal
============================ */
function SupplyModal({ open, onClose, onSubmit }) {
  const [quantity, setQuantity] = useState("");
  const [unitId, setUnitId] = useState("");
  const [price, setPrice] = useState("");

  const [units, setUnits] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchUnits = async () => {
      try {
        setLoadingUnits(true);

        const res = await fetch(`${API_BASE}/units`, {
          cache: "no-store",
          credentials: "include",
        });

        if (!res.ok) throw new Error();

        const data = await res.json();
        setUnits(data.units || data || []);
      } catch {
        setUnits([]);
      } finally {
        setLoadingUnits(false);
      }
    };

    fetchUnits();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[420px] rounded-3xl bg-white p-6 shadow-2xl">
        <h3 className="mb-5 text-sm font-black text-slate-800">
          ارسال پیشنهاد تامین
        </h3>

        <input
          placeholder="مقدار"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="mb-3 w-full rounded-2xl border border-slate-200 p-3 text-sm"
        />

        <select
          value={unitId}
          onChange={(e) => setUnitId(e.target.value)}
          className="mb-3 w-full rounded-2xl border border-slate-200 p-3 text-sm"
        >
          <option value="">انتخاب واحد</option>

          {loadingUnits ? (
            <option>در حال بارگذاری...</option>
          ) : (
            units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))
          )}
        </select>

        <input
          placeholder="قیمت پیشنهادی"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="mb-4 w-full rounded-2xl border border-slate-200 p-3 text-sm"
        />

        <div className="flex gap-3">
          <button
            onClick={() =>
              onSubmit({
                quantity,
                unitId,
                price,
              })
            }
            className="flex-1 rounded-2xl bg-cyan-500 py-2 text-xs font-black text-white"
          >
            ارسال پیشنهاد
          </button>

          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border border-slate-200 py-2 text-xs font-black text-slate-600"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}

function formatPrice(price) {
  if (price == null) return "—";
  return Number(price).toLocaleString("fa-IR");
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function getPublishStatusLabel(status) {
  if (status === "PUBLISHED") return "منتشر شده";
  if (status === "UNDER_REVIEW") return "در حال بررسی";
  if (status === "NEEDS_EDIT") return "نیاز به ویرایش";
  return "نامشخص";
}

function getPublishStatusClass(status) {
  if (status === "PUBLISHED")
    return "border-emerald-100 bg-emerald-50 text-emerald-700";
  if (status === "NEEDS_EDIT")
    return "border-orange-100 bg-orange-50 text-orange-700";
  return "border-amber-100 bg-amber-50 text-amber-700";
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-cyan-100 hover:bg-cyan-50/30">
      <div className="mb-2 flex items-center gap-2 text-[11px] font-bold text-slate-400">
        {Icon && <Icon size={15} className="text-cyan-600" />}
        <span>{label}</span>
      </div>
      <div className="truncate text-sm font-black text-slate-800">
        {value || "—"}
      </div>
    </div>
  );
}

function RequestDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;

  const [request, setRequest] = useState(null);
  const [loadingRequest, setLoadingRequest] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [latestRequests, setLatestRequests] = useState([]);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [adminNote, setAdminNote] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deletingRequest, setDeletingRequest] = useState(false);

  const [offers, setOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [contactLoadingId, setContactLoadingId] = useState(null);

  const [toast, setToast] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 5000);
  };

  const isLoggedIn = !!currentUser?.id;
  const isOwner =
    isLoggedIn &&
    request?.userId != null &&
    String(currentUser.id) === String(request.userId);
  const isAdmin = isLoggedIn && currentUser?.status === "ADMIN";

  const handleSupplyClick = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    try {
      setCheckingAccess(true);

      const res = await fetch(`${API_BASE}/supply-offer/check/${slug}`, {
        method: "GET",
        credentials: "include",
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        showToast({
          title: "خطا",
          text: data.message || "خطا در بررسی دسترسی",
        });
        return;
      }

      if (!data.isSupplier) {
        showToast(supplyMessages.notSupplier);
        return;
      }

      if (!data.hasCredit) {
        showToast(supplyMessages.noCredit);
        return;
      }

      if (window.confirm(supplyMessages.confirmUseCredit.text)) {
        setShowOfferModal(true);
      }
    } catch {
      showToast({
        title: "خطا",
        text: "برقراری ارتباط با سرور با خطا مواجه شد.",
      });
    } finally {
      setCheckingAccess(false);
    }
  };

  const submitSupply = async (form) => {
    try {
      const res = await fetch(`${API_BASE}/supply-offer/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.message === "no_credit") showToast(supplyMessages.noCredit);
        else if (data.message === "not_supplier")
          showToast(supplyMessages.notSupplier);
        else showToast({ title: "خطا", text: data.message || "ارسال ناموفق بود" });
        return;
      }

      setShowOfferModal(false);
      showToast(supplyMessages.success);
    } catch {
      showToast({ title: "خطا", text: "ارتباط با سرور برقرار نشد" });
    }
  };

  const handleContactClick = async (offerId) => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    try {
      setContactLoadingId(offerId);

      const res = await fetch(`${API_BASE}/contact/${offerId}/contact`, {
        method: "POST",
        credentials: "include",
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        if (data.message === "no_credit") {
          showToast(supplyMessages.noCredit);
          return;
        }

        showToast({
          title: "خطا",
          text: data.message || "خطا در دریافت اطلاعات تماس",
        });
        return;
      }

      const phone = data?.phone || "—";
      const address = data?.address || "—";

      showToast({
        title: "اطلاعات تماس",
        text: `شماره تماس: ${phone}\nآدرس: ${address}`,
      });
    } catch {
      showToast({
        title: "خطا",
        text: "ارتباط با سرور برقرار نشد",
      });
    } finally {
      setContactLoadingId(null);
    }
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      setLoadingUser(true);
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          cache: "no-store",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data?.user || data || null);
        } else {
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchRequest = async () => {
      setLoadingRequest(true);
      try {
        const res = await fetch(`${API_BASE}/purchase-requests/${slug}`, {
          cache: "no-store",
          credentials: "include",
        });

        if (!res.ok) throw new Error();

        const data = await res.json();
        setRequest(data?.request || null);
        setAdminNote(data?.request?.adminNote || "");
      } catch {
        setRequest(null);
      } finally {
        setLoadingRequest(false);
      }
    };

    if (slug) fetchRequest();
  }, [slug]);

  useEffect(() => {
    const fetchOffers = async () => {
      setLoadingOffers(true);
      try {
        const res = await fetch(`${API_BASE}/offers-list/${slug}/offers`, {
          cache: "no-store",
          credentials: "include",
        });

        if (!res.ok) throw new Error();

        const data = await res.json();
        setOffers(Array.isArray(data?.offers) ? data.offers : []);
      } catch {
        setOffers([]);
      } finally {
        setLoadingOffers(false);
      }
    };

    if (slug) fetchOffers();
  }, [slug]);

  useEffect(() => {
    const fetchLatestRequests = async () => {
      setLoadingLatest(true);
      try {
        const res = await fetch(`${API_BASE}/purchase-requests?limit=3`, {
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json();
          setLatestRequests(Array.isArray(data?.requests) ? data.requests : []);
        } else {
          setLatestRequests([]);
        }
      } catch {
        setLatestRequests([]);
      } finally {
        setLoadingLatest(false);
      }
    };

    fetchLatestRequests();
  }, []);

  const updatePublishStatus = async (publishStatus) => {
    if (!slug) return;
    setUpdatingStatus(true);

    try {
      const res = await fetch(
        `${API_BASE}/purchase-requests/${slug}/publish-status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ publishStatus, adminNote }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data?.message || "خطا در تغییر وضعیت");
        return;
      }

      setRequest(data.request);
      alert("وضعیت با موفقیت تغییر کرد.");
    } catch {
      alert("خطا در ارتباط با سرور");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const deleteRequest = async () => {
    if (!window.confirm("آیا از حذف این درخواست مطمئن هستید؟")) return;
    setDeletingRequest(true);

    try {
      const res = await fetch(`${API_BASE}/purchase-requests/${slug}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        alert("خطا در حذف درخواست");
        return;
      }

      alert("درخواست حذف شد.");
      router.push("/requests");
    } catch {
      alert("خطا در ارتباط با سرور");
    } finally {
      setDeletingRequest(false);
    }
  };

  const goToEdit = () => router.push(`/requests/${slug}/edit`);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-[1380px]">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <main className="xl:col-span-9">
            {loadingRequest ? (
              <div className="h-[420px] animate-pulse rounded-[2rem] bg-white shadow-sm" />
            ) : request ? (
              <section className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-gradient-to-l from-cyan-50/80 via-white to-white p-5 md:p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        {request.category?.name && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-[11px] font-black text-cyan-700">
                            <Layers size={13} /> {request.category.name}
                          </span>
                        )}
                      </div>
                      <h1 className="text-xl font-black leading-9 text-slate-800 md:text-2xl">
                        {request.title}
                      </h1>
                    </div>

                    {isOwner ? (
                      <div className="flex gap-3">
                        <button
                          onClick={goToEdit}
                          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 hover:border-cyan-200 hover:text-cyan-700"
                        >
                          ویرایش
                        </button>
                        <button
                          onClick={deleteRequest}
                          disabled={deletingRequest}
                          className="rounded-2xl bg-rose-500 px-5 py-3 text-sm font-black text-white hover:bg-rose-600 disabled:opacity-70"
                        >
                          حذف
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleSupplyClick}
                        disabled={checkingAccess}
                        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-black text-white disabled:opacity-70"
                      >
                        <PhoneCall size={17} />
                        {checkingAccess ? "در حال بررسی..." : "تامین می‌کنم"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-5 md:p-6">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <DetailItem
                      icon={Wallet}
                      label="بودجه پیشنهادی"
                      value={
                        request.budgetAmount != null
                          ? `${formatPrice(request.budgetAmount)} تومان`
                          : "—"
                      }
                    />
                    <DetailItem
                      icon={Boxes}
                      label="مقدار / واحد"
                      value={
                        request.quantity != null
                          ? `${formatPrice(request.quantity)} ${request.unit?.name || ""}`
                          : request.unit?.name || "—"
                      }
                    />
                    <DetailItem
                      icon={CalendarDays}
                      label="تاریخ انقضا"
                      value={formatDate(request.expiresAt)}
                    />
                    <DetailItem
                      icon={MapPin}
                      label="محل تحویل"
                      value={`${request.province?.name || "—"}${request.city?.name ? `، ${request.city.name}` : ""}`}
                    />
                  </div>

                  <div className="mt-6 rounded-3xl border border-slate-100 bg-slate-50/60 p-5">
                    <h2 className="mb-3 text-sm font-black text-slate-800">
                      توضیحات درخواست
                    </h2>
                    <p className="text-sm leading-8 text-slate-600">
                      {request.description || "توضیحی ثبت نشده است."}
                    </p>
                  </div>

                  {isLoggedIn && (isOwner || isAdmin) && (
                    <div className="mt-6 rounded-3xl border border-slate-100 bg-white p-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h2 className="text-sm font-black text-slate-800">
                            وضعیت انتشار درخواست
                          </h2>
                          <p className="mt-2 text-sm leading-7 text-slate-500">
                            {request.adminNote ||
                              "توضیحی برای وضعیت این درخواست ثبت نشده است."}
                          </p>
                        </div>
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${getPublishStatusClass(request.publishStatus)}`}
                        >
                          {getPublishStatusLabel(request.publishStatus)}
                        </span>
                      </div>
                    </div>
                  )}

                  {isAdmin && (
                    <div className="mt-6 rounded-3xl border border-cyan-100 bg-cyan-50/30 p-5">
                      <textarea
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 p-4 text-sm"
                        placeholder="توضیحات وضعیت..."
                      />
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          onClick={() => updatePublishStatus("PUBLISHED")}
                          disabled={updatingStatus}
                          className="rounded-2xl bg-emerald-500 px-4 py-2 text-xs font-black text-white disabled:opacity-70"
                        >
                          انتشار
                        </button>
                        <button
                          onClick={() => updatePublishStatus("UNDER_REVIEW")}
                          disabled={updatingStatus}
                          className="rounded-2xl bg-amber-500 px-4 py-2 text-xs font-black text-white disabled:opacity-70"
                        >
                          لغو انتشار
                        </button>
                        <button
                          onClick={() => updatePublishStatus("NEEDS_EDIT")}
                          disabled={updatingStatus}
                          className="rounded-2xl bg-orange-500 px-4 py-2 text-xs font-black text-white disabled:opacity-70"
                        >
                          نیاز به ویرایش
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mt-8">
                    <h2 className="mb-4 text-lg font-black text-slate-800">
                      پیشنهادهای تامین‌کنندگان
                    </h2>

                    {loadingOffers ? (
                      <div className="h-40 animate-pulse rounded-3xl bg-slate-100" />
                    ) : offers.length === 0 ? (
                      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
                        هنوز پیشنهادی ثبت نشده است.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {offers.map((offer) => (
                          <div
                            key={offer.id}
                            className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between"
                          >
                            <div className="flex items-center gap-4">
                              <img
                                src={
                                  offer.supplier?.profile?.avatarUrl || "/avatar.png"
                                }
                                alt={offer.supplier?.name || "supplier"}
                                className="h-14 w-14 rounded-full object-cover"
                              />

                              <div className="min-w-0">
                                <div className="flex items-center gap-2 text-sm font-black text-slate-800">
                                  <User2 size={14} className="text-cyan-600" />
                                  <span className="truncate">
                                    {offer.supplier?.name || "تامین‌کننده"}
                                  </span>
                                </div>

                                <div className="mt-1 flex items-center gap-1 text-xs text-amber-500">
                                  <Star size={13} className="fill-amber-400 text-amber-400" />
                                  <span>
                                    {offer.averageRating != null
                                      ? Number(offer.averageRating).toFixed(1)
                                      : "بدون امتیاز"}
                                  </span>
                                </div>

                                <div className="mt-2 text-xs text-slate-500">
                                  مقدار:{" "}
                                  {offer.quantity != null
                                    ? `${formatPrice(offer.quantity)} ${offer.unit?.name || ""}`
                                    : "—"}
                                </div>

                                <div className="text-xs text-slate-500">
                                  قیمت پیشنهادی: {formatPrice(offer.price)} تومان
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleContactClick(offer.id)}
                              disabled={contactLoadingId === offer.id}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-xs font-black text-white hover:bg-cyan-600 disabled:opacity-70"
                            >
                              <PhoneCall size={15} />
                              {contactLoadingId === offer.id
                                ? "در حال بررسی..."
                                : "تماس"}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            ) : (
              <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center">
                <p className="text-sm font-bold text-slate-400">
                  درخواست موردنظر پیدا نشد.
                </p>
              </div>
            )}
          </main>

          <aside className="flex flex-col gap-4 xl:col-span-3">
            <h2 className="text-lg font-black text-slate-800">جدیدترین‌ها</h2>

            {loadingLatest ? (
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-[150px] animate-pulse rounded-3xl bg-white shadow-sm"
                  />
                ))}
              </div>
            ) : latestRequests.length > 0 ? (
              latestRequests.map((req) => (
                <RequestCard2 key={req.id} request={req} />
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
                درخواستی یافت نشد.
              </div>
            )}
          </aside>
        </div>
      </div>

      <SupplyModal
        open={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        onSubmit={submitSupply}
      />

      <Toast message={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default function RequestDetailsPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center">در حال بارگذاری...</div>}>
      <RequestDetailsContent />
    </Suspense>
  );
}
