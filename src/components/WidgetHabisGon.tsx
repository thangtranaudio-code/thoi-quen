import React, { useState, useEffect } from 'react';
import { Check, Clock, Maximize2, Sparkles, ChevronRight, Flame } from 'lucide-react';
import { StorageService } from '../storage';
import { Ngay } from '../ngay';
import { Chuoi } from '../chuoi';
import { CongThuc } from '../cong_thuc';
import { FocusTask, Habit } from '../types';
import { CamXucService } from '../services/camXucService';

interface WidgetItem {
  id: string;
  type: 'focus' | 'habit';
  title: string;
  timeRange: string;
  startMinutes: number;
  endMinutes: number;
  isCompleted: boolean;
  isOverdue: boolean;
  rawFocusTask?: FocusTask;
  rawHabit?: Habit;
}

interface WidgetHabisGonProps {
  onOpenFocus?: () => void;
  onOpenLich?: () => void;
  onSwitchToFull?: () => void;
}

export const WidgetHabisGon: React.FC<WidgetHabisGonProps> = ({
  onOpenFocus,
  onSwitchToFull,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const todayIso = Ngay.iso(currentTime);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      StorageService.checkAndUpdateOverdueTasks();
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const data = StorageService.getData();
  const profile = data.profile;
  const habits = StorageService.getHabits();
  const ticksToday = StorageService.getTicksForDay(todayIso);
  const tickedHabitIds = new Set(ticksToday.map((t) => t.habitId));
  const focusTasksToday = StorageService.getFocusTasks(todayIso);

  // Completed habits count
  let completedHabitsCount = 0;
  habits.forEach((h) => {
    const hasTick = tickedHabitIds.has(h.id);
    const coveredByFocus = StorageService.getCoveringFocusTaskForHabit(h, todayIso);
    if (hasTick || coveredByFocus) {
      completedHabitsCount++;
    }
  });

  // Food log kcal
  const dayFoodLogs = data.foodLogs.filter((f) => f.ngay === todayIso);
  const totalKcalNap = dayFoodLogs.reduce((acc, cur) => acc + cur.kcal, 0);

  // Suggested Kcal
  const currentWeight = StorageService.getLatestWeighIn()?.kg ?? profile.startKg ?? null;
  const age = CongThuc.tuoi(profile.dob, currentTime);
  const bmrVal = CongThuc.bmr({
    sex: profile.sex,
    kg: currentWeight,
    cm: profile.heightCm,
    tuoi: age,
  });
  const tdeeVal = CongThuc.tdee(bmrVal, profile.activity);
  const suggestedKcal = CongThuc.kcalGoiY({
    tdee: tdeeVal,
    nhip: profile.nhipKg,
    kg: currentWeight,
    target: profile.targetKg,
  }) ?? 2200;

  const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const allItems: WidgetItem[] = [];

  // 1. Focus tasks
  focusTasksToday.forEach((t) => {
    const sMin = StorageService.timeToMinutes(t.gioBatDau);
    const eMin = StorageService.timeToMinutes(t.gioKetThuc);
    const isDone = t.trangThai === 'hoan_thanh';
    const isPast30m = nowMinutes > eMin + 30;
    const isOverdue = !isDone && (isPast30m || t.trangThai === 'qua_han');

    allItems.push({
      id: t.id,
      type: 'focus',
      title: t.tieuDe,
      timeRange: `${t.gioBatDau} - ${t.gioKetThuc}`,
      startMinutes: sMin,
      endMinutes: eMin,
      isCompleted: isDone,
      isOverdue,
      rawFocusTask: t,
    });
  });

  // 2. Habits
  habits.forEach((h) => {
    const hasTick = tickedHabitIds.has(h.id);
    const coveredByFocus = StorageService.getCoveringFocusTaskForHabit(h, todayIso);
    const isDone = hasTick || coveredByFocus != null;

    let sMin = 0;
    let eMin = 1439;
    let timeRange = 'Hôm nay';

    if (h.gioBatDau && h.gioKetThuc) {
      sMin = StorageService.timeToMinutes(h.gioBatDau);
      eMin = StorageService.timeToMinutes(h.gioKetThuc);
      timeRange = `${h.gioBatDau} - ${h.gioKetThuc}`;
    } else if (h.gioNhac != null) {
      sMin = h.gioNhac;
      eMin = h.gioNhac + (h.phutMacDinh ?? 30);
      timeRange = Chuoi.gioNhacChu(h.gioNhac);
    }

    const isPast30m = h.gioKetThuc ? nowMinutes > eMin + 30 : false;
    const isOverdue = !isDone && isPast30m;

    allItems.push({
      id: `habit_${h.id}`,
      type: 'habit',
      title: h.ten,
      timeRange,
      startMinutes: sMin,
      endMinutes: eMin,
      isCompleted: isDone,
      isOverdue,
      rawHabit: h,
    });
  });

  // Top next active item
  const nextItem = allItems
    .filter((item) => !item.isCompleted && !item.isOverdue)
    .sort((a, b) => {
      const aOngoing = nowMinutes >= a.startMinutes && nowMinutes <= a.endMinutes;
      const bOngoing = nowMinutes >= b.startMinutes && nowMinutes <= b.endMinutes;
      if (aOngoing && !bOngoing) return -1;
      if (!aOngoing && bOngoing) return 1;
      return a.startMinutes - b.startMinutes;
    })[0];

  const handleQuickTick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!nextItem) return;
    if (nextItem.type === 'focus' && nextItem.rawFocusTask) {
      const isDone = StorageService.toggleFocusTask(nextItem.rawFocusTask.id);
      if (isDone) {
        CamXucService.kichHoatFocusDone(nextItem.rawFocusTask.tieuDe);
      }
    } else if (nextItem.type === 'habit' && nextItem.rawHabit) {
      const ticked = StorageService.toggleTick(nextItem.rawHabit.id, todayIso);
      if (ticked) {
        const todayTicks = StorageService.getTicksForDay(todayIso);
        const isAllDone = habits.length > 0 && todayTicks.length >= habits.length;
        CamXucService.kichHoatTickHabit(nextItem.rawHabit.ten, isAllDone);
      }
    }
  };

  const streak = Ngay.chuoiLienTiep(new Set(data.ticks.map((t) => t.ngay)), new Date());

  return (
    <div
      id="widget-habis-gon"
      className="relative group overflow-hidden bg-gradient-to-r from-[#131418] via-[#16181d] to-[#121316] border border-[#ff6000]/30 hover:border-[#ff6000]/50 rounded-2xl p-2.5 shadow-md shadow-black/40 mb-3 transition-all duration-200"
    >
      <div className="flex items-center justify-between gap-2.5">
        {/* Left: App Logo in safe-zone container */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div
            className="w-9 h-9 rounded-xl bg-black border border-[#ff6000]/40 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-inner cursor-pointer"
            onClick={onOpenFocus}
            title="Xem Focus"
          >
            <img
              src="/assets/app_logo.png"
              alt="Logo"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Current Task or Success status */}
          <div
            className="min-w-0 flex-1 cursor-pointer select-none"
            onClick={nextItem?.type === 'focus' ? onOpenFocus : undefined}
          >
            {nextItem ? (
              <div className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  id={`nut-tick-gon-${nextItem.id}`}
                  onClick={handleQuickTick}
                  className="w-6 h-6 rounded-lg border-2 border-[#ff6000]/60 hover:border-[#ffaa00] bg-[#1a130f] hover:bg-[#ff6000]/20 text-[#ffaa00] flex items-center justify-center shrink-0 transition-transform active:scale-90"
                  title="Tick hoàn thành"
                >
                  <Check className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[#f8f7f4] truncate flex items-center gap-1.5">
                    <span className="truncate">{nextItem.title}</span>
                    {nextItem.type === 'focus' && (
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-full bg-[#ff6000]/20 text-[#ffaa00] border border-[#ff6000]/30 shrink-0">
                        Focus
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#a6a39b] flex items-center gap-1 truncate mt-0.5">
                    <Clock className="w-2.5 h-2.5 text-[#ffaa00] shrink-0" />
                    <span>{nextItem.timeRange}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-[#a6a39b]">
                <Sparkles className="w-3.5 h-3.5 text-[#ffaa00] shrink-0" />
                <span className="text-[#f8f7f4] font-medium truncate">Mọi việc hôm nay đã xong!</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick metrics & Switch to Full button */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Habits done pill */}
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1a1b20] border border-[#2a2c34] text-[11px] font-semibold text-[#f8f7f4]"
            title="Thói quen hoàn thành"
          >
            <Check className="w-3 h-3 text-[#38b000]" />
            <span>
              {completedHabitsCount}/{habits.length}
            </span>
          </div>

          {/* Kcal indicator or Streak */}
          {totalKcalNap > 0 ? (
            <div
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1a1b20] border border-[#2a2c34] text-[11px] font-semibold text-[#ffaa00]"
              title="Calo đã nạp"
            >
              <span>{Math.round(totalKcalNap).toLocaleString('vi-VN')}</span>
              <span className="text-[9px] text-[#a6a39b]">kcal</span>
            </div>
          ) : (
            <div
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1a1b20] border border-[#2a2c34] text-[11px] font-semibold text-[#ff6000]"
              title="Chuỗi ngày liên tiếp"
            >
              <Flame className="w-3 h-3 text-[#ff6000] fill-[#ff6000]" />
              <span>{streak} ngày</span>
            </div>
          )}

          {/* Expand to Full Widget toggle */}
          {onSwitchToFull && (
            <button
              type="button"
              id="nut-chuyen-widget-day-du"
              onClick={onSwitchToFull}
              className="w-7 h-7 rounded-xl bg-[#1c1e24] hover:bg-[#ff6000]/20 border border-[#2e313b] hover:border-[#ff6000]/50 text-[#a6a39b] hover:text-[#ffaa00] flex items-center justify-center transition-colors"
              title="Chuyển sang Widget Đầy đủ"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
