export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

export const supplyMessages = {
  notSupplier: {
    title: "دسترسی تامین کننده ندارید",
    text: "برای تامین کردن ابتدا باید پروفایل خود را تکمیل کرده و درخواست تامین کننده شدن ثبت نمایید. پس از تایید مدیر سایت می‌توانید درخواست‌ها را تامین کنید.",
    action: "تکمیل پروفایل",
    actionLink: "/profile/supplier-request",
  },
  noCredit: {
    title: "اعتبار کافی ندارید",
    text: "برای ارسال پیشنهاد تامین نیاز به حداقل یک اعتبار دارید.",
    action: "خرید اعتبار",
    actionLink: "/tariffs",
  },
  confirmUseCredit: {
    title: "ارسال پیشنهاد",
    text: "با ارسال پیشنهاد یک اعتبار از حساب شما کسر می‌شود. ادامه می‌دهید؟",
  },
  success: {
    title: "پیشنهاد ارسال شد",
    text: "پیشنهاد شما با موفقیت ثبت شد.",
  },
  noCreditForCall: {
    title: "اعتبار کافی ندارید",
    text: "برای تماس با تامین کننده نیاز به حداقل یک اعتبار دارید.",
    action: "خرید اعتبار",
    actionLink: "/tariffs",
  }
};
