"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE, supplyMessages } from "../utils/constants";
import { authSession } from "../../../../lib/auth-session";

export default function useRequestDetails(slug, initialRequest = null) {
  const router = useRouter();

  const [request, setRequest] = useState(() => initialRequest ?? null);
  const [loadingRequest, setLoadingRequest] = useState(
    () => !initialRequest
  );

  const [contactModal, setContactModal] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [latestRequests, setLatestRequests] = useState([]);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [adminNote, setAdminNote] = useState(
    () => initialRequest?.adminNote || ""
  );
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deletingRequest, setDeletingRequest] = useState(false);

  const [offers, setOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [contactLoadingId, setContactLoadingId] = useState(null);

  const [toast, setToast] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(false);

  // وضعیت دسترسی کاربر به اطلاعات تماس این درخواست
  const [requestAccess, setRequestAccess] = useState({
    hasAccess: false,
    hasCredit: false,
    isSupplier: false,
  });

  // لودینگ دریافت وضعیت دسترسی از سرور
  const [loadingRequestAccess, setLoadingRequestAccess] = useState(false);

  const [actionModal, setActionModal] = useState({
    open: false,
    hasAccess: false,
    hasCredit: false,
    isSupplier: false,
  });

  const [requestContactLoading, setRequestContactLoading] = useState(false);

  const closeActionModal = () => {
    setActionModal({
      open: false,
      hasAccess: false,
      hasCredit: false,
      isSupplier: false,
    });
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 50000);
  };

  const isLoggedIn = !!currentUser?.id;

  const isOwner =
    isLoggedIn &&
    request?.userId != null &&
    String(currentUser.id) === String(request.userId);

  const isAdmin = isLoggedIn && currentUser?.status === "ADMIN";

  /**
   * دریافت وضعیت دسترسی کاربر به درخواست از سرور.
   * این تابع هم در ورود اولیه به صفحه و هم موقع کلیک روی Supply استفاده می‌شود.
   */
  const checkRequestAccess = useCallback(async () => {
    const emptyAccess = {
      hasAccess: false,
      hasCredit: false,
      isSupplier: false,
    };

    // برای کاربر لاگین‌نشده، استعلام Access لازم نیست.
    if (!isLoggedIn || !slug) {
      setRequestAccess(emptyAccess);
      return emptyAccess;
    }

    try {
      setLoadingRequestAccess(true);

      const res = await fetch(`${API_BASE}/supply-offer/check/${slug}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      let data = {};

      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        setRequestAccess(emptyAccess);

        return emptyAccess;
      }

      const accessData = {
        hasAccess: Boolean(data?.hasAccess),
        hasCredit: Boolean(data?.hasCredit),
        isSupplier: Boolean(data?.isSupplier),
      };

      setRequestAccess(accessData);

      return accessData;
    } catch {
      setRequestAccess(emptyAccess);

      return emptyAccess;
    } finally {
      setLoadingRequestAccess(false);
    }
  }, [isLoggedIn, slug]);

  const handleSupplyClick = async () => {
    if (!isLoggedIn) {
      authSession.setRedirectAfterLogin(
        window.location.pathname + window.location.search
      );

      router.push("/auth/login");
      return;
    }

    try {
      setCheckingAccess(true);

      // استفاده از تابع مشترک تا داده از سرور گرفته شود
      const accessData = await checkRequestAccess();

      setActionModal({
        open: true,
        hasAccess: accessData.hasAccess,
        hasCredit: accessData.hasCredit,
        isSupplier: accessData.isSupplier,
      });
    } catch {
      showToast({
        title: "خطا",
        text: "برقراری ارتباط با سرور با خطا مواجه شد.",
      });
    } finally {
      setCheckingAccess(false);
    }
  };

  const handleOpenSupplyModal = () => {
    if (!actionModal.isSupplier) {
      showToast(supplyMessages.notSupplier);
      return;
    }

    if (!actionModal.hasAccess && !actionModal.hasCredit) {
      showToast(supplyMessages.noCredit);
      return;
    }

    closeActionModal();
    setShowOfferModal(true);
  };

  const handleRequestContactClick = async () => {
    if (!isLoggedIn) {
      authSession.setRedirectAfterLogin(
        window.location.pathname + window.location.search
      );

      router.push("/auth/login");
      return;
    }

    try {
      setRequestContactLoading(true);

      const res = await fetch(`${API_BASE}/supply-offer/access/${slug}`, {
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
        if (data.message === "NO_CREDIT" || data.message === "NO_WALLET") {
          showToast(supplyMessages.noCreditForCall || supplyMessages.noCredit);
          return;
        }

        showToast({
          title: "خطا",
          text: data.message || "خطا در دریافت اطلاعات تماس",
        });

        return;
      }

      // چون تماس با موفقیت انجام شده، کاربر قطعاً اکنون Access دارد.
      setRequestAccess((previousAccess) => ({
        ...previousAccess,
        hasAccess: true,
      }));

      closeActionModal();

      const name = data?.contactName || request?.userName || "—";
      const phone = data?.contactPhone || "—";

      setContactModal({
        name,
        phone,
      });

      // showToast({
      //   title: "اطلاعات تماس",
      //   text: `نام خریدار: ${name}\nشماره تماس: ${phone}`,
      // });
    } catch {
      showToast({
        title: "خطا",
        text: "ارتباط با سرور برقرار نشد",
      });
    } finally {
      setRequestContactLoading(false);
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
        if (data.message === "no_credit") {
          showToast(supplyMessages.noCredit);
        } else if (data.message === "not_supplier") {
          showToast(supplyMessages.notSupplier);
        } else {
          showToast({
            title: "خطا",
            text: data.message || "ارسال ناموفق بود",
          });
        }

        return;
      }

      setShowOfferModal(false);
      showToast(supplyMessages.success);
    } catch {
      showToast({
        title: "خطا",
        text: "ارتباط با سرور برقرار نشد",
      });
    }
  };

  const handleContactClick = async (offerId) => {
    if (!isLoggedIn) {
      authSession.setRedirectAfterLogin(
        window.location.pathname + window.location.search
      );

      router.push("/auth/login");
      return;
    }

    try {
      setContactLoadingId(offerId);

      const accessRes = await fetch(
        `${API_BASE}/contact/${offerId}/check-access`,
        {
          credentials: "include",
        }
      );

      const accessData = await accessRes.json();

      if (!accessRes.ok) {
        showToast({
          title: "خطا",
          text: "خطا در بررسی دسترسی",
        });

        return;
      }

      if (!accessData.hasAccess) {
        const confirmPay = window.confirm(
          "برای مشاهده اطلاعات تماس، ۱ اعتبار از کیف پول شما کسر می‌شود. ادامه می‌دهید؟"
        );

        if (!confirmPay) return;
      }

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
        if (data.message === "NO_CREDIT" || data.message === "NO_WALLET") {
          showToast(supplyMessages.noCreditForCall);
          return;
        }

        showToast({
          title: "خطا",
          text: data.message || "خطا در دریافت اطلاعات تماس",
        });

        return;
      }

      const name = data?.contactName || "—";
      const phone = data?.contactPhone || "—";

      showToast({
        title: "اطلاعات تماس",
        text: `نام تامین کننده: ${name}\nشماره تماس: ${phone}`,
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

  /**
   * بلافاصله پس از تعیین وضعیت لاگین و داشتن slug،
   * Access درخواست از سرور خوانده می‌شود.
   *
   * بنابراین لازم نیست کاربر ابتدا روی «ثبت پیشنهاد» بزند.
   */
  useEffect(() => {
    if (loadingUser) return;

    if (!isLoggedIn) {
      setRequestAccess({
        hasAccess: false,
        hasCredit: false,
        isSupplier: false,
      });

      return;
    }

    checkRequestAccess();
  }, [loadingUser, isLoggedIn, checkRequestAccess]);

  useEffect(() => {
    if (initialRequest) {
      setRequest(initialRequest);
      setAdminNote(initialRequest?.adminNote || "");
      setLoadingRequest(false);
      return;
    }

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
  }, [slug, initialRequest]);

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
        const res = await fetch(
          `${API_BASE}/purchase-requests/${slug}/similar`,
          {
            cache: "no-store",
          }
        );

        if (res.ok) {
          const data = await res.json();

          setLatestRequests(
            Array.isArray(data?.requests) ? data.requests : []
          );
        } else {
          setLatestRequests([]);
        }
      } catch {
        setLatestRequests([]);
      } finally {
        setLoadingLatest(false);
      }
    };

    if (slug) fetchLatestRequests();
  }, [slug]);

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

      const go = window.confirm(
        "وضعیت با موفقیت تغییر کرد.\n\nمی‌خواهید به لیست درخواست‌ها برگردید؟"
      );

      if (go) {
        window.location.href =
          "/profile/admin/requests?status=UNDER_REVIEW&page=1";
      }
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
      router.push("/");
    } catch {
      alert("خطا در ارتباط با سرور");
    } finally {
      setDeletingRequest(false);
    }
  };

  const goToEdit = () => router.push(`/request/${slug}/edit`);

  return {
    request,
    loadingRequest,
    currentUser,
    loadingUser,
    latestRequests,
    loadingLatest,
    adminNote,
    setAdminNote,
    updatingStatus,
    deletingRequest,
    offers,
    loadingOffers,
    contactLoadingId,
    toast,
    setToast,
    showOfferModal,
    setShowOfferModal,
    checkingAccess,

    // وضعیت لاگین و کاربر
    isLoggedIn,
    isOwner,
    isAdmin,

    // موارد جدید برای وضعیت Access
    requestAccess,
    loadingRequestAccess,
    checkRequestAccess,

    handleSupplyClick,
    submitSupply,
    handleContactClick,
    updatePublishStatus,
    deleteRequest,
    goToEdit,
    actionModal,
    setActionModal,
    closeActionModal,
    handleOpenSupplyModal,
    handleRequestContactClick,
    requestContactLoading,
    contactModal,
    setContactModal,
  };
}
