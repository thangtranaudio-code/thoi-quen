import React, { useState } from 'react';
import { Flame, Plus, Check, Scale, ChevronRight, Calendar as CalendarIcon, Info } from 'lucide-react';
import { Habit } from '../types';
import { Chuoi, So, Ten } from '../chuoi';
import { Ngay } from '../ngay';
import { CongThuc } from '../cong_thuc';
import { StorageService } from '../storage';
import { LanNgayModal } from '../components/LanNgayModal';
import { ThemHabitModal } from '../components/ThemHabitModal';
import { MotHabitModal } from '../components/MotHabitModal';
import { GhiCanModal } from '../components/GhiCanModal';

interface ManHomNayProps {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  onOpenTienDo: () => void;
}

export const ManHomNay: React.FC<ManHomNayProps> = ({
  selectedDate,
  onSelectDate,
  onOpenTienDo,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [habitDetail, setHabitDetail] = useState<Habit | null>(null);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
  const [showWeightModal, setShowWeightModal] = useState(false);

  const data = StorageService.getData();
  const today = new Date();
  const isToday = Ngay.cungNgay(selectedDate, today);
  const dateIso = Ngay.iso(selectedDate);
  const khoaGhi = !Ngay.ghiDuoc(selectedDate, today) || Ngay.sau(selectedDate, today);

  const habits = StorageService.getHabits();
  const ticksThisDay = StorageService.getTicksForDay(dateIso);
  const tickedHabitIds = new Set(ticksThisDay.map((t) => t.habitId));

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
    }
  };

  const handleToggleTick = (habit: Habit, e: React.MouseEvent) => {
    e.stopPropagation();
    if (khoaGhi) return;
    StorageService.toggleTick(habit.id, dateIso);
  };

  return (
    <div id="man-hom-nay" className="flex flex-col min-h-full pb-20 px-4 pt-3 max-w-lg mx-auto">
      {/* Greeting & Streak Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#f3ece4]">
            {Chuoi.chaoTheoGio()}
          </h1>
          <p className="text-xs text-[#c4b6a8] mt-0.5">{Chuoi.totHonHomQua}</p>
        </div>

        {/* Fire Streak Badge */}
        <div
          id="badge-streak-lua"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] border border-[#ff7a00]/40 rounded-xl"
        >
          <Flame className="w-4 h-4 text-[#ff7a00] fill-[#ff7a00]/30" />
          <div className="text-right">
            <div className="text-[9px] uppercase tracking-wider text-[#c4b6a8] font-bold">
              {Chuoi.chuoiHienTai}
            </div>
            <div className="text-xs font-black text-[#ff7a00]">
              {streak} {Chuoi.ngayDonVi}
            </div>
          </div>
        </div>
      </div>

      {/* Date Row (Tap to open date picker) */}
      <div className="mb-4">
        <button
          id="nut-dong-ngay-chon"
          type="button"
          onClick={() => setShowDatePicker(true)}
          className="w-full flex items-center justify-between p-3 bg-[#161714] hover:bg-[#2a1c14]/60 border border-[#3a322c]/60 rounded-xl transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <CalendarIcon className="w-4 h-4 text-[#ff7a00]" />
            <div>
              <div className="text-sm font-semibold text-[#f3ece4]">
                {Chuoi.dongNgay(selectedDate)}
              </div>
              <div className="text-xs text-[#c4b6a8] mt-0.5">
                {isToday
                  ? Chuoi.nTrenMHomNay(tickedHabitIds.size, habits.length)
                  : Chuoi.nTrenMNgay(tickedHabitIds.size, habits.length, selectedDate)}
                {khoaGhi && (
                  <span className="text-[#d94a38] font-semibold ml-1.5">
                    · {Chuoi.chiXem}
                  </span>
                )}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#c4b6a8]" />
        </button>

        {/* Return to today button if not today */}
        {!isToday && (
          <button
            type="button"
            onClick={() => onSelectDate(new Date())}
            className="mt-1 text-[11px] text-[#ff7a00] hover:underline flex items-center gap-1 font-medium"
          >
            Quay lại hôm nay
          </button>
        )}
      </div>

      {/* 7 Week Dots Strip (Display only) */}
      <div
        id="dai-7-cham-tuan"
        aria-label="7 ngày trong tuần"
        className="flex items-center justify-between bg-[#161714] p-3 rounded-xl border border-[#3a322c]/40 mb-4"
      >
        {weekDays.map((d, index) => {
          const iso = Ngay.iso(d);
          const dayTicks = StorageService.getTicksForDay(iso);
          const isSelected = Ngay.cungNgay(d, selectedDate);
          const isDayToday = Ngay.cungNgay(d, today);
          const hasDone = habits.length > 0 && dayTicks.length >= habits.length;
          const hasPartial = dayTicks.length > 0 && dayTicks.length < habits.length;

          return (
            <div key={iso} className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-medium text-[#c4b6a8]">
                {Chuoi.thuNgan[index]}
              </span>
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                  hasDone
                    ? 'bg-[#3d9a7a]'
                    : hasPartial
                    ? 'bg-[#ff7a00]'
                    : isDayToday
                    ? 'border-2 border-[#ff7a00]'
                    : 'bg-[#2a1c14]'
                } ${isSelected ? 'ring-2 ring-white/60 scale-110' : ''}`}
              />
              <span className="text-[9px] text-[#c4b6a8]/70">{d.getDate()}</span>
            </div>
          );
        })}
      </div>

      {/* Top Weight Chip */}
      <div className="mb-4">
        {latestWeight ? (
          <button
            id="chip-can-nang-home"
            type="button"
            onClick={() => setShowWeightModal(true)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-[#161714] hover:bg-[#2a1c14] border border-[#3a322c]/60 rounded-xl transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#ff7a00]" />
              <span className="text-xs font-semibold text-[#f3ece4]">
                {targetWeight
                  ? Chuoi.chipCanCon(
                      So.kg(latestWeight.kg),
                      So.kg(Math.abs(latestWeight.kg - targetWeight))
                    )
                  : Chuoi.chipCan(So.kg(latestWeight.kg))}
              </span>
            </div>
            <span className="text-[11px] text-[#ff7a00] font-medium">Ghi thêm</span>
          </button>
        ) : (
          <button
            id="chip-them-can-home"
            type="button"
            onClick={() => setShowWeightModal(true)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-[#161714] hover:bg-[#2a1c14] border border-[#3a322c]/60 rounded-xl transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#c4b6a8]" />
              <span className="text-xs font-semibold text-[#c4b6a8]">
                {Chuoi.themCan}
              </span>
            </div>
            <Plus className="w-4 h-4 text-[#c4b6a8]" />
          </button>
        )}
      </div>

      {/* Habits List Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#c4b6a8]">
          {Chuoi.thoiQuen} ({habits.length}/8)
        </h2>
        {lua.so > 0 && (
          <span className="text-[11px] text-[#ffb000] font-medium flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" />
            Lửa tập {lua.so}
          </span>
        )}
      </div>

      {/* Habit Rows or First Run Chips */}
      {habits.length === 0 ? (
        <div id="first-run-chips-container" className="p-4 bg-[#161714] rounded-2xl border border-[#3a322c]/50 my-2">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-[#ff7a00]" />
            <span className="text-xs font-semibold text-[#f3ece4]">Bắt đầu thói quen đầu tiên</span>
          </div>
          <p className="text-xs text-[#c4b6a8] mb-3 leading-relaxed">
            Chọn thói quen mẫu hoặc tự đặt tên để bắt đầu xây dựng chuỗi của bạn.
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {firstRunChips.map((c) => (
              <button
                key={c.ten}
                type="button"
                onClick={() => handleChipSelect(c)}
                disabled={khoaGhi}
                className="px-3 py-2 bg-[#0d0d0d] hover:bg-[#2a1c14] text-xs font-medium text-[#f3ece4] border border-[#3a322c] rounded-xl flex items-center gap-1.5 transition-colors active:scale-95 disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5 text-[#ff7a00]" />
                {c.ten}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowAddHabit(true)}
            disabled={khoaGhi}
            className="w-full py-2.5 bg-[#ff7a00] text-[#0d0d0d] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 active:scale-98 disabled:opacity-50"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            {Chuoi.tuDatTen}
          </button>
        </div>
      ) : (
        <div className="space-y-2 mb-4">
          {habits.map((habit) => {
            const isTicked = tickedHabitIds.has(habit.id);
            // Count month ticks for this habit
            const monthTicksCount = allMonthTicks.filter((t) => t.habitId === habit.id).length;

            return (
              <div
                key={habit.id}
                id={`hang-habit-${habit.id}`}
                onClick={() => setHabitDetail(habit)}
                className={`min-h-[52px] p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isTicked
                    ? 'bg-[#161714] border-[#3d9a7a]/60 text-[#f3ece4]'
                    : 'bg-[#161714] border-[#3a322c]/50 text-[#f3ece4] hover:border-[#3a322c]'
                }`}
              >
                {/* Habit name and month progress */}
                <div className="flex-1 pr-3">
                  <div
                    className={`text-sm font-semibold leading-tight ${
                      isTicked ? 'text-[#f3ece4]' : 'text-[#f3ece4]'
                    }`}
                  >
                    {habit.ten}
                  </div>
                  <div className="text-[11px] text-[#c4b6a8] mt-0.5">
                    {Chuoi.xTrenNThangNay(monthTicksCount, habit.mucTieuThang)}
                    {habit.met && (
                      <span className="text-[#ffb000] ml-1.5">
                        · {habit.phutMacDinh ?? 30} {Chuoi.phut}
                      </span>
                    )}
                  </div>
                </div>

                {/* Single Tap Tick Checkbox (>= 44pt tap target) */}
                <button
                  type="button"
                  id={`nut-tick-habit-${habit.id}`}
                  onClick={(e) => handleToggleTick(habit, e)}
                  disabled={khoaGhi}
                  aria-label={`Đánh dấu ${habit.ten}`}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform active:scale-90 ${
                    isTicked
                      ? 'bg-[#3d9a7a] text-[#0d0d0d]'
                      : 'bg-[#0d0d0d] border border-[#3a322c] text-transparent hover:border-[#ff7a00]'
                  } ${khoaGhi ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <Check className={`w-6 h-6 stroke-[3] ${isTicked ? 'opacity-100' : 'opacity-0'}`} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Habit button below list */}
      {habits.length > 0 && habits.length < 8 && !khoaGhi && (
        <button
          id="nut-them-thoi-quen-duoi-list"
          type="button"
          onClick={() => setShowAddHabit(true)}
          className="w-full min-h-[44px] py-2.5 border border-dashed border-[#3a322c] hover:border-[#ff7a00] text-[#c4b6a8] hover:text-[#f3ece4] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors mb-6"
        >
          <Plus className="w-4 h-4 text-[#ff7a00]" />
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
          habitToEdit={habitToEdit}
          onClose={() => {
            setShowAddHabit(false);
            setHabitToEdit(null);
          }}
          onSuccess={() => {
            // Auto tick new habit for selectedDate
            const newHabits = StorageService.getHabits();
            const latest = newHabits[newHabits.length - 1];
            if (latest && !habitToEdit && !khoaGhi) {
              StorageService.toggleTick(latest.id, dateIso);
            }
          }}
        />
      )}

      {habitDetail && (
        <MotHabitModal
          habit={habitDetail}
          selectedDate={selectedDate}
          onClose={() => setHabitDetail(null)}
          onEdit={() => {
            setHabitToEdit(habitDetail);
            setShowAddHabit(true);
          }}
          onDeleted={() => setHabitDetail(null)}
        />
      )}

      {showWeightModal && (
        <GhiCanModal
          selectedDate={selectedDate}
          onClose={() => setShowWeightModal(false)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
};
