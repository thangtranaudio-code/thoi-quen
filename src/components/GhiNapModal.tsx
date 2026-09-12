import React, { useState, useMemo } from 'react';
import {
  X,
  Check,
  Utensils,
  Sparkles,
  Trash2,
  Search,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  BookOpen,
  SlidersHorizontal,
} from 'lucide-react';
import { Chuoi } from '../chuoi';
import { CongThuc } from '../cong_thuc';
import { Ngay } from '../ngay';
import { StorageService } from '../storage';
import { Food, FoodLog } from '../types';
import { NHOM_THUC_DON, tinhMacroTheoKhoiLuong } from '../thuc_don';

interface GhiNapModalProps {
  selectedDate: Date;
  onClose: () => void;
  onSuccess: () => void;
}

export const GhiNapModal: React.FC<GhiNapModalProps> = ({
  selectedDate,
  onClose,
  onSuccess,
}) => {
  // Tab chính: 'nhat_ky' | 'thuc_don' | 'nhap_tay'
  const [tab, setTab] = useState<'nhat_ky' | 'thuc_don' | 'nhap_tay'>('nhat_ky');

  // Khung bữa được chọn hiện tại
  const [khung, setKhung] = useState<'sang' | 'trua' | 'chieu' | 'toi'>('sang');

  // Quản lý trạng thái thu gọn / mở rộng của 4 bữa
  const [collapsedBua, setCollapsedBua] = useState<Record<string, boolean>>({
    sang: false,
    trua: false,
    chieu: false,
    toi: false,
  });

  // Tìm kiếm & phân loại thực đơn
  const [searchMenu, setSearchMenu] = useState('');
  const [nhomLoc, setNhomLoc] = useState<string>('tat_ca');

  // Trạng thái thêm món tùy chỉnh mới vào Thực đơn
  const [showThemMonMoi, setShowThemMonMoi] = useState(false);
  const [tenMonMoi, setTenMonMoi] = useState('');
  const [kcalMonMoi, setKcalMonMoi] = useState('');
  const [gramMonMoi, setGramMonMoi] = useState('100');
  const [donViMonMoi, setDonViMonMoi] = useState('g');
  const [damMonMoi, setDamMonMoi] = useState('');
  const [botMonMoi, setBotMonMoi] = useState('');
  const [beoMonMoi, setBeoMonMoi] = useState('');
  const [nhomMonMoi, setNhomMonMoi] = useState<'tinh_bot' | 'thit_dam' | 'mon_nuoc' | 'rau_qua' | 'do_uong' | 'khac'>('thit_dam');

  // Nhập tay tự do
  const [ten, setTen] = useState('');
  const [kcal, setKcal] = useState<string>('');
  const [gram, setGram] = useState<string>('');
  const [dam, setDam] = useState<string>('');
  const [bot, setBot] = useState<string>('');
  const [beo, setBeo] = useState<string>('');
  const [quickText, setQuickText] = useState('');
  const [showParser, setShowParser] = useState(false);

  // Món đang xem để tùy chỉnh khối lượng trước khi thêm
  const [customizingFood, setCustomizingFood] = useState<Food | null>(null);
  const [customGram, setCustomGram] = useState<number>(100);

  // Thông báo phản hồi ngắn
  const [thongBao, setThongBao] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setThongBao(msg);
    setTimeout(() => setThongBao(null), 2500);
  };

  const data = StorageService.getData();
  const dateIso = Ngay.iso(selectedDate);
  const dayLogs = data.foodLogs.filter((l) => l.ngay === dateIso);
  const allFoods = StorageService.getFoods();

  // Thống kê tổng hợp trong ngày
  const totalKcalDay = dayLogs.reduce((acc, cur) => acc + cur.kcal, 0);
  const totalDamDay = Math.round(dayLogs.reduce((acc, cur) => acc + (cur.dam || 0), 0) * 10) / 10;
  const totalBotDay = Math.round(dayLogs.reduce((acc, cur) => acc + (cur.bot || 0), 0) * 10) / 10;
  const totalBeoDay = Math.round(dayLogs.reduce((acc, cur) => acc + (cur.beo || 0), 0) * 10) / 10;

  // Lọc danh sách món ăn trong Thực đơn
  const filteredFoods = useMemo(() => {
    return allFoods.filter((f) => {
      const matchNhom =
        nhomLoc === 'tat_ca' || f.nhom === nhomLoc || f.phanLoai === nhomLoc;
      const matchSearch =
        !searchMenu.trim() ||
        f.ten.toLowerCase().includes(searchMenu.toLowerCase()) ||
        (f.moTa && f.moTa.toLowerCase().includes(searchMenu.toLowerCase()));
      return matchNhom && matchSearch;
    });
  }, [allFoods, nhomLoc, searchMenu]);

  // Phân nhóm các món đã ghi theo bữa
  const logsByBua = useMemo(() => {
    return {
      sang: dayLogs.filter((l) => l.khung === 'sang'),
      trua: dayLogs.filter((l) => l.khung === 'trua'),
      chieu: dayLogs.filter((l) => l.khung === 'chieu'),
      toi: dayLogs.filter((l) => l.khung === 'toi'),
    };
  }, [dayLogs]);

  // Bật/tắt thu gọn bữa
  const toggleCollapseBua = (buaKey: string) => {
    setCollapsedBua((prev) => ({ ...prev, [buaKey]: !prev[buaKey] }));
  };

  // Thu gọn / Mở rộng tất cả
  const toggleAllCollapse = () => {
    const isAnyOpen = Object.values(collapsedBua).some((v) => !v);
    setCollapsedBua({
      sang: isAnyOpen,
      trua: isAnyOpen,
      chieu: isAnyOpen,
      toi: isAnyOpen,
    });
  };

  // Chọn nhanh món từ Thực đơn vào bữa đang chọn
  const handleChonNhanhMon = (food: Food) => {
    StorageService.addFoodLogFromMenu(food, khung, food.gram ?? 100, dateIso);
    showToast(`Đã thêm "${food.ten}" vào bữa ${khungLabel(khung)}`);
    onSuccess();
  };

  // Thêm món với khối lượng tùy chỉnh từ Thực đơn
  const handleXacNhanCustomFood = () => {
    if (!customizingFood) return;
    const g = Math.max(1, customGram);
    StorageService.addFoodLogFromMenu(customizingFood, khung, g, dateIso);
    showToast(`Đã thêm "${customizingFood.ten}" (${g}g) vào bữa ${khungLabel(khung)}`);
    setCustomizingFood(null);
    onSuccess();
  };

  // Điều chỉnh khối lượng của một món đã ghi trong ngày
  const handleDoiKhoiLuongLog = (log: FoodLog, deltaGram: number) => {
    const currentG = log.gram ?? log.baseGram ?? 100;
    const newG = Math.max(5, currentG + deltaGram);
    StorageService.updateFoodLogGram(log.id, newG);
    onSuccess();
  };

  // Đặt khối lượng trực tiếp từ input
  const handleSetGramLog = (log: FoodLog, valStr: string) => {
    const val = parseInt(valStr, 10);
    if (!isNaN(val) && val > 0) {
      StorageService.updateFoodLogGram(log.id, val);
      onSuccess();
    }
  };

  // Xóa món khỏi nhật ký
  const handleDeleteLog = (id: number) => {
    StorageService.deleteFoodLog(id);
    onSuccess();
  };

  // Phân tích dán văn bản
  const handleParseText = () => {
    if (!quickText.trim()) return;
    const parsed = CongThuc.docMon(quickText);
    if (parsed.ten) setTen(parsed.ten);
    if (parsed.kcal !== undefined) setKcal(parsed.kcal.toString());
    if (parsed.gram !== undefined) setGram(parsed.gram.toString());
    if (parsed.dam !== undefined) setDam(parsed.dam.toString());
    if (parsed.bot !== undefined) setBot(parsed.bot.toString());
    if (parsed.beo !== undefined) setBeo(parsed.beo.toString());
    setShowParser(false);
  };

  // Lưu món nhập tay
  const handleSaveNhapTay = () => {
    const k = parseInt(kcal, 10);
    if (isNaN(k) || k <= 0) return;
    const cleanTen = ten.trim() || 'Món ăn';
    const g = gram ? parseFloat(gram) : null;
    const d = dam ? parseFloat(dam) : null;
    const b = bot ? parseFloat(bot) : null;
    const f = beo ? parseFloat(beo) : null;

    StorageService.addFoodLog({
      ngay: dateIso,
      ten: cleanTen,
      kcal: k,
      gram: g,
      dam: d,
      bot: b,
      beo: f,
      khung,
      baseGram: g ?? 100,
      baseKcal: k,
      baseDam: d,
      baseBot: b,
      baseBeo: f,
    });

    setTen('');
    setKcal('');
    setGram('');
    setDam('');
    setBot('');
    setBeo('');
    showToast(`Đã thêm "${cleanTen}" vào bữa ${khungLabel(khung)}`);
    setTab('nhat_ky');
    onSuccess();
  };

  // Lưu món mới vào kho Thực đơn dùng lại
  const handleSaveMonMoiVaoThucDon = () => {
    const k = parseInt(kcalMonMoi, 10);
    if (!tenMonMoi.trim() || isNaN(k) || k <= 0) return;
    const g = parseInt(gramMonMoi, 10) || 100;

    StorageService.addFood({
      ten: tenMonMoi.trim(),
      kcal: k,
      gram: g,
      donVi: donViMonMoi.trim() || 'g',
      nhom: nhomMonMoi,
      dam: damMonMoi ? parseFloat(damMonMoi) : null,
      bot: botMonMoi ? parseFloat(botMonMoi) : null,
      beo: beoMonMoi ? parseFloat(beoMonMoi) : null,
      moTa: `${g}${donViMonMoi}`,
    });

    setTenMonMoi('');
    setKcalMonMoi('');
    setDamMonMoi('');
    setBotMonMoi('');
    setBeoMonMoi('');
    setShowThemMonMoi(false);
    showToast('Đã thêm món mới vào thực đơn!');
  };

  function khungLabel(k: 'sang' | 'trua' | 'chieu' | 'toi'): string {
    switch (k) {
      case 'sang':
        return Chuoi.sang;
      case 'trua':
        return Chuoi.trua;
      case 'chieu':
        return Chuoi.chieu;
      case 'toi':
        return Chuoi.toi;
    }
  }

  const buaKeys: Array<'sang' | 'trua' | 'chieu' | 'toi'> = ['sang', 'trua', 'chieu', 'toi'];

  return (
    <div
      id="modal-ghi-nap-backdrop"
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="modal-ghi-nap-content"
        className="w-full max-w-lg bg-[#161714] rounded-2xl border border-[#3a322c] p-4 sm:p-5 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-[#3a322c]/50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#3d9a7a]/20 border border-[#3d9a7a]/40 flex items-center justify-center text-[#3d9a7a]">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#f3ece4]">
                {Chuoi.nhatKy}
              </h3>
              <p className="text-[11px] text-[#c4b6a8]">
                {Chuoi.dongNgay(selectedDate)}
              </p>
            </div>
          </div>
          <button
            id="nut-dong-ghi-nap"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#c4b6a8] hover:text-[#f3ece4] hover:bg-[#2a1c14] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thông báo toast nhanh */}
        {thongBao && (
          <div className="mt-2.5 px-3 py-1.5 bg-[#3d9a7a]/20 border border-[#3d9a7a]/50 text-[#3d9a7a] text-xs font-semibold rounded-xl text-center shrink-0">
            {thongBao}
          </div>
        )}

        {/* Tab chuyển đổi 3 chế độ */}
        <div className="grid grid-cols-3 gap-1.5 mt-3 p-1 bg-[#0c0d0b] rounded-xl border border-[#3a322c]/40 shrink-0">
          <button
            type="button"
            onClick={() => setTab('nhat_ky')}
            className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              tab === 'nhat_ky'
                ? 'bg-[#161714] text-[#f3ece4] shadow-xs border border-[#3a322c]/80'
                : 'text-[#c4b6a8] hover:text-[#f3ece4]'
            }`}
          >
            <Utensils className="w-3.5 h-3.5 text-[#3d9a7a]" />
            <span>Nhật ký ngày</span>
            {dayLogs.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 bg-[#3d9a7a] text-[#0c0d0b] font-bold rounded-full">
                {dayLogs.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setTab('thuc_don')}
            className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              tab === 'thuc_don'
                ? 'bg-[#161714] text-[#f3ece4] shadow-xs border border-[#3a322c]/80'
                : 'text-[#c4b6a8] hover:text-[#f3ece4]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#ff7a00]" />
            <span>{Chuoi.thucDon}</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('nhap_tay')}
            className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              tab === 'nhap_tay'
                ? 'bg-[#161714] text-[#f3ece4] shadow-xs border border-[#3a322c]/80'
                : 'text-[#c4b6a8] hover:text-[#f3ece4]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#b9c0b8]" />
            <span>Nhập tay / Dán</span>
          </button>
        </div>

        {/* Nội dung cuộn được */}
        <div className="flex-1 overflow-y-auto mt-3 pr-0.5 space-y-3">
          {/* ==================== TAB 1: NHẬT KÝ HÔM NAY ==================== */}
          {tab === 'nhat_ky' && (
            <div className="space-y-3">
              {/* Thẻ tổng kết Dinh dưỡng trong ngày */}
              <div className="p-3.5 bg-[#0c0d0b] rounded-2xl border border-[#3a322c]/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#c4b6a8] uppercase tracking-wider">
                    Tổng nạp hôm nay
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-black text-[#3d9a7a]">
                      {totalKcalDay}
                    </span>
                    <span className="text-xs text-[#c4b6a8]">kcal</span>
                  </div>
                </div>

                {/* 3 Macro chi tiết */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#3a322c]/40 text-center">
                  <div className="p-1.5 bg-[#161714] rounded-lg border border-[#3a322c]/30">
                    <div className="text-[10px] text-[#ff7a00] font-semibold">{Chuoi.dam} (P)</div>
                    <div className="text-xs font-bold text-[#f3ece4] mt-0.5">{totalDamDay}g</div>
                  </div>
                  <div className="p-1.5 bg-[#161714] rounded-lg border border-[#3a322c]/30">
                    <div className="text-[10px] text-[#b9c0b8] font-semibold">{Chuoi.bot} (C)</div>
                    <div className="text-xs font-bold text-[#f3ece4] mt-0.5">{totalBotDay}g</div>
                  </div>
                  <div className="p-1.5 bg-[#161714] rounded-lg border border-[#3a322c]/30">
                    <div className="text-[10px] text-[#e7e4dc] font-semibold">{Chuoi.beo} (F)</div>
                    <div className="text-xs font-bold text-[#f3ece4] mt-0.5">{totalBeoDay}g</div>
                  </div>
                </div>
              </div>

              {/* Thanh điều khiển danh sách thu gọn / mở rộng & chuyển sang thực đơn */}
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={toggleAllCollapse}
                  className="text-[11px] text-[#c4b6a8] hover:text-[#f3ece4] flex items-center gap-1 font-medium transition-colors"
                >
                  <SlidersHorizontal className="w-3 h-3 text-[#ff7a00]" />
                  <span>
                    {Object.values(collapsedBua).some((v) => !v)
                      ? Chuoi.thuGonTatCa
                      : Chuoi.moRongTatCa}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTab('thuc_don')}
                  className="text-[11px] text-[#ff7a00] hover:text-[#ffb000] font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{Chuoi.thucDon}</span>
                </button>
              </div>

              {/* Danh sách 4 bữa ăn với Accordion thu gọn */}
              <div className="space-y-2.5">
                {buaKeys.map((bKey) => {
                  const buaLogs = logsByBua[bKey];
                  const buaKcal = buaLogs.reduce((acc, c) => acc + c.kcal, 0);
                  const isCollapsed = collapsedBua[bKey];

                  return (
                    <div
                      key={bKey}
                      className="bg-[#0c0d0b] rounded-xl border border-[#3a322c]/60 overflow-hidden transition-all"
                    >
                      {/* Tiêu đề từng bữa */}
                      <div
                        onClick={() => toggleCollapseBua(bKey)}
                        className="px-3.5 py-2.5 flex items-center justify-between cursor-pointer hover:bg-[#161714]/80 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#f3ece4]">
                            {khungLabel(bKey)}
                          </span>
                          <span className="text-[11px] text-[#c4b6a8]/70">
                            ({buaLogs.length} món)
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-bold text-[#3d9a7a]">
                            {buaKcal} kcal
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setKhung(bKey);
                              setTab('thuc_don');
                            }}
                            title={`Thêm món vào bữa ${khungLabel(bKey)}`}
                            className="p-1 rounded-md bg-[#161714] text-[#ff7a00] hover:bg-[#ff7a00] hover:text-[#0c0d0b] transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>

                          <div className="text-[#c4b6a8]">
                            {isCollapsed ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronUp className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Nội dung danh sách món trong bữa */}
                      {!isCollapsed && (
                        <div className="p-2.5 pt-0 border-t border-[#3a322c]/30 space-y-2">
                          {buaLogs.length === 0 ? (
                            <div className="py-3 text-center text-[11px] text-[#c4b6a8]/60">
                              {Chuoi.chuaCoMonNao}
                              <button
                                type="button"
                                onClick={() => {
                                  setKhung(bKey);
                                  setTab('thuc_don');
                                }}
                                className="ml-2 text-[#ff7a00] font-medium hover:underline"
                              >
                                + Chọn từ thực đơn
                              </button>
                            </div>
                          ) : (
                            buaLogs.map((log) => {
                              const currentG = log.gram ?? log.baseGram ?? 100;
                              return (
                                <div
                                  key={log.id}
                                  className="p-2.5 bg-[#161714] rounded-xl border border-[#3a322c]/50 flex flex-col gap-2"
                                >
                                  {/* Tên & Tổng Kcal của món */}
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <div className="text-xs font-bold text-[#f3ece4] truncate">
                                        {log.ten}
                                      </div>
                                      {/* Chi tiết Macro tính lại theo gram */}
                                      <div className="flex items-center gap-2 text-[10px] text-[#c4b6a8] mt-0.5">
                                        {log.dam != null && (
                                          <span className="text-[#ff7a00]">
                                            P: {log.dam}g
                                          </span>
                                        )}
                                        {log.bot != null && (
                                          <span className="text-[#b9c0b8]">
                                            C: {log.bot}g
                                          </span>
                                        )}
                                        {log.beo != null && (
                                          <span className="text-[#e7e4dc]">
                                            F: {log.beo}g
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="text-xs font-black text-[#3d9a7a]">
                                        {log.kcal} kcal
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteLog(log.id)}
                                        className="text-[#c45c4a] p-1 hover:bg-[#c45c4a]/10 rounded-lg transition-colors"
                                        title="Xoá món"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Chỉnh sửa khối lượng dùng & tự động tính lại macro */}
                                  <div className="pt-1.5 border-t border-[#3a322c]/30 flex flex-wrap items-center justify-between gap-1.5 text-[11px]">
                                    <div className="text-[10px] text-[#c4b6a8] font-medium flex items-center gap-1">
                                      <span>Khối lượng dùng:</span>
                                      <span className="text-[#f3ece4] font-bold">
                                        {currentG}g
                                      </span>
                                    </div>

                                    {/* Nút tăng giảm nhanh và ô nhập khối lượng */}
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handleDoiKhoiLuongLog(log, -50)}
                                        disabled={currentG <= 50}
                                        className="px-1.5 py-0.5 bg-[#0c0d0b] hover:bg-[#2a1c14] disabled:opacity-30 rounded text-[10px] font-semibold text-[#c4b6a8] border border-[#3a322c]/40"
                                        title="Giảm 50g"
                                      >
                                        -50g
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDoiKhoiLuongLog(log, -10)}
                                        disabled={currentG <= 10}
                                        className="p-1 bg-[#0c0d0b] hover:bg-[#2a1c14] disabled:opacity-30 rounded text-[#c4b6a8] border border-[#3a322c]/40"
                                        title="Giảm 10g"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>

                                      <input
                                        type="number"
                                        value={currentG}
                                        onChange={(e) => handleSetGramLog(log, e.target.value)}
                                        className="w-14 px-1 py-0.5 text-center bg-[#0c0d0b] border border-[#3a322c] rounded text-[11px] font-bold text-[#f3ece4] outline-none focus:border-[#3d9a7a]"
                                      />

                                      <button
                                        type="button"
                                        onClick={() => handleDoiKhoiLuongLog(log, 10)}
                                        className="p-1 bg-[#0c0d0b] hover:bg-[#2a1c14] rounded text-[#c4b6a8] border border-[#3a322c]/40"
                                        title="Tăng 10g"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDoiKhoiLuongLog(log, 50)}
                                        className="px-1.5 py-0.5 bg-[#0c0d0b] hover:bg-[#2a1c14] rounded text-[10px] font-semibold text-[#c4b6a8] border border-[#3a322c]/40"
                                        title="Tăng 50g"
                                      >
                                        +50g
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================== TAB 2: THỰC ĐƠN MẪU & CHỌN NHANH ==================== */}
          {tab === 'thuc_don' && (
            <div className="space-y-3">
              {/* Chọn khung bữa ăn mục tiêu */}
              <div className="p-2.5 bg-[#0c0d0b] rounded-xl border border-[#3a322c]/50 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#c4b6a8]">
                  Thêm vào bữa:
                </span>
                <div className="flex items-center gap-1">
                  {buaKeys.map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setKhung(k)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        khung === k
                          ? 'bg-[#3d9a7a] text-[#0c0d0b]'
                          : 'bg-[#161714] text-[#c4b6a8] hover:text-[#f3ece4] border border-[#3a322c]/40'
                      }`}
                    >
                      {khungLabel(k)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ô tìm kiếm món ăn nhanh */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#c4b6a8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchMenu}
                  onChange={(e) => setSearchMenu(e.target.value)}
                  placeholder="Tìm món: Phở, cơm, ức gà, trứng, bún..."
                  className="w-full pl-9 pr-8 py-2 bg-[#0c0d0b] text-[#f3ece4] border border-[#3a322c] rounded-xl text-xs outline-none focus:border-[#ff7a00]"
                />
                {searchMenu && (
                  <button
                    type="button"
                    onClick={() => setSearchMenu('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#c4b6a8] hover:text-[#f3ece4]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Bộ lọc theo nhóm thực phẩm */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {NHOM_THUC_DON.map((n) => (
                  <button
                    key={n.ma}
                    type="button"
                    onClick={() => setNhomLoc(n.ma)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold shrink-0 transition-colors ${
                      nhomLoc === n.ma
                        ? 'bg-[#ff7a00] text-[#0c0d0b]'
                        : 'bg-[#0c0d0b] text-[#c4b6a8] hover:text-[#f3ece4] border border-[#3a322c]/40'
                    }`}
                  >
                    {n.ten}
                  </button>
                ))}
              </div>

              {/* Nút mở form tạo món mới vào thực đơn */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <span className="text-[11px] text-[#c4b6a8]">
                  {filteredFoods.length} món trong danh sách
                </span>
                <button
                  type="button"
                  onClick={() => setShowThemMonMoi(!showThemMonMoi)}
                  className="text-[11px] text-[#ff7a00] hover:text-[#ffb000] font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showThemMonMoi ? 'Đóng tạo món' : Chuoi.themMonMoi}</span>
                </button>
              </div>

              {/* Form tạo món mới lưu vào thực đơn */}
              {showThemMonMoi && (
                <div className="p-3 bg-[#0c0d0b] rounded-xl border border-[#ff7a00]/40 space-y-2.5">
                  <div className="text-xs font-bold text-[#f3ece4]">
                    Tạo món mới vào kho thực đơn
                  </div>
                  <div>
                    <input
                      type="text"
                      value={tenMonMoi}
                      onChange={(e) => setTenMonMoi(e.target.value)}
                      placeholder="Tên món (vd: Cháo sườn, Nước cam tươi...)"
                      className="w-full px-2.5 py-1.5 bg-[#161714] text-[#f3ece4] border border-[#3a322c] rounded-lg text-xs outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-[#c4b6a8]">Kcal *</label>
                      <input
                        type="number"
                        value={kcalMonMoi}
                        onChange={(e) => setKcalMonMoi(e.target.value)}
                        placeholder="250"
                        className="w-full px-2 py-1 bg-[#161714] text-[#f3ece4] border border-[#3a322c] rounded-lg text-xs font-bold text-[#3d9a7a] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#c4b6a8]">Khối lượng chuẩn (g)</label>
                      <input
                        type="number"
                        value={gramMonMoi}
                        onChange={(e) => setGramMonMoi(e.target.value)}
                        placeholder="100"
                        className="w-full px-2 py-1 bg-[#161714] text-[#f3ece4] border border-[#3a322c] rounded-lg text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#c4b6a8]">Đơn vị</label>
                      <input
                        type="text"
                        value={donViMonMoi}
                        onChange={(e) => setDonViMonMoi(e.target.value)}
                        placeholder="bát / g"
                        className="w-full px-2 py-1 bg-[#161714] text-[#f3ece4] border border-[#3a322c] rounded-lg text-xs outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-[#ff7a00]">Đạm (g)</label>
                      <input
                        type="number"
                        value={damMonMoi}
                        onChange={(e) => setDamMonMoi(e.target.value)}
                        placeholder="15"
                        className="w-full px-2 py-1 bg-[#161714] text-[#f3ece4] border border-[#3a322c] rounded-lg text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#b9c0b8]">Bột (g)</label>
                      <input
                        type="number"
                        value={botMonMoi}
                        onChange={(e) => setBotMonMoi(e.target.value)}
                        placeholder="30"
                        className="w-full px-2 py-1 bg-[#161714] text-[#f3ece4] border border-[#3a322c] rounded-lg text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#e7e4dc]">Béo (g)</label>
                      <input
                        type="number"
                        value={beoMonMoi}
                        onChange={(e) => setBeoMonMoi(e.target.value)}
                        placeholder="5"
                        className="w-full px-2 py-1 bg-[#161714] text-[#f3ece4] border border-[#3a322c] rounded-lg text-xs outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <select
                      value={nhomMonMoi}
                      onChange={(e) => setNhomMonMoi(e.target.value as any)}
                      className="px-2 py-1.5 bg-[#161714] text-[#f3ece4] border border-[#3a322c] rounded-lg text-xs outline-none flex-1"
                    >
                      <option value="tinh_bot">Tinh bột</option>
                      <option value="thit_dam">Thịt & Đạm</option>
                      <option value="mon_nuoc">Món nước</option>
                      <option value="rau_qua">Rau & Quả</option>
                      <option value="do_uong">Đồ uống</option>
                      <option value="khac">Khác</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleSaveMonMoiVaoThucDon}
                      className="px-4 py-1.5 bg-[#ff7a00] hover:bg-[#ffb000] text-[#0c0d0b] font-bold text-xs rounded-lg transition-colors"
                    >
                      Lưu món
                    </button>
                  </div>
                </div>
              )}

              {/* Modal/Khối tùy chỉnh khối lượng trước khi thêm */}
              {customizingFood && (
                <div className="p-3.5 bg-[#0c0d0b] rounded-xl border border-[#3d9a7a] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#f3ece4]">
                        Tùy chỉnh khối lượng: {customizingFood.ten}
                      </div>
                      <div className="text-[10px] text-[#c4b6a8]">
                        Chuẩn: {customizingFood.kcal} kcal / {customizingFood.gram}g
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCustomizingFood(null)}
                      className="text-[#c4b6a8] hover:text-[#f3ece4]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Thanh chỉnh gram */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomGram((g) => Math.max(10, g - 50))}
                      className="px-2 py-1 bg-[#161714] hover:bg-[#2a1c14] rounded text-xs text-[#c4b6a8] border border-[#3a322c]"
                    >
                      -50g
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomGram((g) => Math.max(10, g - 10))}
                      className="p-1 bg-[#161714] hover:bg-[#2a1c14] rounded text-[#c4b6a8] border border-[#3a322c]"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      value={customGram}
                      onChange={(e) => setCustomGram(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-20 px-2 py-1 bg-[#161714] border border-[#3d9a7a] rounded text-center text-xs font-bold text-[#f3ece4] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setCustomGram((g) => g + 10)}
                      className="p-1 bg-[#161714] hover:bg-[#2a1c14] rounded text-[#c4b6a8] border border-[#3a322c]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomGram((g) => g + 50)}
                      className="px-2 py-1 bg-[#161714] hover:bg-[#2a1c14] rounded text-xs text-[#c4b6a8] border border-[#3a322c]"
                    >
                      +50g
                    </button>
                  </div>

                  {/* Giá trị tính lại dự kiến */}
                  {(() => {
                    const calc = tinhMacroTheoKhoiLuong(customGram, {
                      baseGram: customizingFood.gram ?? 100,
                      baseKcal: customizingFood.kcal,
                      baseDam: customizingFood.dam,
                      baseBot: customizingFood.bot,
                      baseBeo: customizingFood.beo,
                    });
                    return (
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-[#3a322c]/40">
                        <div className="flex items-center gap-2 text-[11px] text-[#c4b6a8]">
                          <span className="font-bold text-[#3d9a7a]">{calc.kcal} kcal</span>
                          <span>· Đạm {calc.dam}g</span>
                          <span>· Bột {calc.bot}g</span>
                          <span>· Béo {calc.beo}g</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleXacNhanCustomFood}
                          className="px-3 py-1 bg-[#3d9a7a] hover:bg-[#3d9a7a]/90 text-[#0c0d0b] font-bold text-xs rounded-lg flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          Thêm ngay
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Danh sách các món ăn có thể cuộn (Scrollable) */}
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {filteredFoods.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#c4b6a8]">
                    Không tìm thấy món phù hợp với từ khoá.
                  </div>
                ) : (
                  filteredFoods.map((f) => (
                    <div
                      key={f.id}
                      className="p-3 bg-[#0c0d0b] rounded-xl border border-[#3a322c]/50 hover:border-[#3a322c] transition-colors flex items-center justify-between gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#f3ece4] truncate">
                            {f.ten}
                          </span>
                          {f.moTa && (
                            <span className="text-[10px] text-[#c4b6a8]/70">
                              ({f.moTa})
                            </span>
                          )}
                        </div>

                        {/* Kcal & Macro chips */}
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#c4b6a8] mt-1">
                          <span className="font-bold text-[#3d9a7a]">
                            {f.kcal} kcal
                          </span>
                          {f.dam != null && (
                            <span className="text-[#ff7a00]">
                              Đạm {f.dam}g
                            </span>
                          )}
                          {f.bot != null && (
                            <span className="text-[#b9c0b8]">
                              Bột {f.bot}g
                            </span>
                          )}
                          {f.beo != null && (
                            <span className="text-[#e7e4dc]">
                              Béo {f.beo}g
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Nút hành động: Chọn nhanh hoặc Tùy chỉnh khối lượng */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setCustomizingFood(f);
                            setCustomGram(f.gram ?? 100);
                          }}
                          className="px-2 py-1.5 bg-[#161714] hover:bg-[#2a1c14] text-[#c4b6a8] hover:text-[#f3ece4] rounded-lg text-[10px] font-semibold border border-[#3a322c]/60"
                          title="Đổi khối lượng trước khi thêm"
                        >
                          Đổi g
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChonNhanhMon(f)}
                          className="px-3 py-1.5 bg-[#3d9a7a] hover:bg-[#3d9a7a]/90 text-[#0c0d0b] font-bold rounded-lg text-xs flex items-center gap-1 transition-colors"
                          title={`Chọn nhanh món vào bữa ${khungLabel(khung)}`}
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>{Chuoi.chonNhanh}</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ==================== TAB 3: NHẬP TAY / DÁN VĂN BẢN ==================== */}
          {tab === 'nhap_tay' && (
            <div className="space-y-3">
              {/* Chọn bữa */}
              <div className="p-2.5 bg-[#0c0d0b] rounded-xl border border-[#3a322c]/50 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#c4b6a8]">
                  Thêm vào bữa:
                </span>
                <div className="flex items-center gap-1">
                  {buaKeys.map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setKhung(k)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        khung === k
                          ? 'bg-[#3d9a7a] text-[#0c0d0b]'
                          : 'bg-[#161714] text-[#c4b6a8] hover:text-[#f3ece4] border border-[#3a322c]/40'
                      }`}
                    >
                      {khungLabel(k)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nút dán văn bản phân tích món ăn tự động */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowParser(!showParser)}
                  className="text-xs text-[#ff7a00] flex items-center gap-1.5 hover:underline font-medium"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{showParser ? 'Ẩn ô dán văn bản' : 'Dán văn bản phân tích món ăn'}</span>
                </button>
              </div>

              {showParser && (
                <div className="p-3 bg-[#0c0d0b] rounded-xl border border-[#3a322c] space-y-2">
                  <textarea
                    value={quickText}
                    onChange={(e) => setQuickText(e.target.value)}
                    placeholder="Dán nội dung ví dụ: Phở bò 1 bát 450 kcal đạm 25g bột 60g béo 12g..."
                    rows={3}
                    className="w-full bg-transparent text-[#f3ece4] text-xs outline-none resize-none placeholder-[#c4b6a8]/50"
                  />
                  <button
                    type="button"
                    onClick={handleParseText}
                    className="w-full py-2 bg-[#3a322c] hover:bg-[#ff7a00] hover:text-[#0c0d0b] text-xs font-semibold rounded-lg transition-colors"
                  >
                    Tách món & Calo tự động
                  </button>
                </div>
              )}

              {/* Các ô nhập thủ công */}
              <div className="space-y-2.5 p-3.5 bg-[#0c0d0b] rounded-xl border border-[#3a322c]/40">
                <div>
                  <label className="block text-xs font-medium text-[#c4b6a8] mb-1">
                    Tên món ăn
                  </label>
                  <input
                    type="text"
                    value={ten}
                    onChange={(e) => setTen(e.target.value)}
                    placeholder="Ví dụ: Cơm gà nướng, Trứng ốp la..."
                    className="w-full px-3 py-2 bg-[#161714] text-[#f3ece4] border border-[#3a322c] rounded-xl text-xs focus:border-[#3d9a7a] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-[#c4b6a8] mb-1">
                      Kcal *
                    </label>
                    <input
                      type="number"
                      value={kcal}
                      onChange={(e) => setKcal(e.target.value)}
                      placeholder="450"
                      className="w-full px-3 py-2 bg-[#161714] text-[#3d9a7a] font-bold border border-[#3a322c] rounded-xl text-xs focus:border-[#3d9a7a] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#c4b6a8] mb-1">
                      Khối lượng (g)
                    </label>
                    <input
                      type="number"
                      value={gram}
                      onChange={(e) => setGram(e.target.value)}
                      placeholder="200"
                      className="w-full px-3 py-2 bg-[#161714] text-[#f3ece4] border border-[#3a322c] rounded-xl text-xs focus:border-[#3d9a7a] outline-none"
                    />
                  </div>
                </div>

                {/* Macro tuỳ chọn */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-[#ff7a00] mb-1">
                      {Chuoi.dam} (g)
                    </label>
                    <input
                      type="number"
                      value={dam}
                      onChange={(e) => setDam(e.target.value)}
                      placeholder="25"
                      className="w-full px-2 py-1.5 bg-[#161714] text-[#f3ece4] border border-[#3a322c] rounded-lg text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#b9c0b8] mb-1">
                      {Chuoi.bot} (g)
                    </label>
                    <input
                      type="number"
                      value={bot}
                      onChange={(e) => setBot(e.target.value)}
                      placeholder="40"
                      className="w-full px-2 py-1.5 bg-[#161714] text-[#f3ece4] border border-[#3a322c] rounded-lg text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#e7e4dc] mb-1">
                      {Chuoi.beo} (g)
                    </label>
                    <input
                      type="number"
                      value={beo}
                      onChange={(e) => setBeo(e.target.value)}
                      placeholder="10"
                      className="w-full px-2 py-1.5 bg-[#161714] text-[#f3ece4] border border-[#3a322c] rounded-lg text-xs outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveNhapTay}
                className="w-full min-h-[44px] px-3 py-2 bg-[#3d9a7a] text-[#0c0d0b] hover:bg-[#3d9a7a]/90 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Thêm món vào nhật ký</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
