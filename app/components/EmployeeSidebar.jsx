"use client";

import Link from "next/link";

export default function EmployeeSidebar() {
  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-5">
      <h2 className="text-2xl font-bold mb-6">
        Employee Panel
      </h2>

      <ul className="space-y-4">
        <li><Link href="/employee">Dashboard</Link></li>
        <li><Link href="/employee/okrs">OKRs</Link></li>
        <li><Link href="/employee/feedback">Feedback</Link></li>
      </ul>
    </div>
  );
}