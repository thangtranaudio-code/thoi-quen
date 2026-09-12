import React, { useState, useEffect } from 'react';
import { Flame, Check, Clock, Calendar as CalendarIcon, AlertCircle, Sparkles, Minimize2 } from 'lucide-react';
import { StorageService } from '../storage';
import { Ngay } from '../ngay';
import { Chuoi, So } from '../chuoi';
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
  isOverdue: boolean; // Overdue by > 30 minutes
  priority?: 'cao' | 'trung_binh' | 'binh_thuong';
  rawFocusTask?: FocusTask;
  rawHabit?: Habit;
}

interface WidgetHabisProps {
  onOpenFocus?: () => void;
  onOpenLich?: () => void;
  onSwitchToGon?: () => void;
}

export const WidgetHabis: React.FC<WidgetHabisProps> = ({ onOpenFocus, onSwitchToGon }) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const todayIso = Ngay.iso(currentTime);

  // Update clock every 30 seconds to react to 30-minute overdue threshold
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

  // Focus tasks for today
  const focusTasksToday = StorageService.getFocusTasks(todayIso);

  // Count habits completed (either by manual tick or covered by Focus)
  let completedHabitsCount = 0;
  habits.forEach((h) => {
    const hasTick = tickedHabitIds.has(h.id);
    const coveredByFocus = StorageService.getCoveringFocusTaskForHabit(h, todayIso);
    if (hasTick || coveredByFocus) {
      completedHabitsCount++;
    }
  });

  // Calculate kcal intake
  const dayFoodLogs = data.foodLogs.filter((f) => f.ngay === todayIso);
  const totalKcalNap = dayFoodLogs.reduce((acc, cur) => acc + cur.kcal, 0);

  // Calculate kcal target
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

  const kcalPercent = Math.min(100, Math.round((totalKcalNap / suggestedKcal) * 100));

  // Build candidate items for Widget real-time queue
  const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  const allItems: WidgetItem[] = [];

  // 1. Add Focus Tasks
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
      priority: t.mucDoUuTien,
      rawFocusTask: t,
    });
  });

  // 2. Add Habits (with time or without)
  habits.forEach((h) => {
    const hasTick = tickedHabitIds.has(h.id);
    const coveredByFocus = StorageService.getCoveringFocusTaskForHabit(h, todayIso);
    const isDone = hasTick || coveredByFocus != null;

    let sMin = 0;
    let eMin = 1439;
    let timeRange = 'Cả ngày';

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

  // Active items for widget
  const activeWidgetItems = allItems
    .filter((item) => {
      if (item.isCompleted) return false;
      if (item.isOverdue) return false;
      return true;
    })
    .sort((a, b) => {
      const aOngoing = nowMinutes >= a.startMinutes && nowMinutes <= a.endMinutes;
      const bOngoing = nowMinutes >= b.startMinutes && nowMinutes <= b.endMinutes;
      if (aOngoing && !bOngoing) return -1;
      if (!aOngoing && bOngoing) return 1;
      if (a.startMinutes !== b.startMinutes) return a.startMinutes - b.startMinutes;
      return a.title.localeCompare(b.title);
    })
    .slice(0, 2);

  const handleQuickTick = (item: WidgetItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.type === 'focus' && item.rawFocusTask) {
      const isDone = StorageService.toggleFocusTask(item.rawFocusTask.id);
      if (isDone) {
        CamXucService.kichHoatFocusDone(item.rawFocusTask.tieuDe);
      }
    } else if (item.type === 'habit' && item.rawHabit) {
      const ticked = StorageService.toggleTick(item.rawHabit.id, todayIso);
      if (ticked) {
        const todayTicks = StorageService.getTicksForDay(todayIso);
        const isAllDone = habits.length > 0 && todayTicks.length >= habits.length;
        CamXucService.kichHoatTickHabit(item.rawHabit.ten, isAllDone);
      }
    }
  };

  return (
    <div
      id="widget-habis-dashboard"
      className="relative overflow-hidden bg-gradient-to-br from-[#131418] via-[#16171d] to-[#0f1013] border border-[#ff6000]/30 rounded-3xl p-4 shadow-xl shadow-black/50 mb-3.5 text-[#f8f7f4] transition-all duration-200"
    >
      {/* Top Banner Row: Safe-Zone Logo + Title + Actions */}
      <div className="flex items-center justify-between pb-3 border-b border-[#24262c] mb-3">
        {/* Left Safe Zone Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-black border border-[#ff6000]/40 p-1 shadow-md shadow-[#ff6000]/15 shrink-0 overflow-hidden">
            <img
              src="/assets/app_logo.png"
              alt="HABIS Logo"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-wide text-[#f8f7f4]">
                {Chuoi.habisNhan}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-[#ffaa00]/20 to-[#ff6000]/20 text-[#ffaa00] border border-[#ff6000]/30">
                WIDGET
              </span>
            </div>
            <div className="text-xs text-[#a6a39b] flex items-center gap-1 mt-0.5 font-medium">
              <CalendarIcon className="w-3 h-3 text-[#ffaa00]" />
              {Chuoi.dongNgay(currentTime)}
            </div>
          </div>
        </div>

        {/* Right buttons: Focus shortcut + Minimize to Compact Widget */}
        <div className="flex items-center gap-1.5">
          {onOpenFocus && (
            <button
              type="button"
              onClick={onOpenFocus}
              className="text-[11px] font-medium text-[#f8f7f4] hover:text-[#ffaa00] bg-[#1a1c22] border border-[#2c2f38] hover:border-[#ff6000]/40 px-2.5 py-1 rounded-xl transition-colors flex items-center gap-1"
            >
              <Clock className="w-3 h-3 text-[#ffaa00]" />
              <span className="hidden sm:inline">Lịch Focus</span>
            </button>
          )}

          {onSwitchToGon && (
            <button
              type="button"
              id="nut-chuyen-widget-gon"
              onClick={onSwitchToGon}
              className="text-[11px] font-medium text-[#a6a39b] hover:text-[#ffaa00] bg-[#1a1c22] border border-[#2c2f38] hover:border-[#ff6000]/40 px-2.5 py-1 rounded-xl transition-colors flex items-center gap-1"
              title="Chuyển sang Widget Thu gọn"
            >
              <Minimize2 className="w-3 h-3 text-[#ffaa00]" />
              <span>Gọn</span>
            </button>
          )}
        </div>
      </div>

      {/* Middle Stats Section: Kcal intake + Habits Done */}
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        {/* Box Kcal */}
        <div className="bg-[#090a0d]/90 border border-[#24262c] rounded-2xl p-3 shadow-inner">
          <div className="flex items-center justify-between text-[11px] text-[#a6a39b] font-medium mb-1">
            <span>Kcal đã nạp</span>
            <span className="text-[10px] text-[#ffaa00] font-bold">{kcalPercent}%</span>
          </div>
          <div className="text-sm font-bold text-[#f8f7f4]">
            {totalKcalNap.toLocaleString('vi-VN')} <span className="text-xs font-normal text-[#a6a39b]">/ {suggestedKcal.toLocaleString('vi-VN')} kcal</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-[#181a20] rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#ffaa00] via-[#ff6000] to-[#e63800] h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${kcalPercent}%` }}
            />
          </div>
        </div>

        {/* Box Habits Done */}
        <div className="bg-[#090a0d]/90 border border-[#24262c] rounded-2xl p-3 shadow-inner">
          <div className="flex items-center justify-between text-[11px] text-[#a6a39b] font-medium mb-1">
            <span>Thói quen xong</span>
            <span className="text-[10px] text-[#38b000] font-bold">
              {habits.length > 0 ? Math.round((completedHabitsCount / habits.length) * 100) : 0}%
            </span>
          </div>
          <div className="text-sm font-bold text-[#38b000]">
            {completedHabitsCount} <span className="text-xs font-normal text-[#a6a39b]">/ {habits.length} việc</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-[#181a20] rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-[#38b000] h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${habits.length > 0 ? (completedHabitsCount / habits.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Real-time Focus & Habit Priority Queue (Max 2 items) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#a6a39b] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#ffaa00]" />
            Mục tiêu thời gian thực (tối đa 2 việc)
          </span>
          <span className="text-[10px] text-[#a6a39b]/70">Tự trôi sau 30p</span>
        </div>

        {activeWidgetItems.length === 0 ? (
          <div className="py-3 px-3 bg-[#090a0d]/70 border border-[#24262c] rounded-2xl text-center">
            <p className="text-xs text-[#a6a39b] font-medium flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#ffaa00]" />
              Đã hoàn thành hoặc không có việc hẹn giờ trong khung giờ này.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeWidgetItems.map((item) => {
              const isOngoing = nowMinutes >= item.startMinutes && nowMinutes <= item.endMinutes;

              return (
                <div
                  key={item.id}
                  id={`widget-item-${item.id}`}
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all duration-200 ${
                    isOngoing
                      ? 'bg-gradient-to-r from-[#22160e] to-[#1a1410] border-[#ff6000]/60 shadow-md shadow-[#ff6000]/10'
                      : 'bg-[#090a0d]/90 border-[#24262c] hover:border-[#ff6000]/30'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {item.type === 'focus' ? (
                        <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#ff6000]/20 text-[#ffaa00] border border-[#ff6000]/30 shrink-0">
                          Focus
                        </span>
                      ) : (
                        <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#38b000]/20 text-[#38b000] border border-[#38b000]/30 shrink-0">
                          Thói quen
                        </span>
                      )}

                      {isOngoing && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#e63800]/20 text-[#ffaa00] border border-[#e63800]/40 animate-pulse">
                          Đang diễn ra
                        </span>
                      )}

                      <span className="text-xs font-semibold text-[#f8f7f4] truncate">
                        {item.title}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#a6a39b] mt-1 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-[#ffaa00]" />
                      {item.timeRange}
                    </div>
                  </div>

                  {/* 1-Tap Quick Tick Button on Widget */}
                  <button
                    type="button"
                    onClick={(e) => handleQuickTick(item, e)}
                    aria-label={`Tick nhanh ${item.title}`}
                    className="w-9 h-9 rounded-xl bg-[#181920] border border-[#ff6000]/50 hover:bg-gradient-to-br hover:from-[#ffaa00] hover:to-[#ff6000] hover:text-black text-[#ffaa00] flex items-center justify-center shrink-0 transition-all active:scale-90 shadow-sm"
                    title="Tick nhanh hoàn thành"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

