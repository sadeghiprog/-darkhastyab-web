import { Mail, MapPin, Phone, UserRound, BadgeInfo } from "lucide-react";

export const metadata = {
  title: "تماس با ما | درخواست‌یاب",
  description:
    "اطلاعات تماس و نشانی درخواست‌یاب برای ارتباط، پشتیبانی و پیگیری درخواست‌ها.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100">
      <section className="mx-auto max-w-5xl px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-600 shadow-sm">
            ارتباط با درخواست‌یاب
          </span>

          <h1 className="mt-5 text-3xl font-extrabold leading-tight text-slate-900 md:text-5xl md:leading-[4rem]">
            تماس با ما
          </h1>

          <p className="mt-4 text-sm leading-8 text-slate-600 md:text-base">
            برای ارتباط با مجموعه درخواست‌یاب، دریافت پشتیبانی، پیگیری درخواست‌ها
            یا هماهنگی‌های بیشتر، از طریق اطلاعات زیر با ما در تماس باشید.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-6 text-lg font-black text-slate-900">
              اطلاعات ارتباطی
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4">
                <div className="rounded-2xl bg-slate-900/5 p-3 text-slate-700">
                  <UserRound size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500">نام مالک</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 md:text-base">
                    سودابه غیاثی
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4">
                <div className="rounded-2xl bg-slate-900/5 p-3 text-slate-700">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500">شماره همراه</p>
                  <a
                    href="tel:09190555510"
                    dir="ltr"
                    className="mt-1 block text-sm font-semibold text-slate-900 transition hover:text-sky-700 md:text-base"
                  >
                    09190555510
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4">
                <div className="rounded-2xl bg-slate-900/5 p-3 text-slate-700">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500">تلفن ثابت</p>
                  <a
                    href="tel:04137725075"
                    dir="ltr"
                    className="mt-1 block text-sm font-semibold text-slate-900 transition hover:text-sky-700 md:text-base"
                  >
                    04137725075
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4">
                <div className="rounded-2xl bg-slate-900/5 p-3 text-slate-700">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500">ایمیل</p>
                  <a
                    href="mailto:info@test-darkhastyab.ir"
                    dir="ltr"
                    className="mt-1 block break-all text-sm font-semibold text-slate-900 transition hover:text-sky-700 md:text-base"
                  >
                    info@test-darkhastyab.ir
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4">
                <div className="rounded-2xl bg-slate-900/5 p-3 text-slate-700">
                  <BadgeInfo size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500">کد پستی</p>
                  <p
                    dir="ltr"
                    className="mt-1 text-sm font-semibold text-slate-900 md:text-base"
                  >
                    1234567890
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-900 p-6 text-white shadow-lg md:p-8">
            <h2 className="mb-6 text-lg font-black">نشانی و اطلاعات بیشتر</h2>

            <div className="space-y-4">
              <div className="rounded-2xl bg-white/10 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-2xl bg-white/10 p-3">
                    <MapPin size={20} />
                  </div>
                  <p className="text-sm font-bold text-white/80">آدرس</p>
                </div>

                <p className="text-sm leading-8 text-white/90 md:text-base">
                  بناب، عسگر آباد، بن‌بست نریمانی، پلاک 109
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-sm font-bold text-white/80">یادداشت</p>
                <p className="mt-2 text-sm leading-8 text-white/90">
                  برای ارتباط سریع‌تر، بهتر است هنگام تماس موضوع درخواست یا نوع
                  پیگیری خود را به‌صورت کوتاه اعلام کنید.
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-sm font-bold text-white/80">راه ارتباط سریع</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <a
                    href="tel:09190555510"
                    className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
                  >
                    تماس مستقیم
                  </a>
                  <a
                    href="mailto:info@test-darkhastyab.ir"
                    className="rounded-full border border-white/20 bg-transparent px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10"
                  >
                    ارسال ایمیل
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
