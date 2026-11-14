import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Bed,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Edit3,
  Save,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  Sliders,
  Check,
  X,
  Layers,
  Info,
  Download,
  Square,
  FileText,
  Compass,
} from "lucide-react";

export type DecisionStatus = "confirmed" | "proposed" | "unknown";

export interface FurnitureItem {
  id: string;
  name: string;
  category: "bed" | "wardrobe" | "desk" | "nightstand" | "unknown_fixture" | "other";
  width_mm: number;
  depth_mm: number;
  height_mm?: number;
  x_mm: number;
  y_mm: number;
  rotation_deg: number;
  status: DecisionStatus;
  notes?: string;
  spec?: string;
  color_hex?: string;
}

export interface DecisionEntry {
  id: string;
  category: string;
  title: string;
  currentValue: string;
  status: DecisionStatus;
  description: string;
  source: string;
  canConfirm: boolean;
}

const INITIAL_ROOM = {
  width_mm: 4190,
  depth_mm: 4040,
  height_mm: 2800,
  door: {
    wall: "south",
    width_mm: 900,
    offset_mm: 400,
    swing: "inward_left",
  },
  window: {
    wall: "east",
    width_mm: 1600,
    offset_mm: 1200,
    height_mm: 1400,
    sill_mm: 900,
  },
};

const INITIAL_FURNITURE: FurnitureItem[] = [
  {
    id: "furn_bed_main",
    name: "Giường ngủ tham khảo",
    category: "bed",
    width_mm: 1800,
    depth_mm: 2000,
    height_mm: 950,
    x_mm: 2195,
    y_mm: 1100,
    rotation_deg: 0,
    status: "proposed",
    spec: "Kích thước tham khảo 1.800 × 2.000 mm, cần xác nhận thực tế trước khi thi công.",
    notes: "Đang chờ chủ nhà xác nhận kích thước đệm & độ dày đầu giường.",
    color_hex: "#3B82F6",
  },
  {
    id: "furn_wardrobe",
    name: "Tủ quần áo",
    category: "wardrobe",
    width_mm: 2400,
    depth_mm: 600,
    height_mm: 2600,
    x_mm: 1300,
    y_mm: 3640,
    rotation_deg: 0,
    status: "proposed",
    spec: "Đề xuất hệ tủ kịch trần cánh mở hoặc lùa (2.400 × 600 mm).",
    notes: "Phương án sơ bộ, chưa đo kiểm tra hiện trạng dầm trần.",
    color_hex: "#F59E0B",
  },
  {
    id: "furn_desk_bookshelf",
    name: "Bàn làm việc & Kệ sách",
    category: "desk",
    width_mm: 1400,
    depth_mm: 600,
    height_mm: 750,
    x_mm: 3790,
    y_mm: 2400,
    rotation_deg: 90,
    status: "proposed",
    spec: "Đề xuất bàn làm việc kết hợp kệ sách áp tường cạnh cửa sổ đón sáng tự nhiên.",
    notes: "Chưa chốt vị trí ổ cắm điện và chiều cao bậu cửa sổ.",
    color_hex: "#F59E0B",
  },
  {
    id: "furn_headboard_item_700",
    name: "Hạng mục 700 mm đầu giường",
    category: "unknown_fixture",
    width_mm: 700,
    depth_mm: 450,
    height_mm: 500,
    x_mm: 945,
    y_mm: 325,
    rotation_deg: 0,
    status: "unknown",
    spec: "Khoảng trống 700 mm bên cạnh đầu giường chưa xác định rõ công năng.",
    notes: "Cần làm rõ: Là tab đầu giường, bàn phấn trang điểm hay khoảng hở ray rèm cửa?",
    color_hex: "#94A3B8",
  },
];

const INITIAL_DECISIONS: DecisionEntry[] = [
  {
    id: "dec_room_bounds",
    category: "Không gian & Kích thước",
    title: "Kích thước bao phòng ngủ",
    currentValue: "4.190 × 4.040 mm (Diện tích ~16.9 m²)",
    status: "proposed",
    description: "Kích thước tham khảo từ sơ đồ phác thảo. Cần đo đạc bàn giao hiện trạng thực tế.",
    source: "Mặt bằng tham khảo ban đầu",
    canConfirm: true,
  },
  {
    id: "dec_bed_spec",
    category: "Nội thất chính",
    title: "Giường ngủ",
    currentValue: "1.800 × 2.000 mm (Đệm đôi tiêu chuẩn)",
    status: "proposed",
    description: "Kích thước phủ bì dự kiến ~1.950 × 2.150 mm. Cần xác nhận loại nệm và mẫu giát giường.",
    source: "Đề xuất theo nhu cầu sử dụng",
    canConfirm: true,
  },
  {
    id: "dec_wardrobe",
    category: "Nội thất lưu trữ",
    title: "Tủ quần áo",
    currentValue: "2.400 × 600 mm (Kịch trần)",
    status: "proposed",
    description: "Vị trí áp tường cạnh cửa ra vào để tối ưu lưu thông.",
    source: "Đề xuất của kiến trúc sư",
    canConfirm: true,
  },
  {
    id: "dec_desk_shelf",
    category: "Góc học tập / Làm việc",
    title: "Bàn làm việc và kệ sách",
    currentValue: "1.400 × 600 mm (Cạnh cửa sổ đón sáng)",
    status: "proposed",
    description: "Bố trí tận dụng ánh sáng tự nhiên từ cửa sổ hướng Đông.",
    source: "Đề xuất bố trí công năng",
    canConfirm: true,
  },
  {
    id: "dec_700mm_fixture",
    category: "Hạng mục chưa rõ",
    title: "Hạng mục 700 mm ở đầu giường",
    currentValue: "Chưa xác định rõ công năng (700 mm)",
    status: "unknown",
    description: "Chưa chốt là Tab đầu giường, Bàn trang điểm mini hay Khoảng hở thu rèm cửa.",
    source: "Ghi chú phác thảo",
    canConfirm: true,
  },
  {
    id: "dec_style_material",
    category: "Phong cách & Vật liệu",
    title: "Phong cách, màu sắc, vật liệu",
    currentValue: "Chưa chốt (Đang cân nhắc Japandi / Hiện đại tối giản)",
    status: "unknown",
    description: "Chưa chọn mã sơn tường, chất liệu gỗ công nghiệp hay tự nhiên, loại sàn lát.",
    source: "Trao đổi sở thích",
    canConfirm: false,
  },
  {
    id: "dec_budget",
    category: "Tài chính",
    title: "Ngân sách đầu tư",
    currentValue: "Chưa chốt mức trần chi phí",
    status: "unknown",
    description: "Cần xác định ngân sách trần để lựa chọn phân khúc vật liệu phù hợp.",
    source: "Kế hoạch tài chính",
    canConfirm: false,
  },
];

export function BedroomDesignStudio() {
  const [furniture, setFurniture] = useState<FurnitureItem[]>(() => {
    try {
      const saved = localStorage.getItem("atelier_bedroom_furniture_v2");
      return saved ? JSON.parse(saved) : INITIAL_FURNITURE;
    } catch {
      return INITIAL_FURNITURE;
    }
  });

  const [decisions, setDecisions] = useState<DecisionEntry[]>(() => {
    try {
      const saved = localStorage.getItem("atelier_bedroom_decisions_v2");
      return saved ? JSON.parse(saved) : INITIAL_DECISIONS;
    } catch {
      return INITIAL_DECISIONS;
    }
  });

  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string>("furn_bed_main");
  const [filterStatus, setFilterStatus] = useState<"all" | DecisionStatus>("all");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [isEditingItem, setIsEditingItem] = useState<boolean>(false);
  const [editingDecisionId, setEditingDecisionId] = useState<string | null>(null);
  const [editDecisionValue, setEditDecisionValue] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // SVG interaction refs
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("atelier_bedroom_furniture_v2", JSON.stringify(furniture));
      localStorage.setItem("atelier_bedroom_decisions_v2", JSON.stringify(decisions));
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }
  }, [furniture, decisions]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const selectedItem = useMemo(
    () => furniture.find((f) => f.id === selectedFurnitureId) || furniture[0],
    [furniture, selectedFurnitureId]
  );

  const filteredDecisions = useMemo(() => {
    if (filterStatus === "all") return decisions;
    return decisions.filter((d) => d.status === filterStatus);
  }, [decisions, filterStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = decisions.length;
    const confirmed = decisions.filter((d) => d.status === "confirmed").length;
    const proposed = decisions.filter((d) => d.status === "proposed").length;
    const unknown = decisions.filter((d) => d.status === "unknown").length;
    return { total, confirmed, proposed, unknown };
  }, [decisions]);

  // Handle toggling confirmation status
  const handleToggleConfirmDecision = (id: string) => {
    setDecisions((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus: DecisionStatus = item.status === "confirmed" ? "proposed" : "confirmed";
          // Also sync with related furniture
          if (id === "dec_bed_spec") {
            setFurniture((fPrev) =>
              fPrev.map((f) => (f.id === "furn_bed_main" ? { ...f, status: nextStatus } : f))
            );
          } else if (id === "dec_wardrobe") {
            setFurniture((fPrev) =>
              fPrev.map((f) => (f.id === "furn_wardrobe" ? { ...f, status: nextStatus } : f))
            );
          } else if (id === "dec_desk_shelf") {
            setFurniture((fPrev) =>
              fPrev.map((f) => (f.id === "furn_desk_bookshelf" ? { ...f, status: nextStatus } : f))
            );
          } else if (id === "dec_700mm_fixture") {
            setFurniture((fPrev) =>
              fPrev.map((f) => (f.id === "furn_headboard_item_700" ? { ...f, status: nextStatus } : f))
            );
          }
          showToast(`Đã chuyển trạng thái: ${item.title} → ${nextStatus.toUpperCase()}`);
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  // Handle editing decision description or value
  const handleSaveDecisionEdit = (id: string) => {
    if (!editDecisionValue.trim()) return;
    setDecisions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, currentValue: editDecisionValue } : item))
    );
    setEditingDecisionId(null);
    setEditDecisionValue("");
    showToast("Đã cập nhật nội dung quyết định");
  };

  // Handle furniture item attribute changes
  const handleUpdateItem = (fields: Partial<FurnitureItem>) => {
    if (!selectedFurnitureId) return;
    setFurniture((prev) =>
      prev.map((item) => (item.id === selectedFurnitureId ? { ...item, ...fields } : item))
    );
  };

  // Reset to initial defaults
  const handleResetDefaults = () => {
    if (window.confirm("Khôi phục toàn bộ thông số phòng ngủ về mặc định ban đầu?")) {
      setFurniture(INITIAL_FURNITURE);
      setDecisions(INITIAL_DECISIONS);
      localStorage.removeItem("atelier_bedroom_furniture_v2");
      localStorage.removeItem("atelier_bedroom_decisions_v2");
      showToast("Đã khôi phục dữ liệu phác thảo mặc định");
    }
  };

  // Dragging logic for SVG items
  const handleMouseDown = (item: FurnitureItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFurnitureId(item.id);
    setIsDragging(true);
    setDragOffset({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedItem) return;
    const dx = (e.clientX - dragOffset.x) * (4190 / 600) / zoomLevel;
    const dy = (e.clientY - dragOffset.y) * (4040 / 580) / zoomLevel;

    // Bounds checking
    const newX = Math.max(
      selectedItem.width_mm / 2 + 100,
      Math.min(INITIAL_ROOM.width_mm - selectedItem.width_mm / 2 - 100, selectedItem.x_mm + dx)
    );
    const newY = Math.max(
      selectedItem.depth_mm / 2 + 100,
      Math.min(INITIAL_ROOM.depth_mm - selectedItem.depth_mm / 2 - 100, selectedItem.y_mm + dy)
    );

    handleUpdateItem({ x_mm: Math.round(newX), y_mm: Math.round(newY) });
    setDragOffset({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="flex flex-col h-full w-full bg-neutral-50 text-neutral-900 overflow-hidden font-sans"
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
      onMouseUp={handleMouseUp}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-neutral-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-sm animate-fade-in border border-neutral-700">
          <Info size={16} className="text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mandatory Engineering Warning Banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-amber-900">
        <div className="flex items-center gap-2 font-medium">
          <AlertTriangle size={15} className="text-amber-600 shrink-0" />
          <span>
            <strong>LƯU Ý KỸ THUẬT:</strong> Tất cả kích thước trên cần được xác nhận trước khi dùng làm dữ liệu thi công chính thức. (Kích thước phòng tham khảo 4.190 × 4.040 mm).
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="bg-amber-200/80 px-2 py-0.5 rounded text-amber-950 font-mono font-semibold">
            Tỷ lệ 1:1 mm
          </span>
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1 text-amber-800 hover:text-amber-950 hover:underline"
            title="Khôi phục trạng thái ban đầu"
          >
            <RotateCcw size={12} />
            <span>Khôi phục mẫu</span>
          </button>
        </div>
      </div>

      {/* Main Studio Header */}
      <header className="bg-white border-b border-neutral-200 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold shrink-0">
            <Bed size={18} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base font-semibold text-neutral-900 leading-tight">
                Thiết Kế Phòng Ngủ — Sơ Đồ Mặt Bằng & Sổ Quyết Định
              </h1>
              <span className="text-xs bg-teal-100 text-teal-800 font-medium px-2 py-0.5 rounded-full">
                Interactive Studio
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Kích thước tham khảo: 4.190 × 4.040 mm • Mặt bằng 2D SVG trực quan • Đồng bộ thời gian thực
            </p>
          </div>
        </div>

        {/* Quick Summary Pill Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-100 rounded-md text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Đã xác nhận: {stats.confirmed}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-md text-xs font-medium text-amber-800 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Đề xuất: {stats.proposed}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-md text-xs font-medium text-slate-700 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>Chưa rõ: {stats.unknown}</span>
          </div>
        </div>
      </header>

      {/* Workspace Grid Layout: Left = Workspace & 2D SVG, Right = Brief & Decision Ledger */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        {/* Left Column: 2D Design Workspace (SVG Canvas) */}
        <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-neutral-200 bg-neutral-100 relative min-h-[480px] lg:min-h-0">
          {/* Viewport Toolbar */}
          <div className="bg-white border-b border-neutral-200 px-4 py-2 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider flex items-center gap-1">
                <Compass size={14} className="text-teal-700" /> Sơ đồ mặt bằng 2D
              </span>
              <span className="text-xs text-neutral-400">|</span>
              <button
                type="button"
                onClick={() => setShowGrid(!showGrid)}
                className={`text-xs px-2.5 py-1 rounded border transition-colors flex items-center gap-1 ${
                  showGrid ? "bg-teal-50 border-teal-300 text-teal-800" : "bg-white border-neutral-300 text-neutral-600"
                }`}
              >
                <Layers size={13} />
                <span>Lưới 100mm</span>
              </button>
              <button
                type="button"
                onClick={() => setShowDimensions(!showDimensions)}
                className={`text-xs px-2.5 py-1 rounded border transition-colors flex items-center gap-1 ${
                  showDimensions
                    ? "bg-teal-50 border-teal-300 text-teal-800"
                    : "bg-white border-neutral-300 text-neutral-600"
                }`}
              >
                <Sliders size={13} />
                <span>Kích thước chi tiết</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center border border-neutral-300 rounded bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
                  className="px-2 py-1 text-neutral-600 hover:bg-neutral-100 border-r border-neutral-200"
                  title="Thu nhỏ"
                >
                  <ZoomOut size={13} />
                </button>
                <span className="px-2 text-xs font-mono font-medium text-neutral-700">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.1))}
                  className="px-2 py-1 text-neutral-600 hover:bg-neutral-100"
                  title="Phóng to"
                >
                  <ZoomIn size={13} />
                </button>
              </div>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="text-xs px-2 py-1 bg-white border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-50"
                title="Khôi phục kích thước chuẩn"
              >
                Fit
              </button>
            </div>
          </div>

          {/* Interactive 2D SVG Canvas */}
          <div
            className="flex-1 flex items-center justify-center p-6 overflow-auto select-none"
            onMouseMove={handleMouseMove}
          >
            <div
              className="bg-white rounded-xl shadow-md border border-neutral-300 p-8 transition-transform duration-100"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}
            >
              <svg
                ref={svgRef}
                width={650}
                height={620}
                viewBox="-400 -400 5000 4850"
                className="overflow-visible"
                style={{ cursor: isDragging ? "grabbing" : "default" }}
              >
                <defs>
                  {/* Grid Pattern */}
                  <pattern id="roomGrid" width="200" height="200" patternUnits="userSpaceOnUse">
                    <path d="M 200 0 L 0 0 0 200" fill="none" stroke="#F1F5F9" strokeWidth="6" />
                  </pattern>

                  {/* Confirmed Furniture Pattern */}
                  <pattern id="patConfirmed" width="20" height="20" patternUnits="userSpaceOnUse">
                    <rect width="20" height="20" fill="#F0FDFA" />
                    <circle cx="10" cy="10" r="1.5" fill="#0D9488" opacity="0.3" />
                  </pattern>

                  {/* Proposed Furniture Pattern (Amber Dash) */}
                  <pattern id="patProposed" width="30" height="30" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="30" stroke="#FDE68A" strokeWidth="8" opacity="0.4" />
                  </pattern>

                  {/* Unknown Fixture Pattern (Slate Diagonal Stripe) */}
                  <pattern id="patUnknown" width="24" height="24" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                    <rect width="24" height="24" fill="#F8FAFC" />
                    <line x1="0" y1="0" x2="0" y2="24" stroke="#CBD5E1" strokeWidth="6" opacity="0.6" />
                  </pattern>
                </defs>

                {/* Floor Grid */}
                {showGrid && (
                  <rect
                    x={0}
                    y={0}
                    width={INITIAL_ROOM.width_mm}
                    height={INITIAL_ROOM.depth_mm}
                    fill="url(#roomGrid)"
                  />
                )}

                {/* Floor Surface */}
                <rect
                  x={0}
                  y={0}
                  width={INITIAL_ROOM.width_mm}
                  height={INITIAL_ROOM.depth_mm}
                  fill="#FCFDFD"
                  stroke="#171717"
                  strokeWidth="24"
                />

                {/* Dimension Chains */}
                {showDimensions && (
                  <g stroke="#0F766E" strokeWidth="16" fill="#0F766E">
                    {/* Top Room Width: 4190 mm */}
                    <line x1={0} y1={-220} x2={INITIAL_ROOM.width_mm} y2={-220} />
                    <line x1={0} y1={-300} x2={0} y2={-140} />
                    <line x1={INITIAL_ROOM.width_mm} y1={-300} x2={INITIAL_ROOM.width_mm} y2={-140} />
                    <text
                      x={INITIAL_ROOM.width_mm / 2}
                      y={-280}
                      textAnchor="middle"
                      fontSize="140"
                      fontFamily="'JetBrains Mono', monospace"
                      fontWeight="600"
                    >
                      4.190 mm (4.19m)
                    </text>

                    {/* Left Room Depth: 4040 mm */}
                    <line x1={-220} y1={0} x2={-220} y2={INITIAL_ROOM.depth_mm} />
                    <line x1={-300} y1={0} x2={-140} y2={0} />
                    <line x1={-300} y1={INITIAL_ROOM.depth_mm} x2={-140} y2={INITIAL_ROOM.depth_mm} />
                    <text
                      x={-280}
                      y={INITIAL_ROOM.depth_mm / 2}
                      textAnchor="middle"
                      fontSize="140"
                      fontFamily="'JetBrains Mono', monospace"
                      fontWeight="600"
                      transform={`rotate(-90, -280, ${INITIAL_ROOM.depth_mm / 2})`}
                    >
                      4.040 mm (4.04m)
                    </text>
                  </g>
                )}

                {/* Door Opening & Swing Arc (South Wall) */}
                <g>
                  {/* Door Opening Gap */}
                  <line
                    x1={INITIAL_ROOM.door.offset_mm}
                    y1={INITIAL_ROOM.depth_mm}
                    x2={INITIAL_ROOM.door.offset_mm + INITIAL_ROOM.door.width_mm}
                    y2={INITIAL_ROOM.depth_mm}
                    stroke="#FFFFFF"
                    strokeWidth="32"
                  />
                  {/* Door Swing Arc */}
                  <path
                    d={`M ${INITIAL_ROOM.door.offset_mm + INITIAL_ROOM.door.width_mm} ${INITIAL_ROOM.depth_mm} A ${INITIAL_ROOM.door.width_mm} ${INITIAL_ROOM.door.width_mm} 0 0 0 ${INITIAL_ROOM.door.offset_mm} ${INITIAL_ROOM.depth_mm - INITIAL_ROOM.door.width_mm}`}
                    fill="rgba(180, 83, 9, 0.08)"
                    stroke="#B45309"
                    strokeWidth="14"
                    strokeDasharray="40,30"
                  />
                  {/* Door Leaf */}
                  <line
                    x1={INITIAL_ROOM.door.offset_mm}
                    y1={INITIAL_ROOM.depth_mm}
                    x2={INITIAL_ROOM.door.offset_mm}
                    y2={INITIAL_ROOM.depth_mm - INITIAL_ROOM.door.width_mm}
                    stroke="#B45309"
                    strokeWidth="28"
                    strokeLinecap="round"
                  />
                  <text
                    x={INITIAL_ROOM.door.offset_mm + INITIAL_ROOM.door.width_mm / 2}
                    y={INITIAL_ROOM.depth_mm + 220}
                    textAnchor="middle"
                    fontSize="110"
                    fill="#B45309"
                    fontFamily="'JetBrains Mono', monospace"
                  >
                    Cửa đi 900mm
                  </text>
                </g>

                {/* Window (East Wall) */}
                <g>
                  <line
                    x1={INITIAL_ROOM.width_mm}
                    y1={INITIAL_ROOM.window.offset_mm}
                    x2={INITIAL_ROOM.width_mm}
                    y2={INITIAL_ROOM.window.offset_mm + INITIAL_ROOM.window.width_mm}
                    stroke="#FFFFFF"
                    strokeWidth="32"
                  />
                  <line
                    x1={INITIAL_ROOM.width_mm - 40}
                    y1={INITIAL_ROOM.window.offset_mm}
                    x2={INITIAL_ROOM.width_mm - 40}
                    y2={INITIAL_ROOM.window.offset_mm + INITIAL_ROOM.window.width_mm}
                    stroke="#0284C7"
                    strokeWidth="22"
                  />
                  <line
                    x1={INITIAL_ROOM.width_mm + 40}
                    y1={INITIAL_ROOM.window.offset_mm}
                    x2={INITIAL_ROOM.width_mm + 40}
                    y2={INITIAL_ROOM.window.offset_mm + INITIAL_ROOM.window.width_mm}
                    stroke="#0284C7"
                    strokeWidth="22"
                  />
                  <text
                    x={INITIAL_ROOM.width_mm + 240}
                    y={INITIAL_ROOM.window.offset_mm + INITIAL_ROOM.window.width_mm / 2}
                    textAnchor="middle"
                    fontSize="110"
                    fill="#0284C7"
                    fontFamily="'JetBrains Mono', monospace"
                    transform={`rotate(90, ${INITIAL_ROOM.width_mm + 240}, ${INITIAL_ROOM.window.offset_mm + INITIAL_ROOM.window.width_mm / 2})`}
                  >
                    Cửa sổ 1.600mm
                  </text>
                </g>

                {/* Interactive Furniture Items */}
                {furniture.map((item) => {
                  const isSel = selectedFurnitureId === item.id;
                  const rot = (item.rotation_deg || 0) % 360;
                  const fw = rot === 90 || rot === 270 ? item.depth_mm : item.width_mm;
                  const fd = rot === 90 || rot === 270 ? item.width_mm : item.depth_mm;
                  const x0 = item.x_mm - fw / 2;
                  const y0 = item.y_mm - fd / 2;

                  let strokeColor = "#171717";
                  let strokeWidth = isSel ? 36 : 20;
                  let strokeDasharray = "none";
                  let fillColor = "#F8FAFC";

                  if (item.status === "confirmed") {
                    strokeColor = isSel ? "#0F766E" : "#0D9488";
                    fillColor = "#F0FDFA";
                  } else if (item.status === "proposed") {
                    strokeColor = isSel ? "#D97706" : "#F59E0B";
                    strokeDasharray = "35,25";
                    fillColor = "#FFFBEB";
                  } else {
                    // unknown
                    strokeColor = isSel ? "#64748B" : "#94A3B8";
                    strokeDasharray = "20,15";
                    fillColor = "#F1F5F9";
                  }

                  return (
                    <g
                      key={item.id}
                      onMouseDown={(e) => handleMouseDown(item, e)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFurnitureId(item.id);
                      }}
                      style={{ cursor: "grab" }}
                    >
                      {/* Outline box */}
                      <rect
                        x={x0}
                        y={y0}
                        width={fw}
                        height={fd}
                        rx={item.category === "bed" ? 40 : 20}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeDasharray={strokeDasharray}
                      />

                      {/* Headboard pill or visual indicator for bed */}
                      {item.category === "bed" && (
                        <rect
                          x={x0 + 60}
                          y={y0 + 40}
                          width={fw - 120}
                          height={180}
                          rx={20}
                          fill="#E2E8F0"
                          stroke={strokeColor}
                          strokeWidth="12"
                        />
                      )}

                      {/* Status & Name Label */}
                      <text
                        x={item.x_mm}
                        y={item.y_mm - 40}
                        textAnchor="middle"
                        fontSize="115"
                        fontFamily="'Inter', -apple-system, sans-serif"
                        fontWeight="600"
                        fill="#0F172A"
                      >
                        {item.name}
                      </text>

                      {/* Dimensions Label */}
                      <text
                        x={item.x_mm}
                        y={item.y_mm + 90}
                        textAnchor="middle"
                        fontSize="100"
                        fontFamily="'JetBrains Mono', monospace"
                        fontWeight="500"
                        fill="#475569"
                      >
                        {item.width_mm} × {item.depth_mm} mm
                      </text>

                      {/* Status Badge Tag */}
                      <g transform={`translate(${item.x_mm - 200}, ${item.y_mm + 140})`}>
                        <rect
                          x={0}
                          y={0}
                          width={400}
                          height={100}
                          rx={25}
                          fill={
                            item.status === "confirmed"
                              ? "#DCFCE7"
                              : item.status === "proposed"
                              ? "#FEF3C7"
                              : "#E2E8F0"
                          }
                          stroke={
                            item.status === "confirmed"
                              ? "#16A34A"
                              : item.status === "proposed"
                              ? "#D97706"
                              : "#64748B"
                          }
                          strokeWidth="8"
                        />
                        <text
                          x={200}
                          y={66}
                          textAnchor="middle"
                          fontSize="65"
                          fontFamily="'Inter', -apple-system, sans-serif"
                          fontWeight="700"
                          fill={
                            item.status === "confirmed"
                              ? "#15803D"
                              : item.status === "proposed"
                              ? "#B45309"
                              : "#475569"
                          }
                        >
                          {item.status === "confirmed"
                            ? "✓ ĐÃ XÁC NHẬN"
                            : item.status === "proposed"
                            ? "⚠ ĐỀ XUẤT"
                            : "? CHƯA XÁC ĐỊNH"}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Quick Legend at bottom of 2D workspace */}
          <div className="bg-white border-t border-neutral-200 px-4 py-2.5 flex items-center justify-between text-xs text-neutral-600">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-neutral-800">Chú thích sơ đồ:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-teal-100 border border-teal-600 inline-block" />
                <span>Đã xác nhận (Confirmed)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-amber-100 border border-amber-600 border-dashed inline-block" />
                <span>Đề xuất (Proposed - Nét đứt)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-500 border-dotted inline-block" />
                <span>Chưa xác định (Unknown)</span>
              </div>
            </div>
            <span className="text-neutral-400">Nhấp & Kéo trực tiếp để bố trí lại vị trí</span>
          </div>
        </div>

        {/* Right Column: Brief & Interactive Decision Ledger (Tabs / Cards) */}
        <div className="w-full lg:w-[480px] bg-white flex flex-col shrink-0 overflow-y-visible lg:overflow-y-auto">
          {/* Section B: Bedroom Design Brief Card */}
          <div className="p-5 border-b border-neutral-200 bg-neutral-50/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={14} className="text-teal-700" /> Bedroom Design Brief
              </span>
              <span className="text-xs bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded font-medium">
                Phòng Ngủ Master
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-neutral-200 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-500">Không gian:</span>
                <span className="font-semibold text-neutral-900">Phòng ngủ gia đình</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-500">Kích thước tham khảo:</span>
                <span className="font-mono font-semibold text-neutral-900">4.190 × 4.040 mm (~16.9 m²)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-500">Giường ngủ:</span>
                <span className="font-semibold text-amber-700">1.800 × 2.000 mm (Đề xuất)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-500">Tủ quần áo:</span>
                <span className="font-semibold text-amber-700">2.400 × 600 mm (Đề xuất)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-500">Bàn làm việc & kệ sách:</span>
                <span className="font-semibold text-amber-700">1.400 × 600 mm (Đề xuất)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-500">Hạng mục 700 mm đầu giường:</span>
                <span className="font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                  Chưa xác định rõ
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-500">Phong cách / Màu sắc / Ngân sách:</span>
                <span className="font-semibold text-slate-600 italic">Chưa chốt chính thức</span>
              </div>
            </div>

            <div className="mt-3 p-2.5 bg-amber-50 rounded border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
              <strong>Yêu cầu cốt lõi:</strong> Tất cả kích thước trên cần được xác nhận trước khi dùng làm dữ liệu thi công chính thức. Không tự tiện chốt đơn giá hoặc sản xuất thi công khi các kích thước và hạng mục chưa được người dùng duyệt xác nhận.
            </div>
          </div>

          {/* Selected Item Editor Panel */}
          {selectedItem && (
            <div className="p-4 border-b border-neutral-200 bg-white">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                  <Sliders size={14} className="text-teal-700" /> Chỉnh sửa đối tượng đang chọn
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                    selectedItem.status === "confirmed"
                      ? "bg-emerald-100 text-emerald-800"
                      : selectedItem.status === "proposed"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {selectedItem.status === "confirmed"
                    ? "Đã xác nhận"
                    : selectedItem.status === "proposed"
                    ? "Đề xuất"
                    : "Chưa xác định"}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-neutral-500 mb-1">Tên nội thất</label>
                  <input
                    type="text"
                    value={selectedItem.name}
                    onChange={(e) => handleUpdateItem({ name: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-neutral-300 rounded text-xs focus:ring-1 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-neutral-500 mb-1">Chiều rộng (mm)</label>
                    <input
                      type="number"
                      step={50}
                      value={selectedItem.width_mm}
                      onChange={(e) => handleUpdateItem({ width_mm: Number(e.target.value) || 100 })}
                      className="w-full px-2.5 py-1.5 border border-neutral-300 rounded text-xs font-mono focus:ring-1 focus:ring-teal-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-500 mb-1">Chiều sâu (mm)</label>
                    <input
                      type="number"
                      step={50}
                      value={selectedItem.depth_mm}
                      onChange={(e) => handleUpdateItem({ depth_mm: Number(e.target.value) || 100 })}
                      className="w-full px-2.5 py-1.5 border border-neutral-300 rounded text-xs font-mono focus:ring-1 focus:ring-teal-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-neutral-500 mb-1">Vị trí X (mm)</label>
                    <input
                      type="number"
                      step={20}
                      value={selectedItem.x_mm}
                      onChange={(e) => handleUpdateItem({ x_mm: Number(e.target.value) || 0 })}
                      className="w-full px-2 py-1.5 border border-neutral-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-500 mb-1">Vị trí Y (mm)</label>
                    <input
                      type="number"
                      step={20}
                      value={selectedItem.y_mm}
                      onChange={(e) => handleUpdateItem({ y_mm: Number(e.target.value) || 0 })}
                      className="w-full px-2 py-1.5 border border-neutral-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-500 mb-1">Xoay (°)</label>
                    <select
                      value={selectedItem.rotation_deg}
                      onChange={(e) => handleUpdateItem({ rotation_deg: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border border-neutral-300 rounded text-xs bg-white font-mono"
                    >
                      <option value={0}>0°</option>
                      <option value={90}>90°</option>
                      <option value={180}>180°</option>
                      <option value={270}>270°</option>
                    </select>
                  </div>
                </div>

                {/* Status Switcher Buttons */}
                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-neutral-500 text-[11px]">Trạng thái dữ liệu:</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleUpdateItem({ status: "confirmed" })}
                      className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
                        selectedItem.status === "confirmed"
                          ? "bg-teal-700 text-white"
                          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                      }`}
                    >
                      <Check size={12} /> Xác nhận
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateItem({ status: "proposed" })}
                      className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
                        selectedItem.status === "proposed"
                          ? "bg-amber-600 text-white"
                          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                      }`}
                    >
                      Đề xuất
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateItem({ status: "unknown" })}
                      className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
                        selectedItem.status === "unknown"
                          ? "bg-slate-600 text-white"
                          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                      }`}
                    >
                      Chưa rõ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section C: Interactive Decision Ledger Table */}
          <div className="p-5 flex-1">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-teal-700" /> Sổ Quyết Định Thiết Kế (Decision Ledger)
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 mb-3 border-b border-neutral-200 pb-2">
              {(["all", "confirmed", "proposed", "unknown"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilterStatus(tab)}
                  className={`px-2.5 py-1 text-xs rounded transition-colors font-medium ${
                    filterStatus === tab
                      ? "bg-teal-700 text-white"
                      : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  {tab === "all"
                    ? `Tất cả (${decisions.length})`
                    : tab === "confirmed"
                    ? `Đã chốt (${stats.confirmed})`
                    : tab === "proposed"
                    ? `Đề xuất (${stats.proposed})`
                    : `Chưa rõ (${stats.unknown})`}
                </button>
              ))}
            </div>

            {/* Decision Cards List */}
            <div className="space-y-3">
              {filteredDecisions.map((entry) => {
                const isEditing = editingDecisionId === entry.id;

                return (
                  <div
                    key={entry.id}
                    className={`p-3 rounded-lg border text-xs transition-shadow ${
                      entry.status === "confirmed"
                        ? "bg-emerald-50/40 border-emerald-300"
                        : entry.status === "proposed"
                        ? "bg-amber-50/40 border-amber-300"
                        : "bg-slate-50 border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                          {entry.category}
                        </span>
                        <h4 className="font-semibold text-neutral-900 text-xs">{entry.title}</h4>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          entry.status === "confirmed"
                            ? "bg-emerald-100 text-emerald-800"
                            : entry.status === "proposed"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-200 text-slate-800"
                        }`}
                      >
                        {entry.status === "confirmed"
                          ? "CONFIRMED"
                          : entry.status === "proposed"
                          ? "PROPOSED"
                          : "UNKNOWN"}
                      </span>
                    </div>

                    {/* Value Field (Editable) */}
                    {isEditing ? (
                      <div className="mt-2 space-y-2">
                        <textarea
                          rows={2}
                          value={editDecisionValue}
                          onChange={(e) => setEditDecisionValue(e.target.value)}
                          className="w-full p-2 border border-neutral-300 rounded text-xs focus:ring-1 focus:ring-teal-500 outline-none"
                        />
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingDecisionId(null)}
                            className="px-2 py-1 rounded bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveDecisionEdit(entry.id)}
                            className="px-2.5 py-1 rounded bg-teal-700 text-white hover:bg-teal-800 font-medium"
                          >
                            Lưu
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="font-medium text-neutral-800 bg-white/70 p-2 rounded border border-neutral-200/60 my-1 font-mono text-[11.5px]">
                          {entry.currentValue}
                        </div>
                        <p className="text-neutral-500 text-[11px] leading-relaxed mt-1">
                          {entry.description}
                        </p>
                      </>
                    )}

                    {/* Action Buttons: Confirm & Edit */}
                    {!isEditing && (
                      <div className="mt-2 pt-2 border-t border-neutral-200/50 flex items-center justify-between">
                        <span className="text-[10px] text-neutral-400">Nguồn: {entry.source}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingDecisionId(entry.id);
                              setEditDecisionValue(entry.currentValue);
                            }}
                            className="px-2 py-1 rounded text-neutral-600 hover:bg-neutral-200/80 flex items-center gap-1 text-[11px]"
                            title="Sửa nội dung"
                          >
                            <Edit3 size={11} /> Sửa
                          </button>
                          {entry.canConfirm && (
                            <button
                              type="button"
                              onClick={() => handleToggleConfirmDecision(entry.id)}
                              className={`px-2.5 py-1 rounded font-medium flex items-center gap-1 text-[11px] ${
                                entry.status === "confirmed"
                                  ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                                  : "bg-teal-700 text-white hover:bg-teal-800"
                              }`}
                            >
                              {entry.status === "confirmed" ? (
                                <>
                                  <RotateCcw size={11} /> Chuyển thành Đề xuất
                                </>
                              ) : (
                                <>
                                  <Check size={11} /> Xác nhận
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
