import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Check,
  TrendingUp,
  Target,
  Clock,
  ChevronDown,
  ChevronUp,
  Utensils,
  Flame,
  Filter,
} from 'lucide-react';
import { Chuoi } from '../chuoi';
import { Ngay } from '../ngay';
import { StorageService } from '../storage';
import { TienDoThongKe } from '../components/TienDoThongKe';

interface ManLichProps {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
}

export const ManLich: React.FC<ManLichProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  const [cheDo, setCheDo] = useState<'lich' | 'thong_ke'>('lich');
  const [viewDate, setViewDate] = useState(new Date(selectedDate));
  const [collapseGrid, setCollapseGrid] = useState<boolean>(false);
  const [collapseFocus, setCollapseFocus] = useState<boolean>(false);
  const [collapseHabits, setCollapseHabits] = useState<boolean>(false);
  const [collapseDinhDuong, setCollapseDinhDuong] = useState<boolean>(false);
  const [habitFilter, setHabitFilter] = useState<'tat_ca' | 'chua_xong' | 'da_xong'>('tat_ca');

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
  const selectedFocusTasks = StorageService.getFocusTasks(selectedIso);

  // Nutrition & Workout on this day
  const dayFoods = data.foodLogs.filter((f) => f.ngay === selectedIso);
  const dayTapIns = data.tapIns.filter((t) => t.ngay === selectedIso);
  const totalKcalFood = dayFoods.reduce((s, f) => s + f.kcal, 0);
  const totalPhutTap = dayTapIns.reduce((s, t) => s + t.phut, 0);

  // Filtered habits
  const filteredHabits = habits.filter((h) => {
    const isDone = tickedMap.has(h.id);
    if (habitFilter === 'chua_xong') return !isDone;
    if (habitFilter === 'da_xong') return isDone;
    return true;
  });

  return (
    <div id="man-lich" className="flex flex-col min-h-full pb-20 px-4 pt-3 max-w-lg mx-auto">
      {/* Top Segment Switcher: Lịch vs Thống kê */}
      <div className="flex items-center gap-1 bg-[#161714] p-1 rounded-2xl border border-[#3a322c]/60 mb-4 shadow-sm">
        <button
          type="button"
          id="btn-segment-lich"
          onClick={() => setCheDo('lich')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            cheDo === 'lich'
              ? 'bg-[#ff7a00] text-[#0c0d0b] shadow-md'
              : 'text-[#c4b6a8] hover:text-[#e7e4dc]'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          {Chuoi.lich}
        </button>
        <button
          type="button"
          id="btn-segment-thong-ke"
          onClick={() => setCheDo('thong_ke')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            cheDo === 'thong_ke'
              ? 'bg-[#ff7a00] text-[#0c0d0b] shadow-md'
              : 'text-[#c4b6a8] hover:text-[#e7e4dc]'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Thống kê & Tiến độ
        </button>
      </div>

      {cheDo === 'thong_ke' ? (
        /* TÍCH HỢP TAB TIẾN ĐỘ & CÁC BIỂU ĐỒ NÂNG CAO */
        <TienDoThongKe selectedDate={selectedDate} onSelectDate={onSelectDate} />
      ) : (
        /* CHẾ ĐỘ XEM LỊCH */
        <div className="space-y-4">
          {/* Header with Month / Year Switcher & Collapse Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#e7e4dc]">{Chuoi.lich}</h1>
              <p className="text-xs text-[#c4b6a8] mt-0.5">Nhật ký thói quen theo thời gian</p>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 bg-[#161714] border border-[#3a322c]/50 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={prevMonth}
                  aria-label="Tháng trước"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#c4b6a8] hover:text-[#e7e4dc] hover:bg-[#1f201c]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-[#e7e4dc] px-2 whitespace-nowrap font-mono">
                  {Chuoi.thang(viewDate.getMonth() + 1)} / {viewDate.getFullYear()}
                </span>
                <button
                  type="button"
                  onClick={nextMonth}
                  aria-label="Tháng sau"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#c4b6a8] hover:text-[#e7e4dc] hover:bg-[#1f201c]"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setCollapseGrid(!collapseGrid)}
                className="w-8 h-8 bg-[#161714] border border-[#3a322c]/50 rounded-xl flex items-center justify-center text-[#c4b6a8] hover:text-[#e7e4dc]"
                title={collapseGrid ? 'Mở rộng lưới lịch' : 'Thu gọn lưới lịch'}
              >
                {collapseGrid ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Calendar Grid Box (Collapsible) */}
          {!collapseGrid ? (
            <div>
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {Chuoi.thuNgan.map((name) => (
                  <span key={name} className="text-[11px] font-semibold text-[#c4b6a8] py-1">
                    {name}
                  </span>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1.5 p-2 bg-[#161714] rounded-2xl border border-[#3a322c]/50">
                {/* Leading empty slots */}
                {Array.from({ length: firstWeekdayIdx }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-11" />
                ))}

                {monthDays.map((d) => {
                  const iso = Ngay.iso(d);
                  const dayTicks = StorageService.getTicksForDay(iso);
                  const dayTasks = StorageService.getFocusTasks(iso);
                  const isSelected = Ngay.cungNgay(d, selectedDate);
                  const isToday = Ngay.cungNgay(d, new Date());
                  const hasDoneAll = habits.length > 0 && dayTicks.length >= habits.length;
                  const hasPartial = dayTicks.length > 0 && dayTicks.length < habits.length;
                  const hasFocus = dayTasks.length > 0;

                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => onSelectDate(d)}
                      className={`h-11 rounded-xl flex flex-col items-center justify-center relative transition-all ${
                        isSelected
                          ? 'ring-2 ring-[#ff7a00] bg-[#251b14]'
                          : 'bg-[#0c0d0b] hover:bg-[#1f201c] border border-[#3a322c]/30'
                      }`}
                    >
                      <span
                        className={`text-xs font-semibold ${
                          isToday ? 'text-[#ff7a00] font-black' : 'text-[#e7e4dc]'
                        }`}
                      >
                        {d.getDate()}
                      </span>

                      {/* Status dot indicator */}
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {hasDoneAll ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#3d9a7a]" />
                        ) : hasPartial ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ff7a00]" />
                        ) : hasFocus ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ff7a00]/60" />
                        ) : (
                          <span className="w-1.5 h-1.5" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-[#161714] rounded-xl border border-[#3a322c]/40 flex items-center justify-between text-xs text-[#c4b6a8]">
              <span>Đang chọn ngày: <strong className="text-[#ff7a00]">{selectedDate.getDate()}/{selectedDate.getMonth() + 1}/{selectedDate.getFullYear()}</strong></span>
              <button
                type="button"
                onClick={() => setCollapseGrid(false)}
                className="text-[#ff7a00] font-semibold hover:underline"
              >
                Mở rộng lưới lịch
              </button>
            </div>
          )}

          {/* Selected Day Details */}
          <div className="space-y-3">
            {/* Header of selected date */}
            <div className="p-3.5 bg-[#161714] rounded-2xl border border-[#3a322c]/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#ff7a00]" />
                <span className="text-xs font-bold text-[#e7e4dc]">
                  {Chuoi.dongNgay(selectedDate)}
                </span>
              </div>
              <span className="text-xs font-semibold text-[#3d9a7a] bg-[#3d9a7a]/15 px-2 py-0.5 rounded-md">
                {selectedTicks.length}/{habits.length} hoàn thành
              </span>
            </div>

            {/* 1. Focus Tasks on this day (Collapsible) */}
            {selectedFocusTasks.length > 0 && (
              <div className="p-4 bg-[#161714] rounded-2xl border border-[#3a322c]/50">
                <div
                  className="flex items-center justify-between cursor-pointer select-none"
                  onClick={() => setCollapseFocus(!collapseFocus)}
                >
                  <div className="text-xs font-bold text-[#ff7a00] flex items-center gap-1.5">
                    <Target className="w-4 h-4" />
                    <span>Lịch Focus trong ngày ({selectedFocusTasks.length})</span>
                  </div>
                  <button type="button" className="text-[#c4b6a8]">
                    {collapseFocus ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </button>
                </div>

                {!collapseFocus && (
                  <div className="space-y-1.5 mt-3">
                    {selectedFocusTasks.map((t) => (
                      <div
                        key={t.id}
                        className="p-2.5 rounded-xl bg-[#0c0d0b] border border-[#ff7a00]/30 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className={`font-semibold ${t.trangThai === 'hoan_thanh' ? 'line-through text-[#c4b6a8]' : 'text-[#e7e4dc]'}`}>
                            {t.tieuDe}
                          </div>
                          <div className="text-[10px] text-[#c4b6a8] flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-[#ff7a00]" />
                            {t.gioBatDau} – {t.gioKetThuc}
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            t.trangThai === 'hoan_thanh'
                              ? 'bg-[#3d9a7a]/20 text-[#3d9a7a]'
                              : 'bg-[#ff7a00]/20 text-[#ff7a00]'
                          }`}
                        >
                          {t.trangThai === 'hoan_thanh' ? 'Đã xong' : 'Focus'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. Habits on this day (Collapsible with Filter) */}
            <div className="p-4 bg-[#161714] rounded-2xl border border-[#3a322c]/50">
              <div className="flex items-center justify-between mb-2">
                <div
                  className="text-xs font-bold text-[#e7e4dc] uppercase tracking-wider cursor-pointer select-none flex items-center gap-1.5"
                  onClick={() => setCollapseHabits(!collapseHabits)}
                >
                  <span>Thói quen ({habits.length})</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {!collapseHabits && (
                    <div className="flex bg-[#0c0d0b] p-0.5 rounded-lg border border-[#3a322c]/40 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setHabitFilter('tat_ca')}
                        className={`px-2 py-0.5 rounded font-medium ${
                          habitFilter === 'tat_ca' ? 'bg-[#ff7a00] text-[#0c0d0b] font-bold' : 'text-[#c4b6a8]'
                        }`}
                      >
                        Tất cả
                      </button>
                      <button
                        type="button"
                        onClick={() => setHabitFilter('chua_xong')}
                        className={`px-2 py-0.5 rounded font-medium ${
                          habitFilter === 'chua_xong' ? 'bg-[#ff7a00] text-[#0c0d0b] font-bold' : 'text-[#c4b6a8]'
                        }`}
                      >
                        Chưa xong
                      </button>
                      <button
                        type="button"
                        onClick={() => setHabitFilter('da_xong')}
                        className={`px-2 py-0.5 rounded font-medium ${
                          habitFilter === 'da_xong' ? 'bg-[#ff7a00] text-[#0c0d0b] font-bold' : 'text-[#c4b6a8]'
                        }`}
                      >
                        Đã xong
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setCollapseHabits(!collapseHabits)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[#c4b6a8] hover:text-[#e7e4dc]"
                    title={collapseHabits ? 'Mở rộng' : 'Thu gọn'}
                  >
                    {collapseHabits ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!collapseHabits && (
                <div className="mt-2.5">
                  {filteredHabits.length === 0 ? (
                    <p className="text-xs text-[#c4b6a8] py-2 text-center bg-[#0c0d0b] rounded-xl border border-[#3a322c]/40">
                      Không có thói quen nào trong danh mục này.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {filteredHabits.map((h) => {
                        const ticked = tickedMap.has(h.id);
                        const coveringFocus = StorageService.getCoveringFocusTaskForHabit(h, selectedIso);

                        return (
                          <div
                            key={h.id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-[#0c0d0b] border border-[#3a322c]/30 text-xs"
                          >
                            <div>
                              <span className={ticked || coveringFocus ? 'line-through text-[#c4b6a8]' : 'text-[#e7e4dc] font-medium'}>
                                {h.ten}
                              </span>
                              {coveringFocus && (
                                <div className="text-[10px] text-[#ff7a00] mt-0.5">
                                  ⚡ Ưu tiên Focus: {coveringFocus.tieuDe}
                                </div>
                              )}
                            </div>
                            <div
                              className={`w-5 h-5 rounded-md flex items-center justify-center ${
                                ticked || coveringFocus ? 'bg-[#3d9a7a] text-[#0c0d0b]' : 'bg-[#1f201c] text-transparent'
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
              )}
            </div>

            {/* 3. Dinh dưỡng & Vận động trong ngày (Collapsible) */}
            <div className="p-4 bg-[#161714] rounded-2xl border border-[#3a322c]/50">
              <div
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() => setCollapseDinhDuong(!collapseDinhDuong)}
              >
                <div className="text-xs font-bold text-[#e7e4dc] uppercase tracking-wider flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-[#ff7a00]" />
                  <span>Dinh dưỡng & Vận động</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#c4b6a8]">
                    {totalKcalFood} kcal nạp · {totalPhutTap}p tập
                  </span>
                  <button type="button" className="text-[#c4b6a8]">
                    {collapseDinhDuong ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!collapseDinhDuong && (
                <div className="mt-3 space-y-2.5">
                  {/* Foods logged */}
                  <div>
                    <div className="text-[11px] font-semibold text-[#c4b6a8] mb-1.5">Món ăn đã nạp ({dayFoods.length})</div>
                    {dayFoods.length === 0 ? (
                      <div className="text-[11px] text-[#c4b6a8]/70 py-1.5 px-2 bg-[#0c0d0b] rounded-lg border border-[#3a322c]/30">
                        Chưa ghi món ăn nào.
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {dayFoods.map((f) => (
                          <div
                            key={f.id}
                            className="p-2 bg-[#0c0d0b] rounded-lg border border-[#3a322c]/30 flex items-center justify-between text-xs"
                          >
                            <span className="text-[#e7e4dc] font-medium">{f.ten}</span>
                            <span className="text-[#ff7a00] font-bold text-[11px]">{f.kcal} kcal</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Workouts logged */}
                  <div>
                    <div className="text-[11px] font-semibold text-[#c4b6a8] mb-1.5">Bài tập vận động ({dayTapIns.length})</div>
                    {dayTapIns.length === 0 ? (
                      <div className="text-[11px] text-[#c4b6a8]/70 py-1.5 px-2 bg-[#0c0d0b] rounded-lg border border-[#3a322c]/30">
                        Chưa ghi bài tập nào.
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {dayTapIns.map((t) => (
                          <div
                            key={t.id}
                            className="p-2 bg-[#0c0d0b] rounded-lg border border-[#3a322c]/30 flex items-center justify-between text-xs"
                          >
                            <span className="text-[#e7e4dc] font-medium">{Chuoi.tenMon(t.loai)}</span>
                            <span className="text-[#3d9a7a] font-bold text-[11px]">{t.phut} phút</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
