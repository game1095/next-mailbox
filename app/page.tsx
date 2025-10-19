"use client";

import React, {
  useState,
  useMemo,
  ChangeEvent,
  FormEvent,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  PlusCircle,
  Search,
  Eye,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Github,
  X,
  BarChart2,
  Camera,
  CheckCircle,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  LocateFixed,
  Info,
  Sun,
  Moon,
} from "lucide-react";
import dynamic from "next/dynamic";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  ChartOptions,
  ChartData,
} from "chart.js";
import imageCompression from "browser-image-compression";
import Image from "next/image";
import { Map } from "leaflet";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

type MailboxType = "ก." | "ข." | "ค." | "ง." | "";

// ... (interfaces Mailbox, CleaningRecord, etc. ... same as before) ...
interface CleaningRecord {
  date: Date;
  cleanerName: string;
  beforeCleanImage?: string;
  afterCleanImage?: string;
}

interface Mailbox {
  id: number;
  postOffice: string;
  postalCode: string;
  jurisdiction: string;
  mailboxType: MailboxType;
  landmark: string;
  lat: number | string;
  lng: number | string;
  cleaningHistory: CleaningRecord[];
}

interface ApiCleaningRecord {
  date: string;
  cleanerName: string;
  beforeCleanImage?: string;
  afterCleanImage?: string;
}

interface ApiMailbox {
  id: number;
  postOffice: string;
  postalCode: string;
  jurisdiction: string;
  mailboxType: MailboxType;
  landmark: string;
  lat: number | string;
  lng: number | string;
  cleaning_history?: ApiCleaningRecord[];
}

type SortColumn =
  | "postOffice"
  | "landmark"
  | "jurisdiction"
  | "latestCleaningDate"
  | null;

const MAILBOX_TYPES: MailboxType[] = ["ก.", "ข.", "ค.", "ง."];

const JURISDICTIONS = [
  "ปจ.นครสวรรค์",
  "ปจ.อุทัยธานี",
  "ปจ.กำแพงเพชร",
  "ปจ.ตาก",
  "ปจ.สุโขทัย",
  "ปจ.พิษณุโลก",
  "ปจ.พิจิตร",
  "ปจ.เพชรบูรณ์",
];
const POST_OFFICES = [
  // ... (รายชื่อ ปณ. เหมือนเดิม) ...
  "ที่ทำการไปรษณีย์นครสวรรค์",
  "ที่ทำการไปรษณีย์สวรรค์วิถี",
  "ที่ทำการไปรษณีย์จิรประวัติ",
  "ที่ทำการไปรษณีย์หนองบัว",
  "ที่ทำการไปรษณีย์ชุมแสง",
  "ที่ทำการไปรษณีย์พยุหะคีรี",
  "ที่ทำการไปรษณีย์ตาคลี",
  "ที่ทำการไปรษณีย์ลาดยาว",
  "ที่ทำการไปรษณีย์ท่าตะโก",
  "ที่ทำการไปรษณีย์โกรกพระ",
  "ที่ทำการไปรษณีย์บรรพตพิสัย",
  "ที่ทำการไปรษณีย์ตากฟ้า",
  "ที่ทำการไปรษณีย์ช่องแค",
  "ที่ทำการไปรษณีย์ไพศาลี",
  "ที่ทำการไปรษณีย์เก้าเลี้ยว",
  "ที่ทำการไปรษณีย์หนองเบน",
  "ที่ทำการไปรษณีย์ทับกฤช",
  "ที่ทำการไปรษณีย์จันเสน",
  "ที่ทำการไปรษณีย์อุทัยธานี",
  "ที่ทำการไปรษณีย์หนองฉาง",
  "ที่ทำการไปรษณีย์ทัพทัน",
  "ที่ทำการไปรษณีย์หนองขาหย่าง",
  "ที่ทำการไปรษณีย์บ้านไร่",
  "ที่ทำการไปรษณีย์สว่างอารมณ์",
  "ที่ทำการไปรษณีย์ลานสัก",
  "ที่ทำการไปรษณีย์เขาบางแกรก",
  "ที่ทำการไปรษณีย์เมืองการุ้ง",
  "ที่ทำการไปรษณีย์กำแพงเพชร",
  "ที่ทำการไปรษณีย์พรานกระต่าย",
  "ที่ทำการไปรษณีย์คลองขลุง",
  "ที่ทำการไปรษณีย์ขาณุวรลักษบุรี",
  "ที่ทำการไปรษณีย์สลกบาตร",
  "ที่ทำการไปรษณีย์ไทรงาม",
  "ที่ทำการไปรษณีย์ปากดง",
  "ที่ทำการไปรษณีย์ลานกระบือ",
  "ที่ทำการไปรษณีย์คลองลาน",
  "ที่ทำการไปรษณีย์ทุ่งทราย",
  "ที่ทำการไปรษณีย์ระหาน",
  "ที่ทำการไปรษณีย์ตาก",
  "ที่ทำการไปรษณีย์แม่สอด",
  "ที่ทำการไปรษณีย์อินทรคีรี",
  "ที่ทำการไปรษณีย์บ้านตาก",
  "ที่ทำการไปรษณีย์สามเงา",
  "ที่ทำการไปรษณีย์แม่ระมาด",
  "ที่ทำการไปรษณีย์ท่าสองยาง",
  "ที่ทำการไปรษณีย์พบพระ",
  "ที่ทำการไปรษณีย์อุ้มผาง",
  "ที่ทำการไปรษณีย์วังเจ้า",
  "ที่ทำการไปรษณีย์สุโขทัย",
  "ที่ทำการไปรษณีย์สวรรคโลก",
  "ที่ทำการไปรษณีย์ศรีสำโรง",
  "ที่ทำการไปรษณีย์ศรีสัชนาลัย",
  "ที่ทำการไปรษณีย์บ้านด่านลานหอย",
  "ที่ทำการไปรษณีย์ทุ่งเสลี่ยม",
  "ที่ทำการไปรษณีย์คีรีมาศ",
  "ที่ทำการไปรษณีย์กงไกรลาศ",
  "ที่ทำการไปรษณีย์ศรีนคร",
  "ที่ทำการไปรษณีย์ท่าชัย",
  "ที่ทำการไปรษณีย์เมืองเก่า",
  "ที่ทำการไปรษณีย์บ้านสวน",
  "ที่ทำการไปรษณีย์บ้านใหม่ไชยมงคล",
  "ที่ทำการไปรษณีย์พิษณุโลก",
  "ที่ทำการไปรษณีย์อรัญญิก",
  "ที่ทำการไปรษณีย์บางกระทุ่ม",
  "ที่ทำการไปรษณีย์นครไทย",
  "ที่ทำการไปรษณีย์วังทอง",
  "ที่ทำการไปรษณีย์บางระกำ",
  "ที่ทำการไปรษณีย์พรหมพิราม",
  "ที่ทำการไปรษณีย์วัดโบสถ์",
  "ที่ทำการไปรษณีย์ชาติตระการ",
  "ที่ทำการไปรษณีย์หนองตม",
  "ที่ทำการไปรษณีย์เนินมะปราง",
  "ที่ทำการไปรษณีย์เนินกุ่ม",
  "ที่ทำการไปรษณีย์แก่งโสภา",
  "ที่ทำการไปรษณีย์วัดพริก",
  "ที่ทำการไปรษณีย์ชุมแสงสงคราม",
  "ที่ทำการไปรษณีย์พิจิตร",
  "ที่ทำการไปรษณีย์ตะพานหิน",
  "ที่ทำการไปรษณีย์บางมูลนาก",
  "ที่ทำการไปรษณีย์โพทะเล",
  "ที่ทำการไปรษณีย์สามง่าม",
  "ที่ทำการไปรษณีย์ทับคล้อ",
  "ที่ทำการไปรษณีย์สากเหล็ก",
  "ที่ทำการไปรษณีย์หัวดง",
  "ที่ทำการไปรษณีย์วังทรายพูน",
  "ที่ทำการไปรษณีย์โพธิ์ประทับช้าง",
  "ที่ทำการไปรษณีย์วังตะกู",
  "ที่ทำการไปรษณีย์กำแพงดิน",
  "ที่ทำการไปรษณีย์เขาทราย",
  "ที่ทำการไปรษณีย์เพชรบูรณ์",
  "ที่ทำการไปรษณีย์หล่มสัก",
  "ที่ทำการไปรษณีย์หล่มเก่า",
  "ที่ทำการไปรษณีย์วิเชียรบุรี",
  "ที่ทำการไปรษณีย์หนองไผ่",
  "ที่ทำการไปรษณีย์ชนแดน",
  "ที่ทำการไปรษณีย์บึงสามพัน",
  "ที่ทำการไปรษณีย์ศรีเทพ",
  "ที่ทำการไปรษณีย์พุเตย",
  "ที่ทำการไปรษณีย์ดงขุย",
  "ที่ทำการไปรษณีย์วังชมภู",
  "ที่ทำการไปรษณีย์นาเฉลียง",
  "ที่ทำการไปรษณีย์วังพิกุล",
  "ที่ทำการไปรษณีย์วังโป่ง",
  "ที่ทำการไปรษณีย์ท่าพล",
  "ที่ทำการไปรษณีย์น้ำหนาว",
  "ที่ทำการไปรษณีย์เขาค้อ",
  "ที่ทำการไปรษณีย์แคมป์สน",
];

// --- Helper Function to Format Date ---
const formatDateToThai = (date: Date) => {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

// --- Dynamic Import for Map Component ---
const MailboxMap = dynamic(() => import("@/components/MailboxMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex justify-center items-center bg-gray-700">
      <p className="text-gray-300">กำลังโหลดแผนที่...</p>
    </div>
  ),
});

// Dynamic Import for FormMapPicker
const FormMapPicker = dynamic(() => import("@/components/FormMapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full bg-gray-700 animate-pulse rounded-md flex items-center justify-center">
      <p className="text-gray-300">กำลังโหลดแผนที่...</p>
    </div>
  ),
});

// --- Dashboard Component ---
const Dashboard = ({
  theme,
  mailboxes,
  jurisdictions,
  onShowOverdueClick,
  onReportClick,
}: {
  theme: "dark" | "light";
  mailboxes: Mailbox[];
  jurisdictions: string[];
  onShowOverdueClick: () => void;
  onReportClick: (mailboxId: number) => void;
}) => {
  const [dashboardJurisdictionFilter, setDashboardJurisdictionFilter] =
    useState<string>("");

  const chartTextColor = theme === "dark" ? "#d1d5db" : "#475569";
  const chartGridColor = theme === "dark" ? "#374151" : "#e2e8f0";
  const accentColor =
    theme === "dark"
      ? {
          bg: "rgba(220, 38, 38, 0.7)", // red-600
          border: "rgba(185, 28, 28, 1)", // red-700
        }
      : {
          bg: "rgba(59, 130, 246, 0.7)", // blue-500
          border: "rgba(37, 99, 235, 1)", // blue-700
        };

  const filteredMailboxesForDashboard = useMemo(() => {
    return dashboardJurisdictionFilter
      ? mailboxes.filter((m) => m.jurisdiction === dashboardJurisdictionFilter)
      : mailboxes;
  }, [mailboxes, dashboardJurisdictionFilter]);

  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0, color: chartTextColor },
        grid: { color: chartGridColor },
      },
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45,
          color: chartTextColor,
        },
        grid: { color: chartGridColor },
      },
    },
  };
  const pieChartOptions: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: { color: chartTextColor },
      },
    },
  };

  const postOfficeData: ChartData<"bar"> = useMemo(() => {
    const counts = filteredMailboxesForDashboard.reduce(
      (acc, { postOffice }) => {
        acc[postOffice] = (acc[postOffice] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    return {
      labels: Object.keys(counts),
      datasets: [
        {
          label: "จำนวนตู้",
          data: Object.values(counts),
          backgroundColor: accentColor.bg,
          borderColor: accentColor.border,
          borderWidth: 1,
        },
      ],
    };
  }, [filteredMailboxesForDashboard, accentColor]);

  const jurisdictionData: ChartData<"pie"> = useMemo(() => {
    const counts = mailboxes.reduce((acc, { jurisdiction }) => {
      acc[jurisdiction] = (acc[jurisdiction] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return {
      labels: Object.keys(counts),
      datasets: [
        {
          label: "จำนวนตู้",
          data: Object.values(counts),
          backgroundColor: [
            "rgba(59, 130, 246, 0.7)",
            "rgba(239, 68, 68, 0.7)",
            "rgba(245, 158, 11, 0.7)",
            "rgba(16, 185, 129, 0.7)",
            "rgba(139, 92, 246, 0.7)",
            "rgba(236, 72, 153, 0.7)",
            "rgba(14, 165, 233, 0.7)",
            "rgba(99, 102, 241, 0.7)",
          ],
          borderColor: theme === "dark" ? "#1f2937" : "#ffffff",
          borderWidth: 2,
        },
      ],
    };
  }, [mailboxes, theme]);

  const mailboxTypeData: ChartData<"pie"> = useMemo(() => {
    const counts = filteredMailboxesForDashboard.reduce(
      (acc, { mailboxType }) => {
        if (mailboxType) {
          acc[mailboxType] = (acc[mailboxType] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>
    );
    return {
      labels: Object.keys(counts),
      datasets: [
        {
          label: "จำนวนตู้",
          data: Object.values(counts),
          backgroundColor: [
            "rgba(59, 130, 246, 0.7)",
            "rgba(16, 185, 129, 0.7)",
            "rgba(245, 158, 11, 0.7)",
            "rgba(139, 92, 246, 0.7)",
          ],
          borderColor: theme === "dark" ? "#1f2937" : "#ffffff",
          borderWidth: 2,
        },
      ],
    };
  }, [filteredMailboxesForDashboard, theme]);

  const overdueMailboxes = useMemo(() => {
    return filteredMailboxesForDashboard.filter((m) => {
      const latestCleaningDate = m.cleaningHistory[0]?.date;
      if (!latestCleaningDate) return true;
      const today = new Date();
      const lastCleaned = new Date(latestCleaningDate);
      today.setHours(0, 0, 0, 0);
      lastCleaned.setHours(0, 0, 0, 0);
      const diffTime = today.getTime() - lastCleaned.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 90;
    });
  }, [filteredMailboxesForDashboard]);

  const comparisonChartData: ChartData<"bar"> = useMemo(() => {
    const total = filteredMailboxesForDashboard.length;
    const overdue = overdueMailboxes.length;
    const clean = total - overdue;
    return {
      labels: ["ตู้ที่รายงานแล้ว (ปกติ)", "ตู้ที่ค้างรายงาน (เกิน 90 วัน)"],
      datasets: [
        {
          label: "จำนวนตู้",
          data: [clean, overdue],
          backgroundColor: [
            "rgba(16, 185, 129, 0.7)", // emerald-500
            "rgba(239, 68, 68, 0.7)", // red-500
          ],
          borderColor: ["rgba(16, 185, 129, 1)", "rgba(239, 68, 68, 1)"],
          borderWidth: 1,
        },
      ],
    };
  }, [filteredMailboxesForDashboard, overdueMailboxes]);

  const comparisonChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y",
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `ภาพรวมตู้${
          dashboardJurisdictionFilter
            ? `ใน ${dashboardJurisdictionFilter}`
            : "ทั้งหมด"
        } (${filteredMailboxesForDashboard.length} ตู้)`,
        font: { size: 14 },
        color: chartTextColor,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { precision: 0, color: chartTextColor },
        grid: { color: chartGridColor },
      },
      y: {
        ticks: { color: chartTextColor },
        grid: { color: chartGridColor },
      },
    },
  };

  return (
    <div
      className={`${
        theme === "dark" ? "bg-gray-800" : "bg-white shadow-lg"
      } rounded-xl shadow-xl p-4 space-y-6`}
    >
      <div className="flex justify-between items-center">
        <h2
          className={`${
            theme === "dark" ? "text-gray-100" : "text-slate-900"
          } text-lg font-semibold flex items-center gap-2`}
        >
          <BarChart2
            size={18}
            className={theme === "dark" ? "text-red-500" : "text-blue-600"}
          />{" "}
          Dashboard
        </h2>
        <select
          value={dashboardJurisdictionFilter}
          onChange={(e) => setDashboardJurisdictionFilter(e.target.value)}
          className={`p-2 border rounded-md text-sm shadow-sm ${
            theme === "dark"
              ? "border-gray-700 bg-gray-700 text-gray-100 focus:ring-red-600"
              : "border-slate-300 bg-white text-slate-900 focus:ring-blue-500"
          }`}
        >
          <option value="">กรองตามสังกัด (ทั้งหมด)</option>
          {jurisdictions.map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div
          className={`${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          } lg:col-span-2 border-l-4 border-red-500 p-4 rounded-lg shadow-sm flex flex-col`}
        >
          <div
            onClick={onShowOverdueClick}
            className="flex items-center gap-3 cursor-pointer"
            title="คลิกเพื่อกรองในตารางด้านบน"
          >
            <AlertTriangle size={20} className="text-red-500" />
            <h3
              className={`text-base font-semibold ${
                theme === "dark" ? "text-red-400" : "text-red-600"
              }`}
            >
              ตู้ที่ไม่ได้ทำความสะอาดเกิน 90 วัน
            </h3>
          </div>
          <p className="text-4xl font-bold text-red-500 mt-2">
            {overdueMailboxes.length} ตู้
          </p>
          <p
            onClick={onShowOverdueClick}
            className={`text-xs mt-1 cursor-pointer hover:underline ${
              theme === "dark" ? "text-red-400" : "text-red-500"
            }`}
          >
            คลิกเพื่อกรองในตาราง
          </p>
          <div
            className={`mt-4 pt-4 space-y-3 max-h-[350px] overflow-y-auto pr-2 flex-grow ${
              theme === "dark"
                ? "border-t border-gray-700"
                : "border-t border-slate-200"
            }`}
          >
            <h4
              className={`text-sm font-semibold ${
                theme === "dark" ? "text-gray-200" : "text-slate-700"
              }`}
            >
              รายชื่อตู้ที่ค้างดำเนินการ:
            </h4>
            {overdueMailboxes.length > 0 ? (
              overdueMailboxes.map((mailbox) => (
                <div
                  key={mailbox.id}
                  className={`p-3 rounded-md border shadow-sm ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <p
                      className={`font-semibold text-sm pr-2 break-words ${
                        theme === "dark" ? "text-gray-200" : "text-slate-800"
                      }`}
                    >
                      {mailbox.postOffice}
                    </p>
                    <button
                      onClick={() => onReportClick(mailbox.id)}
                      className={`flex-shrink-0 flex items-center gap-1.5 text-xs text-white font-semibold px-3 py-1.5 rounded-md shadow-sm transition-colors ${
                        theme === "dark"
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                      title="รายงานผลการทำความสะอาด"
                    >
                      <Camera size={14} />{" "}
                      <span className="hidden sm:inline">รายงาน</span>
                    </button>
                  </div>
                  <p
                    className={`text-xs break-words ${
                      theme === "dark" ? "text-gray-300" : "text-slate-500"
                    }`}
                  >
                    {mailbox.landmark}
                  </p>
                </div>
              ))
            ) : (
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-300" : "text-slate-600"
                }`}
              >
                ไม่มีตู้ที่ค้างทำความสะอาด{" "}
                {dashboardJurisdictionFilter
                  ? `ใน ${dashboardJurisdictionFilter}`
                  : ""}
              </p>
            )}
          </div>
        </div>
        <div
          className={`lg:col-span-3 border rounded-lg p-4 shadow-sm ${
            theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-slate-200"
          }`}
        >
          <div className="relative h-[450px]">
            <Bar options={comparisonChartOptions} data={comparisonChartData} />
          </div>
        </div>
      </div>

      <div
        className={`border rounded-lg p-4 shadow-sm ${
          theme === "dark"
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-slate-200"
        }`}
      >
        <h3
          className={`font-semibold text-center ${
            theme === "dark" ? "text-gray-200" : "text-slate-700"
          }`}
        >
          จำนวนตู้ฯ แยกตามที่ทำการ{" "}
          {dashboardJurisdictionFilter
            ? `ใน ${dashboardJurisdictionFilter}`
            : ""}
        </h3>
        <div className="relative h-96 mt-4">
          <Bar options={chartOptions} data={postOfficeData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className={`border rounded-lg p-4 shadow-sm ${
            theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-slate-200"
          }`}
        >
          <h3
            className={`font-semibold text-center ${
              theme === "dark" ? "text-gray-200" : "text-slate-700"
            }`}
          >
            สัดส่วนตู้ฯ แยกตามสังกัด (ทั้งหมด)
          </h3>
          <div className="relative h-64 mt-4">
            <Pie options={pieChartOptions} data={jurisdictionData} />
          </div>
        </div>
        <div
          className={`border rounded-lg p-4 shadow-sm ${
            theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-slate-200"
          }`}
        >
          <h3
            className={`font-semibold text-center ${
              theme === "dark" ? "text-gray-200" : "text-slate-700"
            }`}
          >
            สัดส่วนตู้ฯ แยกตามประเภท{" "}
            {dashboardJurisdictionFilter
              ? `ใน ${dashboardJurisdictionFilter}`
              : ""}
          </h3>
          <div className="relative h-64 mt-4">
            <Pie options={pieChartOptions} data={mailboxTypeData} />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Toast Notification Component ---
const Toast = ({
  message,
  onClose,
  theme,
}: {
  message: string;
  onClose: () => void;
  theme: "dark" | "light";
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div
      className={`fixed top-5 right-5 z-[100] px-4 py-3 rounded-lg shadow-xl border flex items-center gap-3 animate-slide-in ${
        theme === "dark"
          ? "bg-gray-700 text-gray-100 border-gray-600"
          : "bg-white text-slate-800 border-slate-200"
      }`}
    >
      <CheckCircle size={20} className="text-green-500" />{" "}
      <span>{message}</span>
    </div>
  );
};

export default function MailboxApp() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  // ... (other states ... same as before) ...
  const [selectedMapMailboxes, setSelectedMapMailboxes] = useState<Mailbox[]>(
    []
  );
  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });
  const [uploadProgress, setUploadProgress] = useState<{
    before: number;
    after: number;
  }>({ before: 0, after: 0 });

  const showToast = useCallback((message: string) => {
    setToast({ show: true, message });
  }, []);

  const fetchMailboxes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/mailboxes");
      if (!response.ok) throw new Error("Failed to fetch data");
      const data: ApiMailbox[] = await response.json();
      const formattedData = data.map((mailbox) => ({
        ...mailbox,
        cleaningHistory: (mailbox.cleaning_history || [])
          .map((record) => ({
            ...record,
            date: new Date(record.date),
          }))
          .sort((a, b) => b.date.getTime() - a.date.getTime()),
      }));
      setMailboxes(formattedData);
    } catch (error) {
      console.error("Fetch error:", error);
      showToast("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    setIsClient(true);
    fetchMailboxes();
  }, [fetchMailboxes]);

  const BLANK_MAILBOX_FORM = useMemo(
    () => ({
      postOffice: "",
      postalCode: "",
      jurisdiction: "",
      mailboxType: "" as MailboxType,
      landmark: "",
      lat: "",
      lng: "",
      cleaningHistory: [],
    }),
    []
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [jurisdictionFilter, setJurisdictionFilter] = useState<string>("");
  const [postOfficeFilter, setPostOfficeFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedMailbox, setSelectedMailbox] = useState<Mailbox | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [currentFormData, setCurrentFormData] =
    useState<Omit<Mailbox, "id">>(BLANK_MAILBOX_FORM);
  const [locationStatus, setLocationStatus] = useState<string>("");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportMailboxId, setReportMailboxId] = useState<number | null>(null);
  const [reportBeforeImage, setReportBeforeImage] = useState<string>("");
  const [reportAfterImage, setReportAfterImage] = useState<string>("");
  const [reportCleanerName, setReportCleanerName] = useState<string>("");
  const [reportDate, setReportDate] = useState<string>("");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [fullImageUrl, setFullImageUrl] = useState("");
  const ITEMS_PER_PAGE = 10;
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showOnlyOverdue, setShowOnlyOverdue] = useState(false);

  const formMapRef = useRef<Map | null>(null);

  // ... (all handler functions: filteredMailboxes, sortedMailboxes, paginatedMailboxes, handleSort, etc. ... same as before) ...
  const filteredMailboxes = useMemo(() => {
    let items = [...mailboxes];
    if (showOnlyOverdue) {
      items = items.filter((m) => {
        const latestCleaningDate = m.cleaningHistory[0]?.date;
        if (!latestCleaningDate) return true;
        const today = new Date();
        const lastCleaned = new Date(latestCleaningDate);
        today.setHours(0, 0, 0, 0);
        lastCleaned.setHours(0, 0, 0, 0);
        const diffTime = today.getTime() - lastCleaned.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 90;
      });
    }
    if (!showOnlyOverdue) {
      if (jurisdictionFilter)
        items = items.filter((m) => m.jurisdiction === jurisdictionFilter);
      if (postOfficeFilter)
        items = items.filter((m) => m.postOffice === postOfficeFilter);
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        items = items.filter(
          (m) =>
            m.postOffice.toLowerCase().includes(term) ||
            m.landmark.toLowerCase().includes(term) ||
            m.jurisdiction.toLowerCase().includes(term) ||
            m.postalCode.includes(term)
        );
      }
    }
    return items;
  }, [
    mailboxes,
    searchTerm,
    jurisdictionFilter,
    postOfficeFilter,
    showOnlyOverdue,
  ]);

  useEffect(() => {
    setSelectedMapMailboxes(filteredMailboxes);
  }, [filteredMailboxes]);

  const sortedMailboxes = useMemo(() => {
    if (!sortColumn) {
      return filteredMailboxes;
    }
    const getLatestDate = (m: Mailbox) => m.cleaningHistory[0]?.date;
    return [...filteredMailboxes].sort((a, b) => {
      if (sortColumn === "latestCleaningDate") {
        const aDate = getLatestDate(a);
        const bDate = getLatestDate(b);
        if (aDate && !bDate) return -1;
        if (!aDate && bDate) return 1;
        if (!aDate && !bDate) return 0;
        const comparison =
          (aDate as Date).getTime() - (bDate as Date).getTime();
        return sortDirection === "asc" ? comparison : -comparison;
      }
      if (
        sortColumn === "postOffice" ||
        sortColumn === "landmark" ||
        sortColumn === "jurisdiction"
      ) {
        const aVal = a[sortColumn] || "";
        const bVal = b[sortColumn] || "";
        const comparison = aVal.localeCompare(bVal, "th");
        return sortDirection === "asc" ? comparison : -comparison;
      }
      return 0;
    });
  }, [filteredMailboxes, sortColumn, sortDirection]);

  const paginatedMailboxes = useMemo(() => {
    return (sortedMailboxes || []).slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      (currentPage - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE
    );
  }, [currentPage, sortedMailboxes]);

  const totalPages = Math.ceil(
    (filteredMailboxes || []).length / ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    jurisdictionFilter,
    postOfficeFilter,
    sortColumn,
    sortDirection,
    showOnlyOverdue,
  ]);

  const handleSort = (column: SortColumn) => {
    if (!column) return;
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleShowOverdueClick = () => {
    setSearchTerm("");
    setJurisdictionFilter("");
    setPostOfficeFilter("");
    setShowOnlyOverdue(true);
  };

  const handleMapSelectionChange = (mailbox: Mailbox, checked: boolean) => {
    setSelectedMapMailboxes((prev) => {
      if (checked) {
        return [...prev, mailbox];
      } else {
        return prev.filter((item) => item.id !== mailbox.id);
      }
    });
  };

  const handleSelectAllFiltered = (checked: boolean) => {
    if (checked) {
      setSelectedMapMailboxes(filteredMailboxes);
    } else {
      setSelectedMapMailboxes([]);
    }
  };

  const handleFormInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    let finalValue: string | number = value;
    if (name === "lat" || name === "lng") {
      const parsed = parseFloat(value);
      finalValue = isNaN(parsed) ? "" : parsed;
    } else if (name === "postalCode") {
      finalValue = value.replace(/[^0-9]/g, "");
    }
    setCurrentFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleImageUpload = async (
    event: ChangeEvent<HTMLInputElement>,
    imageType: "before" | "after"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadProgress((prev) => ({ ...prev, [imageType]: 0 }));
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 800,
      useWebWorker: true,
      onProgress: (percent: number) => {
        setUploadProgress((prev) => ({ ...prev, [imageType]: percent }));
      },
    };
    try {
      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (imageType === "before")
          setReportBeforeImage(reader.result as string);
        if (imageType === "after") setReportAfterImage(reader.result as string);
        setUploadProgress((prev) => ({ ...prev, [imageType]: 100 }));
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Image compression failed:", error);
      alert("เกิดข้อผิดพลาดในการบีบอัดรูปภาพ");
      setUploadProgress((prev) => ({ ...prev, [imageType]: 0 }));
    }
  };

  const getCurrentLocation = useCallback(
    (onSuccess?: (lat: number, lng: number) => void) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = parseFloat(position.coords.latitude.toFixed(6));
          const lng = parseFloat(position.coords.longitude.toFixed(6));
          if (onSuccess) {
            onSuccess(lat, lng);
          } else {
            setCurrentFormData((prev) => ({ ...prev, lat: lat, lng: lng }));
          }
          setLocationStatus("ดึงพิกัดสำเร็จ!");
        },
        () => {
          setLocationStatus("ไม่สามารถเข้าถึงตำแหน่งได้");
        }
      );
    },
    []
  );

  const handleMapPositionChange = useCallback((lat: number, lng: number) => {
    setCurrentFormData((prev) => ({ ...prev, lat: lat, lng: lng }));
  }, []);

  const openFormModal = (mode: "add" | "edit", mailbox?: Mailbox) => {
    setFormMode(mode);
    setLocationStatus("");
    if (mode === "edit" && mailbox) {
      setCurrentFormData(mailbox);
      setIsFormModalOpen(true);
    } else {
      setCurrentFormData(BLANK_MAILBOX_FORM);
      setIsFormModalOpen(true);
      setTimeout(() => {
        getCurrentLocation((lat, lng) => {
          setCurrentFormData((prev) => ({ ...prev, lat: lat, lng: lng }));
        });
      }, 100);
    }
  };
  const closeFormModal = () => setIsFormModalOpen(false);

  const openDetailModal = (mailbox: Mailbox) => {
    setSelectedMailbox(mailbox);
    setIsDetailModalOpen(true);
  };
  const closeDetailModal = () => setIsDetailModalOpen(false);

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (
      !currentFormData.landmark ||
      !currentFormData.lat ||
      !currentFormData.lng ||
      !currentFormData.postalCode ||
      !currentFormData.postOffice ||
      !currentFormData.jurisdiction ||
      !currentFormData.mailboxType
    ) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน รวมถึงการเลือก/กรอกพิกัด");
      return;
    }
    const isEdit = formMode === "edit";
    const mailboxId = (currentFormData as Mailbox).id;
    const url = isEdit ? `/api/mailboxes/${mailboxId}` : "/api/mailboxes";
    const method = isEdit ? "PUT" : "POST";
    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...currentFormData, cleaningHistory: undefined }),
    });
    if (response.ok) {
      showToast(
        isEdit ? "แก้ไขข้อมูลเรียบร้อยแล้ว" : "บันทึกข้อมูลเรียบร้อยแล้ว"
      );
      fetchMailboxes();
      closeFormModal();
    } else {
      showToast("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  const openReportModal = (mailboxId: number) => {
    setReportMailboxId(mailboxId);
    setReportBeforeImage("");
    setReportAfterImage("");
    setReportCleanerName("");
    const today = new Date().toISOString().split("T")[0];
    setReportDate(today);
    setUploadProgress({ before: 0, after: 0 });
    setIsReportModalOpen(true);
  };
  const closeReportModal = () => {
    setIsReportModalOpen(false);
    setReportMailboxId(null);
  };

  const handleReportSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (
      !reportMailboxId ||
      !reportCleanerName ||
      !reportBeforeImage ||
      !reportAfterImage ||
      !reportDate
    ) {
      alert("กรุณากรอกข้อมูลและอัปโหลดรูปภาพให้ครบถ้วน");
      return;
    }
    const response = await fetch("/api/cleaning", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mailbox_id: reportMailboxId,
        cleanerName: reportCleanerName,
        date: reportDate,
        beforeCleanImage: reportBeforeImage,
        afterCleanImage: reportAfterImage,
      }),
    });
    if (response.ok) {
      showToast("รายงานผลเรียบร้อยแล้ว");
      fetchMailboxes();
      closeReportModal();
    } else {
      showToast("เกิดข้อผิดพลาดในการรายงานผล");
    }
  };

  const openImageModal = (imageUrl: string) => {
    setFullImageUrl(imageUrl);
    setIsImageModalOpen(true);
  };
  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setFullImageUrl("");
  };

  // --- 💡💡💡 FIX HERE: Added theme parameter and logic 💡💡💡 ---
  const getDateHighlightClass = (
    date?: Date,
    currentTheme?: "dark" | "light"
  ) => {
    const isDark = currentTheme === "dark";
    if (!date) {
      return isDark ? "bg-red-900/50 text-red-300" : "bg-red-100 text-red-700";
    }
    const today = new Date();
    const lastCleaned = new Date(date);
    today.setHours(0, 0, 0, 0);
    lastCleaned.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - lastCleaned.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 90) {
      return isDark ? "bg-red-900/50 text-red-300" : "bg-red-100 text-red-700";
    } else {
      return isDark
        ? "bg-green-900/50 text-green-300"
        : "bg-green-100 text-green-700";
    }
  };

  const SortIcon = ({ forColumn }: { forColumn: SortColumn }) => {
    if (sortColumn !== forColumn) {
      return <ArrowUpDown size={14} className="ml-1.5 opacity-30" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp size={14} className="ml-1.5" />
    ) : (
      <ChevronDown size={14} className="ml-1.5" />
    );
  };

  if (isLoading || !isClient) {
    return (
      <div
        className={`w-screen h-screen flex items-center justify-center ${
          theme === "dark" ? "bg-gray-900" : "bg-slate-100"
        }`}
      >
        <p
          className={`animate-pulse ${
            theme === "dark" ? "text-gray-300" : "text-slate-500"
          }`}
        >
          กำลังโหลด...
        </p>
      </div>
    );
  }

  return (
    <div
      className={`${
        theme === "dark"
          ? "bg-gray-900 text-gray-200"
          : "bg-slate-100 text-slate-800"
      } min-h-screen flex flex-col`}
    >
      {toast.show && (
        <Toast
          theme={theme}
          message={toast.message}
          onClose={() => setToast({ show: false, message: "" })}
        />
      )}
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <header className="flex justify-between items-center">
          <div>
            <h1
              className={`text-4xl font-semibold tracking-tight ${
                theme === "dark" ? "text-red-600" : "text-blue-600"
              }`}
            >
              ระบบบันทึกข้อมูลตู้ไปรษณีย์
            </h1>
            <p
              className={`${
                theme === "dark" ? "text-gray-300" : "text-slate-600"
              } mt-1`}
            >
              สำนักงานไปรษณีย์เขต 6
            </p>
          </div>
          {/* --- 💡💡💡 FIX HERE: Increased padding and icon size 💡💡💡 --- */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`p-3 rounded-full transition-colors ${
              // Changed p-2 to p-3
              theme === "dark"
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
            title={
              theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
            }
          >
            {theme === "dark" ? <Sun size={24} /> : <Moon size={24} />}{" "}
            {/* Changed size 20 to 24 */}
          </button>
        </header>

        <div
          className={`${
            theme === "dark" ? "bg-gray-800 shadow-xl" : "bg-white shadow-lg"
          } rounded-xl p-4 md:p-6 space-y-4`}
        >
          <h2
            className={`${
              theme === "dark" ? "text-gray-100" : "text-slate-900"
            } text-xl font-semibold flex items-center gap-2`}
          >
            <Info
              size={20}
              className={theme === "dark" ? "text-red-500" : "text-blue-600"}
            />{" "}
            ข้อมูลตู้ไปรษณีย์และจุดติดตั้ง
          </h2>

          <div className="flex flex-col xl:flex-row justify-between items-center gap-4">
            <div className="w-full flex-grow flex flex-col sm:flex-row gap-2">
              <div className="relative flex-grow">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="ค้นหา..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={showOnlyOverdue}
                  className={`w-full pl-10 pr-4 py-2 border rounded-md transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-red-600 focus:border-red-600"
                      : "bg-white border-slate-300 text-slate-900 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                />
              </div>
              <select
                value={jurisdictionFilter}
                onChange={(e) => setJurisdictionFilter(e.target.value)}
                disabled={showOnlyOverdue}
                className={`w-full sm:w-1/3 xl:w-auto p-2 border rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-red-600"
                    : "bg-white border-slate-300 text-slate-900 focus:ring-blue-500"
                }`}
              >
                <option value="">ทุกสังกัด</option>{" "}
                {JURISDICTIONS.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
              <div className="relative w-full sm:w-1/3 xl:w-auto">
                <input
                  type="text"
                  list="post-offices-list"
                  placeholder="ทุกที่ทำการ"
                  value={postOfficeFilter}
                  onChange={(e) => setPostOfficeFilter(e.target.value)}
                  disabled={showOnlyOverdue}
                  className={`w-full p-2 pr-8 border rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-red-600"
                      : "bg-white border-slate-300 text-slate-900 focus:ring-blue-500"
                  }`}
                />
                <datalist id="post-offices-list">
                  {POST_OFFICES.map((po) => (
                    <option key={po} value={po} />
                  ))}
                </datalist>
                {postOfficeFilter && !showOnlyOverdue && (
                  <button
                    onClick={() => setPostOfficeFilter("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-300"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              {showOnlyOverdue && (
                <button
                  onClick={() => setShowOnlyOverdue(false)}
                  className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 bg-red-900/50 text-red-400 font-semibold px-4 py-2 rounded-md hover:bg-red-900 transition-colors shadow-sm"
                  title="ล้างตัวกรองตู้ที่ไม่ได้ทำความสะอาดเกิน 90 วัน"
                >
                  <X size={16} />
                  <span className="hidden sm:inline">ล้างกรอง</span>
                </button>
              )}
            </div>
            <button
              onClick={() => openFormModal("add")}
              className={`w-full xl:w-auto flex-shrink-0 flex items-center justify-center gap-2 text-white font-semibold px-5 py-2 rounded-md transition-all duration-300 shadow-md hover:shadow-lg ${
                theme === "dark"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <PlusCircle size={16} />
              เพิ่มข้อมูล
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 pt-4">
            <div className="lg:w-3/5 w-full flex flex-col">
              <div
                className={`${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-slate-200"
                } rounded-xl border overflow-hidden flex-grow flex flex-col shadow-sm`}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead
                      className={
                        theme === "dark" ? "bg-gray-700" : "bg-slate-100"
                      }
                    >
                      <tr>
                        <th className="px-4 py-3 w-4">
                          <input
                            type="checkbox"
                            className={`h-4 w-4 rounded border ${
                              theme === "dark"
                                ? "border-gray-600 text-red-600 bg-gray-600 focus:ring-red-500"
                                : "border-slate-300 text-blue-600 bg-slate-100 focus:ring-blue-500"
                            }`}
                            checked={
                              filteredMailboxes.length > 0 &&
                              selectedMapMailboxes.length ===
                                filteredMailboxes.length
                            }
                            onChange={(e) =>
                              handleSelectAllFiltered(e.target.checked)
                            }
                          />
                        </th>
                        <th
                          className={`px-4 py-3 text-left font-semibold cursor-pointer transition-colors ${
                            theme === "dark"
                              ? "text-gray-200 hover:bg-gray-600"
                              : "text-slate-700 hover:bg-slate-200"
                          }`}
                          onClick={() => handleSort("postOffice")}
                        >
                          <div className="flex items-center">
                            ที่ทำการฯ
                            <SortIcon forColumn="postOffice" />
                          </div>
                        </th>
                        <th
                          className={`px-4 py-3 text-left font-semibold cursor-pointer transition-colors ${
                            theme === "dark"
                              ? "text-gray-200 hover:bg-gray-600"
                              : "text-slate-700 hover:bg-slate-200"
                          }`}
                          onClick={() => handleSort("landmark")}
                        >
                          <div className="flex items-center">
                            จุดสังเกต
                            <SortIcon forColumn="landmark" />
                          </div>
                        </th>
                        <th
                          className={`px-4 py-3 text-left font-semibold cursor-pointer transition-colors ${
                            theme === "dark"
                              ? "text-gray-200 hover:bg-gray-600"
                              : "text-slate-700 hover:bg-slate-200"
                          }`}
                          onClick={() => handleSort("jurisdiction")}
                        >
                          <div className="flex items-center">
                            สังกัด
                            <SortIcon forColumn="jurisdiction" />
                          </div>
                        </th>
                        <th
                          className={`px-4 py-3 text-left font-semibold cursor-pointer transition-colors ${
                            theme === "dark"
                              ? "text-gray-200 hover:bg-gray-600"
                              : "text-slate-700 hover:bg-slate-200"
                          }`}
                          onClick={() => handleSort("latestCleaningDate")}
                        >
                          <div className="flex items-center">
                            ทำความสะอาดล่าสุด
                            <SortIcon forColumn="latestCleaningDate" />
                          </div>
                        </th>
                        <th
                          className={`px-4 py-3 text-center font-semibold ${
                            theme === "dark"
                              ? "text-gray-200"
                              : "text-slate-700"
                          }`}
                        >
                          จัดการ
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className={
                        theme === "dark"
                          ? "divide-y divide-gray-700"
                          : "divide-y divide-slate-200"
                      }
                    >
                      {paginatedMailboxes.map((mailbox) => {
                        const latestCleaningDate =
                          mailbox.cleaningHistory[0]?.date;
                        return (
                          <tr
                            key={mailbox.id}
                            className={`${
                              theme === "dark"
                                ? "hover:bg-gray-700"
                                : "hover:bg-slate-50"
                            } transition-colors`}
                          >
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                className={`h-4 w-4 rounded border ${
                                  theme === "dark"
                                    ? "border-gray-600 text-red-600 bg-gray-600 focus:ring-red-500"
                                    : "border-slate-300 text-blue-600 bg-slate-100 focus:ring-blue-500"
                                }`}
                                checked={selectedMapMailboxes.some(
                                  (item) => item.id === mailbox.id
                                )}
                                onChange={(e) =>
                                  handleMapSelectionChange(
                                    mailbox,
                                    e.target.checked
                                  )
                                }
                              />
                            </td>
                            <td
                              className={`px-4 py-3 whitespace-nowrap font-medium ${
                                theme === "dark"
                                  ? "text-gray-100"
                                  : "text-slate-800"
                              }`}
                            >
                              {mailbox.postOffice}
                            </td>
                            <td
                              className={`px-4 py-3 min-w-[200px] ${
                                theme === "dark"
                                  ? "text-gray-300"
                                  : "text-slate-500"
                              }`}
                            >
                              {mailbox.landmark}
                            </td>
                            <td
                              className={`px-4 py-3 whitespace-nowrap ${
                                theme === "dark"
                                  ? "text-gray-300"
                                  : "text-slate-500"
                              }`}
                            >
                              {mailbox.jurisdiction}
                            </td>
                            <td
                              className={`px-4 py-3 whitespace-nowrap ${
                                theme === "dark"
                                  ? "text-gray-300"
                                  : "text-slate-500"
                              }`}
                            >
                              {/* --- 💡💡💡 FIX HERE: Passed theme to function 💡💡💡 --- */}
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getDateHighlightClass(
                                  latestCleaningDate,
                                  theme // Pass theme here
                                )}`}
                              >
                                {latestCleaningDate
                                  ? formatDateToThai(latestCleaningDate)
                                  : "ยังไม่มีการรายงาน"}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex justify-center items-center gap-1">
                                <button
                                  onClick={() => openDetailModal(mailbox)}
                                  className={`p-2 rounded-full transition-colors ${
                                    theme === "dark"
                                      ? "text-gray-300 hover:bg-gray-700 hover:text-red-400"
                                      : "text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                                  }`}
                                  title="ดูรายละเอียด"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={() => openFormModal("edit", mailbox)}
                                  className={`p-2 rounded-full transition-colors ${
                                    theme === "dark"
                                      ? "text-gray-300 hover:bg-gray-700 hover:text-red-400"
                                      : "text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                                  }`}
                                  title="แก้ไขข้อมูล"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  onClick={() => openReportModal(mailbox.id)}
                                  className={`p-2 rounded-full transition-colors ${
                                    theme === "dark"
                                      ? "text-gray-300 hover:bg-gray-700 hover:text-red-400"
                                      : "text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                                  }`}
                                  title="รายงานผลการทำความสะอาด"
                                >
                                  <Camera size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {totalPages > 0 && (
                  <div
                    className={`flex items-center justify-between border-t px-4 py-3 mt-auto ${
                      theme === "dark"
                        ? "border-gray-700 bg-gray-700/50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div>
                      <p
                        className={`text-sm ${
                          theme === "dark" ? "text-gray-300" : "text-slate-500"
                        }`}
                      >
                        แสดง{" "}
                        <span
                          className={`font-semibold ${
                            theme === "dark"
                              ? "text-gray-100"
                              : "text-slate-700"
                          }`}
                        >
                          {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                        </span>
                        -
                        <span
                          className={`font-semibold ${
                            theme === "dark"
                              ? "text-gray-100"
                              : "text-slate-700"
                          }`}
                        >
                          {Math.min(
                            currentPage * ITEMS_PER_PAGE,
                            filteredMailboxes.length
                          )}
                        </span>{" "}
                        จาก{" "}
                        <span
                          className={`font-semibold ${
                            theme === "dark"
                              ? "text-gray-100"
                              : "text-slate-700"
                          }`}
                        >
                          {filteredMailboxes.length}
                        </span>
                      </p>
                    </div>
                    {totalPages > 1 && (
                      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                        <button
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center rounded-l-md px-2 py-2 disabled:opacity-50 ${
                            theme === "dark"
                              ? "text-gray-400 hover:bg-gray-600"
                              : "text-slate-400 hover:bg-slate-100"
                          }`}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        {Array.from(
                          { length: Math.min(totalPages, 5) },
                          (_, i) => {
                            let page;
                            if (totalPages <= 5) {
                              page = i + 1;
                            } else {
                              if (currentPage <= 3) {
                                page = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                page = totalPages - 4 + i;
                              } else {
                                page = currentPage - 2 + i;
                              }
                            }
                            return (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                  currentPage === page
                                    ? theme === "dark"
                                      ? "z-10 bg-red-900/50 border-red-500 text-red-400"
                                      : "z-10 bg-blue-100 border-blue-500 text-blue-600"
                                    : theme === "dark"
                                    ? "text-gray-200 hover:bg-gray-600"
                                    : "text-slate-700 hover:bg-slate-100"
                                }`}
                              >
                                {page}
                              </button>
                            );
                          }
                        )}
                        <button
                          onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                          }
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center rounded-r-md px-2 py-2 disabled:opacity-50 ${
                            theme === "dark"
                              ? "text-gray-400 hover:bg-gray-600"
                              : "text-slate-400 hover:bg-slate-100"
                          }`}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </nav>
                    )}
                  </div>
                )}
                {filteredMailboxes.length === 0 && (
                  <p
                    className={`text-center p-12 ${
                      theme === "dark" ? "text-gray-300" : "text-slate-500"
                    }`}
                  >
                    ไม่พบข้อมูล
                  </p>
                )}
              </div>
            </div>
            <div
              className={`lg:w-2/5 w-full relative transition-all duration-300 ${
                isFormModalOpen || isDetailModalOpen || isReportModalOpen
                  ? "z-0"
                  : "z-10"
              }`}
            >
              <div
                className={`${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-slate-200"
                } rounded-xl border overflow-hidden p-4 space-y-4 h-full shadow-sm`}
              >
                <h2
                  className={`text-lg font-semibold ${
                    theme === "dark" ? "text-gray-100" : "text-slate-900"
                  }`}
                >
                  แผนที่แสดงผล ({selectedMapMailboxes.length} รายการ)
                </h2>
                <div
                  className={`w-full h-full min-h-[500px] rounded-lg overflow-hidden shadow-inner ${
                    theme === "dark" ? "bg-gray-700" : "bg-slate-100"
                  }`}
                >
                  <MailboxMap mailboxes={selectedMapMailboxes} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <Dashboard
          theme={theme}
          mailboxes={mailboxes}
          jurisdictions={JURISDICTIONS}
          onShowOverdueClick={handleShowOverdueClick}
          onReportClick={openReportModal}
        />
      </main>

      <footer className="mt-auto">
        <div
          className={`container mx-auto px-4 sm:px-6 py-6 flex justify-between items-center text-sm border-t ${
            theme === "dark"
              ? "text-gray-300 border-gray-700"
              : "text-slate-500 border-slate-200"
          }`}
        >
          <p className="flex items-center justify-center gap-1.5">
            Made with <span className="text-red-500">❤️</span> by Megamind
          </p>
          <a
            href="https://github.com/game1095/"
            target="_blank"
            rel="noopener noreferrer"
            className={`transition-colors ${
              theme === "dark" ? "hover:text-red-400" : "hover:text-blue-600"
            }`}
            aria-label="GitHub Repository"
          >
            <Github size={20} />
          </a>
        </div>
      </footer>

      {/* --- Modals --- */}
      {/* ... (Modal code remains the same, styles inside will follow theme) ... */}
      {/* Form Modal */}
      {isFormModalOpen && (
        <div
          className={`fixed inset-0 flex justify-center items-center z-50 p-4 ${
            theme === "dark"
              ? "bg-black/60 backdrop-blur-md"
              : "bg-slate-900/50 backdrop-blur-sm"
          }`}
        >
          <div
            className={`${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            } rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all animate-scale-in`}
          >
            <div
              className={`flex justify-between items-center px-6 py-5 border-b ${
                theme === "dark" ? "border-gray-700" : "border-slate-200"
              }`}
            >
              <h2
                className={`text-xl font-semibold ${
                  theme === "dark" ? "text-gray-100" : "text-slate-900"
                }`}
              >
                {formMode === "add"
                  ? "เพิ่มข้อมูลตู้ไปรษณีย์"
                  : "แก้ไขข้อมูลตู้ไปรษณีย์"}
              </h2>
              <button
                onClick={closeFormModal}
                className={`p-1 rounded-full ${
                  theme === "dark"
                    ? "text-gray-300 hover:bg-gray-700"
                    : "text-slate-400 hover:bg-slate-100"
                }`}
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={handleFormSubmit}
              className="p-6 space-y-5 overflow-y-auto"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      theme === "dark" ? "text-gray-200" : "text-slate-700"
                    }`}
                  >
                    ที่ทำการไปรษณีย์
                  </label>
                  <input
                    name="postOffice"
                    type="text"
                    list="form-post-offices-list"
                    value={currentFormData.postOffice}
                    onChange={handleFormInputChange}
                    className={`w-full p-2 border rounded-md shadow-sm ${
                      theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-red-600"
                        : "bg-white border-slate-300 text-slate-900 focus:ring-blue-500"
                    }`}
                    required
                  />
                  <datalist id="form-post-offices-list">
                    {POST_OFFICES.map((po) => (
                      <option key={po} value={po} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      theme === "dark" ? "text-gray-200" : "text-slate-700"
                    }`}
                  >
                    รหัสไปรษณีย์
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={currentFormData.postalCode}
                    onChange={handleFormInputChange}
                    maxLength={5}
                    placeholder="5 หลัก"
                    className={`w-full p-2 border rounded-md shadow-sm ${
                      theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-red-600"
                        : "bg-white border-slate-300 text-slate-900 focus:ring-blue-500"
                    }`}
                    required
                  />
                </div>
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    theme === "dark" ? "text-gray-200" : "text-slate-700"
                  }`}
                >
                  สังกัด
                </label>
                <select
                  name="jurisdiction"
                  value={currentFormData.jurisdiction}
                  onChange={handleFormInputChange}
                  className={`w-full p-2 border rounded-md shadow-sm ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-red-600"
                      : "bg-white border-slate-300 text-slate-900 focus:ring-blue-500"
                  }`}
                  required
                >
                  <option value="">-- เลือก --</option>{" "}
                  {JURISDICTIONS.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    theme === "dark" ? "text-gray-200" : "text-slate-700"
                  }`}
                >
                  ประเภทตู้
                </label>
                <select
                  name="mailboxType"
                  value={currentFormData.mailboxType}
                  onChange={handleFormInputChange}
                  className={`w-full p-2 border rounded-md shadow-sm ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-red-600"
                      : "bg-white border-slate-300 text-slate-900 focus:ring-blue-500"
                  }`}
                  required
                >
                  <option value="">-- เลือก --</option>{" "}
                  {MAILBOX_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    theme === "dark" ? "text-gray-200" : "text-slate-700"
                  }`}
                >
                  จุดสังเกตที่ตั้ง
                </label>
                <textarea
                  name="landmark"
                  value={currentFormData.landmark}
                  onChange={handleFormInputChange}
                  rows={3}
                  className={`w-full p-2 border rounded-md shadow-sm ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-red-600"
                      : "bg-white border-slate-300 text-slate-900 focus:ring-blue-500"
                  }`}
                  required
                ></textarea>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label
                    className={`block text-sm font-medium ${
                      theme === "dark" ? "text-gray-200" : "text-slate-700"
                    }`}
                  >
                    จุดพิกัด
                  </label>
                  <button
                    type="button"
                    onClick={() => getCurrentLocation()}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors border shadow-sm ${
                      theme === "dark"
                        ? "bg-red-900/50 text-red-300 border-red-800 hover:bg-red-900"
                        : "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200"
                    }`}
                  >
                    <LocateFixed size={14} /> ใช้ตำแหน่งปัจจุบัน
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="number"
                    step="any"
                    name="lat"
                    value={currentFormData.lat}
                    onChange={handleFormInputChange}
                    placeholder="ละติจูด"
                    className={`w-full p-2 border rounded-md shadow-sm font-mono text-sm ${
                      theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-red-600"
                        : "bg-white border-slate-300 text-slate-900 focus:ring-blue-500"
                    }`}
                    required
                  />
                  <input
                    type="number"
                    step="any"
                    name="lng"
                    value={currentFormData.lng}
                    onChange={handleFormInputChange}
                    placeholder="ลองจิจูด"
                    className={`w-full p-2 border rounded-md shadow-sm font-mono text-sm ${
                      theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-red-600"
                        : "bg-white border-slate-300 text-slate-900 focus:ring-blue-500"
                    }`}
                    required
                  />
                </div>
                <p
                  className={`text-xs mb-1 ${
                    theme === "dark" ? "text-gray-300" : "text-slate-500"
                  }`}
                >
                  หรือ คลิก/ลากหมุดบนแผนที่:
                </p>
                <FormMapPicker
                  initialLat={currentFormData.lat}
                  initialLng={currentFormData.lng}
                  onPositionChange={handleMapPositionChange}
                  mapRef={formMapRef}
                />
                {locationStatus && (
                  <p
                    className={`text-xs mt-2 ${
                      theme === "dark" ? "text-gray-300" : "text-slate-500"
                    }`}
                  >
                    {locationStatus}
                  </p>
                )}
              </div>
              <div
                className={`flex justify-end gap-3 p-4 -m-6 mt-6 rounded-b-xl border-t ${
                  theme === "dark"
                    ? "bg-gray-700/50 border-gray-700"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <button
                  type="button"
                  onClick={closeFormModal}
                  className={`px-5 py-2 font-semibold rounded-md transition-colors border shadow-sm ${
                    theme === "dark"
                      ? "bg-gray-600 text-gray-100 border-gray-500 hover:bg-gray-500"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white font-semibold rounded-md transition-colors shadow-md hover:shadow-lg ${
                    theme === "dark"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Detail Modal */}
      {isDetailModalOpen && selectedMailbox && (
        <div
          className={`fixed inset-0 flex justify-center items-center z-50 p-4 ${
            theme === "dark"
              ? "bg-black/60 backdrop-blur-md"
              : "bg-slate-900/50 backdrop-blur-sm"
          }`}
        >
          <div
            className={`${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            } rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col transform transition-all animate-scale-in`}
          >
            <div
              className={`flex justify-between items-center px-6 py-5 border-b ${
                theme === "dark" ? "border-gray-700" : "border-slate-200"
              }`}
            >
              <h2
                className={`text-xl font-semibold ${
                  theme === "dark" ? "text-gray-100" : "text-slate-900"
                }`}
              >
                รายละเอียดตู้ไปรษณีย์
              </h2>
              <button
                onClick={closeDetailModal}
                className={`p-1 rounded-full ${
                  theme === "dark"
                    ? "text-gray-300 hover:bg-gray-700"
                    : "text-slate-400 hover:bg-slate-100"
                }`}
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3
                      className={`text-sm font-semibold ${
                        theme === "dark" ? "text-gray-300" : "text-slate-500"
                      }`}
                    >
                      ที่ทำการไปรษณีย์
                    </h3>
                    <p
                      className={`text-base ${
                        theme === "dark" ? "text-gray-100" : "text-slate-900"
                      }`}
                    >
                      {selectedMailbox.postOffice} ({selectedMailbox.postalCode}
                      )
                    </p>
                  </div>
                  <div>
                    <h3
                      className={`text-sm font-semibold ${
                        theme === "dark" ? "text-gray-300" : "text-slate-500"
                      }`}
                    >
                      สังกัด
                    </h3>
                    <p
                      className={`text-base ${
                        theme === "dark" ? "text-gray-100" : "text-slate-900"
                      }`}
                    >
                      {selectedMailbox.jurisdiction}
                    </p>
                  </div>
                  <div>
                    <h3
                      className={`text-sm font-semibold ${
                        theme === "dark" ? "text-gray-300" : "text-slate-500"
                      }`}
                    >
                      ประเภทตู้
                    </h3>
                    <p
                      className={`text-base ${
                        theme === "dark" ? "text-gray-100" : "text-slate-900"
                      }`}
                    >
                      {selectedMailbox.mailboxType}
                    </p>
                  </div>
                  <div>
                    <h3
                      className={`text-sm font-semibold ${
                        theme === "dark" ? "text-gray-300" : "text-slate-500"
                      }`}
                    >
                      จุดสังเกต
                    </h3>
                    <p
                      className={`text-base ${
                        theme === "dark" ? "text-gray-100" : "text-slate-900"
                      }`}
                    >
                      {selectedMailbox.landmark}
                    </p>
                  </div>
                  <div>
                    <h3
                      className={`text-sm font-semibold ${
                        theme === "dark" ? "text-gray-300" : "text-slate-500"
                      }`}
                    >
                      พิกัด
                    </h3>
                    <p
                      className={`text-base font-mono ${
                        theme === "dark" ? "text-gray-100" : "text-slate-900"
                      }`}
                    >
                      {selectedMailbox.lat}, {selectedMailbox.lng}
                    </p>
                  </div>
                </div>
                <div>
                  <h3
                    className={`text-sm font-semibold mb-2 ${
                      theme === "dark" ? "text-gray-300" : "text-slate-500"
                    }`}
                  >
                    ตำแหน่งบนแผนที่
                  </h3>
                  <div
                    className={`w-full h-96 rounded-lg overflow-hidden border shadow-inner ${
                      theme === "dark"
                        ? "border-gray-700 bg-gray-700"
                        : "border-slate-200 bg-slate-100"
                    }`}
                  >
                    <iframe
                      width="100%"
                      height="100%"
                      loading="lazy"
                      allowFullScreen
                      src={`https://maps.google.com/maps?q=${selectedMailbox.lat},${selectedMailbox.lng}&hl=th&z=15&output=embed`}
                    ></iframe>
                  </div>
                </div>
              </div>
              <div
                className={`pt-6 mt-6 border-t ${
                  theme === "dark" ? "border-gray-700" : "border-slate-200"
                }`}
              >
                <h3
                  className={`text-lg font-semibold mb-4 ${
                    theme === "dark" ? "text-gray-100" : "text-slate-900"
                  }`}
                >
                  ประวัติการทำความสะอาด
                </h3>
                {selectedMailbox.cleaningHistory.length === 0 ? (
                  <p
                    className={
                      theme === "dark" ? "text-gray-300" : "text-slate-500"
                    }
                  >
                    ยังไม่มีประวัติ
                  </p>
                ) : (
                  <div
                    className={`overflow-x-auto rounded-xl border shadow-sm ${
                      theme === "dark" ? "border-gray-700" : "border-slate-200"
                    }`}
                  >
                    <table className="w-full text-sm">
                      <thead
                        className={
                          theme === "dark" ? "bg-gray-700" : "bg-slate-100"
                        }
                      >
                        <tr>
                          <th
                            className={`px-4 py-3 text-left font-semibold w-12 ${
                              theme === "dark"
                                ? "text-gray-200"
                                : "text-slate-700"
                            }`}
                          >
                            ลำดับ
                          </th>
                          <th
                            className={`px-4 py-3 text-left font-semibold ${
                              theme === "dark"
                                ? "text-gray-200"
                                : "text-slate-700"
                            }`}
                          >
                            วันที่
                          </th>
                          <th
                            className={`px-4 py-3 text-center font-semibold ${
                              theme === "dark"
                                ? "text-gray-200"
                                : "text-slate-700"
                            }`}
                          >
                            ก่อนทำ
                          </th>
                          <th
                            className={`px-4 py-3 text-center font-semibold ${
                              theme === "dark"
                                ? "text-gray-200"
                                : "text-slate-700"
                            }`}
                          >
                            หลังทำ
                          </th>
                          <th
                            className={`px-4 py-3 text-left font-semibold ${
                              theme === "dark"
                                ? "text-gray-200"
                                : "text-slate-700"
                            }`}
                          >
                            ผู้รับผิดชอบ
                          </th>
                        </tr>
                      </thead>
                      <tbody
                        className={
                          theme === "dark"
                            ? "divide-y divide-gray-700"
                            : "divide-y divide-slate-200"
                        }
                      >
                        {selectedMailbox.cleaningHistory.map(
                          (record, index) => (
                            <tr
                              key={index}
                              className={`${
                                theme === "dark"
                                  ? "hover:bg-gray-700/50"
                                  : "hover:bg-slate-50"
                              } transition-colors`}
                            >
                              <td
                                className={`px-4 py-3 whitespace-nowrap font-medium ${
                                  theme === "dark"
                                    ? "text-gray-100"
                                    : "text-slate-800"
                                }`}
                              >
                                {index + 1}
                              </td>
                              <td
                                className={`px-4 py-3 whitespace-nowrap ${
                                  theme === "dark"
                                    ? "text-gray-200"
                                    : "text-slate-600"
                                }`}
                              >
                                {formatDateToThai(record.date)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {record.beforeCleanImage ? (
                                  <Image
                                    src={record.beforeCleanImage}
                                    alt="Before"
                                    width={64}
                                    height={64}
                                    className={`w-16 h-16 object-cover rounded-lg cursor-pointer mx-auto border ${
                                      theme === "dark"
                                        ? "border-gray-600"
                                        : "border-slate-200"
                                    }`}
                                    onClick={() =>
                                      openImageModal(
                                        record.beforeCleanImage as string
                                      )
                                    }
                                  />
                                ) : (
                                  <span
                                    className={
                                      theme === "dark"
                                        ? "text-gray-500"
                                        : "text-slate-400"
                                    }
                                  >
                                    -
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {record.afterCleanImage ? (
                                  <Image
                                    src={record.afterCleanImage}
                                    alt="After"
                                    width={64}
                                    height={64}
                                    className={`w-16 h-16 object-cover rounded-lg cursor-pointer mx-auto border ${
                                      theme === "dark"
                                        ? "border-gray-600"
                                        : "border-slate-200"
                                    }`}
                                    onClick={() =>
                                      openImageModal(
                                        record.afterCleanImage as string
                                      )
                                    }
                                  />
                                ) : (
                                  <span
                                    className={
                                      theme === "dark"
                                        ? "text-gray-500"
                                        : "text-slate-400"
                                    }
                                  >
                                    -
                                  </span>
                                )}
                              </td>
                              <td
                                className={`px-4 py-3 whitespace-nowrap ${
                                  theme === "dark"
                                    ? "text-gray-200"
                                    : "text-slate-600"
                                }`}
                              >
                                {record.cleanerName}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
            <div
              className={`flex justify-end gap-3 p-4 rounded-b-xl border-t ${
                theme === "dark"
                  ? "bg-gray-700/50 border-gray-700"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <button
                type="button"
                onClick={closeDetailModal}
                className={`px-5 py-2 font-semibold rounded-md transition-colors border shadow-sm ${
                  theme === "dark"
                    ? "bg-gray-600 text-gray-100 border-gray-500 hover:bg-gray-500"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                }`}
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Report Modal */}
      {isReportModalOpen && (
        <div
          className={`fixed inset-0 flex justify-center items-center z-50 p-4 ${
            theme === "dark"
              ? "bg-black/60 backdrop-blur-md"
              : "bg-slate-900/50 backdrop-blur-sm"
          }`}
        >
          <div
            className={`${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            } rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all animate-scale-in`}
          >
            <div
              className={`flex justify-between items-center px-6 py-5 border-b ${
                theme === "dark" ? "border-gray-700" : "border-slate-200"
              }`}
            >
              <h2
                className={`text-xl font-semibold ${
                  theme === "dark" ? "text-gray-100" : "text-slate-900"
                }`}
              >
                รายงานผลการทำความสะอาด
              </h2>
              <button
                onClick={closeReportModal}
                className={`p-1 rounded-full ${
                  theme === "dark"
                    ? "text-gray-300 hover:bg-gray-700"
                    : "text-slate-400 hover:bg-slate-100"
                }`}
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={handleReportSubmit}
              className="p-6 space-y-5 overflow-y-auto"
            >
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    theme === "dark" ? "text-gray-200" : "text-slate-700"
                  }`}
                >
                  วันที่รายงาน
                </label>
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className={`w-full p-2 border rounded-md shadow-sm ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-red-600"
                      : "bg-white border-slate-300 text-slate-900 focus:ring-blue-500"
                  }`}
                  required
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    theme === "dark" ? "text-gray-200" : "text-slate-700"
                  }`}
                >
                  รูปภาพก่อนทำความสะอาด
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "before")}
                  className={`w-full text-sm ${
                    theme === "dark" ? "text-gray-300" : "text-slate-500"
                  } file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold ${
                    theme === "dark"
                      ? "file:bg-red-900/50 file:text-red-300 hover:file:bg-red-900"
                      : "file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                  }`}
                  required
                />
                {uploadProgress.before > 0 && (
                  <div
                    className={`mt-2 w-full rounded-full h-2.5 ${
                      theme === "dark" ? "bg-gray-700" : "bg-slate-200"
                    }`}
                  >
                    <div
                      className={`h-2.5 rounded-full ${
                        theme === "dark" ? "bg-red-600" : "bg-blue-600"
                      }`}
                      style={{ width: `${uploadProgress.before}%` }}
                    ></div>
                  </div>
                )}
                {reportBeforeImage && (
                  <Image
                    src={reportBeforeImage}
                    alt="Before Preview"
                    width={128}
                    height={128}
                    className={`mt-2 w-32 h-32 object-cover rounded-lg border ${
                      theme === "dark" ? "border-gray-600" : "border-slate-200"
                    }`}
                  />
                )}
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    theme === "dark" ? "text-gray-200" : "text-slate-700"
                  }`}
                >
                  รูปภาพหลังทำความสะอาด
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "after")}
                  className={`w-full text-sm ${
                    theme === "dark" ? "text-gray-300" : "text-slate-500"
                  } file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold ${
                    theme === "dark"
                      ? "file:bg-red-900/50 file:text-red-300 hover:file:bg-red-900"
                      : "file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                  }`}
                  required
                />
                {uploadProgress.after > 0 && (
                  <div
                    className={`mt-2 w-full rounded-full h-2.5 ${
                      theme === "dark" ? "bg-gray-700" : "bg-slate-200"
                    }`}
                  >
                    <div
                      className={`h-2.5 rounded-full ${
                        theme === "dark" ? "bg-red-600" : "bg-blue-600"
                      }`}
                      style={{ width: `${uploadProgress.after}%` }}
                    ></div>
                  </div>
                )}
                {reportAfterImage && (
                  <Image
                    src={reportAfterImage}
                    alt="After Preview"
                    width={128}
                    height={128}
                    className={`mt-2 w-32 h-32 object-cover rounded-lg border ${
                      theme === "dark" ? "border-gray-600" : "border-slate-200"
                    }`}
                  />
                )}
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    theme === "dark" ? "text-gray-200" : "text-slate-700"
                  }`}
                >
                  ชื่อผู้รายงาน/ผู้ทำความสะอาด
                </label>
                <input
                  type="text"
                  value={reportCleanerName}
                  onChange={(e) => setReportCleanerName(e.target.value)}
                  className={`w-full p-2 border rounded-md shadow-sm ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-red-600"
                      : "bg-white border-slate-300 text-slate-900 focus:ring-blue-500"
                  }`}
                  placeholder="เช่น ทีมงาน A, เจ้าหน้าที่ สมชาย"
                  required
                />
              </div>
              <div
                className={`flex justify-end gap-3 p-4 -m-6 mt-6 rounded-b-xl border-t ${
                  theme === "dark"
                    ? "bg-gray-700/50 border-gray-700"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <button
                  type="button"
                  onClick={closeReportModal}
                  className={`px-5 py-2 font-semibold rounded-md transition-colors border shadow-sm ${
                    theme === "dark"
                      ? "bg-gray-600 text-gray-100 border-gray-500 hover:bg-gray-500"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white font-semibold rounded-md transition-colors shadow-md hover:shadow-lg ${
                    theme === "dark"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  บันทึกรายงาน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Image Modal */}
      {isImageModalOpen && fullImageUrl && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex justify-center items-center z-[60] p-4"
          onClick={closeImageModal}
        >
          <div
            className="relative max-w-full max-h-[90vh] bg-transparent flex justify-center items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={fullImageUrl}
              alt="Full Screen"
              width={1920}
              height={1080}
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border-4 border-white"
            />
            <button
              onClick={closeImageModal}
              className="absolute -top-2 -right-2 p-2 rounded-full bg-white text-gray-800 hover:bg-gray-100 z-10 shadow-lg"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      {/* --- Styles --- */}
      <style
        dangerouslySetInnerHTML={{
          __html: `@keyframes scale-in { from { transform: scale(0.98); opacity: 0; } to { transform: scale(1); opacity: 1; } } @keyframes slide-in { from { transform: translateY(-20px) translateX(50%); opacity: 0; } to { transform: translateY(0) translateX(50%); opacity: 1; } } .animate-scale-in { animation: scale-in 0.2s ease-out forwards; } .animate-slide-in { animation: slide-in 0.3s ease-out forwards; right: 50%; }`,
        }}
      />
    </div>
  );
}
