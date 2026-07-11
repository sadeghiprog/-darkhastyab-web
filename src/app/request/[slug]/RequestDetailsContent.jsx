"use client";

import React from "react";
import useRequestDetails from "./hooks/useRequestDetails";
import Toast from "./components/Toast";
import SupplyModal from "./components/SupplyModal";
import RequestHeader from "./components/RequestHeader";
import RequestInfoGrid from "./components/RequestInfoGrid";
import RequestDescription from "./components/RequestDescription";
import PublishStatusBox from "./components/PublishStatusBox";
import AdminPublishActions from "./components/AdminPublishActions";
import OffersSection from "./components/OffersSection";
import LatestRequestsSidebar from "./components/LatestRequestsSidebar";

export default function RequestDetailsContent({ slug, initialRequest }) {
  const {
    request,
    loadingRequest,
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
    closeActionModal,
    handleOpenSupplyModal,
    handleRequestContactClick,
    requestContactLoading,
  } = useRequestDetails(slug, initialRequest);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-[1380px]">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <main className="xl:col-span-9">
            {loadingRequest && !request ? (
              <div className="h-[420px] animate-pulse rounded-[2rem] bg-white shadow-sm" />
            ) : request ? (
              <section className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
                <RequestHeader
                  request={request}
                  isAdmin={isAdmin}
                  isOwner={isOwner}
                  checkingAccess={checkingAccess}
                  deletingRequest={deletingRequest}
                  onSupplyClick={handleSupplyClick}
                  onEdit={goToEdit}
                  onDelete={deleteRequest}
                />

                <div className="p-5 md:p-6">
                  <RequestInfoGrid request={request} />
                  <RequestDescription description={request.description} />

                  {isLoggedIn && (isOwner || isAdmin) && (
                    <PublishStatusBox request={request} />
                  )}

                  {isAdmin && (
                    <AdminPublishActions
                      adminNote={adminNote}
                      setAdminNote={setAdminNote}
                      updatingStatus={updatingStatus}
                      updatePublishStatus={updatePublishStatus}
                    />
                  )}

                  <OffersSection
                    loadingOffers={loadingOffers}
                    offers={offers}
                    contactLoadingId={contactLoadingId}
                    onContactClick={handleContactClick}
                  />
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

          <LatestRequestsSidebar
            loadingLatest={loadingLatest}
            latestRequests={latestRequests}
          />
        </div>
      </div>

      {actionModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl">
            <div className="bg-gradient-to-l from-cyan-50 via-white to-white px-6 py-5">
              <h3 className="text-lg font-black text-slate-800">
                انتخاب نحوه ارتباط
              </h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                {actionModal.hasAccess
                  ? "شما قبلا دسترسی این درخواست را خریداری کرده‌اید. حالا می‌توانید ثبت پیشنهاد انجام دهید یا مستقیم اطلاعات تماس را دریافت کنید."
                  : "برای ثبت پیشنهاد یا دریافت اطلاعات تماس، ۱ اعتبار از کیف پول شما کسر می‌شود. لطفا یکی از گزینه‌های زیر را انتخاب کنید."}
              </p>
            </div>

            <div className="px-6 py-5">
              <div className="mb-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-500" />
                  <p className="leading-7">
                    {actionModal.hasAccess
                      ? "دسترسی شما فعال است و برای این درخواست دوباره هزینه‌ای بابت دسترسی پرداخت نمی‌کنید."
                      : "اگر اعتبار کافی نداشته باشید، امکان ادامه برای شما وجود ندارد."}
                  </p>
                </div>
              </div>

              <div className="grid gap-3">
                <button
                  onClick={handleOpenSupplyModal}
                  className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3.5 text-sm font-black text-white transition hover:opacity-95"
                >
                  ثبت پیشنهاد
                </button>

                <button
                  onClick={handleRequestContactClick}
                  disabled={requestContactLoading}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-black text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700 disabled:opacity-70"
                >
                  {requestContactLoading
                    ? "در حال دریافت اطلاعات تماس..."
                    : "تماس"}
                </button>

                <button
                  onClick={closeActionModal}
                  className="rounded-2xl px-5 py-3 text-sm font-bold text-slate-500 transition hover:bg-slate-50"
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <SupplyModal
        open={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        onSubmit={submitSupply}
      />

      <Toast message={toast} onClose={() => setToast(null)} />
    </div>
  );
}
