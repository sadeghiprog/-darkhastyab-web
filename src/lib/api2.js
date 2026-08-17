const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(path, options = {}) {
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers = {
    ...(options.headers || {}),
  };

  // برای FormData نباید Content-Type دستی ست بشه؛ مرورگر خودش با boundary ست می‌کنه
  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include", // ارسال کوکی سشن به سمت سرور
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message || data?.error || `خطای سرور (${response.status})`
    );
  }

  return data;
}
