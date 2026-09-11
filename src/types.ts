export interface Habit {
  id: number;
  ten: string;
  mucTieuThang: number;
  met?: number | null;
  phutMacDinh?: number | null;
  thuTu: number;
  thuBit: string; // e.g. '1234567'
  gioNhac?: number | null; // minutes from 00:00 (e.g. 8*60 = 480)
  an: boolean;
  anTu?: string | null;
  taoLuc: string; // ISO date string YYYY-MM-DD
}

export interface Tick {
  habitId: number;
  ngay: string; // YYYY-MM-DD
  phut?: number | null;
}

export interface Profile {
  id: number;
  sex?: 'nam' | 'nu' | null;
  heightCm?: number | null;
  dob?: string | null; // YYYY-MM-DD
  activity: number; // 1.2, 1.375, 1.55, 1.725, 1.9
  targetKg?: number | null;
  tenGoi?: string | null;
  nhipKg: number; // 0.25, 0.5, 0.75, 1.0 (default 0.5)
  startKg?: number | null;
  startEo?: number | null;
  startHong?: number | null;
  startNguc?: number | null;
  startBapTay?: number | null;
  startDoNgay?: string | null;
}

export interface WeighIn {
  ngay: string; // YYYY-MM-DD
  kg: number;
}

export interface TapIn {
  id: number;
  ngay: string; // YYYY-MM-DD
  loai: string; // e.g. 'di_bo', 'chay', 'dap_xe', 'khang_luc', 'yoga', etc.
  phut: number;
}

export interface ChiSoIn {
  ngay: string; // YYYY-MM-DD
  eo?: number | null;
  hong?: number | null;
  nguc?: number | null;
  bapTay?: number | null;
}

export interface NapIn {
  ngay: string; // YYYY-MM-DD
  kcal: number;
}

export interface Food {
  id: number;
  ten: string;
  kcal: number;
  gram?: number | null;
  vanBan?: string | null;
  dam?: number | null; // grams protein
  bot?: number | null; // grams carbs
  beo?: number | null; // grams fat
}

export interface FoodLog {
  id: number;
  ngay: string; // YYYY-MM-DD
  foodId?: number | null;
  ten: string;
  kcal: number;
  gram?: number | null;
  dam?: number | null;
  bot?: number | null;
  beo?: number | null;
  khung: 'sang' | 'trua' | 'chieu' | 'toi';
}

export interface AuraProfile {
  id: number;
  level: number;
  exp: number;
  unspent: number;
  luc: number;
  ben: number;
  chi: number;
  tinh: number;
}

export interface AuraQuestLog {
  ngay: string;
  kind: string; // 'habit' | 'tap' | 'can'
  refId: number;
  exp: number;
}

export interface AuraFragment {
  id: number;
  cau: string;
  ngay: string;
}

export interface AppData {
  habits: Habit[];
  ticks: Tick[];
  profile: Profile;
  weighIns: WeighIn[];
  tapIns: TapIn[];
  chiSoIns: ChiSoIn[];
  napIns: NapIn[];
  foods: Food[];
  foodLogs: FoodLog[];
  auraProfile: AuraProfile;
  auraQuestLogs: AuraQuestLog[];
  auraFragments: AuraFragment[];
}

export interface LuaTap {
  so: number;
  sang: boolean;
}

export interface DocMon {
  ten?: string;
  gram?: number;
  kcal?: number;
  dam?: number;
  bot?: number;
  beo?: number;
}
