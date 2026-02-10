"use client";

import { useState } from "react";
import {
  FileText,
  Users,
  UserCheck,
  UserX,
  Shield,
  Activity,
  Key,
  DollarSign,
  Download,
  X,
} from "lucide-react";

/* ------------------ DATA ------------------ */
const DATASETS = {
  totalUsers: {
    label: "Total Users",
    icon: Users,
    color: "from-indigo-500 to-indigo-600",

    records: [
      { type: "Fundis", count: 20 },
      { type: "Customers", count: 20 },
      { type: "Professionals", count: 12 },
      { type: "Contractors", count: 10 },
      { type: "Hardwares", count: 5 },
      { type: "Admins", count: 1 },
      { type: "Super Admins", count: 1 },
      { type: "Agents", count: 2 },
      { type: "Associates", count: 3 },
    ],
  },

  customers: {
    label: "Customers",
    icon: Users,
    icon: UserCheck,
    color: "from-emerald-500 to-emerald-600",
    records: [
      { type: "Individual Customers", count: 10 },
      { type: "Organization Customers", count: 5 },
    ],
  },

  builders: {
    label: "Builders",
    records: [
      { type: "Fundis", count: 3400 },
      { type: "Contractors", count: 620 },
      { type: "Professionals", count: 1280 },
      { type: "Hardwares", count: 430 },
    ],
  },

  activeUsers: {
    label: "Active Users",
    records: [
      { type: "Active Individual Customers", count: 3810 },
      { type: "Active Organization Customers", count: 920 },
      { type: "Active Fundis - Plumbers", count: 420 },
      { type: "Active Fundis - Masons", count: 510 },
      { type: "Active Professionals - Architects", count: 210 },
      { type: "Active Professionals - QS", count: 140 },
      { type: "Active Contractors - Building Works", count: 180 },
      { type: "Active Contractors - Water Works", count: 90 },
      { type: "Active Hardwares - General", count: 190 },
    ],
  },

  pending: {
    label: "Pending Review",
    records: [
      { type: "Pending Customers", count: 97 },
      { type: "Pending Fundis", count: 63 },
      { type: "Pending Professionals", count: 32 },
      { type: "Pending Contractors", count: 18 },
      { type: "Pending Hardwares", count: 4 },
    ],
  },

  suspended: {
    label: "Suspended",
    records: [
      { type: "Suspended Customers", count: 41 },
      { type: "Suspended Fundis", count: 23 },
      { type: "Suspended Professionals", count: 9 },
      { type: "Suspended Contractors", count: 8 },
      { type: "Suspended Hardwares", count: 6 },
    ],
  },

  otp: {
    label: "OTP Requests",
    records: [
      { type: "Login OTPs", count: 22000 },
      { type: "Registration OTPs", count: 10200 },
      { type: "Password Reset OTPs", count: 5920 },
    ],
  },

  sales: {
    label: "Total Sales",
    records: [
      { type: "Service Payments", amount: "KES 2.3M" },
      { type: "Product Orders", amount: "KES 1.9M" },
    ],
  },
};

/* ------------------ CSV EXPORT ------------------ */
function exportCSV(records, filename) {
  if (!records || !records.length) return;
  const headers = Object.keys(records[0]).join(",");
  const rows = records.map((r) => Object.values(r).join(","));
  const csv = [headers, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
}

/* ------------------ MODAL ------------------ */
function DetailModal({ title, records, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <div className="flex justify-between mb-4">
          <h3 className="text-lg font-bold text-indigo-700">{title}</h3>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="space-y-2">
          {records.map((r, i) => (
            <div key={i} className="flex justify-between p-3 border rounded">
              <span>{r.type}</span>
              <span className="font-bold text-indigo-700">
                {r.count || r.amount}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={() => exportCSV(records, `${title}.csv`)}
          className="mt-5 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
        >
          Download {title} CSV
        </button>
      </div>
    </div>
  );
}

/* ------------------ MAIN ------------------ */
export default function AdminReports() {
  const [selected, setSelected] = useState("totalUsers");
  const [modal, setModal] = useState(null);

  const cards = [
    { id: "totalUsers", title: "Total Users", value: "12,450", icon: Users },
    { id: "customers", title: "Customers", value: "7,230", icon: UserCheck },
    { id: "builders", title: "Builders", value: "5,220", icon: Shield },
    {
      id: "activeUsers",
      title: "Active Users",
      value: "6,901",
      icon: Activity,
    },
    { id: "pending", title: "Pending Review", value: "214", icon: FileText },
    { id: "suspended", title: "Suspended", value: "87", icon: UserX },
    { id: "otp", title: "OTP Requests", value: "38,120", icon: Key },
    { id: "sales", title: "Total Sales", value: "KES 4.2M", icon: DollarSign },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-indigo-800">System Reports</h1>
          <p className="text-sm text-gray-500">
            Platform activity & user lifecycle insights
          </p>
        </div>

        <div className="flex gap-3">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="border rounded px-3 py-2"
          >
            {Object.entries(DATASETS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>

          <button
            onClick={() =>
              exportCSV(DATASETS[selected].records, `${selected}.csv`)
            }
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div
            key={c.id}
            onClick={() => setModal(c.id)}
            className="cursor-pointer bg-white rounded-xl shadow p-5 hover:ring-2 ring-indigo-400"
          >
            <div className="flex justify-between">
              <div>
                <p className="text-gray-500">{c.title}</p>
                <p className="text-2xl font-bold text-indigo-700">{c.value}</p>
              </div>
              <c.icon className="text-indigo-600" />
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <DetailModal
          title={DATASETS[modal].label}
          records={DATASETS[modal].records}
          onClose={() => setModal(null)}
        />
      )}
      {/* Lifecycle Section */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-indigo-700 mb-4">
          User Lifecycle Status
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {[
            ["Incomplete", 310],
            ["Complete", 10_120],
            ["Pending Review", 214],
            ["Verified", 9_804],
            ["Deactivated", 54],
            ["Suspended", 61],
            ["Rejected", 26],
          ].map(([label, value], i) => (
            <div
              key={i}
              className="p-4 border rounded-lg text-center hover:shadow"
            >
              <p className="text-gray-500">{label}</p>
              <p className="text-xl font-bold text-indigo-700">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Section */}
      <div className="bg-white rounded-xl shadow p-6 mt-8">
        <h2 className="text-lg font-semibold text-indigo-700 mb-4">
          What Has Happened (Audit Logs)
        </h2>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>✔ New user registrations</li>
          <li>✔ Profile approvals & rejections</li>
          <li>✔ Builder verifications</li>
          <li>✔ Order creations & payments</li>
          <li>✔ Account suspensions & deactivations</li>
        </ul>
      </div>
    </div>
  );
}
