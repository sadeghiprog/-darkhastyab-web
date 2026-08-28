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
import LatestRequestsSidebar from "./components/LatestRequestsSidebar";
import ContactInfoModal from "./components/ContactInfoModal";
import RequestImageGallery from "./components/RequestImageGallery";

function PhoneIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function LoadingIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function DirectContactBox({
  isLoggedIn,
  loadingRequestAccess,
  hasAccess,
  requestContactLoading,
  onRequestContact,
  hasImages = false,
}) {
  const title = "اطلاعات تماس و ارتباط مستقیم";

  const description = !isLoggedIn
    ? "برای مشاهده اطلاعات تماس و ارتباط مستقیم با ثبت‌کننده درخواست، ابتدا باید وارد حساب کاربری خود شوید."
    : loadingRequestAccess
    ? "در حال بررسی وضعیت دسترسی شما..."
    : hasAccess
    ? "شما قبلاً دسترسی این درخواست را خریداری کرده‌اید. اکنون می‌توانید بدون کسر اعتبار اطلاعات تماس را مشاهده کنید."
    : "برای دریافت مستقیم اطلاعات تماس، ۱ اعتبار از کیف پول شما کسر خواهد شد.";

  const buttonText = requestContactLoading
    ? "در حال دریافت..."
    : !isLoggedIn
    ? "ورود و دریافت تماس"
    : loadingRequestAccess
    ? "در حال بررسی..."
    : hasAccess
    ? "مشاهده اطلاعات تماس"
    : "دریافت اطلاعات تماس";

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-blue-100/90 bg-gradient-to-br from-blue-50/70 via-white to-cyan-50/50 p-5 m-4 shadow-sm sm:p-6 ${
        hasImages ? "mt-6" : "mt-8"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <PhoneIcon className="h-5 w-5" />
            </div>

            <h3 className="text-base font-black text-slate-800 sm:text-lg">
              {title}
            </h3>
          </div>

          <p className="text-xs font-medium leading-6 text-slate-600 sm:text-sm sm:leading-7">
            {description}
          </p>
        </div>

        <div className="shrink-0">
          <button
            type="button"
            onClick={onRequestContact}
            disabled={requestContactLoading || loadingRequestAccess}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-7 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-700 hover:to-cyan-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {requestContactLoading ? (
              <LoadingIcon className="h-5 w-5" />
            ) : (
              <PhoneIcon className="h-5 w-5" />
            )}

            <span>{buttonText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function RequestMainContent({
  request,
  isAdmin,
  isOwner,
  isLoggedIn,
  checkingAccess,
  deletingRequest,
  adminNote,
  setAdminNote,
  updatingStatus,
  loadingRequestAccess,
  requestContactLoading,
  hasAccess,
  hasImages,
  handleSupplyClick,
  goToEdit,
  deleteRequest,
  handleRequestContactClick,
  updatePublishStatus,
}) {
  return (
    <>
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

      <div className={hasImages ? "mt-6 space-y-6" : "p-6 md:p-6"}>
        <RequestInfoGrid request={request} />

        <RequestDescription description={request.description} />

        <DirectContactBox
          hasImages={hasImages}
          isLoggedIn={isLoggedIn}
          loadingRequestAccess={loadingRequestAccess}
          hasAccess={hasAccess}
          requestContactLoading={requestContactLoading}
          onRequestContact={handleRequestContactClick}
        />

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
      </div>
    </>
  );
}

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
    toast,
    setToast,
    showOfferModal,
    setShowOfferModal,
    checkingAccess,
    isLoggedIn,
    isOwner,
    isAdmin,
    requestAccess,
    loadingRequestAccess,
    handleSupplyClick,
    submitSupply,
    updatePublishStatus,
    deleteRequest,
    goToEdit,
    actionModal,
    closeActionModal,
    handleOpenSupplyModal,
    handleRequestContactClick,
    requestContactLoading,
    contactModal,
    setContactModal,
  } = useRequestDetails(slug, initialRequest);

  const hasAccess = Boolean(
    requestAccess?.hasAccess ||
      actionModal?.hasAccess ||
      request?.hasAccess ||
      isOwner ||
      isAdmin
  );

  const hasImages = Boolean(request?.images?.length);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-[1380px]">
        <div
          className={
            hasImages
              ? "flex flex-col gap-8"
              : "grid grid-cols-1 gap-6 xl:grid-cols-12"
          }
        >
          <main className={hasImages ? "w-full" : "xl:col-span-8"}>
            {loadingRequest && !request ? (
              <div className="h-[420px] animate-pulse rounded-3xl bg-white shadow-sm" />
            ) : request ? (
              <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                {hasImages ? (
                  <div
                    dir="ltr"
                    className="grid grid-cols-1 lg:grid-cols-12"
                  >
                    {/* ستون گالری: سمت چپ (عرض ۵ ستون در دسکتاپ) */}
                    <div className="border-b border-slate-100 bg-slate-50/40 p-0 lg:col-span-5 lg:border-b-0 lg:border-r lg:p-0">
                      <div dir="rtl" className="lg:sticky lg:top-0">
                        <RequestImageGallery
                          images={request.images}
                          title={request.title}
                        />
                      </div>
                    </div>

                    {/* ستون اطلاعات: سمت راست (عرض ۷ ستون در دسکتاپ) */}
                    <div
                      dir="rtl"
                      className="flex flex-col p-0 sm:p-7 md:p-0 lg:col-span-7"
                    >
                      <RequestMainContent
                        request={request}
                        isAdmin={isAdmin}
                        isOwner={isOwner}
                        isLoggedIn={isLoggedIn}
                        checkingAccess={checkingAccess}
                        deletingRequest={deletingRequest}
                        adminNote={adminNote}
                        setAdminNote={setAdminNote}
                        updatingStatus={updatingStatus}
                        loadingRequestAccess={loadingRequestAccess}
                        requestContactLoading={requestContactLoading}
                        hasAccess={hasAccess}
                        hasImages={hasImages}
                        handleSupplyClick={handleSupplyClick}
                        goToEdit={goToEdit}
                        deleteRequest={deleteRequest}
                        handleRequestContactClick={handleRequestContactClick}
                        updatePublishStatus={updatePublishStatus}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <RequestMainContent
                      request={request}
                      isAdmin={isAdmin}
                      isOwner={isOwner}
                      isLoggedIn={isLoggedIn}
                      checkingAccess={checkingAccess}
                      deletingRequest={deletingRequest}
                      adminNote={adminNote}
                      setAdminNote={setAdminNote}
                      updatingStatus={updatingStatus}
                      loadingRequestAccess={loadingRequestAccess}
                      requestContactLoading={requestContactLoading}
                      hasAccess={hasAccess}
                      hasImages={hasImages}
                      handleSupplyClick={handleSupplyClick}
                      goToEdit={goToEdit}
                      deleteRequest={deleteRequest}
                      handleRequestContactClick={handleRequestContactClick}
                      updatePublishStatus={updatePublishStatus}
                    />
                  </div>
                )}
              </section>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <p className="text-sm font-bold text-slate-400">
                  درخواست موردنظر پیدا نشد.
                </p>
              </div>
            )}
          </main>

          {!hasImages && (
            <aside className="xl:col-span-4">
              <LatestRequestsSidebar
                loadingLatest={loadingLatest}
                latestRequests={latestRequests}
              />
            </aside>
          )}
        </div>

        {hasImages && (
          <section className="mt-8">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
              <h2 className="text-lg font-black text-slate-800">
                درخواست‌های مشابه و جدید
              </h2>
            </div>

            <LatestRequestsSidebar
              variant="grid"
              loadingLatest={loadingLatest}
              latestRequests={latestRequests}
            />
          </section>
        )}
      </div>

      {actionModal?.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm"
          dir="rtl"
        >
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="bg-gradient-to-l from-cyan-50 via-white to-white px-6 py-5">
              <h3 className="text-lg font-black text-slate-800">
                انتخاب نحوه ارتباط
              </h3>

              <p className="mt-2 text-sm leading-7 text-slate-600">
                {!isLoggedIn
                  ? "برای ثبت پیشنهاد یا دریافت اطلاعات تماس، ابتدا باید وارد حساب کاربری خود شوید."
                  : actionModal.hasAccess
                  ? "شما قبلاً دسترسی این درخواست را خریداری کرده‌اید. حالا می‌توانید ثبت پیشنهاد انجام دهید یا مستقیم اطلاعات تماس را دریافت کنید."
                  : "برای ثبت پیشنهاد یا دریافت اطلاعات تماس، ۱ اعتبار از کیف پول شما کسر می‌شود. لطفاً یکی از گزینه‌های زیر را انتخاب کنید."}
              </p>
            </div>

            <div className="px-6 py-5">
              <div className="mb-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-500" />
                  <p className="leading-7">
                    {!isLoggedIn
                      ? "پس از ورود به حساب کاربری، وضعیت دسترسی و اعتبار شما بررسی خواهد شد."
                      : actionModal.hasAccess
                      ? "دسترسی شما فعال است و برای این درخواست دوباره هزینه‌ای بابت دسترسی پرداخت نمی‌کنید."
                      : "اگر اعتبار کافی نداشته باشید، امکان ادامه برای شما وجود ندارد."}
                  </p>
                </div>
              </div>

              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={handleOpenSupplyModal}
                  className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3.5 text-sm font-black text-white transition hover:opacity-95"
                >
                  ثبت پیشنهاد
                </button>

                <button
                  type="button"
                  onClick={handleRequestContactClick}
                  disabled={requestContactLoading}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-black text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700 disabled:opacity-70"
                >
                  {requestContactLoading
                    ? "در حال دریافت اطلاعات تماس..."
                    : "تماس مستقیم"}
                </button>

                <button
                  type="button"
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

      <ContactInfoModal
        open={Boolean(contactModal)}
        contactName={contactModal?.name}
        contactPhone={contactModal?.phone}
        onClose={() => setContactModal(null)}
      />

      <Toast message={toast} onClose={() => setToast(null)} />
    </div>
  );
}
