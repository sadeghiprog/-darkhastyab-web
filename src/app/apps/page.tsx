import Link from "next/link";

const APPS = [
  {
    id: "darkhastyab",
    name: "درخواست‌ یاب",
    description:
      "اپلیکیشن اصلی درخواست‌ یاب برای اندروید؛ بدون نیاز به مرورگر به درخواست‌ها دسترسی داشته باشید و با تأمین‌کنندگان در ارتباط بمانید.",
    icon: "https://darkhastyab.com/uploads/application/v1/darkhastyab-icon.png",
    version: "v1.0.0",
    size: "90 MB",
    downloadUrl: "https://darkhastyab.com/uploads/application/v1/app-release.apk",
  },
  {
    id: "hojreh",
    name: "اپلیکیشن حجره",
    description: "اپلیکیشن حجره پلتفرمی برای ارتباط فعالان بازار میوه و تره بار",
    icon: "https://darkhastyab.com/uploads/application/hojreh/v1/hojreh-icon.png",
    version: "v1.0.0",
    size: "8 MB",
    downloadUrl: "https://darkhastyab.com/uploads/application/hojreh/v1/app-release.apk",
  },
  {
    id: "kood-forosh",
    name: "اپلیکیشن کود فروش",
    description: "اپلیکیشن کودفروش همراه همیشگی کشاورزان برای مقایسه و خرید کود",
    icon: "https://darkhastyab.com/uploads/application/kood/v1/kood-icon.png",
    version: "v1.0.0",
    size: "8 MB",
    downloadUrl: "https://darkhastyab.com/uploads/application/kood/v1/app-release.apk",
  },
];

function DownloadIcon({ className = "h-5 w-5" }) {
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  );
}

function AndroidIcon({ className = "h-6 w-6" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M17.523 15.34a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5m-11.046 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5m11.405-6.02.976-1.69a.406.406 0 0 0-.703-.406l-.988 1.712a8.53 8.53 0 0 0-7.334 0L8.845 7.224a.406.406 0 1 0-.703.406l.976 1.69C7.03 10.44 5.55 12.5 5.3 15h13.4c-.25-2.5-1.73-4.56-3.772-5.68" />
    </svg>
  );
}

export default function AppsDownloadPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <header className="text-center">
        <h1 className="text-2xl font-black text-white">
          اپلیکیشن‌های درخواست‌یاب
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          نسخه اندروید اپلیکیشن‌های ما را اینجا دانلود کنید.
        </p>
      </header>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {APPS.map((app) => (
          <article
            key={app.id}
            className="flex flex-col rounded-2xl border border-cyan-100/50 bg-gradient-to-br from-[#0B192C] to-[#0f2038] p-5 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-cyan-500/10">
                {app.icon ? (
                    <img
                        src={app.icon}
                        alt={app.name}
                        className="h-14 w-14 object-contain"
                    />
                    ) : (
                    <AndroidIcon className="h-7 w-7 text-cyan-400" />
                    )}
              </div>

              <div>
                <h2 className="font-black text-white">{app.name}</h2>
                <p className="text-xs text-slate-400">
                  {app.version} • {app.size}
                </p>
              </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              {app.description}
            </p>

            <a
              href={app.downloadUrl}
              download
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-2.5 text-sm font-black text-white transition hover:from-cyan-400 hover:to-blue-400"
            >
              <DownloadIcon className="h-4 w-4" />
              <span>دانلود اپلیکیشن</span>
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
