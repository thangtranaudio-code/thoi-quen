import React, { useState } from 'react';
import { Flame, Plus, Check, Scale, ChevronRight, Calendar as CalendarIcon, Info, Sparkles, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { Habit } from '../types';
import { Chuoi, So, Ten } from '../chuoi';
import { Ngay } from '../ngay';
import { CongThuc } from '../cong_thuc';
import { StorageService } from '../storage';
import { LanNgayModal } from '../components/LanNgayModal';
import { ThemHabitModal } from '../components/ThemHabitModal';
import { MotHabitModal } from '../components/MotHabitModal';
import { GhiCanModal } from '../components/GhiCanModal';
import { WidgetHabis } from '../components/WidgetHabis';
import { WidgetHabisGon } from '../components/WidgetHabisGon';
import { CamXucService } from '../services/camXucService';

interface ManHomNayProps {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  onOpenTienDo: () => void;
  onOpenFocus?: () => void;
}

export const ManHomNay: React.FC<ManHomNayProps> = ({
  selectedDate,
  onSelectDate,
  onOpenTienDo,
  onOpenFocus,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [habitDetail, setHabitDetail] = useState<Habit | null>(null);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [habitFilter, setHabitFilter] = useState<'tat_ca' | 'chua_xong' | 'da_xong'>('tat_ca');
  const [collapseCompleted, setCollapseCompleted] = useState(false);
  const [widgetStyle, setWidgetStyle] = useState<'day_du' | 'gon'>(() => StorageService.getWidgetStyle());

  const data = StorageService.getData();
  const today = new Date();
  const isToday = Ngay.cungNgay(selectedDate, today);
  const dateIso = Ngay.iso(selectedDate);
  const khoaGhi = !Ngay.ghiDuoc(selectedDate, today) || Ngay.sau(selectedDate, today);

  const habits = StorageService.getHabits();
  const ticksThisDay = StorageService.getTicksForDay(dateIso);
  const tickedHabitIds = new Set(ticksThisDay.map((t) => t.habitId));

  // Count habits completed, including habits covered by scheduled Focus tasks
  let completedHabitsCount = 0;
  habits.forEach((h) => {
    const isTicked = tickedHabitIds.has(h.id);
    const coveringFocus = StorageService.getCoveringFocusTaskForHabit(h, dateIso);
    if (isTicked || coveringFocus != null) {
      completedHabitsCount++;
    }
  });

  // Week dots for Monday to Sunday
  const weekDays = Ngay.tuan(selectedDate);

  // Month stats for prefix
  const prefixThang = Ngay.prefixThang(selectedDate);
  const allMonthTicks = StorageService.getTicksForMonth(prefixThang);

  // Weight chip calculation
  const latestWeight = StorageService.getLatestWeighIn();
  const targetWeight = data.profile.targetKg;

  // Global Streak flame
  const allTicksSet = new Set(data.ticks.map((t) => t.ngay));
  const streak = Ngay.chuoiLienTiep(allTicksSet, today);

  // Workout streak
  const tapDates = data.tapIns.map((t) => t.ngay);
  const lua = CongThuc.luaTap(tapDates, today);

  // First run chips
  const firstRunChips = [
    { ten: Chuoi.day6Gio, met: null, phut: null },
    { ten: Chuoi.vanDong, met: 5.5, phut: 30 },
    { ten: Chuoi.doc20Trang, met: null, phut: null },
  ];

  const handleChipSelect = (chip: { ten: string; met: number | null; phut: number | null }) => {
    if (khoaGhi) return;
    const cleanTen = Ten.sach(chip.ten);
    if (habits.some((h) => Ten.trung(h.ten, cleanTen))) return;

    const newHabit = StorageService.addHabit({
      ten: cleanTen,
      mucTieuThang: 25,
      met: chip.met,
      phutMacDinh: chip.phut,
      createdDate: dateIso,
    });

    if (newHabit) {
      StorageService.toggleTick(newHabit.id, dateIso);
      CamXucService.kichHoatTickHabit(newHabit.ten, false);
    }
  };

  const handleToggleTick = (habit: Habit, e: React.MouseEvent) => {
    e.stopPropagation();
    if (khoaGhi) return;
    const ticked = StorageService.toggleTick(habit.id, dateIso);
    if (ticked) {
      const todayTicks = StorageService.getTicksForDay(dateIso);
      const isAllDone = habits.length > 0 && todayTicks.length >= habits.length;
      CamXucService.kichHoatTickHabit(habit.ten, isAllDone);
    }
  };

  const handleSwitchWidget = (style: 'day_du' | 'gon') => {
    StorageService.setWidgetStyle(style);
    setWidgetStyle(style);
  };

  return (
    <div id="man-hom-nay" className="flex flex-col min-h-full pb-20 px-4 pt-3 max-w-lg mx-auto">
      {/* Widget Section: Compact vs Full with Seamless Switch */}
      {widgetStyle === 'gon' ? (
        <WidgetHabisGon
          onOpenFocus={onOpenFocus}
          onSwitchToFull={() => handleSwitchWidget('day_du')}
        />
      ) : (
        <WidgetHabis
          onOpenFocus={onOpenFocus}
          onSwitchToGon={() => handleSwitchWidget('gon')}
        />
      )}

      {/* Greeting & Logo Header (Safe Zone) */}
      <div className="flex items-center justify-between mb-3.5 pt-1">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl bg-black border border-[#ff6000]/40 p-1 flex items-center justify-center shrink-0 shadow-md shadow-[#ff6000]/15 overflow-hidden"
            title="HABIS Thói quen"
          >
            <img
              src="/assets/app_logo.png"
              alt="Logo"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-[#f8f7f4]">
              {Chuoi.chaoTheoGio()}
            </h1>
            <p className="text-xs text-[#a6a39b] mt-0.5 font-medium">{Chuoi.totHonHomQua}</p>
          </div>
        </div>

        {/* Fire Streak Badge with Logo Brand Colors */}
        <div
          id="badge-streak-lua"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#131418] border border-[#ff6000]/30 rounded-2xl shadow-sm"
        >
          <Flame className="w-4 h-4 text-[#ff6000] fill-[#ff6000]" />
          <div className="text-right">
            <div className="text-[9px] uppercase tracking-wider text-[#a6a39b] font-bold">
              {Chuoi.chuoiHienTai}
            </div>
            <div className="text-xs font-black text-[#ffaa00]">
              {streak} {Chuoi.ngayDonVi}
            </div>
          </div>
        </div>
      </div>

      {/* Date Row (Tap to open date picker) */}
      <div className="mb-3">
        <button
          id="nut-dong-ngay-chon"
          type="button"
          onClick={() => setShowDatePicker(true)}
          className="w-full flex items-center justify-between p-3.5 bg-[#131418] hover:bg-[#181a20] border border-[#24262c] hover:border-[#ff6000]/30 rounded-2xl transition-all text-left shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#1c1e26] flex items-center justify-center text-[#ffaa00]">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#f8f7f4]">
                {Chuoi.dongNgay(selectedDate)}
              </div>
              <div className="text-xs text-[#a6a39b] mt-0.5 font-medium">
                {isToday
                  ? Chuoi.nTrenMHomNay(completedHabitsCount, habits.length)
                  : Chuoi.nTrenMNgay(completedHabitsCount, habits.length, selectedDate)}
                {khoaGhi && (
                  <span className="text-[#e63946] font-semibold ml-1.5">
                    · {Chuoi.chiXem}
                  </span>
                )}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#a6a39b]" />
        </button>

        {/* Return to today button if not today */}
        {!isToday && (
          <button
            type="button"
            onClick={() => onSelectDate(new Date())}
            className="mt-1.5 text-[11px] text-[#ffaa00] hover:underline flex items-center gap-1 font-semibold pl-1"
          >
            ← Quay lại hôm nay
          </button>
        )}
      </div>

      {/* 7 Week Dots Strip (Display only) */}
      <div
        id="dai-7-cham-tuan"
        className="flex items-center justify-between px-3.5 py-2.5 bg-[#131418] rounded-2xl border border-[#24262c] mb-3 shadow-sm"
      >
        {weekDays.map((d, index) => {
          const iso = Ngay.iso(d);
          const ticksOnDay = StorageService.getTicksForDay(iso);
          const isSelected = Ngay.cungNgay(d, selectedDate);
          const isDayToday = Ngay.cungNgay(d, today);
          const isCompleted = habits.length > 0 && ticksOnDay.length >= habits.length;
          const isPartial = ticksOnDay.length > 0 && ticksOnDay.length < habits.length;

          return (
            <div key={iso} className="flex flex-col items-center gap-1.5">
              <span
                className={`text-[10px] font-bold ${
                  isSelected ? 'text-[#ffaa00]' : isDayToday ? 'text-[#f8f7f4]' : 'text-[#a6a39b]'
                }`}
              >
                {Chuoi.thuNgan[index]}
              </span>
              <div
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-[#38b000]'
                    : isPartial
                    ? 'bg-gradient-to-br from-[#ffaa00] to-[#ff6000]'
                    : isSelected
                    ? 'border-2 border-[#ffaa00] bg-transparent'
                    : 'bg-[#22242c]'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Weight Chip & Workout Flame */}
      <div className="flex items-center gap-2 mb-3.5 overflow-x-auto pb-1">
        {latestWeight ? (
          <button
            id="chip-can-nang"
            type="button"
            onClick={onOpenTienDo}
            className="px-3.5 py-2 bg-[#131418] hover:bg-[#1a1c22] border border-[#24262c] hover:border-[#ff6000]/30 rounded-2xl text-xs font-semibold text-[#f8f7f4] flex items-center gap-2 transition-all shrink-0 shadow-sm"
          >
            <Scale className="w-3.5 h-3.5 text-[#ffaa00]" />
            {targetWeight
              ? Chuoi.chipCanCon(So.kg(latestWeight.kg), So.kg(Math.abs(latestWeight.kg - targetWeight)))
              : `${So.kg(latestWeight.kg)} kg`}
          </button>
        ) : (
          <button
            id="chip-them-can"
            type="button"
            onClick={() => setShowWeightModal(true)}
            disabled={khoaGhi}
            className="px-3.5 py-2 bg-[#131418] hover:bg-[#1a1c22] border border-[#24262c] hover:border-[#ff6000]/30 rounded-2xl text-xs font-semibold text-[#a6a39b] hover:text-[#f8f7f4] flex items-center gap-2 transition-all shrink-0 disabled:opacity-50 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-[#ffaa00]" />
            {Chuoi.themCan}
          </button>
        )}

        {lua.so > 0 && (
          <span className="text-[11px] text-[#ffaa00] font-semibold flex items-center gap-1.5 shrink-0 bg-[#131418] px-3 py-2 rounded-2xl border border-[#24262c] shadow-sm">
            <Flame className="w-3.5 h-3.5 text-[#ff6000] fill-[#ff6000]" />
            Lửa tập {lua.so}
          </span>
        )}
      </div>

      {/* Habit Rows or First Run Chips */}
      {habits.length === 0 ? (
        <div id="first-run-chips-container" className="p-5 bg-[#131418] rounded-3xl border border-[#24262c] my-2 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-[#ffaa00]" />
            <span className="text-xs font-bold text-[#f8f7f4]">Bắt đầu thói quen đầu tiên</span>
          </div>
          <p className="text-xs text-[#a6a39b] mb-4 leading-relaxed">
            Chọn thói quen mẫu hoặc tự đặt tên để bắt đầu xây dựng chuỗi của bạn.
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {firstRunChips.map((c) => (
              <button
                key={c.ten}
                type="button"
                onClick={() => handleChipSelect(c)}
                disabled={khoaGhi}
                className="px-3.5 py-2 bg-[#090a0c] hover:bg-[#181a20] text-xs font-medium text-[#f8f7f4] border border-[#24262c] hover:border-[#ff6000]/40 rounded-2xl flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 text-[#ffaa00]" />
                {c.ten}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowAddHabit(true)}
            disabled={khoaGhi}
            className="w-full py-3 bg-gradient-to-r from-[#ffaa00] to-[#ff6000] text-black text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 active:scale-98 disabled:opacity-50 shadow-md shadow-[#ff6000]/20 transition-transform"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            {Chuoi.tuDatTen}
          </button>
        </div>
      ) : (
        <div className="space-y-2 mb-4">
          {/* Thanh phân loại & thu gọn thói quen */}
          {habits.length > 1 && (
            <div className="flex items-center justify-between pb-1.5 text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setHabitFilter('tat_ca')}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
                    habitFilter === 'tat_ca'
                      ? 'bg-[#1e2029] text-[#f8f7f4] border border-[#2e313c] shadow-sm'
                      : 'text-[#a6a39b] hover:text-[#f8f7f4]'
                  }`}
                >
                  Tất cả ({habits.length})
                </button>
                <button
                  type="button"
                  onClick={() => setHabitFilter('chua_xong')}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
                    habitFilter === 'chua_xong'
                      ? 'bg-[#261b14] text-[#ffaa00] border border-[#ff6000]/40 shadow-sm'
                      : 'text-[#a6a39b] hover:text-[#f8f7f4]'
                  }`}
                >
                  Chưa xong ({habits.length - completedHabitsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setHabitFilter('da_xong')}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
                    habitFilter === 'da_xong'
                      ? 'bg-[#15241b] text-[#38b000] border border-[#38b000]/40 shadow-sm'
                      : 'text-[#a6a39b] hover:text-[#f8f7f4]'
                  }`}
                >
                  Đã xong ({completedHabitsCount})
                </button>
              </div>

              {habitFilter === 'tat_ca' && completedHabitsCount > 0 && (
                <button
                  type="button"
                  onClick={() => setCollapseCompleted(!collapseCompleted)}
                  className="text-[11px] text-[#a6a39b] hover:text-[#f8f7f4] flex items-center gap-1 font-medium transition-colors"
                >
                  <SlidersHorizontal className="w-3 h-3 text-[#ffaa00]" />
                  <span>{collapseCompleted ? 'Hiện đã xong' : 'Thu gọn'}</span>
                </button>
              )}
            </div>
          )}

          {habits
            .filter((habit) => {
              const isTicked = tickedHabitIds.has(habit.id);
              const coveringFocus = StorageService.getCoveringFocusTaskForHabit(habit, dateIso);
              const isDone = isTicked || coveringFocus != null;

              if (habitFilter === 'chua_xong') return !isDone;
              if (habitFilter === 'da_xong') return isDone;
              if (habitFilter === 'tat_ca' && collapseCompleted && isDone) return false;
              return true;
            })
            .map((habit) => {
              const isTicked = tickedHabitIds.has(habit.id);
              const coveringFocus = StorageService.getCoveringFocusTaskForHabit(habit, dateIso);
              const isCoveredByFocus = coveringFocus != null;
              const monthTicksCount = allMonthTicks.filter((t) => t.habitId === habit.id).length;

              return (
                <div
                  key={habit.id}
                  id={`hang-habit-${habit.id}`}
                  onClick={() => setHabitDetail(habit)}
                  className={`min-h-[52px] p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between shadow-sm ${
                    isCoveredByFocus
                      ? 'bg-gradient-to-r from-[#20150e] to-[#17120e] border-[#ff6000]/60 text-[#f8f7f4]'
                      : isTicked
                      ? 'bg-[#121a15] border-[#38b000]/40 text-[#f8f7f4]'
                      : 'bg-[#131418] border-[#24262c] text-[#f8f7f4] hover:border-[#ff6000]/30 hover:bg-[#17181f]'
                  }`}
                >
                  {/* Habit name and month progress */}
                  <div className="flex-1 pr-3">
                    <div
                      className={`text-sm font-semibold leading-tight ${
                        isCoveredByFocus
                          ? 'line-through text-[#a6a39b]'
                          : isTicked
                          ? 'text-[#f8f7f4]'
                          : 'text-[#f8f7f4]'
                      }`}
                    >
                      {habit.ten}
                    </div>

                    {/* Focus priority override note */}
                    {isCoveredByFocus ? (
                      <div className="text-[11px] text-[#ffaa00] font-medium mt-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#ffaa00]" />
                        <span>
                          Ưu tiên theo Focus: {coveringFocus.tieuDe} ({coveringFocus.gioBatDau}–{coveringFocus.gioKetThuc})
                        </span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-[#a6a39b] mt-1 flex items-center gap-1.5">
                        <span>{Chuoi.xTrenNThangNay(monthTicksCount, habit.mucTieuThang)}</span>
                        {habit.met && (
                          <span className="text-[#ffaa00]">
                            · {habit.phutMacDinh ?? 30} {Chuoi.phut}
                          </span>
                        )}
                        {habit.gioNhac != null && (
                          <span className="text-[#a6a39b]">
                            · {Chuoi.gioNhacChu(habit.gioNhac)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Checkbox (>= 44pt tap target) */}
                  {isCoveredByFocus ? (
                    <div
                      className="w-10 h-10 rounded-xl bg-[#26170f] border border-[#ff6000] flex flex-col items-center justify-center text-[#ffaa00] shrink-0"
                      title={`Hoàn thành ưu tiên theo Focus: ${coveringFocus.tieuDe}`}
                    >
                      <Check className="w-4 h-4 stroke-[2.75]" />
                      <span className="text-[8px] font-extrabold uppercase -mt-0.5 tracking-tighter">
                        Focus
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      id={`nut-tick-habit-${habit.id}`}
                      onClick={(e) => handleToggleTick(habit, e)}
                      disabled={khoaGhi}
                      aria-label={`Đánh dấu ${habit.ten}`}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform active:scale-90 ${
                        isTicked
                          ? 'bg-[#38b000] text-black shadow-md shadow-[#38b000]/20'
                          : 'bg-[#090a0c] border border-[#2a2c34] text-transparent hover:border-[#ffaa00]'
                      } ${khoaGhi ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      <Check className={`w-5 h-5 stroke-[2.75] ${isTicked ? 'opacity-100' : 'opacity-0'}`} />
                    </button>
                  )}
                </div>
              );
            })}

          {/* Dòng tóm tắt khi đã thu gọn các mục đã xong */}
          {habitFilter === 'tat_ca' && collapseCompleted && completedHabitsCount > 0 && (
            <div
              onClick={() => setCollapseCompleted(false)}
              className="p-3 bg-[#131418] rounded-2xl border border-dashed border-[#2e313c] flex items-center justify-between cursor-pointer hover:border-[#38b000]/50 transition-colors"
            >
              <span className="text-xs text-[#38b000] font-medium flex items-center gap-2">
                <Check className="w-3.5 h-3.5" />
                <span>Đã xong {completedHabitsCount} việc (chạm để mở rộng)</span>
              </span>
              <ChevronDown className="w-4 h-4 text-[#a6a39b]" />
            </div>
          )}
        </div>
      )}

      {/* Add Habit button below list */}
      {habits.length > 0 && habits.length < 8 && !khoaGhi && (
        <button
          id="nut-them-thoi-quen-duoi-list"
          type="button"
          onClick={() => setShowAddHabit(true)}
          className="w-full min-h-[46px] py-3 border border-dashed border-[#2e313c] hover:border-[#ff6000]/60 text-[#a6a39b] hover:text-[#f8f7f4] rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all mb-6 bg-[#131418]/50 hover:bg-[#131418]"
        >
          <Plus className="w-4 h-4 text-[#ffaa00]" />
          {Chuoi.themThoiQuen}
        </button>
      )}

      {/* Modals */}
      {showDatePicker && (
        <LanNgayModal
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
          onClose={() => setShowDatePicker(false)}
        />
      )}

      {showAddHabit && (
        <ThemHabitModal
          onClose={() => setShowAddHabit(false)}
          onSuccess={() => setShowAddHabit(false)}
        />
      )}

      {habitDetail && (
        <MotHabitModal
          habit={habitDetail}
          selectedDate={selectedDate}
          onClose={() => setHabitDetail(null)}
          onEdit={() => {
            const h = habitDetail;
            setHabitDetail(null);
            setHabitToEdit(h);
          }}
          onDeleted={() => setHabitDetail(null)}
        />
      )}

      {habitToEdit && (
        <ThemHabitModal
          habitToEdit={habitToEdit}
          onClose={() => setHabitToEdit(null)}
          onSuccess={() => setHabitToEdit(null)}
        />
      )}

      {showWeightModal && (
        <GhiCanModal
          selectedDate={selectedDate}
          onClose={() => setShowWeightModal(false)}
          onSuccess={() => setShowWeightModal(false)}
        />
      )}
    </div>
  );
};
