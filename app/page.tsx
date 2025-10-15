"use client";

import React, {
  useState,
  useMemo,
  ChangeEvent,
  FormEvent,
  useEffect,
} from "react";
import {
  PlusCircle,
  Search,
  MapPin,
  Eye,
  Pencil,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Github,
  X,
  BarChart2,
  Camera,
  CheckCircle,
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
} from "chart.js";
import imageCompression from "browser-image-compression";
import Image from "next/image";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// --- Type Definitions ---
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
  landmark: string;
  lat: number | string;
  lng: number | string;
  cleaningHistory: CleaningRecord[];
}
type MailboxSortKey =
  | keyof Omit<Mailbox, "lat" | "lng" | "cleaningHistory">
  | "lastCleaned";

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
    <div className="w-full h-full flex justify-center items-center bg-slate-50">
      <p className="text-slate-500">กำลังโหลดแผนที่...</p>
    </div>
  ),
});

// --- Dashboard Component ---
const Dashboard = ({
  mailboxes,
  jurisdictions,
}: {
  mailboxes: Mailbox[];
  jurisdictions: string[];
}) => {
  const [dashboardJurisdictionFilter, setDashboardJurisdictionFilter] =
    useState<string>("");
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
      x: { ticks: { autoSkip: false, maxRotation: 45, minRotation: 45 } },
    },
  };
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top" as const } },
  };

  const postOfficeData = useMemo(() => {
    const filtered = dashboardJurisdictionFilter
      ? mailboxes.filter((m) => m.jurisdiction === dashboardJurisdictionFilter)
      : mailboxes;
    const counts = filtered.reduce((acc, { postOffice }) => {
      acc[postOffice] = (acc[postOffice] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return {
      labels: Object.keys(counts),
      datasets: [
        {
          label: "จำนวนตู้",
          data: Object.values(counts),
          backgroundColor: "rgba(56, 189, 248, 0.6)",
          borderColor: "rgba(14, 165, 233, 1)",
          borderWidth: 1,
        },
      ],
    };
  }, [mailboxes, dashboardJurisdictionFilter]);

  const jurisdictionData = useMemo(() => {
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
          borderColor: "#ffffff",
          borderWidth: 2,
        },
      ],
    };
  }, [mailboxes]);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <BarChart2 size={18} /> Dashboard
        </h2>
        <select
          value={dashboardJurisdictionFilter}
          onChange={(e) => setDashboardJurisdictionFilter(e.target.value)}
          className="p-2 border border-slate-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-sky-500"
        >
          <option value="">กรองกราฟตามสังกัด (ทั้งหมด)</option>
          {jurisdictions.map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-slate-50 border border-slate-200 rounded-lg p-4">
          <h3 className="font-semibold text-slate-700 text-center">
            จำนวนตู้ฯ แยกตามที่ทำการ
          </h3>
          <div className="relative h-80 mt-4">
            <Bar options={chartOptions} data={postOfficeData} />
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <h3 className="font-semibold text-slate-700 text-center">
            สัดส่วนตู้ฯ แยกตามสังกัด
          </h3>
          <div className="relative h-80 mt-4">
            <Pie options={pieChartOptions} data={jurisdictionData} />
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
}: {
  message: string;
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-5 right-5 z-[100] bg-slate-800 text-white px-4 py-3 rounded-md shadow-lg flex items-center gap-3 animate-slide-in">
      <CheckCircle size={20} className="text-green-400" />
      <span>{message}</span>
    </div>
  );
};

export default function MailboxApp() {
  // --- States ---
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [isClient, setIsClient] = useState(false);
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

  useEffect(() => {
    setIsClient(true);
  }, []);

  const POST_OFFICES = useMemo(
    () =>
      mailboxes.length > 0
        ? [...new Set(mailboxes.map((m) => m.postOffice))].sort()
        : [],
    [mailboxes]
  );
  const JURISDICTIONS = useMemo(
    () =>
      mailboxes.length > 0
        ? [...new Set(mailboxes.map((m) => m.jurisdiction))].sort()
        : [],
    [mailboxes]
  );
  const BLANK_MAILBOX_FORM = useMemo(
    () => ({
      postOffice: POST_OFFICES[0] || "",
      postalCode: "",
      jurisdiction: JURISDICTIONS[0] || "",
      landmark: "",
      lat: "",
      lng: "",
      cleaningHistory: [],
    }),
    [POST_OFFICES, JURISDICTIONS]
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [jurisdictionFilter, setJurisdictionFilter] = useState<string>("");
  const [postOfficeFilter, setPostOfficeFilter] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<{
    key: MailboxSortKey | null;
    direction: "ascending" | "descending";
  }>({ key: "lastCleaned", direction: "descending" });
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

  // --- Logic ---
  const sortedMailboxes = useMemo(() => {
    const sortableItems = [...mailboxes];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (sortConfig.key === "lastCleaned") {
          const dateA = a.cleaningHistory[0]?.date || new Date(0);
          const dateB = b.cleaningHistory[0]?.date || new Date(0);
          if (dateA < dateB)
            return sortConfig.direction === "ascending" ? -1 : 1;
          if (dateA > dateB)
            return sortConfig.direction === "ascending" ? 1 : -1;
          return 0;
        }

        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA < valB) return sortConfig.direction === "ascending" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [mailboxes, sortConfig]);

  const filteredMailboxes = useMemo(() => {
    if (mailboxes.length === 0) return [];
    let items = sortedMailboxes;
    if (jurisdictionFilter)
      items = items.filter((m) => m.jurisdiction === jurisdictionFilter);
    if (postOfficeFilter)
      items = items.filter((m) => m.postOffice === postOfficeFilter);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      items = items.filter((m) =>
        Object.values(m).some((val) => String(val).toLowerCase().includes(term))
      );
    }
    return items;
  }, [
    sortedMailboxes,
    searchTerm,
    jurisdictionFilter,
    postOfficeFilter,
    mailboxes.length,
  ]);
  const paginatedMailboxes = useMemo(() => {
    return (filteredMailboxes || []).slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      (currentPage - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE
    );
  }, [currentPage, filteredMailboxes]);
  const totalPages = Math.ceil(
    (filteredMailboxes || []).length / ITEMS_PER_PAGE
  );
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, jurisdictionFilter, postOfficeFilter]);

  // --- Handlers ---
  const showToast = (message: string) => {
    setToast({ show: true, message });
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
  const requestSort = (key: MailboxSortKey) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending")
      direction = "descending";
    setSortConfig({ key, direction });
  };
  const handleFormInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const finalValue =
      name === "postalCode" ? value.replace(/[^0-9]/g, "") : value;
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
  const getCurrentLocation = () => {
    setLocationStatus("กำลังดึงพิกัด...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentFormData((prev) => ({
          ...prev,
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6),
        }));
        setLocationStatus("ดึงพิกัดสำเร็จ!");
      },
      () => {
        setLocationStatus("ไม่สามารถเข้าถึงตำแหน่งได้");
      }
    );
  };
  const openFormModal = (mode: "add" | "edit", mailbox?: Mailbox) => {
    setFormMode(mode);
    if (mode === "edit" && mailbox) {
      setCurrentFormData(mailbox);
    } else {
      setCurrentFormData(BLANK_MAILBOX_FORM);
    }
    setIsFormModalOpen(true);
    setLocationStatus("");
  };
  const closeFormModal = () => setIsFormModalOpen(false);
  const openDetailModal = (mailbox: Mailbox) => {
    setSelectedMailbox(mailbox);
    setIsDetailModalOpen(true);
  };
  const closeDetailModal = () => setIsDetailModalOpen(false);
  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (
      !currentFormData.landmark ||
      !currentFormData.lat ||
      !currentFormData.lng ||
      !currentFormData.postalCode
    ) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    if (formMode === "add") {
      const newEntry: Mailbox = { id: Date.now(), ...currentFormData };
      setMailboxes([newEntry, ...mailboxes]);
      showToast("บันทึกข้อมูลเรียบร้อยแล้ว");
    } else {
      setMailboxes(
        mailboxes.map((m) =>
          m.id === (currentFormData as Mailbox).id
            ? { ...m, ...(currentFormData as Mailbox) }
            : m
        )
      );
      showToast("แก้ไขข้อมูลเรียบร้อยแล้ว");
    }
    closeFormModal();
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
  const handleReportSubmit = (e: FormEvent) => {
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
    setMailboxes((prevMailboxes) => {
      return prevMailboxes.map((mailbox) => {
        if (mailbox.id === reportMailboxId) {
          const newCleaningRecord: CleaningRecord = {
            date: new Date(reportDate),
            cleanerName: reportCleanerName,
            beforeCleanImage: reportBeforeImage,
            afterCleanImage: reportAfterImage,
          };
          return {
            ...mailbox,
            cleaningHistory: [
              newCleaningRecord,
              ...mailbox.cleaningHistory,
            ].sort((a, b) => b.date.getTime() - a.date.getTime()),
          };
        }
        return mailbox;
      });
    });
    closeReportModal();
    showToast("รายงานผลเรียบร้อยแล้ว");
  };
  const openImageModal = (imageUrl: string) => {
    setFullImageUrl(imageUrl);
    setIsImageModalOpen(true);
  };
  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setFullImageUrl("");
  };

  const getDateHighlightClass = (date?: Date) => {
    if (!date) return "bg-red-100 text-red-700";
    const today = new Date();
    const lastCleaned = new Date(date);
    today.setHours(0, 0, 0, 0);
    lastCleaned.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - lastCleaned.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 90) return "bg-red-100 text-red-700";
    else return "bg-green-100 text-green-700";
  };

  if (!isClient) {
    return (
      <div className="w-screen h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 animate-pulse">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen flex flex-col">
      {toast.show && (
        <Toast
          message={toast.message}
          onClose={() => setToast({ show: false, message: "" })}
        />
      )}
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-slate-900">
            ระบบบันทึกข้อมูลตู้ไปรษณีย์
          </h1>
          <p className="text-slate-500 mt-1">
            Mailbox Information Management System
          </p>
        </header>

        <div className="flex flex-col xl:flex-row justify-between items-center gap-4">
          <div className="w-full flex-grow flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="ค้นหา..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
              />
            </div>
            <select
              value={jurisdictionFilter}
              onChange={(e) => setJurisdictionFilter(e.target.value)}
              className="w-full sm:w-1/3 xl:w-auto p-2 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-sky-500"
            >
              <option value="">ทุกสังกัด</option>
              {JURISDICTIONS.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
            <select
              value={postOfficeFilter}
              onChange={(e) => setPostOfficeFilter(e.target.value)}
              className="w-full sm:w-1/3 xl:w-auto p-2 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-sky-500"
            >
              <option value="">ทุกที่ทำการ</option>
              {POST_OFFICES.map((po) => (
                <option key={po} value={po}>
                  {po}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => openFormModal("add")}
            className="w-full xl:w-auto flex-shrink-0 flex items-center justify-center gap-2 bg-slate-800 text-white font-semibold px-5 py-2 rounded-md hover:bg-slate-700 transition"
          >
            <PlusCircle size={16} />
            เพิ่มข้อมูล
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-3/5 w-full flex flex-col">
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden flex-grow flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 w-4">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                          onChange={(e) =>
                            handleSelectAllFiltered(e.target.checked)
                          }
                          checked={
                            filteredMailboxes.length > 0 &&
                            selectedMapMailboxes.length ===
                              filteredMailboxes.length
                          }
                        />
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">
                        <button
                          onClick={() => requestSort("postOffice")}
                          className="flex items-center gap-2"
                        >
                          ที่ทำการฯ{" "}
                          {sortConfig.key === "postOffice" ? (
                            sortConfig.direction === "ascending" ? (
                              <ArrowUp size={14} />
                            ) : (
                              <ArrowDown size={14} />
                            )
                          ) : (
                            <ArrowUpDown size={14} className="opacity-40" />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">
                        <button
                          onClick={() => requestSort("landmark")}
                          className="flex items-center gap-2"
                        >
                          จุดสังเกต{" "}
                          {sortConfig.key === "landmark" ? (
                            sortConfig.direction === "ascending" ? (
                              <ArrowUp size={14} />
                            ) : (
                              <ArrowDown size={14} />
                            )
                          ) : (
                            <ArrowUpDown size={14} className="opacity-40" />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">
                        <button
                          onClick={() => requestSort("jurisdiction")}
                          className="flex items-center gap-2"
                        >
                          สังกัด{" "}
                          {sortConfig.key === "jurisdiction" ? (
                            sortConfig.direction === "ascending" ? (
                              <ArrowUp size={14} />
                            ) : (
                              <ArrowDown size={14} />
                            )
                          ) : (
                            <ArrowUpDown size={14} className="opacity-40" />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">
                        <button
                          onClick={() => requestSort("lastCleaned")}
                          className="flex items-center gap-2"
                        >
                          ล่าสุด{" "}
                          {sortConfig.key === "lastCleaned" ? (
                            sortConfig.direction === "ascending" ? (
                              <ArrowUp size={14} />
                            ) : (
                              <ArrowDown size={14} />
                            )
                          ) : (
                            <ArrowUpDown size={14} className="opacity-40" />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-600">
                        จัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {paginatedMailboxes.map((mailbox) => {
                      const latestCleaningDate =
                        mailbox.cleaningHistory[0]?.date;
                      return (
                        <tr
                          key={mailbox.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
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
                          <td className="px-4 py-3 whitespace-nowrap text-slate-800 font-medium">
                            {mailbox.postOffice}
                          </td>
                          <td className="px-4 py-3 text-slate-500 min-w-[200px]">
                            {mailbox.landmark}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                            {mailbox.jurisdiction}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getDateHighlightClass(
                                latestCleaningDate
                              )}`}
                            >
                              {latestCleaningDate
                                ? formatDateToThai(latestCleaningDate)
                                : "ไม่มีข้อมูล"}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex justify-center items-center gap-2">
                              <button
                                onClick={() => openDetailModal(mailbox)}
                                className="p-1.5 text-slate-500 hover:text-sky-600"
                                title="ดูรายละเอียด"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => openFormModal("edit", mailbox)}
                                className="p-1.5 text-slate-500 hover:text-sky-600"
                                title="แก้ไขข้อมูล"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => openReportModal(mailbox.id)}
                                className="p-1.5 text-slate-500 hover:text-sky-600"
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
                <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 mt-auto">
                  <div>
                    <p className="text-sm text-slate-500">
                      แสดง{" "}
                      <span className="font-semibold text-slate-700">
                        {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                      </span>
                      -{" "}
                      <span className="font-semibold text-slate-700">
                        {Math.min(
                          currentPage * ITEMS_PER_PAGE,
                          filteredMailboxes.length
                        )}
                      </span>{" "}
                      จาก{" "}
                      <span className="font-semibold text-slate-700">
                        {filteredMailboxes.length}
                      </span>
                    </p>
                  </div>
                  {totalPages > 1 && (
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm border border-slate-300">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 hover:bg-slate-50 disabled:opacity-50"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                              currentPage === page
                                ? "z-10 bg-sky-50 border-sky-500 text-sky-600"
                                : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 hover:bg-slate-50 disabled:opacity-50"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  )}
                </div>
              )}
              {filteredMailboxes.length === 0 && (
                <p className="text-center text-slate-500 p-12">ไม่พบข้อมูล</p>
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
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden p-4 space-y-4 h-full">
              <h2 className="text-lg font-semibold text-slate-800">
                แผนที่แสดงผล ({selectedMapMailboxes.length} รายการ)
              </h2>
              <div className="w-full h-full min-h-[500px] rounded-md overflow-hidden border border-slate-200">
                <MailboxMap mailboxes={selectedMapMailboxes} />
              </div>
            </div>
          </div>
        </div>

        <Dashboard mailboxes={mailboxes} jurisdictions={JURISDICTIONS} />
      </main>

      <footer className="mt-auto">
        <div className="container mx-auto px-4 sm:px-6 py-6 flex justify-between items-center text-sm text-slate-500 border-t border-slate-200">
          <p className="flex items-center justify-center gap-1.5">
            Made with <span className="text-red-500">❤️</span> by Megamind
          </p>
          <a
            href="https://github.com/game1095/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-900 transition-colors"
            aria-label="GitHub Repository"
          >
            <Github size={20} />
          </a>
        </div>
      </footer>

      {isFormModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          {" "}
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all animate-scale-in">
            {" "}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
              {" "}
              <h2 className="text-lg font-semibold text-slate-800">
                {formMode === "add"
                  ? "เพิ่มข้อมูลตู้ไปรษณีย์"
                  : "แก้ไขข้อมูลตู้ไปรษณีย์"}
              </h2>{" "}
              <button
                onClick={closeFormModal}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>{" "}
            </div>{" "}
            <form
              onSubmit={handleFormSubmit}
              className="p-6 space-y-4 overflow-y-auto"
            >
              {" "}
              <div className="grid sm:grid-cols-2 gap-4">
                {" "}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    ที่ทำการไปรษณีย์
                  </label>
                  <select
                    name="postOffice"
                    value={currentFormData.postOffice}
                    onChange={handleFormInputChange}
                    className="w-full p-2 border border-slate-300 rounded-md"
                  >
                    <option value="">-- เลือก --</option>
                    {POST_OFFICES.map((po) => (
                      <option key={po} value={po}>
                        {po}
                      </option>
                    ))}
                  </select>
                </div>{" "}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    รหัสไปรษณีย์
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={currentFormData.postalCode}
                    onChange={handleFormInputChange}
                    maxLength={5}
                    placeholder="5 หลัก"
                    className="w-full p-2 border border-slate-300 rounded-md"
                    required
                  />
                </div>{" "}
              </div>{" "}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  สังกัด
                </label>
                <select
                  name="jurisdiction"
                  value={currentFormData.jurisdiction}
                  onChange={handleFormInputChange}
                  className="w-full p-2 border border-slate-300 rounded-md"
                >
                  <option value="">-- เลือก --</option>
                  {JURISDICTIONS.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
              </div>{" "}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  จุดสังเกตที่ตั้ง
                </label>
                <textarea
                  name="landmark"
                  value={currentFormData.landmark}
                  onChange={handleFormInputChange}
                  rows={3}
                  className="w-full p-2 border border-slate-300 rounded-md"
                  required
                ></textarea>
              </div>{" "}
              <div>
                {" "}
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  จุดพิกัด
                </label>{" "}
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  {" "}
                  <input
                    type="number"
                    step="any"
                    name="lat"
                    value={currentFormData.lat}
                    onChange={handleFormInputChange}
                    placeholder="ละติจูด"
                    className="w-full p-2 border border-slate-300 rounded-md"
                    required
                  />{" "}
                  <input
                    type="number"
                    step="any"
                    name="lng"
                    value={currentFormData.lng}
                    onChange={handleFormInputChange}
                    placeholder="ลองจิจูด"
                    className="w-full p-2 border border-slate-300 rounded-md"
                    required
                  />{" "}
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 bg-slate-100 text-slate-600 font-medium px-4 py-2 rounded-md hover:bg-slate-200"
                  >
                    <MapPin size={16} /> พิกัด
                  </button>{" "}
                </div>{" "}
                {locationStatus && (
                  <p className="text-xs text-slate-500 mt-2">
                    {locationStatus}
                  </p>
                )}{" "}
              </div>{" "}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                {" "}
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="px-5 py-2 bg-slate-200 text-slate-800 font-semibold rounded-md hover:bg-slate-300"
                >
                  ยกเลิก
                </button>{" "}
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-800 text-white font-semibold rounded-md hover:bg-slate-700"
                >
                  บันทึก
                </button>{" "}
              </div>{" "}
            </form>{" "}
          </div>{" "}
        </div>
      )}
      {isDetailModalOpen && selectedMailbox && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          {" "}
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col transform transition-all animate-scale-in">
            {" "}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
              {" "}
              <h2 className="text-lg font-semibold text-slate-800">
                รายละเอียดตู้ไปรษณีย์
              </h2>{" "}
              <button
                onClick={closeDetailModal}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>{" "}
            </div>{" "}
            <div className="p-6 overflow-y-auto">
              {" "}
              <div className="grid lg:grid-cols-2 gap-6">
                {" "}
                <div className="space-y-4">
                  {" "}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500">
                      ที่ทำการไปรษณีย์
                    </h3>
                    <p className="text-base text-slate-900">
                      {selectedMailbox.postOffice} ({selectedMailbox.postalCode}
                      )
                    </p>
                  </div>{" "}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500">
                      สังกัด
                    </h3>
                    <p className="text-base text-slate-900">
                      {selectedMailbox.jurisdiction}
                    </p>
                  </div>{" "}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500">
                      จุดสังเกต
                    </h3>
                    <p className="text-base text-slate-900">
                      {selectedMailbox.landmark}
                    </p>
                  </div>{" "}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500">
                      พิกัด
                    </h3>
                    <p className="text-base text-slate-900 font-mono">
                      {selectedMailbox.lat}, {selectedMailbox.lng}
                    </p>
                  </div>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <h3 className="text-sm font-semibold text-slate-500 mb-2">
                    ตำแหน่งบนแผนที่
                  </h3>{" "}
                  <div className="w-full h-96 rounded-md overflow-hidden border border-slate-200">
                    {" "}
                    <iframe
                      width="100%"
                      height="100%"
                      loading="lazy"
                      allowFullScreen
                      src={`https://www.google.com/maps?q=${selectedMailbox.lat},${selectedMailbox.lng}&hl=th&z=15&output=embed`}
                    ></iframe>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              <div className="pt-6 mt-6 border-t border-slate-200">
                {" "}
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  ประวัติการทำความสะอาด
                </h3>{" "}
                {selectedMailbox.cleaningHistory.length === 0 ? (
                  <p className="text-slate-500">ยังไม่มีประวัติ</p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    {" "}
                    <table className="w-full text-sm">
                      {" "}
                      <thead className="bg-slate-50">
                        {" "}
                        <tr>
                          {" "}
                          <th className="px-4 py-2 text-left font-semibold text-slate-600 w-12">
                            ลำดับ
                          </th>{" "}
                          <th className="px-4 py-2 text-left font-semibold text-slate-600">
                            วันที่
                          </th>{" "}
                          <th className="px-4 py-2 text-center font-semibold text-slate-600">
                            ก่อนทำ
                          </th>{" "}
                          <th className="px-4 py-2 text-center font-semibold text-slate-600">
                            หลังทำ
                          </th>{" "}
                          <th className="px-4 py-2 text-left font-semibold text-slate-600">
                            ผู้รับผิดชอบ
                          </th>{" "}
                        </tr>{" "}
                      </thead>{" "}
                      <tbody className="divide-y divide-slate-200">
                        {" "}
                        {selectedMailbox.cleaningHistory.map(
                          (record, index) => (
                            <tr key={index} className="hover:bg-slate-50">
                              {" "}
                              <td className="px-4 py-3 whitespace-nowrap text-slate-800 font-medium">
                                {index + 1}
                              </td>{" "}
                              <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                                {formatDateToThai(record.date)}
                              </td>{" "}
                              <td className="px-4 py-3 text-center">
                                {" "}
                                {record.beforeCleanImage ? (
                                  <Image
                                    src={record.beforeCleanImage}
                                    alt="Before"
                                    width={64}
                                    height={64}
                                    className="w-16 h-16 object-cover rounded-md cursor-pointer mx-auto border"
                                    onClick={() =>
                                      openImageModal(
                                        record.beforeCleanImage as string
                                      )
                                    }
                                  />
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}{" "}
                              </td>{" "}
                              <td className="px-4 py-3 text-center">
                                {" "}
                                {record.afterCleanImage ? (
                                  <Image
                                    src={record.afterCleanImage}
                                    alt="After"
                                    width={64}
                                    height={64}
                                    className="w-16 h-16 object-cover rounded-md cursor-pointer mx-auto border"
                                    onClick={() =>
                                      openImageModal(
                                        record.afterCleanImage as string
                                      )
                                    }
                                  />
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}{" "}
                              </td>{" "}
                              <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                                {record.cleanerName}
                              </td>{" "}
                            </tr>
                          )
                        )}{" "}
                      </tbody>{" "}
                    </table>{" "}
                  </div>
                )}{" "}
              </div>{" "}
            </div>{" "}
            <div className="flex justify-end gap-2 p-4 border-t border-slate-200">
              {" "}
              <button
                type="button"
                onClick={closeDetailModal}
                className="px-5 py-2 bg-slate-200 text-slate-800 font-semibold rounded-md hover:bg-slate-300"
              >
                ปิด
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          {" "}
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all animate-scale-in">
            {" "}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
              {" "}
              <h2 className="text-lg font-semibold text-slate-800">
                รายงานผลการทำความสะอาด
              </h2>{" "}
              <button
                onClick={closeReportModal}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>{" "}
            </div>{" "}
            <form
              onSubmit={handleReportSubmit}
              className="p-6 space-y-4 overflow-y-auto"
            >
              {" "}
              <div>
                {" "}
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  วันที่รายงาน
                </label>{" "}
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md"
                  required
                />{" "}
              </div>{" "}
              <div>
                {" "}
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  รูปภาพก่อนทำความสะอาด
                </label>{" "}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "before")}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                  required
                />{" "}
                {uploadProgress.before > 0 && (
                  <div className="mt-2 w-full bg-slate-200 rounded-full h-2.5">
                    <div
                      className="bg-sky-500 h-2.5 rounded-full"
                      style={{ width: `${uploadProgress.before}%` }}
                    ></div>
                  </div>
                )}{" "}
                {reportBeforeImage && (
                  <Image
                    src={reportBeforeImage}
                    alt="Before Preview"
                    width={128}
                    height={128}
                    className="mt-2 w-32 h-32 object-cover rounded-md border"
                  />
                )}{" "}
              </div>{" "}
              <div>
                {" "}
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  รูปภาพหลังทำความสะอาด
                </label>{" "}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "after")}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                  required
                />{" "}
                {uploadProgress.after > 0 && (
                  <div className="mt-2 w-full bg-slate-200 rounded-full h-2.5">
                    <div
                      className="bg-sky-500 h-2.5 rounded-full"
                      style={{ width: `${uploadProgress.after}%` }}
                    ></div>
                  </div>
                )}{" "}
                {reportAfterImage && (
                  <Image
                    src={reportAfterImage}
                    alt="After Preview"
                    width={128}
                    height={128}
                    className="mt-2 w-32 h-32 object-cover rounded-md border"
                  />
                )}{" "}
              </div>{" "}
              <div>
                {" "}
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  ชื่อผู้รายงาน/ผู้ทำความสะอาด
                </label>{" "}
                <input
                  type="text"
                  value={reportCleanerName}
                  onChange={(e) => setReportCleanerName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md"
                  placeholder="เช่น ทีมงาน A, เจ้าหน้าที่ สมชาย"
                  required
                />{" "}
              </div>{" "}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                {" "}
                <button
                  type="button"
                  onClick={closeReportModal}
                  className="px-5 py-2 bg-slate-200 text-slate-800 font-semibold rounded-md hover:bg-slate-300"
                >
                  ยกเลิก
                </button>{" "}
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-800 text-white font-semibold rounded-md hover:bg-slate-700"
                >
                  บันทึกรายงาน
                </button>{" "}
              </div>{" "}
            </form>{" "}
          </div>{" "}
        </div>
      )}
      {isImageModalOpen && fullImageUrl && (
        <div
          className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex justify-center items-center z-[60] p-4"
          onClick={closeImageModal}
        >
          {" "}
          <div
            className="relative max-w-full max-h-[90vh] bg-transparent flex justify-center items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {" "}
            <Image
              src={fullImageUrl}
              alt="Full Screen"
              width={1920}
              height={1080}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border-4 border-white"
            />{" "}
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 p-2 rounded-full bg-white text-slate-800 hover:bg-slate-100 z-10"
            >
              <X size={24} />
            </button>{" "}
          </div>{" "}
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `@keyframes scale-in { from { transform: scale(0.98); opacity: 0; } to { transform: scale(1); opacity: 1; } } @keyframes slide-in { from { transform: translateY(-20px) translateX(50%); opacity: 0; } to { transform: translateY(0) translateX(50%); opacity: 1; } } .animate-scale-in { animation: scale-in 0.2s ease-out forwards; } .animate-slide-in { animation: slide-in 0.3s ease-out forwards; right: 50%; }`,
        }}
      />
    </div>
  );
}
