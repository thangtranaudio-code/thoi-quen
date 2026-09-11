import React, { useState } from 'react';
import { Scale, Flame, Utensils, Award, Info, ChevronRight } from 'lucide-react';
import { Chuoi, So } from '../chuoi';
import { Ngay } from '../ngay';
import { CongThuc } from '../cong_thuc';
import { StorageService } from '../storage';
import { GhiCanModal } from '../components/GhiCanModal';

interface ManTienDoProps {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
}

export const ManTienDo: React.FC<ManTienDoProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  const [showWeightModal, setShowWeightModal] = useState(false);
  const data = StorageService.getData();
  const habits = StorageService.getHabits();
  const dateIso = Ngay.iso(selectedDate);
  const khoaGhi = !Ngay.ghiDuoc(selectedDate, new Date());

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

  // 4. Weight stats and sparkline
  const weighIns = [...data.weighIns].sort((a, b) => a.ngay.localeCompare(b.ngay));
  const currentWeight = StorageService.getLatestWeighIn()?.kg ?? data.profile.startKg ?? null;
  const targetWeight = data.profile.targetKg ?? null;
  const remainingWeight = currentWeight !== null && targetWeight !== null
    ? Math.abs(currentWeight - targetWeight)
    : null;

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

  // Energy in selected day
  const dayWorkouts = data.tapIns.filter((t) => t.ngay === dateIso);
  const totalKcalBurned = dayWorkouts.reduce((acc, cur) => {
    const m = CongThuc.metCua(cur.loai) ?? 5.0;
    const burned = currentWeight ? CongThuc.kcalTap({ met: m, kg: currentWeight, phut: cur.phut }) ?? 0 : 0;
    return acc + Math.round(burned);
  }, 0);

  const dayFood = data.foodLogs.filter((f) => f.ngay === dateIso);
  const totalKcalFood = dayFood.reduce((acc, cur) => acc + cur.kcal, 0);

  // Estimated completion date
  const estDate = CongThuc.duKien({
    homNay: new Date(),
    nhip: profile.nhipKg,
    kg: currentWeight,
    target: targetWeight,
  });

  // Calculate SVG sparkline points
  const minKg = weighIns.length > 0 ? Math.min(...weighIns.map((w) => w.kg), targetWeight ?? 999) : 0;
  const maxKg = weighIns.length > 0 ? Math.max(...weighIns.map((w) => w.kg), targetWeight ?? 0) : 100;
  const rangeKg = Math.max(1, maxKg - minKg);

  const svgWidth = 280;
  const svgHeight = 70;
  const svgPadding = 8;

  const points = weighIns.map((w, idx) => {
    const x = svgPadding + (idx / Math.max(1, weighIns.length - 1)) * (svgWidth - svgPadding * 2);
    const y = svgHeight - svgPadding - ((w.kg - minKg) / rangeKg) * (svgHeight - svgPadding * 2);
    return { x, y, kg: w.kg, date: w.ngay };
  });

  const pathD = points.length > 1
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
    : '';

  const targetY = targetWeight
    ? svgHeight - svgPadding - ((targetWeight - minKg) / rangeKg) * (svgHeight - svgPadding * 2)
    : null;

  return (
    <div id="man-tien-do" className="flex flex-col min-h-full pb-20 px-4 pt-3 max-w-lg mx-auto">
      {/* Screen Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#f3ece4]">{Chuoi.tienDo}</h1>
          <p className="text-xs text-[#c4b6a8] mt-0.5">{Chuoi.dongNgay(selectedDate)}</p>
        </div>
      </div>

      {/* 1. Ngày đang xem: % hoàn thành + n/m Vòng tròn */}
      <div className="p-4 bg-[#161714] rounded-2xl border border-[#3a322c]/50 mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-[#c4b6a8] uppercase tracking-wider mb-1">
            {Chuoi.tieuVongNgay}
          </div>
          <div className="text-2xl font-black text-[#f3ece4]">{dayDone}%</div>
          <div className="text-xs text-[#c4b6a8] mt-0.5">
            {Chuoi.daTick(dayTicks.length, habits.length)}
          </div>
        </div>

        {/* Circular SVG Ring */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="w-16 h-16 transform -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="26"
              stroke="#2a1c14"
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
      </div>

      {/* 2. Tuần chứa ngày đó: 7 cột % T2 -> CN */}
      <div className="p-4 bg-[#161714] rounded-2xl border border-[#3a322c]/50 mb-4">
        <div className="text-xs font-semibold text-[#c4b6a8] uppercase tracking-wider mb-3">
          {Chuoi.hoanThanhTheoThu}
        </div>
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
                <div className="w-full bg-[#0d0d0d] rounded-t-lg h-16 relative flex items-end overflow-hidden border border-[#3a322c]/40">
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
      </div>

      {/* 3. Tháng chứa ngày đó: hàng cột % theo ngày */}
      <div className="p-4 bg-[#161714] rounded-2xl border border-[#3a322c]/50 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold text-[#c4b6a8] uppercase tracking-wider">
            {Chuoi.hoanThanhTheoNgay} ({Chuoi.thang(selectedDate.getMonth() + 1)})
          </div>
        </div>
        <div className="flex gap-1 overflow-x-auto pb-2 pt-1 scrollbar-thin">
          {monthPercents.map((item) => {
            const isSelected = Ngay.cungNgay(item.date, selectedDate);
            return (
              <button
                key={item.iso}
                type="button"
                onClick={() => onSelectDate(item.date)}
                className={`w-7 shrink-0 flex flex-col items-center p-1 rounded-lg transition-colors ${
                  isSelected ? 'bg-[#2a1c14] ring-1 ring-[#ff7a00]' : 'hover:bg-[#0d0d0d]'
                }`}
              >
                <div className="w-full bg-[#0d0d0d] h-10 rounded-t flex items-end overflow-hidden border border-[#3a322c]/30">
                  <div
                    style={{ height: `${item.pct}%` }}
                    className={`w-full ${
                      item.pct >= 100 ? 'bg-[#3d9a7a]' : item.pct > 0 ? 'bg-[#ff7a00]' : 'bg-transparent'
                    }`}
                  />
                </div>
                <span className="text-[10px] text-[#c4b6a8] font-medium mt-1">
                  {item.date.getDate()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Cân & Sparkline (1 mốc = chấm; >= 2 mốc = sparkline + vạch đích) */}
      <div className="p-4 bg-[#161714] rounded-2xl border border-[#3a322c]/50 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#ff7a00]" />
            <span className="text-xs font-semibold text-[#c4b6a8] uppercase tracking-wider">
              {Chuoi.canNang}
            </span>
          </div>
          {!khoaGhi && (
            <button
              type="button"
              onClick={() => setShowWeightModal(true)}
              className="text-xs text-[#ff7a00] font-semibold hover:underline"
            >
              + Ghi cân
            </button>
          )}
        </div>

        {weighIns.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#c4b6a8]">
            {Chuoi.chuaCoCan}
          </div>
        ) : (
          <div>
            {/* Sparkline Graphic */}
            <div className="w-full h-24 my-2 flex items-center justify-center bg-[#0d0d0d] rounded-xl border border-[#3a322c]/40 relative overflow-hidden">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full p-2">
                {/* Target line */}
                {targetY !== null && (
                  <line
                    x1="0"
                    y1={targetY}
                    x2={svgWidth}
                    y2={targetY}
                    stroke="#ff7a00"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                )}

                {/* Line path if >= 2 entries */}
                {points.length > 1 && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#3d9a7a"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Circles for points */}
                {points.map((p, idx) => (
                  <circle
                    key={idx}
                    cx={p.x}
                    cy={p.y}
                    r="3.5"
                    fill="#3d9a7a"
                    stroke="#0d0d0d"
                    strokeWidth="1.5"
                  />
                ))}
              </svg>
            </div>

            {/* Current / Target / Remaining */}
            <div className="text-xs text-[#f3ece4] font-medium mt-2">
              {currentWeight !== null && targetWeight !== null && remainingWeight !== null ? (
                Chuoi.canHienTai(
                  So.kg(currentWeight),
                  So.kg(targetWeight),
                  So.kg(remainingWeight)
                )
              ) : currentWeight !== null ? (
                Chuoi.canHienTaiKhongDich(So.kg(currentWeight))
              ) : null}
            </div>

            {/* Estimated Completion Date */}
            {estDate && (
              <div className="text-xs text-[#ffb000] font-medium mt-1">
                {Chuoi.duKienHoanThanh}: {estDate.getDate()} tháng {estDate.getMonth() + 1} {estDate.getFullYear()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Năng lượng & Chỉ số sinh học (BMI, BMR, TDEE, Calo nạp/tiêu) */}
      <div className="p-4 bg-[#161714] rounded-2xl border border-[#3a322c]/50 mb-4">
        <div className="text-xs font-semibold text-[#c4b6a8] uppercase tracking-wider mb-3">
          Chỉ số cơ thể & Năng lượng
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          {/* BMI */}
          <div className="p-3 bg-[#0d0d0d] rounded-xl border border-[#3a322c]/40">
            <div className="text-[11px] text-[#c4b6a8]">{Chuoi.bmi} (Mốc Á)</div>
            <div className="text-base font-bold text-[#f3ece4] mt-0.5">
              {bmiVal ? So.kg(bmiVal) : '—'}
            </div>
            {bmiLabel && (
              <span className="text-[10px] text-[#ff7a00] font-semibold">{bmiLabel}</span>
            )}
          </div>

          {/* TDEE */}
          <div className="p-3 bg-[#0d0d0d] rounded-xl border border-[#3a322c]/40">
            <div className="text-[11px] text-[#c4b6a8]">{Chuoi.tdee}</div>
            <div className="text-base font-bold text-[#f3ece4] mt-0.5">
              {tdeeVal ? `${Math.round(tdeeVal)} kcal` : '—'}
            </div>
            <span className="text-[10px] text-[#c4b6a8]/70">±200–400</span>
          </div>
        </div>

        {/* Daily Calorie Intake vs Burn */}
        <div className="p-3 bg-[#0d0d0d] rounded-xl border border-[#3a322c]/40 mb-3 flex items-center justify-around">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-[#3d9a7a]">
              <Utensils className="w-3.5 h-3.5" />
              {Chuoi.kcalNap}
            </div>
            <div className="text-sm font-bold text-[#f3ece4] mt-1">
              {totalKcalFood} kcal
            </div>
          </div>
          <div className="h-8 w-px bg-[#3a322c]/60" />
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-[#ffb000]">
              <Flame className="w-3.5 h-3.5" />
              {Chuoi.kcalTapNhan}
            </div>
            <div className="text-sm font-bold text-[#f3ece4] mt-1">
              {totalKcalBurned} kcal
            </div>
          </div>
        </div>

        {suggestedKcal && (
          <div className="text-xs text-[#ff7a00] font-medium text-center">
            Mục tiêu nạp gợi ý: <span className="font-bold">{suggestedKcal} kcal/ngày</span>
          </div>
        )}
      </div>

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
