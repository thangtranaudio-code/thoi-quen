export const So = {
  kg: (v: number): string => {
    const r = Math.round(v * 10) / 10;
    if (r === Math.round(r)) return r.toString();
    return r.toFixed(1).replace('.', ',');
  },

  parseKg: (raw: string): number | null => {
    const t = raw.trim().replace(/\s+/g, '').replace(',', '.');
    if (!t) return null;
    const v = parseFloat(t);
    if (isNaN(v) || v <= 0 || v > 400) return null;
    return v;
  },

  parseCm: (raw: string): number | null => {
    const t = raw.trim().replace(/\s+/g, '').replace(',', '.');
    if (!t) return null;
    const v = parseFloat(t);
    if (isNaN(v) || v < 50 || v > 250) return null;
    return v;
  },

  parseEo: (raw: string): number | null => {
    const t = raw.trim().replace(/\s+/g, '').replace(',', '.');
    if (!t) return null;
    const v = parseFloat(t);
    if (isNaN(v) || v < 40 || v > 200) return null;
    return v;
  },

  parseKcal: (raw: string): number | null => {
    const t = raw.trim().replace(/\s+/g, '');
    if (!t) return null;
    const v = parseInt(t, 10);
    if (isNaN(v) || v < 0 || v > 20000) return null;
    return v;
  },

  parseG: (raw: string): number | null => {
    const t = raw.trim().replace(/\s+/g, '').replace(',', '.');
    if (!t) return null;
    const v = parseFloat(t);
    if (isNaN(v) || v <= 0 || v > 5000) return null;
    return v;
  },

  parseMacro: (raw: string): number | null => {
    const t = raw.trim().replace(/\s+/g, '').replace(',', '.');
    if (!t) return null;
    const v = parseFloat(t);
    if (isNaN(v) || v < 0 || v > 500) return null;
    return v;
  },

  heSo: (v: number): string => {
    return v.toString().replace('.', ',');
  },
};

export const Ten = {
  sach: (raw: string): string => raw.trim().replace(/\s+/g, ' '),
  khoa: (raw: string): string => Ten.sach(raw).toLowerCase(),
  trung: (a: string, b: string): boolean => Ten.khoa(a) === Ten.khoa(b),
};

export const Chuoi = {
  tenApp: 'Habis',
  habisNhan: 'HABIS',
  chaoSang: 'Chào buổi sáng!',
  chaoChieu: 'Chào buổi chiều!',
  chaoToi: 'Chào buổi tối!',
  chaoDem: 'Chào đêm muộn!',
  totHonHomQua: 'Hôm nay, bạn sẽ tốt hơn hôm qua.',
  chuoiHienTai: 'STREAK HIỆN TẠI',
  ngayDonVi: 'ngày',
  homNay: 'Hôm nay',
  tienDo: 'Tiến độ',
  caiDat: 'Cài đặt',
  taiKhoan: 'Tài khoản',
  he: 'Hệ',
  cap: 'Cấp',
  expNhan: 'EXP',
  sucTam: 'Sức tạm',
  luc: 'Lực',
  ben: 'Bền',
  chiNhan: 'Chí',
  tinh: 'Tĩnh',
  diemChuaCong: 'Điểm chưa cộng',
  questHomNay: 'Việc hôm nay',
  tapHomNayQuest: 'Tập hôm nay',
  ghiCanQuest: 'Ghi cân',
  kyNhan: 'Kỹ',
  dangHieuLuc: 'đang hiệu lực',
  tamYeu: 'tạm yếu',
  manhNhan: 'Mảnh',
  nhipThoVung: 'Nhịp thở vững',
  nhipThoVungMoTa: 'Gắn chuỗi tập. Hiệu lực khi đã tập hôm nay.',
  buocDau: 'Bước đầu',
  buocDauMoTa: 'Gắn tick thói quen. Hiệu lực khi đã tick ít nhất một việc hôm nay.',
  luaTang: 'Lửa vừa nối. Đừng để tắt.',
  hetViecHomNay: 'Hết việc hôm nay',
  thoiQuen: 'Thói quen',
  themCan: 'Thêm cân',
  xong: 'Xong',
  luu: 'Lưu',
  huy: 'Huỷ',
  mucTieu: 'Mục tiêu',
  chuoiNgay: 'Chuỗi',
  duLieuChiTrenMay: 'Dữ liệu chỉ trên máy này.',
  day6Gio: 'Dậy 6 giờ',
  vanDong: 'Vận động',
  doc20Trang: 'Đọc 20 trang',
  tuDatTen: 'Tự đặt tên',
  tenThoiQuen: 'Tên thói quen',
  chonThoiQuen: 'Chọn thói quen',
  haiLamNamNgay: '25 ngày trong tháng này',
  datMucTieu: 'đạt mục tiêu',
  canHomNay: 'Cân hôm nay',
  kg: 'kg',
  thieuDuLieu: 'Thiếu dữ liệu',
  thieuGioi: 'Thiếu giới',
  thieuNgaySinh: 'Thiếu ngày sinh',
  thieuChieuCao: 'Thiếu chiều cao',
  thieuCan: 'Thiếu cân',
  chuaCoCan: 'Chưa có lần cân.',
  themThoiQuen: 'Thêm thói quen',
  lich: 'Lịch',
  sua: 'Sửa',
  xoa: 'Xoá',
  daCoThoiQuen: 'Đã có thói quen này.',
  xoaKhoiMay: 'Xoá khỏi máy này? Không lấy lại được.',
  xoaHetMay: 'Xoá hết dữ liệu trên máy này? Không lấy lại được.',
  thongKe: 'Thống kê',
  chuaTick: 'Chưa tick',
  xuatSac: 'Xuất sắc',
  tot: 'Tốt',
  kha: 'Khá',
  te: 'Tệ',
  danhGiaNhan: 'Đánh giá',
  chiXem: 'Chỉ xem.',
  chonNgay: 'Chọn ngày',
  uocTinh: 'Ước tính, không thay lời bác sĩ. Không chẩn đoán hay điều trị.',
  nguon: 'Nguồn',
  gioi: 'Giới',
  nam: 'Nam',
  nu: 'Nữ',
  chieuCao: 'Chiều cao',
  cm: 'cm',
  ngaySinh: 'Ngày sinh',
  mucHoatDong: 'Mức hoạt động',
  canDich: 'Cân đích',
  tenGoi: 'Tên gọi',
  bmi: 'BMI',
  bmr: 'BMR',
  tdee: 'TDEE',
  mocA: 'Mốc Á 18,5 / 23 / 27,5',
  saiSo: 'sai số ±200–400',
  kcalBuoi: 'Kcal buổi',
  phut: 'phút',
  hoSoChiSo: 'Hồ sơ & mục tiêu',
  xuatBanSao: 'Xuất bản sao',
  khoiPhuc: 'Khôi phục',
  xoaDuLieu: 'Xoá hết',
  nguonDisclaimer: 'Nguồn & disclaimer',
  phienBan: 'Phiên bản 0.1.0',
  haiMayLech: 'Hai máy cùng ghi sẽ lệch. Chỉ một máy ghi.',
  thayToanBo: 'Thay toàn bộ dữ liệu trên máy này. Không gộp.',
  daXuat: 'Đã xuất bản sao.',
  khongCoBanSao: 'Không có bản sao.',
  daKhoiPhuc: 'Đã khôi phục.',
  fileKhongPhaiBanSao: 'File không phải bản sao.',
  canKg: 'Cân kg',
  tuanNhan: 'Tuần',
  thangNhan: 'Tháng',
  namNhan: 'Năm',
  hienTai: 'Hiện tại',
  mucTieuPhan: 'Mục tiêu',
  ghiTrongNgay: 'Ghi trong ngày',
  ghi: 'Ghi',
  luuHoSo: 'Lưu hồ sơ',
  tap: 'Tập',
  diBo: 'Đi bộ',
  chay: 'Chạy',
  dapXe: 'Đạp xe',
  khangLuc: 'Kháng lực',
  yoga: 'Yoga',
  boi: 'Bơi',
  daBong: 'Đá bóng',
  cauLong: 'Cầu lông',
  nhayDay: 'Nhảy dây',
  gianCo: 'Giãn cơ',
  canBanDau: 'Cân ban đầu',
  anUong: 'Ăn uống',
  nhatKy: 'Nhật ký',
  kcalTapNhan: 'Kcal tập',
  kcalTieuThu: 'Kcal tiêu thụ',
  kcalNap: 'Kcal nạp',
  chuaGhiNap: 'Chưa ghi kcal nạp',
  themMon: 'Thêm món',
  dam: 'Đạm',
  bot: 'Bột',
  beo: 'Béo',
  timMon: 'Tìm món',
  kcal: 'kcal',
  sang: 'Sáng',
  trua: 'Trưa',
  chieu: 'Chiều',
  toi: 'Tối',
  eoCm: 'Eo',
  hongCm: 'Hông',
  ngucCm: 'Ngực',
  bapTayCm: 'Bắp tay',
  moPhanTram: '% mỡ',
  nhipTuan: 'Nhịp kg/tuần',
  nhip05: '0,5 kg/tuần',
  kcalGoiY: 'Kcal/ngày gợi ý',
  canNang: 'Cân nặng',
  hoatDongO: 'Hoạt động',
  chiSo: 'Chỉ số',
  ngayDangXem: 'Ngày đang xem',
  banDau: 'Ban đầu',
  moiNhat: 'Mới nhất',
  soVoiLanTruoc: 'so với lần trước',
  soVoiBanDau: 'so với ban đầu',
  hoanThanhTheoThu: 'Hoàn thành theo thứ',
  hoanThanhTheoNgay: 'Hoàn thành theo ngày',
  hoanThanhTheoThang: 'Hoàn thành theo tháng',
  tieuVongNgay: 'Thói quen · Ngày này',
  tieuVongTuan: 'Thói quen · Tuần này',
  tieuVongThang: 'Thói quen · Tháng này',
  tieuVongNam: 'Thói quen · Năm này',
  trenNhipBacSi: 'Trên 0,5 kg/tuần nên có bác sĩ.',
  duKienHoanThanh: 'Dự kiến hoàn thành',
  itVanDong: '1,2 Ít vận động — ngồi nhiều',
  nheVanDong: '1,375 Nhẹ — 1–3 buổi/tuần',
  vuaVanDong: '1,55 Vừa — 3–5 buổi/tuần',
  nhieuVanDong: '1,725 Nhiều — 6–7 buổi hoặc kháng lực gần mỗi ngày',
  ratNhieuVanDong: '1,9 Rất nặng — tập 2 buổi/ngày',

  mifflin: 'Mifflin 1990 (BMR)',
  whoA: 'WHO châu Á (mốc BMI)',
  compendium: 'Compendium of Physical Activities (MET)',
  heSoKhongMifflin: 'Hệ số hoạt động TDEE không nằm trong paper Mifflin.',

  thu: ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'],
  thuNgan: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],

  chaoTheoGio: (d: Date = new Date()): string => {
    const h = d.getHours();
    if (h >= 5 && h < 11) return Chuoi.chaoSang;
    if (h >= 11 && h < 17) return Chuoi.chaoChieu;
    if (h >= 17 && h < 21) return Chuoi.chaoToi;
    return Chuoi.chaoDem;
  },

  dongNgay: (d: Date): string => {
    const weekdayIdx = (d.getDay() + 6) % 7; // Monday = 0
    return `${Chuoi.thu[weekdayIdx]}, ${d.getDate()} tháng ${d.getMonth() + 1} ${d.getFullYear()}`;
  },

  homNayNgay: (d: Date): string => {
    return `hôm nay ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  },

  nTrenMHomNay: (n: number, m: number): string => `${n}/${m} hôm nay`,
  nTrenMNgay: (n: number, m: number, d: Date): string => `${n}/${m} ngày ${d.getDate()}/${d.getMonth() + 1}`,
  xTrenNThangNay: (x: number, n: number): string => `${x}/${n} tháng này`,
  chipCan: (kg: string): string => `Cân ${kg}`,
  chipCanCon: (kg: string, con: string): string => `Cân ${kg} · còn ${con} kg`,
  canHienTai: (x: string, y: string, z: string): string => `Cân hiện tại ${x} · đích ${y} · còn ${z}`,
  canHienTaiKhongDich: (x: string): string => `Cân hiện tại ${x}`,
  nNgayTrongThang: (n: number): string => `${n} ngày trong tháng này`,
  chuoiNNgay: (n: number): string => `Chuỗi ${n} ngày`,
  conKDatN: (k: number, n: number): string => {
    if (k <= 0) return `Đã đạt ${n}`;
    return `Còn ${k} ngày nữa là đạt ${n}`;
  },
  thang: (m: number): string => `Tháng ${m}`,
  phanTram: (p: number): string => `${p}%`,
  daTick: (n: number, m: number): string => `${n}/${m} đã tick`,
  tieuVong: (phin: number): string => {
    switch (phin) {
      case 1: return Chuoi.tieuVongTuan;
      case 2: return Chuoi.tieuVongThang;
      case 3: return Chuoi.tieuVongNam;
      default: return Chuoi.tieuVongNgay;
    }
  },
  tenMon: (loai: string): string => {
    switch (loai) {
      case 'di_bo': return Chuoi.diBo;
      case 'chay': return Chuoi.chay;
      case 'dap_xe': return Chuoi.dapXe;
      case 'khang_luc': return Chuoi.khangLuc;
      case 'yoga': return Chuoi.yoga;
      case 'boi': return Chuoi.boi;
      case 'da_bong': return Chuoi.daBong;
      case 'cau_long': return Chuoi.cauLong;
      case 'nhay_day': return Chuoi.nhayDay;
      case 'gian_co': return Chuoi.gianCo;
      default: return loai;
    }
  },
  gioNhacChu: (phut: number): string => {
    const h = Math.floor(phut / 60);
    const m = (phut % 60).toString().padStart(2, '0');
    const chieu = h >= 12;
    let h12 = h % 12;
    if (h12 === 0) h12 = 12;
    return `${h12}:${m} ${chieu ? 'CH' : 'SA'}`;
  },
};
