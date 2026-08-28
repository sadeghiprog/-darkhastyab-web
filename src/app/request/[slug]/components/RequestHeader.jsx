"use client";

import {
  Layers,
  PhoneCall,
  CheckCircle2,
  CircleSlash,
  User,
  Clock3,
} from "lucide-react";

export default function RequestHeader({
  request,
  isOwner,
  isAdmin,
  checkingAccess,
  deletingRequest,
  onSupplyClick,
  onEdit,
  onDelete,
}) {
  const isExpired = request?.isExpired;
  const userName = request?.userName || "کاربر";
  const daysRemaining =
    typeof request?.daysRemaining === "number" ? request.daysRemaining : null;

  const canManage = isOwner || isAdmin;

  return (
    <div className="border-b border-slate-100 bg-gradient-to-l from-cyan-50/80 via-white to-white p-5 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {request.category?.name && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-[11px] font-black text-cyan-700">
                <Layers size={13} />
                {request.category.name}
              </span>
            )}

            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black ${
                isExpired
                  ? "border-rose-100 bg-rose-50 text-rose-700"
                  : "border-green-100 bg-green-50 text-green-700"
              }`}
            >
              {isExpired ? (
                <CircleSlash size={13} />
              ) : (
                <CheckCircle2 size={13} />
              )}

              {isExpired ? "منقضی شده" : "فعال"}
            </span>
          </div>

          <h1 className="text-xl font-black leading-9 text-slate-800 md:text-2xl">
             {request.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
            <div className="inline-flex items-center gap-1.5">
              <User size={14} className="text-cyan-600" />
              <span>کاربر:</span>
              <span className="font-bold text-slate-700">{userName}</span>
            </div>

            <div className="inline-flex items-center gap-1.5">
              <Clock3 size={14} className="text-cyan-600" />
              <span>زمان باقی‌مانده:</span>
              <span className="font-bold text-slate-700">
                {isExpired ? (
                                  <>
                                    
                                    <span>منقضی شده</span>
                                  </>
                                ) : daysRemaining > 10000 ? (
                                  <>
                                   
                                    <span>بدون انقضا</span>
                                  </>
                                ) : (
                                  <>
                                    
                                    <span>{daysRemaining} روز تا پایان</span>
                                  </>
                                )}
              </span>
            </div>
          </div>
        </div>

        {canManage ? (
          <div className="flex gap-3">
            <button
              onClick={onEdit}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700"
            >
              ویرایش
            </button>

            <button
              onClick={onDelete}
              disabled={deletingRequest}
              className="rounded-2xl bg-rose-500 px-5 py-3 text-sm font-black text-white transition hover:bg-rose-600 disabled:opacity-70"
            >
              حذف
            </button>
          </div>
        ) : isExpired ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-black text-rose-700">
            این درخواست منقضی شده
          </div>
        ) : (
          <div/>
          // <button
          //   onClick={onSupplyClick}
          //   disabled={checkingAccess}
            
          //   className="inline-flex justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-black text-white disabled:opacity-70"
          // >
          //   <PhoneCall size={20} />
          //   {checkingAccess ? "در حال بررسی..." : "تماس و تامین"}
          // </button>
        )}
      </div>
    </div>
  );
}
