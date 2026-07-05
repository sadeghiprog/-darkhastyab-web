"use client";

export default function Toast({ message, type = "info", onClose }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <div className="rounded-2xl bg-white shadow-xl border p-4 w-[280px]">
        <div className="text-sm font-black mb-1">{message.title}</div>
        <div className="text-xs text-slate-500">{message.text}</div>

        {message.action && (
          <a
            href={message.actionLink}
            className="mt-3 inline-block text-xs text-cyan-600 font-bold"
          >
            {message.action}
          </a>
        )}

        <button
          onClick={onClose}
          className="absolute top-2 left-2 text-xs"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
