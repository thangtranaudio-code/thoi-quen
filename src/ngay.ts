export const Ngay = {
  cat: (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate()),

  iso: (d: Date): string => {
    const x = Ngay.cat(d);
    const mm = (x.getMonth() + 1).toString().padStart(2, '0');
    const dd = x.getDate().toString().padStart(2, '0');
    return `${x.getFullYear()}-${mm}-${dd}`;
  },

  parse: (s: string): Date => {
    const p = s.split('-');
    return new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
  },

  thuHai: (d: Date): Date => {
    const x = Ngay.cat(d);
    // getDay(): 0 is Sunday, 1 is Monday ... 6 is Saturday
    const day = x.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(x);
    monday.setDate(x.getDate() + diff);
    return Ngay.cat(monday);
  },

  tuan: (d: Date): Date[] => {
    const m = Ngay.thuHai(d);
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(m);
      day.setDate(m.getDate() + i);
      return Ngay.cat(day);
    });
  },

  prefixThang: (d: Date): string => {
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${d.getFullYear()}-${mm}`;
  },

  cungNgay: (a: Date, b: Date): boolean => {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
  },

  cungThang: (a: Date, b: Date): boolean => {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
  },

  truoc: (a: Date, b: Date): boolean => Ngay.cat(a).getTime() < Ngay.cat(b).getTime(),
  sau: (a: Date, b: Date): boolean => Ngay.cat(a).getTime() > Ngay.cat(b).getTime(),

  cuaSoLui: 6,

  ghiDuoc: (ngay: Date, homNay: Date): boolean => {
    const d = Ngay.cat(ngay);
    const h = Ngay.cat(homNay);
    const limit = new Date(h);
    limit.setDate(h.getDate() - Ngay.cuaSoLui);
    return d.getTime() >= limit.getTime();
  },

  soNgayThang: (nam: number, thang: number): number => {
    return new Date(nam, thang, 0).getDate();
  },

  dauThang: (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), 1),

  cacNgayThang: (d: Date): Date[] => {
    const n = Ngay.soNgayThang(d.getFullYear(), d.getMonth() + 1);
    return Array.from({ length: n }, (_, i) => new Date(d.getFullYear(), d.getMonth(), i + 1));
  },

  chuoiLienTiep: (ticksSet: Set<string>, homNay: Date): number => {
    let d = Ngay.cat(homNay);
    if (!ticksSet.has(Ngay.iso(d))) {
      d = new Date(d);
      d.setDate(d.getDate() - 1);
    }
    if (!ticksSet.has(Ngay.iso(d))) return 0;
    let n = 0;
    while (ticksSet.has(Ngay.iso(d))) {
      n++;
      d = new Date(d);
      d.setDate(d.getDate() - 1);
    }
    return n;
  },
};
