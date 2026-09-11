import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check } from 'lucide-react';
import { Chuoi } from '../chuoi';
import { Ngay } from '../ngay';
import { StorageService } from '../storage';

interface ManLichProps {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
}

export const ManLich: React.FC<ManLichProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  const [viewDate, setViewDate] = useState(new Date(selectedDate));
  const habits = StorageService.getHabits();
  const data = StorageService.getData();

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const monthDays = Ngay.cacNgayThang(viewDate);
  const firstDay = Ngay.dauThang(viewDate);
  // Weekday of 1st day (0 = Mon, 6 = Sun)
  const firstWeekdayIdx = (firstDay.getDay() + 6) % 7;

  // Selected date details
  const selectedIso = Ngay.iso(selectedDate);
  const selectedTicks = StorageService.getTicksForDay(selectedIso);
  const tickedMap = new Set(selectedTicks.map((t) => t.habitId));

  return (
    <div id="man-lich" className="flex flex-col min-h-full pb-20 px-4 pt-3 max-w-lg mx-auto">
      {/* Header with Month / Year Switcher */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#f3ece4]">{Chuoi.lich}</h1>
          <p className="text-xs text-[#c4b6a8] mt-0.5">Nhật ký thói quen theo thời gian</p>
        </div>

        <div className="flex items-center gap-1 bg-[#161714] border border-[#3a322c]/50 p-1 rounded-xl">
          <button
            type="button"
            onClick={prevMonth}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#c4b6a8] hover:text-[#f3ece4] hover:bg-[#2a1c14]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-[#f3ece4] px-2 whitespace-nowrap">
            {Chuoi.thang(viewDate.getMonth() + 1)} / {viewDate.getFullYear()}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#c4b6a8] hover:text-[#f3ece4] hover:bg-[#2a1c14]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {Chuoi.thuNgan.map((name) => (
          <span key={name} className="text-[11px] font-semibold text-[#c4b6a8] py-1">
            {name}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 p-2 bg-[#161714] rounded-2xl border border-[#3a322c]/50 mb-4">
        {/* Leading empty slots */}
        {Array.from({ length: firstWeekdayIdx }).map((_, i) => (
          <div key={`empty-${i}`} className="h-11" />
        ))}

        {monthDays.map((d) => {
          const iso = Ngay.iso(d);
          const dayTicks = StorageService.getTicksForDay(iso);
          const isSelected = Ngay.cungNgay(d, selectedDate);
          const isToday = Ngay.cungNgay(d, new Date());
          const hasDoneAll = habits.length > 0 && dayTicks.length >= habits.length;
          const hasPartial = dayTicks.length > 0 && dayTicks.length < habits.length;

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelectDate(d)}
              className={`h-11 rounded-xl flex flex-col items-center justify-center relative transition-all ${
                isSelected
                  ? 'ring-2 ring-[#ff7a00] bg-[#2a1c14]'
                  : 'bg-[#0d0d0d] hover:bg-[#2a1c14]/40 border border-[#3a322c]/30'
              }`}
            >
              <span
                className={`text-xs font-semibold ${
                  isToday ? 'text-[#ff7a00] font-black' : 'text-[#f3ece4]'
                }`}
              >
                {d.getDate()}
              </span>

              {/* Status dot or indicator */}
              <div className="flex items-center gap-0.5 mt-0.5">
                {hasDoneAll ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3d9a7a]" />
                ) : hasPartial ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff7a00]" />
                ) : (
                  <span className="w-1.5 h-1.5" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Card */}
      <div className="p-4 bg-[#161714] rounded-2xl border border-[#3a322c]/50">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#3a322c]/40 mb-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#ff7a00]" />
            <span className="text-xs font-bold text-[#f3ece4]">
              {Chuoi.dongNgay(selectedDate)}
            </span>
          </div>
          <span className="text-xs font-semibold text-[#3d9a7a]">
            {selectedTicks.length}/{habits.length} việc
          </span>
        </div>

        {habits.length === 0 ? (
          <p className="text-xs text-[#c4b6a8] py-2">Chưa có thói quen nào.</p>
        ) : (
          <div className="space-y-1.5">
            {habits.map((h) => {
              const ticked = tickedMap.has(h.id);
              return (
                <div
                  key={h.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#0d0d0d] border border-[#3a322c]/30 text-xs"
                >
                  <span className={ticked ? 'text-[#f3ece4] font-medium' : 'text-[#c4b6a8]'}>
                    {h.ten}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center ${
                      ticked ? 'bg-[#3d9a7a] text-[#0d0d0d]' : 'bg-[#1a1a1a] text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
