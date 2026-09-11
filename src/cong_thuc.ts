import { DocMon, LuaTap } from './types';
import { Ngay } from './ngay';

export const CongThuc = {
  mocA185: 18.5,
  mocA23: 23.0,
  mocA275: 27.5,

  heSo: [1.2, 1.375, 1.55, 1.725, 1.9],

  metDiBo: 3.5,
  metChay: 8.0,
  metDapXe: 6.8,
  metKhangLuc: 5.0,
  metYoga: 3.0,
  metBoi: 6.0,
  metDaBong: 7.0,
  metCauLong: 5.5,
  metNhayDay: 8.8,
  metGianCo: 2.3,

  loaiDiBo: 'di_bo',
  loaiChay: 'chay',
  loaiDapXe: 'dap_xe',
  loaiKhangLuc: 'khang_luc',
  loaiYoga: 'yoga',
  loaiBoi: 'boi',
  loaiDaBong: 'da_bong',
  loaiCauLong: 'cau_long',
  loaiNhayDay: 'nhay_day',
  loaiGianCo: 'gian_co',

  tyLeDam: 0.30,
  tyLeBot: 0.40,
  tyLeBeo: 0.30,

  mon: [
    { loai: 'di_bo', ten: 'Đi bộ', met: 3.5 },
    { loai: 'chay', ten: 'Chạy', met: 8.0 },
    { loai: 'dap_xe', ten: 'Đạp xe', met: 6.8 },
    { loai: 'khang_luc', ten: 'Kháng lực', met: 5.0 },
    { loai: 'yoga', ten: 'Yoga', met: 3.0 },
    { loai: 'boi', ten: 'Bơi', met: 6.0 },
    { loai: 'da_bong', ten: 'Đá bóng', met: 7.0 },
    { loai: 'cau_long', ten: 'Cầu lông', met: 5.5 },
    { loai: 'nhay_day', ten: 'Nhảy dây', met: 8.8 },
    { loai: 'gian_co', ten: 'Giãn cơ', met: 2.3 },
  ],

  metCua: (loai?: string | null): number | null => {
    if (!loai) return null;
    const found = CongThuc.mon.find((m) => m.loai === loai);
    return found ? found.met : null;
  },

  tuoi: (dobIso?: string | null, homNay: Date = new Date()): number | null => {
    if (!dobIso) return null;
    const d = Ngay.parse(dobIso);
    let t = homNay.getFullYear() - d.getFullYear();
    if (
      homNay.getMonth() < d.getMonth() ||
      (homNay.getMonth() === d.getMonth() && homNay.getDate() < d.getDate())
    ) {
      t--;
    }
    if (t < 0 || t > 120) return null;
    return t;
  },

  bmi: (kg?: number | null, cm?: number | null): number | null => {
    if (!kg || !cm || kg <= 0 || cm <= 0) return null;
    const m = cm / 100.0;
    return kg / (m * m);
  },

  bmiNhan: (bmi?: number | null): string | null => {
    if (bmi == null) return null;
    if (bmi < CongThuc.mocA185) return 'thiếu';
    if (bmi < CongThuc.mocA23) return 'bình thường';
    if (bmi < CongThuc.mocA275) return 'thừa';
    return 'béo';
  },

  bmr: ({
    sex,
    kg,
    cm,
    tuoi,
  }: {
    sex?: string | null;
    kg?: number | null;
    cm?: number | null;
    tuoi?: number | null;
  }): number | null => {
    if (kg == null || cm == null || tuoi == null) return null;
    if (sex !== 'nam' && sex !== 'nu') return null;
    const base = 10 * kg + 6.25 * cm - 5 * tuoi;
    return sex === 'nam' ? base + 5 : base - 161;
  },

  tdee: (bmr?: number | null, activity: number = 1.2): number | null => {
    if (bmr == null) return null;
    return bmr * activity;
  },

  kcalTap: ({
    met,
    kg,
    phut,
  }: {
    met?: number | null;
    kg?: number | null;
    phut?: number | null;
  }): number | null => {
    if (met == null || kg == null || phut == null) return null;
    if (met <= 0 || kg <= 0 || phut <= 0) return null;
    return 0.0175 * met * kg * phut;
  },

  kcalGoiY: ({
    tdee,
    nhip,
    kg,
    target,
  }: {
    tdee?: number | null;
    nhip: number;
    kg?: number | null;
    target?: number | null;
  }): number | null => {
    if (tdee == null) return null;
    const delta = (nhip * 7700) / 7;
    let v = tdee - delta;
    if (kg != null && target != null && target - kg > 0.05) {
      v = tdee + delta;
    }
    return Math.round(v / 10) * 10;
  },

  moDeurenberg: ({
    bmi,
    tuoi,
    sex,
  }: {
    bmi?: number | null;
    tuoi?: number | null;
    sex?: string | null;
  }): number | null => {
    if (bmi == null || tuoi == null) return null;
    if (sex !== 'nam' && sex !== 'nu') return null;
    const s = sex === 'nam' ? 1.0 : 0.0;
    return 1.20 * bmi + 0.23 * tuoi - 10.8 * s - 5.4;
  },

  duKien: ({
    homNay,
    nhip,
    kg,
    target,
  }: {
    homNay: Date;
    nhip: number;
    kg?: number | null;
    target?: number | null;
  }): Date | null => {
    if (nhip <= 0 || kg == null || target == null) return null;
    const d = Math.abs(kg - target);
    if (d <= 0.05) return null;
    const soNgay = Math.ceil((d / nhip) * 7);
    const result = new Date(Ngay.cat(homNay));
    result.setDate(result.getDate() + soNgay);
    return result;
  },

  luaTap: (isoNgay: string[], today: Date): LuaTap => {
    const dates = Array.from(new Set(isoNgay.map((s) => Ngay.parse(s).getTime())))
      .map((t) => new Date(t))
      .sort((a, b) => b.getTime() - a.getTime());

    if (dates.length === 0) return { so: 0, sang: false };
    const last = dates[0];
    const hom = Ngay.cat(today);
    const gap = Math.round((hom.getTime() - last.getTime()) / (1000 * 3600 * 24));
    let streak = 1;
    let cursor = last;

    for (let i = 1; i < dates.length; i++) {
      const g = Math.round((cursor.getTime() - dates[i].getTime()) / (1000 * 3600 * 24));
      if (g <= 0) continue;
      if (g <= 3) {
        streak++;
        cursor = dates[i];
      } else {
        break;
      }
    }
    return { so: streak, sang: gap === 0 };
  },

  docKcal: (vanBan: string): number | null => {
    const re = /(\d+(?:[.,]\d+)?)\s*(?:kcal|calo|năng lượng)/i;
    const m = vanBan.match(re);
    if (!m) return null;
    const raw = m[1].replace(',', '.');
    const v = parseFloat(raw);
    if (isNaN(v)) return null;
    const n = Math.round(v);
    if (n < 0 || n > 20000) return null;
    return n;
  },

  docMon: (vanBan: string): DocMon => {
    const lines = vanBan.split('\n');
    let ten: string | undefined;
    let gram: number | undefined;
    let kcal: number | undefined;
    let dam: number | undefined;
    let bot: number | undefined;
    let beo: number | undefined;

    const parseNum = (str: string): number | undefined => {
      const match = str.match(/(\d+(?:[.,]\d+)?)/);
      if (!match) return undefined;
      const v = parseFloat(match[1].replace(',', '.'));
      return isNaN(v) ? undefined : v;
    };

    for (const line of lines) {
      const l = line.trim();
      if (/^MON\s*:/i.test(l)) {
        ten = l.replace(/^MON\s*:\s*/i, '').trim();
      } else if (/^KHOI_LUONG\s*:/i.test(l)) {
        gram = parseNum(l.replace(/^KHOI_LUONG\s*:\s*/i, ''));
      } else if (/^KCAL\s*:/i.test(l)) {
        const val = parseNum(l.replace(/^KCAL\s*:\s*/i, ''));
        if (val !== undefined && val >= 0 && val <= 20000) kcal = Math.round(val);
      } else if (/^DAM\s*:/i.test(l)) {
        dam = parseNum(l.replace(/^DAM\s*:\s*/i, ''));
      } else if (/^BOT\s*:/i.test(l)) {
        bot = parseNum(l.replace(/^BOT\s*:\s*/i, ''));
      } else if (/^BEO\s*:/i.test(l)) {
        beo = parseNum(l.replace(/^BEO\s*:\s*/i, ''));
      }
    }

    if (kcal === undefined) {
      const fallbackKcal = CongThuc.docKcal(vanBan);
      if (fallbackKcal !== null) kcal = fallbackKcal;
    }

    return { ten, gram, kcal, dam, bot, beo };
  },
};
