"use client";

import React, { Suspense } from "react";
import RequestDetailsContent from "./RequestDetailsContent";

export default function RequestDetailsPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center">در حال بارگذاری...</div>}>
      <RequestDetailsContent />
    </Suspense>
  );
}
