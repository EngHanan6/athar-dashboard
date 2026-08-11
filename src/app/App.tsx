import { useState, useEffect, type ElementType } from "react";
import { ProactiveActionCard } from './components/ProactiveActionCard';
import {
  Activity, Zap, Droplets, Building2, Car, Bell,
  Settings, Shield, ChevronDown, Cpu, Users,
  Wifi, ArrowUp, BarChart3, Target, TrendingUp,
  AlertTriangle, CheckCircle2, RefreshCw, MapPin,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// ── Types ─────────────────────────────────────────────────────────
type Severity = "critical" | "warning" | "info";
type SectorKey = "water" | "transport" | "energy" | "municipal";

// ── Severity palette ──────────────────────────────────────────────
const SEV: Record<Severity, { dot: string; text: string; border: string; bg: string; hex: string }> = {
  critical: { dot: "bg-red-500", text: "text-red-400", border: "border-red-500/30", bg: "bg-red-500/10", hex: "#ef4444" },
  warning:  { dot: "bg-amber-500", text: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10", hex: "#f59e0b" },
  info:     { dot: "bg-sky-400", text: "text-sky-400", border: "border-sky-500/30", bg: "bg-sky-500/10", hex: "#38bdf8" },
};

// ── Constants ─────────────────────────────────────────────────────
const EVENTS = [
  "موسم الرياض — فعالية كبرى",
  "موسم جدة — الحفل الكبير",
  "فعاليات العيد الوطني الـ95",
];

const SECTORS: { id: SectorKey; label: string; icon: ElementType; level: Severity; base: number }[] = [
  { id: "transport", label: "النقل والمواصلات", icon: Car, level: "critical", base: 94 },
  { id: "energy",    label: "الطاقة والكهرباء", icon: Zap, level: "warning",  base: 78 },
  { id: "water",     label: "المياه والصرف",    icon: Droplets, level: "critical", base: 91 },
  { id: "municipal", label: "الخدمات البلدية",  icon: Building2, level: "info",  base: 62 },
];

const BOTTLENECKS: {
  id: number; time: string; severity: Severity; title: string; desc: string; action: string; sector: SectorKey;
}[] = [
  { id: 1, time: "17:30", severity: "critical", title: "نقص مياه في الحي السابع", desc: "متوقع انخفاض ضغط المياه بنسبة 42%", action: "رفع طاقة الخزان", sector: "water" },
  { id: 2, time: "18:00", severity: "warning",  title: "اختناق مروري — طريق الملك فهد", desc: "توقع تراكم 8,200 مركبة في الاتجاهين", action: "تحويل المسار", sector: "transport" },
  { id: 3, time: "18:45", severity: "critical", title: "ضغط حرج على الشبكة الكهربائية", desc: "الطلب يتجاوز الطاقة الإنتاجية بـ 340 ميغاواط", action: "تفعيل خطوط الاحتياط", sector: "energy" },
  { id: 4, time: "19:30", severity: "warning",  title: "امتلاء الصرف الصحي — منطقة المسارح", desc: "الطاقة الاستيعابية وصلت 87% من الحد الأقصى", action: "نشر وحدات إضافية", sector: "municipal" },
  { id: 5, time: "20:15", severity: "info",     title: "ازدحام البوابات الشمالية", desc: "متوقع 12,000 زائر خلال 30 دقيقة", action: "فتح بوابات إضافية", sector: "transport" },
  { id: 6, time: "21:00", severity: "info",     title: "ارتفاع الطلب على مواقف السيارات", desc: "امتلاء 92% من المواقف المركزية", action: "توجيه لمواقف بديلة", sector: "transport" },
];

const TREND_DATA = [
  { time: "06:00", زوار: 45, ضغط: 12 },
  { time: "09:00", زوار: 180, ضغط: 28 },
  { time: "12:00", زوار: 520, ضغط: 45 },
  { time: "15:00", زوار: 980, ضغط: 62 },
  { time: "17:00", زوار: 1450, ضغط: 71 },
  { time: "18:00", زوار: 1820, ضغط: 78 },
  { time: "20:00", زوار: 2100, ضغط: 85 },
  { time: "22:00", زوار: 1650, ضغط: 68 },
];

const HEAT_ZONES: { x: number; y: number; r: number; name: string; level: Severity }[] = [
  { x: 342, y: 222, r: 58, name: "فنادق الرياض",    level: "critical" },
  { x: 320, y: 200, r: 40, name: "مطار الملك خالد", level: "critical" },
  { x: 104, y: 248, r: 44, name: "ميناء جدة",       level: "warning" },
  { x: 462, y: 190, r: 36, name: "الدمام الصناعي",  level: "warning" },
  { x: 115, y: 272, r: 34, name: "مكة المكرمة",     level: "critical" },
  { x: 128, y: 166, r: 24, name: "المدينة المنورة", level: "info" },
];

const CITIES = [
  { x: 344, y: 230, name: "الرياض" },
  { x: 104, y: 252, name: "جدة" },
  { x: 117, y: 276, name: "مكة" },
  { x: 130, y: 168, name: "المدينة" },
  { x: 462, y: 194, name: "الدمام" },
  { x: 100, y: 110, name: "تبوك" },
  { x: 146, y: 370, name: "أبها" },
];

// Rough Saudi Arabia polygon (within 560×450 viewBox)
const SA_PATH = [
  "M 113,86 L 156,52 L 196,38 L 252,28 L 312,22 L 366,26",
  "L 393,47 L 417,77 L 439,114 L 459,152 L 477,188",
  "L 489,223 L 493,258 L 486,289 L 469,316",
  "L 449,341 L 431,365 L 409,387 L 379,409",
  "L 343,427 L 301,441 L 259,445 L 216,439",
  "L 173,423 L 146,397 L 123,361",
  "L 101,315 L 87,268 L 78,221 L 76,173",
  "L 80,130 L 99,103 Z",
].join(" ");

// ── Helpers ───────────────────────────────────────────────────────
function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "م";
  if (n >= 1_000)     return Math.round(n / 1_000) + "ك";
  return String(n);
}

function fmtTime(d: Date): string {
  return d.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

// ── KPI Card ──────────────────────────────────────────────────────
interface KPIProps {
  title: string;
  value: string;
  unit?: string;
  change: string;
  positive: boolean;
  level: "normal" | "warning" | "critical";
  icon: ElementType;
  sub?: string;
}

function KPICard({ title, value, unit, change, positive, level, icon: Icon, sub }: KPIProps) {
  const colors = {
    normal:   { border: "border-emerald-500/20", glow: "bg-emerald-500/8",  icon: "bg-emerald-500/10 text-emerald-400", val: "text-emerald-300" },
    warning:  { border: "border-amber-500/25",   glow: "bg-amber-500/8",    icon: "bg-amber-500/10 text-amber-400",    val: "text-amber-300"   },
    critical: { border: "border-red-500/25",     glow: "bg-red-500/8",      icon: "bg-red-500/10 text-red-400",        val: "text-red-300"     },
  }[level];

  return (
    <div className={`relative bg-card rounded-xl border ${colors.border} p-4 overflow-hidden shadow-lg`}>
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none ${colors.glow}`} />
      <div className="relative flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-muted-foreground mb-1 leading-tight">{title}</p>
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className={`text-[26px] font-bold leading-none font-mono ${colors.val}`}>{value}</span>
            {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
          </div>
          {sub && <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>}
          <div className={`flex items-center gap-1 mt-2 text-[10px] ${positive ? "text-emerald-400" : "text-red-400"}`}>
            <ArrowUp className={`h-2.5 w-2.5 flex-none ${positive ? "" : "rotate-180"}`} />
            <span>{change}</span>
          </div>
        </div>
        <div className={`flex-none p-2.5 rounded-lg ${colors.icon}`}>
          <Icon className="h-4.5 w-4.5" style={{ width: "18px", height: "18px" }} />
        </div>
      </div>
    </div>
  );
}

// ── Saudi Arabia Map ──────────────────────────────────────────────
function SaudiMap({ sliderValue }: { sliderValue: number }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 2000);
    return () => clearInterval(id);
  }, []);

  const sf = 1 + sliderValue / 100;

  return (
    <div className="relative bg-[#03091a] rounded-xl border border-[#1a3366]/40 overflow-hidden h-full flex flex-col">
      {/* Corner labels */}
      <div className="absolute top-3 right-3 text-[9px] text-emerald-500/40 font-mono z-10">KSA-GRID-07</div>
      <div className="absolute top-3 left-3 text-[9px] text-emerald-500/40 font-mono z-10">24°N 46°E</div>
      <div className="absolute bottom-3 right-3 text-[9px] text-emerald-500/40 font-mono z-10">ATHAR-MAP v2.1</div>

      {/* Section title */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
        <MapPin className="h-3 w-3 text-emerald-400" />
        <span className="text-[10px] text-emerald-400/80 font-medium">خريطة التوزيع الحراري — المملكة العربية السعودية</span>
      </div>

      {/* SVG map */}
      <svg viewBox="0 0 560 450" className="w-full flex-1" preserveAspectRatio="xMidYMid meet">
        <defs>
          {/* Grid pattern */}
          <pattern id="mapgrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a3a6a" strokeWidth="0.4" opacity="0.5" />
          </pattern>
          {/* Heat gradients */}
          <radialGradient id="hcrit" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.65" />
            <stop offset="55%" stopColor="#ef4444" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hwarn" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.55" />
            <stop offset="55%" stopColor="#f59e0b" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hinfo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
            <stop offset="55%" stopColor="#38bdf8" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>
          {/* Map body glow */}
          <filter id="mGlow" x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="dGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
        </defs>

        {/* Background grid */}
        <rect width="560" height="450" fill="url(#mapgrid)" />

        {/* Country fill */}
        <path d={SA_PATH} fill="#091526" stroke="#1e4080" strokeWidth="1.5" filter="url(#mGlow)" />
        {/* Inner subtle texture */}
        <path d={SA_PATH} fill="none" stroke="#10b981" strokeWidth="0.5" opacity="0.12" />

        {/* Heat zones */}
        {HEAT_ZONES.map((z, i) => {
          const r = z.r * Math.min(1.6, sf);
          const gradId = z.level === "critical" ? "hcrit" : z.level === "warning" ? "hwarn" : "hinfo";
          const pulse = tick % 2 === 0 ? 1 : 0.7;
          return (
            <g key={i} style={{ opacity: pulse, transition: "opacity 1.8s ease" }}>
              <circle cx={z.x} cy={z.y} r={r} fill={`url(#${gradId})`} />
              <circle cx={z.x} cy={z.y} r={z.r * 0.45} fill={SEV[z.level].hex} opacity="0.25" />
            </g>
          );
        })}

        {/* City dots + labels */}
        {CITIES.map((c, i) => (
          <g key={i}>
            {/* Outer ring */}
            <circle cx={c.x} cy={c.y} r={7} fill="none" stroke="#10b981" strokeWidth="0.7" opacity="0.35" />
            <circle cx={c.x} cy={c.y} r={3.5} fill="#10b981" opacity="0.9" />
            <circle cx={c.x} cy={c.y} r={1.5} fill="#ffffff" opacity="0.8" />
            <text
              x={c.x + (c.x > 290 ? -12 : 10)}
              y={c.y - 8}
              fill="#94a3b8"
              fontSize="9"
              textAnchor={c.x > 290 ? "end" : "start"}
              fontFamily="'Readex Pro', sans-serif"
            >{c.name}</text>
          </g>
        ))}

        {/* Riyadh event pin */}
        <g>
          <circle cx={344} cy={222} r={12} fill="none" stroke="#10b981" strokeWidth="1.2" opacity="0.6" strokeDasharray="3 2" />
          <circle cx={344} cy={222} r={5} fill="#10b981" opacity="0.9" />
          <text x={358} y={218} fill="#10b981" fontSize="8" fontFamily="'Readex Pro', sans-serif" opacity="0.9">الحدث الرئيسي</text>
        </g>
      </svg>

      {/* Legend */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/5">
        {(["critical", "warning", "info"] as Severity[]).map(s => (
          <div key={s} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SEV[s].hex, boxShadow: `0 0 6px ${SEV[s].hex}` }} />
            <span className="text-[9px] text-slate-400">
              {s === "critical" ? "حرج" : s === "warning" ? "تحذير" : "منخفض"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Cascade Flow ──────────────────────────────────────────────────
function CascadeFlow({ sliderValue }: { sliderValue: number }) {
  const sf = 1 + sliderValue / 100;
  return (
    <div className="bg-card rounded-xl border border-border/40 p-3">
      <div className="flex items-center gap-1.5 mb-3">
        <Activity className="h-3 w-3 text-emerald-400" />
        <span className="text-[10px] text-muted-foreground font-medium">تسلسل تأثير الحدث على القطاعات</span>
      </div>
      <div className="flex items-center gap-2">
        {/* Source node */}
        <div className="flex-none">
          <div className="w-[68px] h-[68px] rounded-xl bg-emerald-500/10 border border-emerald-500/40 flex flex-col items-center justify-center gap-1 shadow-lg shadow-emerald-500/10">
            <Target className="h-4 w-4 text-emerald-400" />
            <span className="text-[8px] text-emerald-400 text-center leading-tight font-medium">فعالية<br />الرياض</span>
          </div>
        </div>

        {/* Arrow lines */}
        <div className="flex-none w-6 relative h-[68px]">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="absolute w-full h-px bg-gradient-to-l from-emerald-500/60 to-transparent"
              style={{ top: `${8 + i * 17}px` }} />
          ))}
        </div>

        {/* Sector nodes */}
        <div className="flex-1 grid grid-cols-2 gap-1.5">
          {SECTORS.map(s => {
            const stress = Math.min(99, Math.round(s.base * Math.pow(sf, 1.2)));
            const c = SEV[s.level];
            const Icon = s.icon;
            return (
              <div key={s.id} className={`rounded-lg border ${c.border} bg-muted/50 p-1.5 flex items-center gap-1.5`}>
                <div className={`p-1 rounded-md ${c.bg} flex-none`}>
                  <Icon className={`h-2.5 w-2.5 ${c.text}`} style={{ width: "10px", height: "10px" }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[8px] text-muted-foreground leading-tight truncate">{s.label}</div>
                  <div className={`text-xs font-bold font-mono ${c.text}`}>{stress}%</div>
                </div>
                <div className={`w-1.5 h-1.5 rounded-full ${c.dot} animate-pulse flex-none`} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Trend Chart ───────────────────────────────────────────────────
function TrendChart({ sliderValue }: { sliderValue: number }) {
  const sf = 1 + sliderValue / 100;
  const data = TREND_DATA.map(d => ({
    time: d.time,
    زوار: Math.round(d["زوار"] * sf),
    ضغط: Math.min(99, Math.round(d["ضغط"] * Math.pow(sf, 1.3))),
  }));

  return (
    <div className="bg-card rounded-xl border border-border/40 p-3 flex flex-col">
      <div className="flex items-center gap-1.5 mb-2">
        <TrendingUp className="h-3 w-3 text-emerald-400" />
        <span className="text-[10px] text-muted-foreground font-medium">منحنى الحضور والضغط</span>
        <div className="mr-auto flex gap-3">
          {[["#10b981", "زوار (ك)"], ["#f59e0b", "ضغط %"]].map(([c, l]) => (
            <div key={l} className="flex items-center gap-1">
              <div className="w-3 h-0.5 rounded" style={{ backgroundColor: c }} />
              <span className="text-[8px] text-muted-foreground">{l}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1" style={{ minHeight: "90px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" tick={{ fill: "#475569", fontSize: 7 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#475569", fontSize: 7 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "#0b1528", border: "1px solid #1e3a5f", borderRadius: "8px", fontSize: "11px", color: "#e2e8f0" }}
              itemStyle={{ color: "#94a3b8" }}
            />
            <Area type="monotone" dataKey="زوار" stroke="#10b981" strokeWidth={1.5} fill="url(#gV)" dot={false} />
            <Area type="monotone" dataKey="ضغط"  stroke="#f59e0b" strokeWidth={1.5} fill="url(#gS)"  dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── AI Recommendations Panel ──────────────────────────────────────
function AIPanel({ sliderValue }: { sliderValue: number }) {
  const [resolved, setResolved] = useState<Set<number>>(new Set());
  const sf = 1 + sliderValue / 100;
  const visible = sliderValue > 40 ? BOTTLENECKS : BOTTLENECKS.slice(0, 4);

  const toggle = (id: number) => setResolved(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const SectorIcon: Record<SectorKey, ElementType> = {
    water: Droplets, transport: Car, energy: Zap, municipal: Building2,
  };

  const counts = {
    critical: visible.filter(b => b.severity === "critical" && !resolved.has(b.id)).length,
    warning:  visible.filter(b => b.severity === "warning"  && !resolved.has(b.id)).length,
    info:     visible.filter(b => b.severity === "info"     && !resolved.has(b.id)).length,
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Panel header */}
      <div className="flex items-center justify-between flex-none">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Cpu className="h-4 w-4 text-emerald-400" />
            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          </div>
          <span className="text-sm font-semibold text-foreground">توصيات الذكاء الاصطناعي</span>
        </div>
        <div className="flex items-center gap-1 text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span>نشط</span>
        </div>
      </div>

      {/* Alert counts */}
      <div className="grid grid-cols-3 gap-2 flex-none">
        {(["critical", "warning", "info"] as Severity[]).map((sev) => (
          <div key={sev} className={`${SEV[sev].bg} border ${SEV[sev].border} rounded-lg p-2 text-center`}>
            <div className={`text-xl font-bold font-mono ${SEV[sev].text}`}>{counts[sev]}</div>
            <div className={`text-[9px] ${SEV[sev].text} opacity-70`}>{sev === "critical" ? "حرج" : sev === "warning" ? "تحذير" : "تنبيه"}</div>
          </div>
        ))}
      </div>

      {/* Throughput bar */}
      <div className="flex-none bg-muted/50 rounded-lg px-3 py-2 flex items-center gap-3">
        <span className="text-[9px] text-muted-foreground whitespace-nowrap">معدل المعالجة</span>
        <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-400 rounded-full transition-all duration-700"
            style={{ width: `${Math.min(99, Math.round(72 * sf))}%` }}
          />
        </div>
        <span className="text-[9px] font-mono text-emerald-400 whitespace-nowrap">{Math.min(99, Math.round(72 * sf))}%</span>
      </div>

      {/* Bottleneck list */}
      <div className="flex-1 overflow-y-auto space-y-2" style={{ scrollbarWidth: "thin", scrollbarColor: "#1e3a5f transparent" }}>
        {visible.map(b => {
          const c = SEV[b.severity];
          const Icon = SectorIcon[b.sector];
          const done = resolved.has(b.id);
          return (
            <div
              key={b.id}
              className={`rounded-lg border p-3 transition-all duration-300 ${done ? "border-emerald-500/20 bg-emerald-500/5 opacity-60" : `${c.border} bg-card/70`}`}
            >
              <div className="flex items-start gap-2">
                <div className="flex-none flex flex-col items-center gap-1.5 pt-0.5">
                  <span className={`text-[10px] font-mono font-bold ${done ? "text-emerald-400" : c.text}`}>{b.time}</span>
                  <div className={`w-1.5 h-1.5 rounded-full ${done ? "bg-emerald-500" : c.dot}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Icon className={`h-3 w-3 flex-none ${done ? "text-emerald-400" : c.text}`} style={{ width: "11px", height: "11px" }} />
                    <span className={`text-[11px] font-semibold leading-tight ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {b.title}
                    </span>
                  </div>
                  <p className="text-[9px] text-muted-foreground mb-2 leading-snug">{b.desc}</p>
                  {done ? (
                    <div className="flex items-center gap-1 text-[9px] text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>تم التنفيذ</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => toggle(b.id)}
                      className={`w-full text-[10px] px-2 py-1 rounded-md border ${c.border} ${c.bg} ${c.text} hover:opacity-80 active:scale-95 transition-all duration-150 font-medium`}
                    >
                      ⚡ {b.action}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Scenario Simulator ────────────────────────────────────────────
function ScenarioSimulator({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const sf = 1 + value / 100;
  const visitors  = Math.round(2_400_000 * sf);
  const stress    = Math.min(99, Math.round(78 * Math.pow(sf, 1.4)));
  const power     = Math.round(340 * sf);
  const water     = Math.round(2.1 * sf * 10) / 10;
  const readiness = Math.max(42, Math.round(87 / Math.pow(sf, 0.8)));

  const label =
    value <= 10 ? "الخط الأساسي" :
    value <= 30 ? "سيناريو معتدل (+20%)" :
    value <= 55 ? "سيناريو مرتفع (+50%)" :
    "أقصى حمولة";

  const labelColor =
    value <= 10 ? "text-emerald-400" :
    value <= 30 ? "text-amber-400" :
    value <= 55 ? "text-orange-400" :
    "text-red-400";

  const trackColor =
    value <= 10 ? "#10b981" :
    value <= 30 ? "#f59e0b" :
    value <= 55 ? "#f97316" :
    "#ef4444";

  return (
    <div className="bg-card rounded-xl border border-border/40 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-semibold text-foreground">محاكي السيناريوهات</span>
          <span className="text-[10px] text-muted-foreground">— الزوار المتوقعون وتأثيرهم على البنية التحتية</span>
        </div>
        <span className={`text-xs font-bold ${labelColor}`}>{label}</span>
      </div>

      {/* Slider */}
      <div className="mb-4 px-1">
        <div dir="ltr" className="relative">
          <input
            type="range" min={0} max={100} value={value}
            onChange={e => onChange(+e.target.value)}
            className="w-full h-2 rounded-full appearance-none cursor-pointer outline-none"
            style={{
              background: `linear-gradient(to right, ${trackColor} ${value}%, #1e3a5f ${value}%)`,
            }}
          />
          {/* tick marks */}
          <div dir="ltr" className="flex justify-between mt-1.5 px-0.5">
            {[["0%", "الخط الأساسي"], ["20%", "+20%"], ["50%", "+50%"], ["100%", "أقصى"]].map(([pct, ar]) => (
              <div key={pct} className="flex flex-col items-center gap-0.5">
                <div className="w-0.5 h-1.5 bg-slate-600" />
                <span className="text-[8px] text-muted-foreground">{ar}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic metric tiles */}
      <div className="grid grid-cols-5 gap-2">
        {/* Visitors */}
        <div className="col-span-1 bg-secondary/60 rounded-lg p-3 text-center">
          <div className="text-[9px] text-muted-foreground mb-1 leading-tight">الزوار المتوقعون</div>
          <div className="text-lg font-bold font-mono text-foreground">{fmt(visitors)}</div>
          <div className="text-[8px] text-emerald-400 mt-0.5">+{Math.round((sf - 1) * 100)}%</div>
        </div>
        {/* Stress */}
        <div className={`col-span-1 bg-secondary/60 rounded-lg p-3 text-center border ${stress >= 90 ? "border-red-500/30" : stress >= 75 ? "border-amber-500/30" : "border-transparent"}`}>
          <div className="text-[9px] text-muted-foreground mb-1 leading-tight">ضغط البنية التحتية</div>
          <div className={`text-lg font-bold font-mono ${stress >= 90 ? "text-red-400" : stress >= 75 ? "text-amber-400" : "text-emerald-400"}`}>{stress}%</div>
          <div className="text-[8px] text-muted-foreground mt-0.5">من الطاقة القصوى</div>
        </div>
        {/* Power */}
        <div className="col-span-1 bg-secondary/60 rounded-lg p-3 text-center">
          <div className="text-[9px] text-muted-foreground mb-1 leading-tight">دلتا الكهرباء</div>
          <div className="text-lg font-bold font-mono text-amber-400">+{power}</div>
          <div className="text-[8px] text-muted-foreground mt-0.5">ميغاواط</div>
        </div>
        {/* Water */}
        <div className="col-span-1 bg-secondary/60 rounded-lg p-3 text-center">
          <div className="text-[9px] text-muted-foreground mb-1 leading-tight">دلتا المياه</div>
          <div className="text-lg font-bold font-mono text-sky-400">+{water}م</div>
          <div className="text-[8px] text-muted-foreground mt-0.5">لتر / يوم</div>
        </div>
        {/* Readiness */}
        <div className={`col-span-1 bg-secondary/60 rounded-lg p-3 text-center border ${readiness < 60 ? "border-red-500/30" : readiness < 75 ? "border-amber-500/30" : "border-transparent"}`}>
          <div className="text-[9px] text-muted-foreground mb-1 leading-tight">تقييم الجاهزية</div>
          <div className={`text-lg font-bold font-mono ${readiness >= 75 ? "text-emerald-400" : readiness >= 60 ? "text-amber-400" : "text-red-400"}`}>{readiness}</div>
          <div className="text-[8px] text-muted-foreground mt-0.5">من 100</div>
        </div>
      </div>

      {/* Stress bar */}
      <div className="mt-3 flex items-center gap-3">
        <span className="text-[9px] text-muted-foreground whitespace-nowrap">مستوى الضغط الإجمالي</span>
        <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${stress}%`,
              background: stress >= 90 ? "#ef4444" : stress >= 75 ? "#f59e0b" : "#10b981",
              boxShadow: `0 0 8px ${stress >= 90 ? "#ef4444" : stress >= 75 ? "#f59e0b" : "#10b981"}`,
            }}
          />
        </div>
        <span className={`text-[9px] font-mono font-bold whitespace-nowrap ${stress >= 90 ? "text-red-400" : stress >= 75 ? "text-amber-400" : "text-emerald-400"}`}>
          {stress}%
        </span>
      </div>
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────
function Header({ event, setEvent, time, aiProcessing }: {
  event: string; setEvent: (e: string) => void; time: Date; aiProcessing: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex-none bg-card border-b border-border/50 px-5 py-2.5 flex items-center gap-4 z-20">
      {/* Logo */}
      <div className="flex items-center gap-2.5 flex-none">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10">
          <span className="text-emerald-400 font-bold text-xl leading-none" style={{ fontFamily: "'Readex Pro', sans-serif" }}>أ</span>
        </div>
        <div className="leading-none">
          <div className="text-xl font-bold text-foreground" style={{ fontFamily: "'Readex Pro', sans-serif", letterSpacing: "0.06em" }}>أثَر</div>
          <div className="text-[9px] text-muted-foreground mt-0.5">منصة التحليلات التنبؤية الحكومية</div>
        </div>
      </div>

      <div className="h-8 w-px bg-border/60 flex-none" />

      {/* Event selector */}
      <div className="relative flex-none">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2 bg-secondary/70 border border-border/70 rounded-lg px-3 py-1.5 text-[11px] text-foreground hover:bg-secondary transition-colors"
        >
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse flex-none" />
          <span className="max-w-[200px] truncate">{event}</span>
          <ChevronDown className={`h-3 w-3 text-muted-foreground flex-none transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <div className="absolute top-full mt-1 right-0 w-64 bg-card border border-border/60 rounded-lg overflow-hidden shadow-2xl z-50">
            {EVENTS.map(e => (
              <button
                key={e}
                onClick={() => { setEvent(e); setOpen(false); }}
                className={`w-full text-right px-3 py-2.5 text-[11px] hover:bg-secondary transition-colors flex items-center gap-2 ${e === event ? "text-emerald-400" : "text-foreground"}`}
              >
                {e === event && <div className="w-1 h-1 bg-emerald-400 rounded-full flex-none" />}
                <span>{e}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Date range badge */}
      <div className="flex-none bg-secondary/50 border border-border/50 rounded-lg px-3 py-1.5 text-[10px] text-muted-foreground">
        <span>3 أكتوبر — 10 نوفمبر 2025</span>
      </div>

      <div className="flex-1" />

      {/* Clock */}
      <div className="flex-none text-left">
        <div className="text-sm font-mono text-foreground tabular-nums">{fmtTime(time)}</div>
        <div className="text-[9px] text-muted-foreground">{fmtDate(time)}</div>
      </div>

      <div className="h-8 w-px bg-border/60 flex-none" />

      {/* Status row */}
      <div className="flex items-center gap-3 flex-none">
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
          <Wifi className="h-3 w-3" />
          <span>متصل بالشبكة</span>
        </div>
        {aiProcessing && (
          <div className="flex items-center gap-1.5 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full animate-pulse">
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span>جاري معالجة البيانات...</span>
          </div>
        )}
      </div>
    </header>
  );
}

// ── Main Dashboard Component ──────────────────────────────────────
export default function Dashboard() {
  const [event, setEvent] = useState(EVENTS[0]);
  const [sliderValue, setSliderValue] = useState(15);
  const [time, setTime] = useState(new Date());
  const [aiProcessing, setAiProcessing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSliderChange = (v: number) => {
    setSliderValue(v);
    setAiProcessing(true);
    setTimeout(() => setAiProcessing(false), 600);
  };

  const sf = 1 + sliderValue / 100;
  const visitors = Math.round(2_400_000 * sf);
  const stress = Math.min(99, Math.round(78 * Math.pow(sf, 1.4)));

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans overflow-hidden dir-rtl">
      {/* Header */}
      <Header event={event} setEvent={setEvent} time={time} aiProcessing={aiProcessing} />

      {/* Main Content Area */}
      <main className="flex-1 p-4 overflow-y-auto grid grid-cols-12 gap-4">
        {/* Top KPIs */}
        <div className="col-span-12 grid grid-cols-4 gap-4">
          <KPICard
            title="إجمالي الزوار المتوقعين"
            value={fmt(visitors)}
            unit="زائر"
            change={`+${Math.round((sf - 1) * 100)}% عن المعيار`}
            positive={true}
            level="normal"
            icon={Users}
            sub="المستوى المستهدف للتجمع"
          />
          <KPICard
            title="مؤشر ضغط البنية التحتية"
            value={`${stress}%`}
            change="+8% عن السعة العامة"
            positive={false}
            level={stress >= 90 ? "critical" : stress >= 75 ? "warning" : "normal"}
            icon={Activity}
            sub="معدل استهلاك الموارد"
          />
          <KPICard
            title="القطاعات تحت الضغط"
            value="3"
            unit="قطاعات"
            change="حالة حرجة في النقل والمياه"
            positive={false}
            level="critical"
            icon={AlertTriangle}
            sub="تتطلب تدخلاً استباقياً"
          />
          <KPICard
            title="معدل الجاهزية التشغيلية"
            value={`${Math.max(42, Math.round(87 / Math.pow(sf, 0.8)))}%`}
            change="-4% خلال الساعة الأخيرة"
            positive={false}
            level="warning"
            icon={Shield}
            sub="تقييم بناءً على محاكاة AI"
          />
        </div>

        {/* Middle Section: Map + Center Flows + Right AI Panel */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-12 gap-4">
          {/* Map */}
          <div className="col-span-12 md:col-span-7 h-[380px]">
            <SaudiMap sliderValue={sliderValue} />
          </div>

          {/* Flow & Trends */}
          <div className="col-span-12 md:col-span-5 flex flex-col gap-4">
            <CascadeFlow sliderValue={sliderValue} />
            <div className="flex-1">
              <TrendChart sliderValue={sliderValue} />
            </div>
          </div>

          {/* Scenario Simulator */}
          <div className="col-span-12">
            <ScenarioSimulator value={sliderValue} onChange={handleSliderChange} />
          </div>
        </div>

        {/* AI Recommendations Panel */}
        <div className="col-span-12 lg:col-span-4 bg-card rounded-xl border border-border/40 p-4 h-full">
          <AIPanel sliderValue={sliderValue} />
        </div>
      </main>
    </div>
  );
}