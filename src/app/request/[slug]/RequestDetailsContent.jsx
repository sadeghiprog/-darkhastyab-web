"use client";

import React from "react";
import { useParams } from "next/navigation";
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

export default function RequestDetailsContent() {
  const params = useParams();
  const slug = params?.slug;

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
  } = useRequestDetails(slug);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-[1380px]">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <main className="xl:col-span-9">
            {loadingRequest ? (
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

      <SupplyModal
        open={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        onSubmit={submitSupply}
      />

      <Toast message={toast} onClose={() => setToast(null)} />
    </div>
  );
}
