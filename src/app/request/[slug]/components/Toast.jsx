"use client";

import { Info } from "lucide-react";

export default function Toast({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">

      <div className="relative w-[420px] rounded-[28px] bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">

        {/* icon */}
        <div className="mb-5 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-50">
            <Info size={26} className="text-cyan-600" />
          </div>
        </div>

        {/* title */}
        <div className="text-center text-base font-extrabold text-slate-800 mb-2">
          {message.title}
        </div>

        {/* text */}
        <div className="text-center text-sm leading-7 text-slate-500 whitespace-pre-line">
          {message.text}
        </div>

        {/* action */}
        {message.action && (
          <a
            href={message.actionLink}
            className="mt-6 block w-full rounded-2xl bg-cyan-500 py-3 text-center text-sm font-black text-white transition hover:bg-cyan-600"
          >
            {message.action}
          </a>
        )}

        {/* close */}
        <button
          onClick={onClose}
          className="mt-3 block w-full rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          متوجه شدم
        </button>

      </div>
    </div>
  );
}
