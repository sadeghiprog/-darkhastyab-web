"use client";

export default function TransactionCard({ transaction, adminView = false }) {
  const isPositive = transaction.amount > 0;

  const typeLabels = {
    TOP_UP: "شارژ کیف پول",
    CONTACT_REQUEST: "دریافت اطلاعات تماس",
    SUPPLY_REQUEST: "ارسال پیشنهاد",
    GIFT: "هدیه",
    REFUND: "بازگشت وجه",
  };

  return (
    <div className="border border-gray-200 rounded-2xl p-5 bg-white flex items-center justify-between">

      {/* Right */}
      <div className="space-y-2">

        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isPositive ? "bg-green-500" : "bg-red-500"
            }`}
          />

          <span className="text-sm font-medium text-gray-800">
            {typeLabels[transaction.type]}
          </span>
        </div>

        {transaction.description && (
          <div className="text-xs text-gray-500">
            {transaction.description}
          </div>
        )}

        {transaction.referenceCode && (
          <div className="text-xs text-gray-400">
            کد پیگیری: {transaction.referenceCode}
          </div>
        )}

        {adminView && transaction.wallet?.user && (
          <div className="text-xs text-gray-500 pt-1">
            {transaction.wallet.user.firstName}{" "}
            {transaction.wallet.user.lastName}
            {" - "}
            {transaction.wallet.user.phone}
          </div>
        )}
      </div>

      {/* Left */}
      <div className="text-left space-y-1">

        <div
          className={`text-sm font-semibold ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {isPositive ? "+" : ""}
          {transaction.amount.toLocaleString()}
          {" "}
          تومان
        </div>

        <div className="text-xs text-gray-400">
          موجودی:{" "}
          {transaction.balanceAfter.toLocaleString()}
        </div>

        <div className="text-xs text-gray-400">
          {new Date(transaction.createdAt).toLocaleDateString("fa-IR")}
        </div>

      </div>

    </div>
  );
}
