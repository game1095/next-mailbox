"use client";

import React, {
  useState,
  useMemo,
  ChangeEvent,
  FormEvent,
  useEffect,
  useCallback,
} from "react";
import {
  PlusCircle,
  Search,
  MapPin,
  Eye,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Github,
  X,
  BarChart2,
  Camera,
  CheckCircle,
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
} from "chart.js";
import imageCompression from "browser-image-compression";
import Image from "next/image";
import { useTheme } from "next-themes";

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

// --- Constants ---
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
    <div className="w-full h-full flex justify-center items-center bg-slate-50 dark:bg-slate-800">
      <p className="text-slate-500">กำลังโหลดแผนที่...</p>
    </div>
  ),
});

// --- Dashboard Component ---
const Dashboard = ({ mailboxes }: { mailboxes: Mailbox[] }) => {
  const [barChartJurisdictionFilter, setBarChartJurisdictionFilter] =
    useState<string>("");
  const [barChartPostOfficeFilter, setBarChartPostOfficeFilter] =
    useState<string>("");
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0, color: isDarkMode ? "#94a3b8" : "#64748b" },
        grid: { color: isDarkMode ? "#334155" : "#e2e8f0" },
      },
      x: {
        ticks: { color: isDarkMode ? "#94a3b8" : "#64748b" },
        grid: { display: false },
      },
    },
  };
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: { color: isDarkMode ? "#cbd5e1" : "#334155" },
      },
    },
  };

  const barChartData = useMemo(() => {
    let filtered = [...mailboxes];
    if (barChartJurisdictionFilter)
      filtered = filtered.filter(
        (m) => m.jurisdiction === barChartJurisdictionFilter
      );
    if (barChartPostOfficeFilter)
      filtered = filtered.filter(
        (m) => m.postOffice === barChartPostOfficeFilter
      );
    const counts = filtered.reduce((acc, { postOffice }) => {
      acc[postOffice] = (acc[postOffice] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const sortedCounts = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return {
      labels: sortedCounts.map((item) => item[0]),
      datasets: [
        {
          label: "จำนวนตู้",
          data: sortedCounts.map((item) => item[1]),
          backgroundColor: "rgba(56, 189, 248, 0.6)",
          borderColor: "rgba(14, 165, 233, 1)",
          borderWidth: 1,
        },
      ],
    };
  }, [mailboxes, barChartJurisdictionFilter, barChartPostOfficeFilter]);

  const pieChartData = useMemo(() => {
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
          borderColor: isDarkMode ? "#1e293b" : "#ffffff",
          borderWidth: 2,
        },
      ],
    };
  }, [mailboxes, isDarkMode]);

  return (
    <div className="grid grid-cols-5 gap-6">
      <div className="col-span-5 lg:col-span-3 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 sm:p-6 flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <BarChart2 size={18} /> จำนวนตู้ไปรษณีย์
          </h3>
          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={barChartJurisdictionFilter}
              onChange={(e) => setBarChartJurisdictionFilter(e.target.value)}
              className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-sky-500"
            >
              <option value="">ทุกสังกัด</option>
              {JURISDICTIONS.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
            <select
              value={barChartPostOfficeFilter}
              onChange={(e) => setBarChartPostOfficeFilter(e.target.value)}
              className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-sky-500"
            >
              <option value="">ทุกที่ทำการ</option>
              {POST_OFFICES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="relative h-80 flex-grow">
          <Bar options={chartOptions} data={barChartData} />
        </div>
      </div>
      <div className="col-span-5 lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 sm:p-6 flex flex-col">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-center">
          สัดส่วนตู้ฯ แยกตามสังกัด
        </h3>
        <div className="relative h-80 flex-grow mt-4">
          <Pie options={pieChartOptions} data={pieChartData} />
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

// --- Theme Toggle Component ---
const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return <div style={{ width: "36px", height: "36px" }} />;

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
};

export default function MailboxApp() {
  // --- States ---
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const showToast = useCallback((message: string) => {
    setToast({ show: true, message });
  }, []);
  const fetchMailboxes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/mailboxes");
      if (!response.ok) throw new Error("Failed to fetch data");
      const data: any[] = await response.json();
      const formattedData = data.map((mailbox: any) => ({
        ...mailbox,
        cleaningHistory: (mailbox.cleaning_history || [])
          .map((record: any) => ({
            ...record,
            date: new Date(record.date),
          }))
          .sort((a: any, b: any) => b.date.getTime() - a.date.getTime()),
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
  const ITEMS_PER_PAGE = 5;

  // --- Logic ---
  const filteredMailboxes = useMemo(() => {
    if (mailboxes.length === 0) return [];
    let items = [...mailboxes];
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
    return items;
  }, [mailboxes, searchTerm, jurisdictionFilter, postOfficeFilter]);

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

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (
      !currentFormData.landmark ||
      !currentFormData.lat ||
      !currentFormData.lng ||
      !currentFormData.postalCode ||
      !currentFormData.postOffice ||
      !currentFormData.jurisdiction
    ) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
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
  const getDateHighlightClass = (date?: Date) => {
    if (!date)
      return "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300";
    const today = new Date();
    const lastCleaned = new Date(date);
    today.setHours(0, 0, 0, 0);
    lastCleaned.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - lastCleaned.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 90)
      return "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300";
    else
      return "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300";
  };

  if (isLoading || !isClient) {
    return (
      <div className="w-screen h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <p className="text-slate-500 animate-pulse">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 min-h-screen">
      {toast.show && (
        <Toast
          message={toast.message}
          onClose={() => setToast({ show: false, message: "" })}
        />
      )}
      <main className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Mailbox System
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              ระบบบันทึกข้อมูลตู้ไปรษณีย์
            </p>
          </div>
          <ThemeToggle />
        </header>

        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-5 lg:col-span-3 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 sm:p-6 flex flex-col h-[700px]">
            <div className="flex flex-col xl:flex-row justify-between items-center gap-4 mb-4">
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
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                  />
                </div>
                <select
                  value={jurisdictionFilter}
                  onChange={(e) => setJurisdictionFilter(e.target.value)}
                  className="w-full sm:w-auto p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-sky-500"
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
                  className="w-full sm:w-auto p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">ทุกที่ทำการ</option>
                  {POST_OFFICES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-4 py-3 w-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 dark:border-slate-500 text-sky-600 focus:ring-sky-500"
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
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">
                      ที่ทำการฯ
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">
                      จุดสังเกต
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">
                      สังกัด
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">
                      ล่าสุด
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-600 dark:text-slate-300">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {paginatedMailboxes.map((mailbox) => {
                    const latestCleaningDate = mailbox.cleaningHistory[0]?.date;
                    return (
                      <tr
                        key={mailbox.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-300 dark:border-slate-500 text-sky-600 focus:ring-sky-500"
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
                        <td className="px-4 py-3 whitespace-nowrap text-slate-800 dark:text-slate-200 font-medium">
                          {mailbox.postOffice}
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 min-w-[200px]">
                          {mailbox.landmark}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400">
                          {mailbox.jurisdiction}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-medium ${getDateHighlightClass(
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
              <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 px-4 py-3 mt-auto">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    แสดง{" "}
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                    </span>
                    -{" "}
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {Math.min(
                        currentPage * ITEMS_PER_PAGE,
                        filteredMailboxes.length
                      )}
                    </span>{" "}
                    จาก{" "}
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {filteredMailboxes.length}
                    </span>
                  </p>
                </div>
                {totalPages > 1 && (
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm border border-slate-300 dark:border-slate-600">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
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
                              ? "z-10 bg-sky-50 dark:bg-sky-900/50 border-sky-500 text-sky-600 dark:text-sky-400"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
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
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                )}
              </div>
            )}
            {filteredMailboxes.length === 0 && (
              <p className="text-center text-slate-500 p-12 flex-grow flex items-center justify-center">
                ไม่พบข้อมูล
              </p>
            )}
          </div>

          <div className="col-span-5 lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 h-[700px] flex flex-col">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
              แผนที่แสดงผล ({selectedMapMailboxes.length} รายการ)
            </h2>
            <div className="w-full flex-grow rounded-md overflow-hidden border border-slate-200 dark:border-slate-700">
              <MailboxMap mailboxes={selectedMapMailboxes} />
            </div>
          </div>
        </div>

        <Dashboard mailboxes={mailboxes} />

        <div className="col-span-5 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4">
          <div className="flex justify-between items-center text-sm text-slate-500 dark:text-slate-400">
            <p className="flex items-center justify-center gap-1.5">
              Made with <span className="text-red-500">❤️</span> by Megamind
            </p>
            <a
              href="https://github.com/game1095/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <Github size={20} />
            </a>
          </div>
        </div>
      </main>

      {isFormModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          {/* ... Form Modal ... */}
        </div>
      )}
      {isDetailModalOpen && selectedMailbox && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          {/* ... Detail Modal ... */}
        </div>
      )}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          {/* ... Report Modal ... */}
        </div>
      )}
      {isImageModalOpen && fullImageUrl && (
        <div
          className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex justify-center items-center z-[60] p-4"
          onClick={closeImageModal}
        >
          {/* ... Image Modal ... */}
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes scale-in { from { transform: scale(0.98); opacity: 0; } to { transform: scale(1); opacity: 1; } } 
        @keyframes slide-in { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
        .animate-slide-in { animation: slide-in 0.3s ease-out forwards; }
      `,
        }}
      />
    </div>
  );
}
