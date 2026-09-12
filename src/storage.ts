import { AppData, Habit, Tick, Profile, WeighIn, TapIn, ChiSoIn, NapIn, Food, FoodLog, AuraProfile, AuraQuestLog, AuraFragment, FocusTask } from './types';
import { Ten } from './chuoi';
import { He } from './he';
import { Ngay } from './ngay';
import { THUC_DON_MAC_DINH, tinhMacroTheoKhoiLuong } from './thuc_don';

const STORAGE_KEY = 'thoi_quen_app_offline_v1';

const defaultProfile: Profile = {
  id: 1,
  activity: 1.2,
  nhipKg: 0.5,
};

const defaultAura: AuraProfile = {
  id: 1,
  level: 1,
  exp: 0,
  unspent: 0,
  luc: 0,
  ben: 0,
  chi: 0,
  tinh: 0,
};

const defaultData: AppData = {
  habits: [],
  ticks: [],
  profile: defaultProfile,
  weighIns: [],
  tapIns: [],
  chiSoIns: [],
  napIns: [],
  foods: THUC_DON_MAC_DINH,
  foodLogs: [],
  auraProfile: defaultAura,
  auraQuestLogs: [],
  auraFragments: [],
  focusTasks: [],
  widgetStyle: 'day_du',
};

type Listener = () => void;
const listeners = new Set<Listener>();

let cachedData: AppData | null = null;
let levelUpMoment: string | null = null;
let flashOrange = 0;

function loadData(): AppData {
  if (cachedData) return cachedData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      let loadedFoods = THUC_DON_MAC_DINH;
      if (Array.isArray(parsed.foods) && parsed.foods.length > 0) {
        const defaultNames = new Set(THUC_DON_MAC_DINH.map((f) => f.ten.toLowerCase()));
        const customFoods = parsed.foods.filter((f: Food) => !defaultNames.has(f.ten.toLowerCase()));
        loadedFoods = [...THUC_DON_MAC_DINH, ...customFoods];
      }

      cachedData = {
        ...defaultData,
        ...parsed,
        foods: loadedFoods,
        profile: { ...defaultProfile, ...(parsed.profile || {}) },
        auraProfile: { ...defaultAura, ...(parsed.auraProfile || {}) },
        focusTasks: Array.isArray(parsed.focusTasks) ? parsed.focusTasks : [],
      };
      return cachedData!;
    }
  } catch (e) {
    console.error('Error reading localStorage:', e);
  }
  cachedData = { ...defaultData };
  return cachedData;
}

function saveData(data: AppData) {
  cachedData = data;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
  listeners.forEach((fn) => fn());
}

export const StorageService = {
  subscribe(fn: Listener): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  getData(): AppData {
    return loadData();
  },

  getLevelUpMoment(): string | null {
    return levelUpMoment;
  },

  clearLevelUpMoment(): void {
    levelUpMoment = null;
    listeners.forEach((fn) => fn());
  },

  getFlashOrange(): number {
    return flashOrange;
  },

  // --- HABITS ---
  getHabits(): Habit[] {
    const data = loadData();
    return data.habits.filter((h) => !h.an);
  },

  addHabit(param: {
    ten: string;
    mucTieuThang?: number;
    met?: number | null;
    phutMacDinh?: number | null;
    thuBit?: string;
    gioNhac?: number | null;
    gioBatDau?: string | null;
    gioKetThuc?: string | null;
    createdDate?: string;
  }): Habit | null {
    const tenSach = Ten.sach(param.ten);
    if (!tenSach) return null;

    const data = loadData();
    if (data.habits.filter((h) => !h.an).length >= 8) return null;
    if (data.habits.some((h) => Ten.trung(h.ten, tenSach))) return null;

    const nextId = data.habits.length > 0 ? Math.max(...data.habits.map((h) => h.id)) + 1 : 1;
    const newHabit: Habit = {
      id: nextId,
      ten: tenSach,
      mucTieuThang: param.mucTieuThang ?? 25,
      met: param.met ?? null,
      phutMacDinh: param.phutMacDinh ?? null,
      thuTu: data.habits.length,
      thuBit: param.thuBit ?? '1234567',
      gioNhac: param.gioNhac ?? null,
      gioBatDau: param.gioBatDau ?? null,
      gioKetThuc: param.gioKetThuc ?? null,
      an: false,
      taoLuc: param.createdDate ?? Ngay.iso(new Date()),
    };

    saveData({
      ...data,
      habits: [...data.habits, newHabit],
    });

    return newHabit;
  },

  updateHabit(
    id: number,
    param: {
      ten?: string;
      mucTieuThang?: number;
      met?: number | null;
      phutMacDinh?: number | null;
      thuBit?: string;
      gioNhac?: number | null;
      gioBatDau?: string | null;
      gioKetThuc?: string | null;
      xoaGioNhac?: boolean;
    }
  ): boolean {
    const data = loadData();
    const habit = data.habits.find((h) => h.id === id);
    if (!habit) return false;

    let ten = habit.ten;
    if (param.ten !== undefined) {
      const tenSach = Ten.sach(param.ten);
      if (!tenSach) return false;
      if (data.habits.some((h) => h.id !== id && Ten.trung(h.ten, tenSach))) return false;
      ten = tenSach;
    }

    const updated = data.habits.map((h) => {
      if (h.id !== id) return h;
      return {
        ...h,
        ten,
        mucTieuThang: param.mucTieuThang ?? h.mucTieuThang,
        met: param.met !== undefined ? param.met : h.met,
        phutMacDinh: param.phutMacDinh !== undefined ? param.phutMacDinh : h.phutMacDinh,
        thuBit: param.thuBit !== undefined ? param.thuBit : h.thuBit,
        gioNhac: param.xoaGioNhac ? null : param.gioNhac !== undefined ? param.gioNhac : h.gioNhac,
        gioBatDau: param.gioBatDau !== undefined ? param.gioBatDau : h.gioBatDau,
        gioKetThuc: param.gioKetThuc !== undefined ? param.gioKetThuc : h.gioKetThuc,
      };
    });

    saveData({ ...data, habits: updated });
    return true;
  },

  deleteHabit(id: number): void {
    const data = loadData();
    saveData({
      ...data,
      habits: data.habits.filter((h) => h.id !== id),
      ticks: data.ticks.filter((t) => t.habitId !== id),
    });
  },

  // --- TICKS ---
  toggleTick(habitId: number, ngay: string): boolean {
    const data = loadData();
    const habit = data.habits.find((h) => h.id === habitId);
    if (!habit) return false;

    const existingIndex = data.ticks.findIndex((t) => t.habitId === habitId && t.ngay === ngay);
    let newTicks: Tick[];
    let ticked = false;

    if (existingIndex >= 0) {
      newTicks = data.ticks.filter((_, i) => i !== existingIndex);
      ticked = false;
    } else {
      newTicks = [...data.ticks, { habitId, ngay, phut: habit.phutMacDinh ?? null }];
      ticked = true;
      // Award Aura EXP for habit tick
      StorageService.awardQuestExp('habit', habitId, ngay, He.expTick);
    }

    saveData({
      ...loadData(), // reload in case awardQuestExp modified aura
      ticks: newTicks,
    });
    return ticked;
  },

  getTicksForDay(ngay: string): Tick[] {
    const data = loadData();
    return data.ticks.filter((t) => t.ngay === ngay);
  },

  getTicksForHabit(habitId: number): Tick[] {
    const data = loadData();
    return data.ticks.filter((t) => t.habitId === habitId);
  },

  getTicksForMonth(prefix: string): Tick[] {
    const data = loadData();
    return data.ticks.filter((t) => t.ngay.startsWith(prefix));
  },

  // --- WEIGH INS ---
  saveWeighIn(ngay: string, kg: number): void {
    const data = loadData();
    const existingIndex = data.weighIns.findIndex((w) => w.ngay === ngay);
    let updated: WeighIn[];
    if (existingIndex >= 0) {
      updated = data.weighIns.map((w, i) => (i === existingIndex ? { ngay, kg } : w));
    } else {
      updated = [...data.weighIns, { ngay, kg }];
    }
    // Sort descending by date
    updated.sort((a, b) => b.ngay.localeCompare(a.ngay));

    // Quest log
    StorageService.awardQuestExp('can', 0, ngay, He.expCan);

    saveData({
      ...loadData(),
      weighIns: updated,
    });
  },

  getLatestWeighIn(): WeighIn | null {
    const data = loadData();
    if (data.weighIns.length === 0) return null;
    return data.weighIns[0];
  },

  // --- WORKOUTS (TAP INS) ---
  addTapIn(ngay: string, loai: string, phut: number): number {
    const data = loadData();
    const nextId = data.tapIns.length > 0 ? Math.max(...data.tapIns.map((t) => t.id)) + 1 : 1;
    const newTap: TapIn = { id: nextId, ngay, loai, phut };

    // Calculate approx kcal and award EXP
    const exp = He.expTap(phut * 5);
    StorageService.awardQuestExp('tap', nextId, ngay, exp);

    saveData({
      ...loadData(),
      tapIns: [newTap, ...data.tapIns],
    });
    return nextId;
  },

  deleteTapIn(id: number): void {
    const data = loadData();
    saveData({
      ...data,
      tapIns: data.tapIns.filter((t) => t.id !== id),
    });
  },

  // --- BODY METRICS (CHI SO) ---
  saveChiSo(ngay: string, metrics: { eo?: number | null; hong?: number | null; nguc?: number | null; bapTay?: number | null }): void {
    const data = loadData();
    const idx = data.chiSoIns.findIndex((c) => c.ngay === ngay);
    let updated: ChiSoIn[];
    if (idx >= 0) {
      updated = data.chiSoIns.map((c, i) => (i === idx ? { ngay, ...metrics } : c));
    } else {
      updated = [{ ngay, ...metrics }, ...data.chiSoIns];
    }
    saveData({ ...data, chiSoIns: updated });
  },

  // --- NUTRITION / FOOD (NAP / FOOD LOG) ---
  saveNap(ngay: string, kcal: number): void {
    const data = loadData();
    const idx = data.napIns.findIndex((n) => n.ngay === ngay);
    let updated: NapIn[];
    if (idx >= 0) {
      updated = data.napIns.map((n, i) => (i === idx ? { ngay, kcal } : n));
    } else {
      updated = [{ ngay, kcal }, ...data.napIns];
    }
    saveData({ ...data, napIns: updated });
  },

  getFoods(): Food[] {
    const data = loadData();
    return data.foods && data.foods.length > 0 ? data.foods : THUC_DON_MAC_DINH;
  },

  addFood(item: Omit<Food, 'id'>): Food {
    const data = loadData();
    const foods = data.foods && data.foods.length > 0 ? data.foods : [...THUC_DON_MAC_DINH];
    const nextId = foods.length > 0 ? Math.max(...foods.map((f) => f.id)) + 1 : 1;
    const newFood: Food = {
      id: nextId,
      ten: item.ten,
      kcal: item.kcal,
      gram: item.gram ?? 100,
      donVi: item.donVi || 'g',
      nhom: item.nhom || 'khac',
      dam: item.dam ?? null,
      bot: item.bot ?? null,
      beo: item.beo ?? null,
      moTa: item.moTa ?? null,
    };
    saveData({
      ...data,
      foods: [newFood, ...foods],
    });
    return newFood;
  },

  deleteFood(id: number): void {
    const data = loadData();
    saveData({
      ...data,
      foods: (data.foods || []).filter((f) => f.id !== id),
    });
  },

  addFoodLog(item: {
    ngay: string;
    ten: string;
    kcal: number;
    gram?: number | null;
    dam?: number | null;
    bot?: number | null;
    beo?: number | null;
    khung?: 'sang' | 'trua' | 'chieu' | 'toi';
    foodId?: number | null;
    baseGram?: number | null;
    baseKcal?: number | null;
    baseDam?: number | null;
    baseBot?: number | null;
    baseBeo?: number | null;
  }): number {
    const data = loadData();
    const nextId = data.foodLogs.length > 0 ? Math.max(...data.foodLogs.map((l) => l.id)) + 1 : 1;

    const baseGram = item.baseGram ?? item.gram ?? 100;
    const baseKcal = item.baseKcal ?? item.kcal;
    const baseDam = item.baseDam ?? item.dam ?? null;
    const baseBot = item.baseBot ?? item.bot ?? null;
    const baseBeo = item.baseBeo ?? item.beo ?? null;

    const newLog: FoodLog = {
      id: nextId,
      ngay: item.ngay,
      foodId: item.foodId ?? null,
      ten: item.ten,
      kcal: item.kcal,
      gram: item.gram ?? null,
      dam: item.dam ?? null,
      bot: item.bot ?? null,
      beo: item.beo ?? null,
      khung: item.khung ?? 'sang',
      baseGram,
      baseKcal,
      baseDam,
      baseBot,
      baseBeo,
    };

    // Recalculate daily total kcal for this date
    const currentDayLogs = [...data.foodLogs.filter((l) => l.ngay === item.ngay), newLog];
    const totalKcal = currentDayLogs.reduce((acc, cur) => acc + cur.kcal, 0);

    const napIdx = data.napIns.findIndex((n) => n.ngay === item.ngay);
    const updatedNap = napIdx >= 0
      ? data.napIns.map((n, i) => (i === napIdx ? { ngay: item.ngay, kcal: totalKcal } : n))
      : [{ ngay: item.ngay, kcal: totalKcal }, ...data.napIns];

    saveData({
      ...data,
      foodLogs: [newLog, ...data.foodLogs],
      napIns: updatedNap,
    });
    return nextId;
  },

  addFoodLogFromMenu(
    food: Food,
    khung: 'sang' | 'trua' | 'chieu' | 'toi',
    gramOverride?: number,
    ngay?: string
  ): number {
    const logDate = ngay || Ngay.iso(new Date());
    const gChuan = food.gram && food.gram > 0 ? food.gram : 100;
    const actualGram = gramOverride && gramOverride > 0 ? gramOverride : gChuan;

    const calc = tinhMacroTheoKhoiLuong(actualGram, {
      baseGram: gChuan,
      baseKcal: food.kcal,
      baseDam: food.dam,
      baseBot: food.bot,
      baseBeo: food.beo,
    });

    return StorageService.addFoodLog({
      ngay: logDate,
      foodId: food.id,
      ten: food.ten,
      kcal: calc.kcal,
      gram: actualGram,
      dam: calc.dam,
      bot: calc.bot,
      beo: calc.beo,
      khung,
      baseGram: gChuan,
      baseKcal: food.kcal,
      baseDam: food.dam,
      baseBot: food.bot,
      baseBeo: food.beo,
    });
  },

  updateFoodLog(id: number, updates: Partial<FoodLog>): void {
    const data = loadData();
    const log = data.foodLogs.find((l) => l.id === id);
    if (!log) return;

    const updatedLog: FoodLog = {
      ...log,
      ...updates,
    };

    const updatedLogs = data.foodLogs.map((l) => (l.id === id ? updatedLog : l));
    const dayLogs = updatedLogs.filter((l) => l.ngay === updatedLog.ngay);
    const totalKcal = dayLogs.reduce((acc, cur) => acc + cur.kcal, 0);

    const napIdx = data.napIns.findIndex((n) => n.ngay === updatedLog.ngay);
    const updatedNap = napIdx >= 0
      ? data.napIns.map((n, i) => (i === napIdx ? { ngay: updatedLog.ngay, kcal: totalKcal } : n))
      : [{ ngay: updatedLog.ngay, kcal: totalKcal }, ...data.napIns];

    saveData({
      ...data,
      foodLogs: updatedLogs,
      napIns: updatedNap,
    });
  },

  updateFoodLogGram(id: number, newGram: number): void {
    const data = loadData();
    const log = data.foodLogs.find((l) => l.id === id);
    if (!log) return;

    const validGram = Math.max(1, Math.round(newGram));
    const bGram = log.baseGram && log.baseGram > 0 ? log.baseGram : (log.gram || 100);
    const bKcal = log.baseKcal ?? log.kcal;
    const bDam = log.baseDam ?? log.dam ?? 0;
    const bBot = log.baseBot ?? log.bot ?? 0;
    const bBeo = log.baseBeo ?? log.beo ?? 0;

    const calculated = tinhMacroTheoKhoiLuong(validGram, {
      baseGram: bGram,
      baseKcal: bKcal,
      baseDam: bDam,
      baseBot: bBot,
      baseBeo: bBeo,
    });

    StorageService.updateFoodLog(id, {
      gram: validGram,
      kcal: calculated.kcal,
      dam: calculated.dam,
      bot: calculated.bot,
      beo: calculated.beo,
    });
  },

  deleteFoodLog(id: number): void {
    const data = loadData();
    const log = data.foodLogs.find((l) => l.id === id);
    if (!log) return;
    const filtered = data.foodLogs.filter((l) => l.id !== id);
    const dayLogs = filtered.filter((l) => l.ngay === log.ngay);
    const totalKcal = dayLogs.reduce((acc, cur) => acc + cur.kcal, 0);

    const napIdx = data.napIns.findIndex((n) => n.ngay === log.ngay);
    const updatedNap = napIdx >= 0
      ? data.napIns.map((n, i) => (i === napIdx ? { ngay: log.ngay, kcal: totalKcal } : n))
      : data.napIns;

    saveData({
      ...data,
      foodLogs: filtered,
      napIns: updatedNap,
    });
  },

  // --- PROFILE ---
  getProfile(): Profile {
    return loadData().profile;
  },

  updateProfile(fields: Partial<Profile>): void {
    const data = loadData();
    saveData({
      ...data,
      profile: {
        ...data.profile,
        ...fields,
      },
    });
  },

  // --- AURA SYSTEM ---
  getAura(): AuraProfile {
    return loadData().auraProfile;
  },

  congChiSo(stat: 'luc' | 'ben' | 'chi' | 'tinh'): boolean {
    const data = loadData();
    if (data.auraProfile.unspent <= 0) return false;
    saveData({
      ...data,
      auraProfile: {
        ...data.auraProfile,
        unspent: data.auraProfile.unspent - 1,
        [stat]: data.auraProfile[stat] + 1,
      },
    });
    return true;
  },

  awardQuestExp(kind: string, refId: number, ngay: string, exp: number): void {
    const data = loadData();
    const exists = data.auraQuestLogs.some(
      (q) => q.ngay === ngay && q.kind === kind && q.refId === refId
    );
    if (exists) return;

    const newQuestLog: AuraQuestLog = { ngay, kind, refId, exp };
    const currentExp = data.auraProfile.exp + exp;
    const up = He.lenCap({
      level: data.auraProfile.level,
      exp: currentExp,
      unspent: data.auraProfile.unspent,
    });

    if (up.lan > 0) {
      flashOrange++;
      levelUpMoment = He.ngaunhien(He.cauLenCap);
    }

    saveData({
      ...data,
      auraQuestLogs: [...data.auraQuestLogs, newQuestLog],
      auraProfile: {
        ...data.auraProfile,
        level: up.level,
        exp: up.exp,
        unspent: up.unspent,
      },
    });
  },

  // --- FOCUS TASKS & TIME LOGIC ---
  timeToMinutes(timeStr?: string | null): number {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    const h = parseInt(parts[0] || '0', 10);
    const m = parseInt(parts[1] || '0', 10);
    return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
  },

  isTimeOverlapping(startA: string, endA: string, startB: string, endB: string): boolean {
    const sA = StorageService.timeToMinutes(startA);
    const eA = StorageService.timeToMinutes(endA);
    const sB = StorageService.timeToMinutes(startB);
    const eB = StorageService.timeToMinutes(endB);
    return Math.max(sA, sB) < Math.min(eA, eB);
  },

  getFocusTasks(ngay?: string): FocusTask[] {
    const data = loadData();
    let list = data.focusTasks || [];
    if (ngay) {
      list = list.filter((t) => t.ngay === ngay);
    }
    // Sort chronologically by gioBatDau ascending
    return [...list].sort((a, b) => {
      const mA = StorageService.timeToMinutes(a.gioBatDau);
      const mB = StorageService.timeToMinutes(b.gioBatDau);
      if (mA !== mB) return mA - mB;
      return a.tieuDe.localeCompare(b.tieuDe);
    });
  },

  getCoveringFocusTaskForHabit(habit: Habit, dateIso: string): FocusTask | null {
    const tasks = StorageService.getFocusTasks(dateIso);
    if (tasks.length === 0) return null;

    for (const task of tasks) {
      // 1. If habit has start and end times, check time interval intersection
      if (habit.gioBatDau && habit.gioKetThuc) {
        if (StorageService.isTimeOverlapping(habit.gioBatDau, habit.gioKetThuc, task.gioBatDau, task.gioKetThuc)) {
          return task;
        }
      }
      // 2. If habit has reminder time (gioNhac in minutes), check if inside task range
      if (habit.gioNhac != null) {
        const s = StorageService.timeToMinutes(task.gioBatDau);
        const e = StorageService.timeToMinutes(task.gioKetThuc);
        if (habit.gioNhac >= s && habit.gioNhac <= e) {
          return task;
        }
      }
      // 3. Or if task notes / title explicitly matches habit name
      const habitNorm = Ten.khoa(habit.ten);
      const taskNorm = Ten.khoa(task.tieuDe);
      if (taskNorm.includes(habitNorm) || (task.ghiChu && Ten.khoa(task.ghiChu).includes(habitNorm))) {
        return task;
      }
    }
    return null;
  },

  addFocusTask(param: {
    tieuDe: string;
    ghiChu?: string;
    ngay: string;
    gioBatDau: string;
    gioKetThuc: string;
    mucDoUuTien?: 'cao' | 'trung_binh' | 'binh_thuong';
  }): FocusTask {
    const data = loadData();
    const id = `focus_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const newTask: FocusTask = {
      id,
      tieuDe: Ten.sach(param.tieuDe),
      ghiChu: param.ghiChu ? Ten.sach(param.ghiChu) : undefined,
      ngay: param.ngay,
      gioBatDau: param.gioBatDau,
      gioKetThuc: param.gioKetThuc,
      mucDoUuTien: param.mucDoUuTien ?? 'cao',
      trangThai: 'chua_lam',
      taoLuc: new Date().toISOString(),
    };

    saveData({
      ...data,
      focusTasks: [...(data.focusTasks || []), newTask],
    });

    return newTask;
  },

  updateFocusTask(id: string, param: Partial<FocusTask>): boolean {
    const data = loadData();
    const existing = (data.focusTasks || []).find((t) => t.id === id);
    if (!existing) return false;

    const updated = (data.focusTasks || []).map((t) => {
      if (t.id !== id) return t;
      return {
        ...t,
        ...param,
        tieuDe: param.tieuDe !== undefined ? Ten.sach(param.tieuDe) : t.tieuDe,
      };
    });

    saveData({
      ...data,
      focusTasks: updated,
    });
    return true;
  },

  deleteFocusTask(id: string): void {
    const data = loadData();
    saveData({
      ...data,
      focusTasks: (data.focusTasks || []).filter((t) => t.id !== id),
    });
  },

  toggleFocusTask(id: string): boolean {
    const data = loadData();
    const task = (data.focusTasks || []).find((t) => t.id === id);
    if (!task) return false;

    const isNowDone = task.trangThai !== 'hoan_thanh';
    const nextStatus: 'hoan_thanh' | 'chua_lam' = isNowDone ? 'hoan_thanh' : 'chua_lam';

    const updated = (data.focusTasks || []).map((t) => {
      if (t.id !== id) return t;
      return {
        ...t,
        trangThai: nextStatus,
        hoanThanhLuc: isNowDone ? new Date().toISOString() : null,
      };
    });

    saveData({
      ...data,
      focusTasks: updated,
    });
    return isNowDone;
  },

  checkAndUpdateOverdueTasks(): void {
    const data = loadData();
    const now = new Date();
    const todayIso = Ngay.iso(now);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    let changed = false;
    const updated = (data.focusTasks || []).map((t) => {
      if (t.trangThai === 'chua_lam') {
        const isPastDate = t.ngay < todayIso;
        const isTodayOverdue = t.ngay === todayIso && nowMinutes > StorageService.timeToMinutes(t.gioKetThuc) + 30;
        if (isPastDate || isTodayOverdue) {
          changed = true;
          return { ...t, trangThai: 'qua_han' as const };
        }
      }
      return t;
    });

    if (changed) {
      saveData({
        ...data,
        focusTasks: updated,
      });
    }
  },

  // --- WIDGET STYLE (day_du vs gon) ---
  getWidgetStyle(): 'day_du' | 'gon' {
    const data = loadData();
    return data.widgetStyle ?? 'day_du';
  },

  setWidgetStyle(style: 'day_du' | 'gon'): void {
    const data = loadData();
    saveData({
      ...data,
      widgetStyle: style,
    });
  },

  // --- BACKUP / RESTORE / RESET ---
  exportBackup(): string {
    const data = loadData();
    return JSON.stringify(data, null, 2);
  },

  restoreBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') return false;
      const restored: AppData = {
        habits: Array.isArray(parsed.habits) ? parsed.habits : [],
        ticks: Array.isArray(parsed.ticks) ? parsed.ticks : [],
        profile: { ...defaultProfile, ...(parsed.profile || {}) },
        weighIns: Array.isArray(parsed.weighIns) ? parsed.weighIns : [],
        tapIns: Array.isArray(parsed.tapIns) ? parsed.tapIns : [],
        chiSoIns: Array.isArray(parsed.chiSoIns) ? parsed.chiSoIns : [],
        napIns: Array.isArray(parsed.napIns) ? parsed.napIns : [],
        foods: Array.isArray(parsed.foods) ? parsed.foods : [],
        foodLogs: Array.isArray(parsed.foodLogs) ? parsed.foodLogs : [],
        auraProfile: { ...defaultAura, ...(parsed.auraProfile || {}) },
        auraQuestLogs: Array.isArray(parsed.auraQuestLogs) ? parsed.auraQuestLogs : [],
        auraFragments: Array.isArray(parsed.auraFragments) ? parsed.auraFragments : [],
        focusTasks: Array.isArray(parsed.focusTasks) ? parsed.focusTasks : [],
      };
      saveData(restored);
      return true;
    } catch (e) {
      console.error('Failed to restore backup:', e);
      return false;
    }
  },

  resetAll(): void {
    localStorage.removeItem(STORAGE_KEY);
    cachedData = { ...defaultData };
    saveData(cachedData);
  },
};
