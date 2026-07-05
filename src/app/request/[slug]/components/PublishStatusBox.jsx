"use client";

import {
  getPublishStatusClass,
  getPublishStatusLabel,
} from "../utils/formatters";

export default function PublishStatusBox({ request }) {
  return (
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
          className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${getPublishStatusClass(
            request.publishStatus
          )}`}
        >
          {getPublishStatusLabel(request.publishStatus)}
        </span>
      </div>
    </div>
  );
}
