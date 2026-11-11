"use client";

import Link from "next/link";

export default function AdminSidebar() {
  return (
    <div className="w-64 h-screen bg-black text-white p-5">
      <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>

      <ul className="space-y-4">
        <li><Link href="/admin">Dashboard</Link></li>
        <li><Link href="/admin/users">Manage Users</Link></li>
        <li><Link href="/admin/departments">Departments</Link></li>
        <li><Link href="/admin/kpis">KPIs</Link></li>
        <li><Link href="/admin/security">Security</Link></li>
      </ul>
    </div>
  );
}