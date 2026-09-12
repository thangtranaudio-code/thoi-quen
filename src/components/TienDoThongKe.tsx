import React, { useState } from 'react';
import { Scale, Flame, Utensils, Award, Info, ChevronDown, ChevronUp, Calendar, Activity } from 'lucide-react';
import { Chuoi, So } from '../chuoi';
import { Ngay } from '../ngay';
import { CongThuc } from '../cong_thuc';
import { StorageService } from '../storage';
import { GhiCanModal } from './GhiCanModal';
import { BieuDoCanNangRecharts } from './BieuDoCanNangRecharts';
import { BieuDoNangLuongRecharts } from './BieuDoNangLuongRecharts';
import { BieuDoMacroRecharts } from './BieuDoMacroRecharts';
import { BieuDoVanDongRecharts } from './BieuDoVanDongRecharts';

interface TienDoThongKeProps {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
}

export const TienDoThongKe: React.FC<TienDoThongKeProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [collapseNgay, setCollapseNgay] = useState(false);
  const [collapseTuan, setCollapseTuan] = useState(false);
  const [collapseThang, setCollapseThang] = useState(false);
  const [collapseNam, setCollapseNam] = useState(false);
  const [collapseChiSo, setCollapseChiSo] = useState(false);

  const data = StorageService.getData();
  const habits = StorageService.getHabits();
  const dateIso = Ngay.iso(selectedDate);

  // 1. Day completion ring
  const dayTicks = StorageService.getTicksForDay(dateIso);
  const dayDone = habits.length > 0 ? Math.round((dayTicks.length / habits.length) * 100) : 0;

  // 2. Week 7 columns (T2 to CN)
  const weekDays = Ngay.tuan(selectedDate);
  const weekPercents = weekDays.map((d) => {
    const iso = Ngay.iso(d);
    const ticks = StorageService.getTicksForDay(iso);
    const pct = habits.length > 0 ? Math.round((ticks.length / habits.length) * 100) : 0;
    return { date: d, iso, pct, ticksCount: ticks.length };
  });

  // 3. Month days column strip
  const monthDays = Ngay.cacNgayThang(selectedDate);
  const monthPercents = monthDays.map((d) => {
    const iso = Ngay.iso(d);
    const ticks = StorageService.getTicksForDay(iso);
    const pct = habits.length > 0 ? Math.round((ticks.length / habits.length) * 100) : 0;
    return { date: d, iso, pct };
  });

  // 3b. Year 12 months completion strip
  const selectedYear = selectedDate.getFullYear();
  const yearPercents = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const prefix = `${selectedYear}-${String(m).padStart(2, '0')}`;
    const ticks = data.ticks.filter((t) => t.ngay.startsWith(prefix));
    const daysInMonth = new Date(selectedYear, m, 0).getDate();
    const totalPossible = (habits.length || 1) * daysInMonth;
    const pct = habits.length > 0 ? Math.min(100, Math.round((ticks.length / totalPossible) * 100)) : 0;
    return {
      thang: m,
      nhan: `T${m}`,
      pct,
      ticksCount: ticks.length,
      date: new Date(selectedYear, i, 1),
    };
  });

  // 4. Weight stats and sparkline
  const currentWeight = StorageService.getLatestWeighIn()?.kg ?? data.profile.startKg ?? null;
  const targetWeight = data.profile.targetKg ?? null;

  // BMI calculation
  const profile = data.profile;
  const bmiVal = CongThuc.bmi(currentWeight, profile.heightCm);
  const bmiLabel = CongThuc.bmiNhan(bmiVal);

  // BMR & TDEE
  const age = CongThuc.tuoi(profile.dob, new Date());
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
    target: targetWeight,
  });

  // Estimated completion date
  const estDate = CongThuc.duKien({
    homNay: new Date(),
    nhip: profile.nhipKg,
    kg: currentWeight,
    target: targetWeight,
  });

  return (
    <div id="tien-do-thong-ke" className="space-y-4 pt-1">
      {/* 1. Ngày đang xem: % hoàn thành + n/m Vòng tròn */}
      <div className="p-4 bg-[#161714] rounded-2xl border border-[#3a322c]/50">
        <div className="flex items-center justify-between">
          <div
            className="flex-1 cursor-pointer select-none"
            onClick={() => setCollapseNgay(!collapseNgay)}
          >
            <div className="text-xs font-semibold text-[#c4b6a8] uppercase tracking-wider mb-1">
              {Chuoi.tieuVongNgay}
            </div>
            <div className="text-2xl font-black text-[#e7e4dc]">{dayDone}%</div>
            <div className="text-xs text-[#c4b6a8] mt-0.5">
              {Chuoi.daTick(dayTicks.length, habits.length)}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Circular SVG Ring */}
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="#252622"
                  strokeWidth="5"
                  fill="transparent"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="#3d9a7a"
                  strokeWidth="5"
                  fill="transparent"
                  strokeDasharray={163.36}
                  strokeDashoffset={163.36 - (163.36 * dayDone) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <Award className="w-6 h-6 text-[#3d9a7a] absolute" />
            </div>

            <button
              type="button"
              onClick={() => setCollapseNgay(!collapseNgay)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#c4b6a8] hover:text-[#e7e4dc]"
              title={collapseNgay ? 'Mở rộng' : 'Thu gọn'}
            >
              {collapseNgay ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {!collapseNgay && dayTicks.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#3a322c]/40 text-xs text-[#c4b6a8]">
            Đã hoàn thành <span className="font-bold text-[#3d9a7a]">{dayTicks.length}</span> trên tổng số <span className="font-bold text-[#e7e4dc]">{habits.length}</span> thói quen ngày {selectedDate.getDate()}/{selectedDate.getMonth() + 1}.
          </div>
        )}
      </div>

      {/* 2. Tuần chứa ngày đó: 7 cột % T2 -> CN */}
      <div className="p-4 bg-[#161714] rounded-2xl border border-[#3a322c]/50">
        <div className="flex items-center justify-between mb-2">
          <div
            className="text-xs font-semibold text-[#c4b6a8] uppercase tracking-wider cursor-pointer select-none"
            onClick={() => setCollapseTuan(!collapseTuan)}
          >
            {Chuoi.hoanThanhTheoThu}
          </div>
          <button
            type="button"
            onClick={() => setCollapseTuan(!collapseTuan)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#c4b6a8] hover:text-[#e7e4dc]"
            title={collapseTuan ? 'Mở rộng' : 'Thu gọn'}
          >
            {collapseTuan ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {!collapseTuan && (
          <div className="grid grid-cols-7 gap-2 items-end h-28 pt-2">
            {weekPercents.map((item, idx) => {
              const isSelected = Ngay.cungNgay(item.date, selectedDate);
              return (
                <button
                  key={item.iso}
                  type="button"
                  onClick={() => onSelectDate(item.date)}
                  className="flex flex-col items-center h-full justify-end group focus:outline-none"
                >
                  <span className="text-[10px] text-[#c4b6a8] mb-1 font-semibold">{item.pct}%</span>
                  <div className="w-full bg-[#0c0d0b] rounded-t-lg h-16 relative flex items-end overflow-hidden border border-[#3a322c]/40">
                    <div
                      style={{ height: `${item.pct}%` }}
                      className={`w-full rounded-t-md transition-all ${
                        isSelected ? 'bg-[#ff7a00]' : item.pct >= 100 ? 'bg-[#3d9a7a]' : 'bg-[#ff7a00]/70'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-[11px] font-bold mt-1.5 ${
                      isSelected ? 'text-[#ff7a00]' : 'text-[#c4b6a8]'
                    }`}
                  >
                    {Chuoi.thuNgan[idx]}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Tháng chứa ngày đó: hàng cột % theo ngày */}
      <div className="p-4 bg-[#161714] rounded-2xl border border-[#3a322c]/50">
        <div className="flex items-center justify-between mb-2">
          <div
            className="text-xs font-semibold text-[#c4b6a8] uppercase tracking-wider cursor-pointer select-none"
            onClick={() => setCollapseThang(!collapseThang)}
          >
            {Chuoi.hoanThanhTheoNgay} ({Chuoi.thang(selectedDate.getMonth() + 1)})
          </div>
          <button
            type="button"
            onClick={() => setCollapseThang(!collapseThang)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#c4b6a8] hover:text-[#e7e4dc]"
            title={collapseThang ? 'Mở rộng' : 'Thu gọn'}
          >
            {collapseThang ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {!collapseThang && (
          <div className="flex gap-1 overflow-x-auto pb-2 pt-1 scrollbar-thin">
            {monthPercents.map((item) => {
              const isSelected = Ngay.cungNgay(item.date, selectedDate);
              return (
                <button
                  key={item.iso}
                  type="button"
                  onClick={() => onSelectDate(item.date)}
                  className={`w-7 shrink-0 flex flex-col items-center p-1 rounded-lg transition-colors ${
                    isSelected ? 'bg-[#251b14] ring-1 ring-[#ff7a00]' : 'hover:bg-[#0c0d0b]'
                  }`}
                >
                  <div className="w-full bg-[#0c0d0b] rounded-t h-12 relative flex items-end overflow-hidden border border-[#3a322c]/30">
                    <div
                      style={{ height: `${item.pct}%` }}
                      className={`w-full rounded-t transition-all ${
                        isSelected ? 'bg-[#ff7a00]' : item.pct >= 100 ? 'bg-[#3d9a7a]' : 'bg-[#ff7a00]/60'
                      }`}
                    />
                  </div>
                  <span className="text-[9px] text-[#c4b6a8] mt-1 font-mono">
                    {item.date.getDate()}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3b. Năm chứa ngày đó: 12 cột % theo tháng */}
      <div className="p-4 bg-[#161714] rounded-2xl border border-[#3a322c]/50">
        <div className="flex items-center justify-between mb-2">
          <div
            className="text-xs font-semibold text-[#c4b6a8] uppercase tracking-wider cursor-pointer select-none"
            onClick={() => setCollapseNam(!collapseNam)}
          >
            Hoàn thành theo Năm ({selectedYear})
          </div>
          <button
            type="button"
            onClick={() => setCollapseNam(!collapseNam)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#c4b6a8] hover:text-[#e7e4dc]"
            title={collapseNam ? 'Mở rộng' : 'Thu gọn'}
          >
            {collapseNam ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {!collapseNam && (
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 pt-2 items-end">
            {yearPercents.map((item) => {
              const isSelectedMonth = selectedDate.getMonth() + 1 === item.thang;
              return (
                <button
                  key={item.nhan}
                  type="button"
                  onClick={() => onSelectDate(item.date)}
                  className={`flex flex-col items-center p-1.5 rounded-xl transition-all ${
                    isSelectedMonth
                      ? 'bg-[#251b14] ring-1 ring-[#ff7a00]'
                      : 'hover:bg-[#0c0d0b]'
                  }`}
                  title={`Tháng ${item.thang}: ${item.pct}% (${item.ticksCount} lần hoàn thành)`}
                >
                  <span className="text-[9px] text-[#c4b6a8] mb-1 font-mono font-bold">
                    {item.pct}%
                  </span>
                  <div className="w-full bg-[#0c0d0b] rounded-t-lg h-14 relative flex items-end overflow-hidden border border-[#3a322c]/40">
                    <div
                      style={{ height: `${item.pct}%` }}
                      className={`w-full rounded-t-md transition-all ${
                        isSelectedMonth
                          ? 'bg-gradient-to-t from-[#ff6000] to-[#ffaa00]'
                          : item.pct >= 80
                          ? 'bg-[#3d9a7a]'
                          : 'bg-[#ff7a00]/70'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-bold mt-1 ${
                      isSelectedMonth ? 'text-[#ffaa00]' : 'text-[#c4b6a8]'
                    }`}
                  >
                    {item.nhan}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Cân bằng Năng lượng (Calo nạp vs Tiêu thụ) */}
      <BieuDoNangLuongRecharts selectedDate={selectedDate} />

      {/* 5. Cơ cấu Dinh dưỡng Macro (Đạm - Tinh bột - Chất béo) */}
      <BieuDoMacroRecharts selectedDate={selectedDate} />

      {/* 6. Thời lượng Vận động Tuần */}
      <BieuDoVanDongRecharts selectedDate={selectedDate} />

      {/* 7. Cân nặng: Biểu đồ Recharts */}
      <BieuDoCanNangRecharts onOpenGhiCan={() => setShowWeightModal(true)} />

      {estDate && (
        <div className="p-3 bg-[#161714] rounded-xl border border-[#3a322c]/40 text-xs text-[#c4b6a8]">
          <span className="text-[#ff7a00] font-medium">{Chuoi.duKienHoanThanh}:</span>{' '}
          <span className="font-bold text-[#e7e4dc]">
            {estDate.getDate()}/{estDate.getMonth() + 1}/{estDate.getFullYear()}
          </span>
        </div>
      )}

      {/* 8. BMI, BMR, TDEE with Collapsible toggle */}
      <div className="p-4 bg-[#161714] rounded-2xl border border-[#3a322c]/50 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <div
            className="text-xs font-semibold text-[#c4b6a8] uppercase tracking-wider cursor-pointer select-none"
            onClick={() => setCollapseChiSo(!collapseChiSo)}
          >
            Chỉ số trao đổi chất (BMI / BMR / TDEE)
          </div>
          <button
            type="button"
            onClick={() => setCollapseChiSo(!collapseChiSo)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#c4b6a8] hover:text-[#e7e4dc]"
            title={collapseChiSo ? 'Mở rộng' : 'Thu gọn'}
          >
            {collapseChiSo ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {!collapseChiSo && (
          <div className="space-y-2 pt-2 border-t border-[#3a322c]/40">
            <div className="flex items-center justify-between">
              <span className="text-[#c4b6a8]">{Chuoi.bmi} ({Chuoi.mocA}):</span>
              <span className="font-bold text-[#e7e4dc]">
                {bmiVal !== null ? `${bmiVal} · ${bmiLabel}` : Chuoi.thieuDuLieu}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#c4b6a8]">{Chuoi.bmr} ({Chuoi.mifflin}):</span>
              <span className="font-bold text-[#e7e4dc]">
                {bmrVal !== null ? `${bmrVal} kcal` : Chuoi.thieuDuLieu}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#c4b6a8]">{Chuoi.tdee} ({Chuoi.saiSo}):</span>
              <span className="font-bold text-[#e7e4dc]">
                {tdeeVal !== null ? `${tdeeVal} kcal` : Chuoi.thieuDuLieu}
              </span>
            </div>

            {suggestedKcal !== null && (
              <div className="flex items-center justify-between pt-1 border-t border-[#3a322c]/40 text-[#ff7a00]">
                <span className="font-semibold">{Chuoi.kcalGoiY}:</span>
                <span className="font-black text-sm">{suggestedKcal} kcal</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Medical Disclaimer */}
      <div className="p-3 bg-[#0c0d0b] border border-[#3a322c]/40 rounded-xl flex items-start gap-2 text-[11px] text-[#c4b6a8] leading-relaxed">
        <Info className="w-4 h-4 text-[#c4b6a8] shrink-0 mt-0.5" />
        <p>{Chuoi.uocTinh}</p>
      </div>

      {/* Weight modal */}
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
