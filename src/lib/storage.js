export const storage = {
  get(key) {
    // 1. اگر در سمت سرور هستیم، برنگردان
    if (typeof window === "undefined") return null;

    const item = localStorage.getItem(key);
    
    // 2. اگر مقداری پیدا نشد، نال برگردان
    if (!item || item === "undefined") return null;

    try {
      // 3. فقط در صورتی که رشته معتبر باشد، پارس کن
      return JSON.parse(item);
    } catch (error) {
      console.error("Error parsing storage item:", error);
      return null;
    }
  },

  set(key, value) {
    if (typeof window === "undefined") return;
    
    // مقدار را به رشته تبدیل کن
    localStorage.setItem(key, JSON.stringify(value));
  },

  remove(key) {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  }
};
