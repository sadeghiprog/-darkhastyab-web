"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE, supplyMessages } from "../utils/constants";
import { authSession } from "../../../../lib/auth-session";

export default function useRequestDetails(slug, initialRequest = null) {
  const router = useRouter();

 const [request, setRequest] = useState(() => initialRequest ?? null);
const [loadingRequest, setLoadingRequest] = useState(() => !initialRequest);


  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [latestRequests, setLatestRequests] = useState([]);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [adminNote, setAdminNote] = useState(() => initialRequest?.adminNote || "");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deletingRequest, setDeletingRequest] = useState(false);

  const [offers, setOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [contactLoadingId, setContactLoadingId] = useState(null);

  const [toast, setToast] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(false);

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
      authSession.setRedirectAfterLogin(
        window.location.pathname + window.location.search
      );
      router.push("/auth/login");
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

      setActionModal({
        open: true,
        hasAccess: !!data.hasAccess,
        hasCredit: !!data.hasCredit,
        isSupplier: !!data.isSupplier,
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

      closeActionModal();

      const name = data?.contactName || request?.userName || "—";
      const phone = data?.contactPhone || "—";

      showToast({
        title: "اطلاعات تماس",
        text: `نام خریدار: ${name}\nشماره تماس: ${phone}`,
      });
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
          showToast({ title: "خطا", text: data.message || "ارسال ناموفق بود" });
        }
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
      authSession.setRedirectAfterLogin(
        window.location.pathname + window.location.search
      );
      router.push("/auth/login");
      return;
    }

    try {
      setContactLoadingId(offerId);

      const accessRes = await fetch(`${API_BASE}/contact/${offerId}/check-access`, {
        credentials: "include",
      });

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
        const res = await fetch(`${API_BASE}/purchase-requests/${slug}/similar`, {
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
        const go = window.confirm("وضعیت با موفقیت تغییر کرد.\n\nمی‌خواهید به لیست درخواست‌ها برگردید؟");

        if (go) {
          window.location.href = "/profile/admin/requests?status=UNDER_REVIEW&page=1";
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
    isLoggedIn,
    isOwner,
    isAdmin,
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
  };
}
