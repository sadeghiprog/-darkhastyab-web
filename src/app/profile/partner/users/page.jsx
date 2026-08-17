"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { apiFetch } from "../../../../lib/api2";
import PageHeader from "../../../../components/ui/PageHeader";
import EmptyState from "../../../../components/ui/EmptyState";
import Pagination from "../../../../components/ui/Pagination";

const LIMIT = 10;

const SUPPLIER_STATUS_LABEL = {
  NOT_REQUESTED: "بدون درخواست",
  PENDING: "در انتظار تأیید",
  REJECTED: "رد شده",
  APPROVED: "تأیید شده",
};

const SUPPLIER_STATUS_CLASS = {
  NOT_REQUESTED: "bg-slate-100 text-slate-600",
  PENDING: "bg-amber-100 text-amber-700",
  REJECTED: "bg-red-100 text-red-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
};

const PHONE_REGEX = /^09\d{9}$/;

function getStatusLabel(status) {
  return SUPPLIER_STATUS_LABEL[status] || "نامشخص";
}

function getStatusClass(status) {
  return SUPPLIER_STATUS_CLASS[status] || "bg-slate-100 text-slate-600";
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("fa-IR");
}

export default function PartnerUsersPage() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [supplierStatus, setSupplierStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ثبت اولیه (فقط موبایل و نام)
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ phone: "", name: "" });
  const [creating, setCreating] = useState(false);
  const [formMsg, setFormMsg] = useState({ type: "", text: "" });

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
      });

      const trimmedSearch = search.trim();

      if (trimmedSearch) {
        params.set("search", trimmedSearch);
      }

      if (supplierStatus) {
        params.set("supplierStatus", supplierStatus);
      }

      const response = await apiFetch(`/partner/users?${params.toString()}`);

      const responseUsers = response.data?.users || [];
      const responsePagination = response.data?.pagination;

      setUsers(responseUsers);
      setTotalPages(responsePagination?.totalPages || 1);
    } catch (err) {
      setUsers([]);
      setTotalPages(1);
      setError(err?.message || "دریافت فهرست کاربران با خطا مواجه شد.");
    } finally {
      setLoading(false);
    }
  }, [page, search, supplierStatus]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleStatusChange = (event) => {
    setSupplierStatus(event.target.value);
    setPage(1);
  };

  const resetForm = () => {
    setForm({ phone: "", name: "" });
    setFormMsg({ type: "", text: "" });
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setCreating(true);
    setFormMsg({ type: "", text: "" });

    const phone = form.phone.trim();
    const name = form.name.trim();

    // اعتبارسنجی سمت کلاینت
    if (!PHONE_REGEX.test(phone)) {
      setFormMsg({
        type: "error",
        text: "شماره موبایل معتبر نیست. شماره باید با 09 شروع شود و ۱۱ رقم باشد.",
      });
      setCreating(false);
      return;
    }

    if (!name) {
      setFormMsg({ type: "error", text: "نام کاربر را وارد کنید." });
      setCreating(false);
      return;
    }

    try {
      await apiFetch("/partner/users", {
        method: "POST",
        body: JSON.stringify({ phone, name }),
      });

      resetForm();
      setShowCreate(false);
      setPage(1);
      await loadUsers();
    } catch (err) {
      setFormMsg({
        type: "error",
        text: err?.message || "ثبت کاربر با خطا مواجه شد.",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="کاربران زیرمجموعه"
        description="کاربرانی که توسط شما معرفی شده‌اند"
        action={
          <button
            type="button"
            onClick={() => {
              setShowCreate((prev) => !prev);
              resetForm();
            }}
            className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-cyan-600"
          >
            {showCreate ? "بستن" : "+ ثبت کاربر جدید"}
          </button>
        }
      />

      {/* فرم ثبت اولیه */}
      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="mb-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-5"
        >
          <h3 className="mb-1 font-bold text-slate-800">
            ثبت کاربر جدید
          </h3>

          <p className="mb-4 text-xs text-slate-500">
            در این مرحله فقط شماره موبایل و نام کاربر ثبت می‌شود. تکمیل پروفایل و
            درخواست تأمین‌کنندگی در صفحه جزئیات انجام می‌شود.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="create-phone"
                className="mb-1 block text-xs font-medium text-slate-600"
              >
                شماره موبایل
              </label>

              <input
                id="create-phone"
                required
                dir="ltr"
                inputMode="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, phone: event.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                placeholder="09123456789"
              />
            </div>

            <div>
              <label
                htmlFor="create-name"
                className="mb-1 block text-xs font-medium text-slate-600"
              >
                نام کاربر
              </label>

              <input
                id="create-name"
                required
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                placeholder="مثال: علی رضایی"
              />
            </div>
          </div>

          {formMsg.text && (
            <p
              className={`mt-3 text-sm ${
                formMsg.type === "success"
                  ? "text-emerald-600"
                  : "text-red-500"
              }`}
            >
              {formMsg.text}
            </p>
          )}

          <button
            type="submit"
            disabled={creating}
            className="mt-4 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creating ? "در حال ثبت…" : "ثبت کاربر"}
          </button>
        </form>
      )}

      {/* فیلترها */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={search}
          onChange={handleSearchChange}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
          placeholder="جستجو بر اساس نام یا موبایل…"
          aria-label="جستجوی کاربر بر اساس نام یا موبایل"
        />

        <select
          value={supplierStatus}
          onChange={handleStatusChange}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
          aria-label="فیلتر وضعیت تأمین‌کننده"
        >
          <option value="">وضعیت تأمین‌کننده: همه</option>

          {Object.entries(SUPPLIER_STATUS_LABEL).map(([status, label]) => (
            <option key={status} value={status}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* خطای دریافت اطلاعات */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* وضعیت بارگذاری */}
      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400">
          در حال بارگذاری کاربران…
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          title="کاربری یافت نشد"
          description="هنوز کاربری ثبت نکرده‌اید یا هیچ کاربری با فیلترهای فعلی پیدا نشد."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-right text-xs text-slate-500">
                  <th className="px-4 py-3 font-medium">نام</th>
                  <th className="px-4 py-3 font-medium">موبایل</th>
                  <th className="px-4 py-3 font-medium">وضعیت تأمین‌کننده</th>
                  <th className="px-4 py-3 font-medium">تاریخ ثبت</th>
                  <th className="px-4 py-3 font-medium">عملیات</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => {
                  const status = user.supplierStatus;

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70"
                    >
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-800">
                          {user.name || "—"}
                        </div>

                        {user.profile?.companyName && (
                          <div className="mt-1 text-xs text-slate-400">
                            {user.profile.companyName}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-slate-600" dir="ltr">
                        {user.phone || "—"}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${getStatusClass(
                            status
                          )}`}
                        >
                          {getStatusLabel(status)}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-500">
                        {formatDate(user.createdAt)}
                      </td>

                      <td className="px-4 py-3">
                        <Link
                          href={`/profile/partner/users/${user.id}`}
                          className="text-xs font-bold text-cyan-600 transition hover:text-cyan-700"
                        >
                          جزئیات / ویرایش
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
