import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Flame, Utensils, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { StorageService } from '../storage';
import { CongThuc } from '../cong_thuc';
import { Ngay } from '../ngay';

interface BieuDoNangLuongRechartsProps {
  selectedDate: Date;
  className?: string;
}

export const BieuDoNangLuongRecharts: React.FC<BieuDoNangLuongRechartsProps> = ({
  selectedDate,
  className = '',
}) => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [khoang, setKhoang] = useState<'tuan' | 'thang' | 'nam'>('tuan');

  const data = StorageService.getData();
  const profile = data.profile;
  const currentWeight = StorageService.getLatestWeighIn()?.kg ?? profile.startKg ?? null;

  // BMR & TDEE
  const age = CongThuc.tuoi(profile.dob, new Date());
  const bmrVal = CongThuc.bmr({
    sex: profile.sex,
    kg: currentWeight,
    cm: profile.heightCm,
    tuoi: age,
  });
  const tdeeVal = CongThuc.tdee(bmrVal, profile.activity) ?? 2000;

  // Generate data points for Tuần (7 ngày), Tháng (ngày trong tháng), Năm (12 tháng)
  const chartData = useMemo(() => {
    if (khoang === 'tuan') {
      const result = [];
      const baseDate = new Date(selectedDate);
      for (let i = 6; i >= 0; i--) {
        const d = new Date(baseDate.getTime() - i * 24 * 60 * 60 * 1000);
        const iso = Ngay.iso(d);
        const parts = iso.split('-');
        const nhanNgay = `${parts[2]}/${parts[1]}`;

        const foods = data.foodLogs.filter((f) => f.ngay === iso);
        const caloNap = foods.reduce((sum, f) => sum + f.kcal, 0);

        const workouts = data.tapIns.filter((t) => t.ngay === iso);
        const caloTap = workouts.reduce((sum, cur) => {
          const m = CongThuc.metCua(cur.loai) ?? 5.0;
          const burned = currentWeight ? CongThuc.kcalTap({ met: m, kg: currentWeight, phut: cur.phut }) ?? 0 : 0;
          return sum + Math.round(burned);
        }, 0);

        const caloTieuThu = Math.round(tdeeVal + caloTap);

        result.push({
          ngay: iso,
          nhanNgay,
          chuThich: `Ngày ${parts[2]}/${parts[1]}`,
          caloNap,
          caloTieuThu,
          caloTap,
          chenhLech: caloNap - caloTieuThu,
        });
      }
      return result;
    } else if (khoang === 'thang') {
      // Days of the month
      const monthDays = Ngay.cacNgayThang(selectedDate);
      return monthDays.map((d) => {
        const iso = Ngay.iso(d);
        const parts = iso.split('-');
        const nhanNgay = `${d.getDate()}`;

        const foods = data.foodLogs.filter((f) => f.ngay === iso);
        const caloNap = foods.reduce((sum, f) => sum + f.kcal, 0);

        const workouts = data.tapIns.filter((t) => t.ngay === iso);
        const caloTap = workouts.reduce((sum, cur) => {
          const m = CongThuc.metCua(cur.loai) ?? 5.0;
          const burned = currentWeight ? CongThuc.kcalTap({ met: m, kg: currentWeight, phut: cur.phut }) ?? 0 : 0;
          return sum + Math.round(burned);
        }, 0);

        const caloTieuThu = Math.round(tdeeVal + caloTap);

        return {
          ngay: iso,
          nhanNgay,
          chuThich: `Ngày ${parts[2]}/${parts[1]}`,
          caloNap,
          caloTieuThu,
          caloTap,
          chenhLech: caloNap - caloTieuThu,
        };
      });
    } else {
      // 12 months
      const nam = selectedDate.getFullYear();
      const result = [];
      for (let m = 1; m <= 12; m++) {
        const prefixThang = `${nam}-${String(m).padStart(2, '0')}`;
        const foods = data.foodLogs.filter((f) => f.ngay.startsWith(prefixThang));
        const totalKcalNap = foods.reduce((sum, f) => sum + f.kcal, 0);

        const workouts = data.tapIns.filter((t) => t.ngay.startsWith(prefixThang));
        const totalKcalTap = workouts.reduce((sum, cur) => {
          const met = CongThuc.metCua(cur.loai) ?? 5.0;
          const burned = currentWeight ? CongThuc.kcalTap({ met: m, kg: currentWeight, phut: cur.phut }) ?? 0 : 0;
          return sum + Math.round(burned);
        }, 0);

        // Days in month
        const daysInMonth = new Date(nam, m, 0).getDate();
        const caloTieuThu = Math.round(tdeeVal * daysInMonth + totalKcalTap);

        result.push({
          ngay: prefixThang,
          nhanNgay: `T${m}`,
          chuThich: `Tháng ${m}/${nam}`,
          caloNap: totalKcalNap,
          caloTieuThu,
          caloTap: totalKcalTap,
          chenhLech: totalKcalNap - caloTieuThu,
        });
      }
      return result;
    }
  }, [data.foodLogs, data.tapIns, selectedDate, khoang, tdeeVal, currentWeight]);

  // Averages or Totals
  const avgNap = Math.round(chartData.reduce((s, i) => s + i.caloNap, 0) / (chartData.length || 1));
  const avgTieuThu = Math.round(chartData.reduce((s, i) => s + i.caloTieuThu, 0) / (chartData.length || 1));
  const avgChenhLech = avgNap - avgTieuThu;

  return (
    <div
      id="bieu-do-nang-luong"
      className={`p-4 bg-[#131418] rounded-2xl border border-[#24262c] shadow-sm ${className}`}
    >
      {/* Header with Collapsible toggle */}
      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => setCollapsed(!collapsed)}
        >
          <Zap className="w-4 h-4 text-[#ffaa00]" />
          <div>
            <span className="text-xs font-semibold text-[#a6a39b] uppercase tracking-wider block">
              Cân bằng Năng lượng Calo
            </span>
            <span className="text-[11px] text-[#f8f7f4] font-medium">
              {khoang === 'tuan'
                ? 'Calo nạp vs Tiêu hao (7 ngày)'
                : khoang === 'thang'
                ? `Calo nạp vs Tiêu hao Tháng ${selectedDate.getMonth() + 1}`
                : `Calo nạp vs Tiêu hao Năm ${selectedDate.getFullYear()}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {!collapsed && (
            <div className="flex bg-[#1c1e26] p-0.5 rounded-xl border border-[#2e313c] text-[10px]">
              <button
                type="button"
                onClick={() => setKhoang('tuan')}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  khoang === 'tuan'
                    ? 'bg-gradient-to-r from-[#ffaa00] to-[#ff6000] text-black shadow-sm'
                    : 'text-[#a6a39b] hover:text-[#f8f7f4]'
                }`}
              >
                Tuần
              </button>
              <button
                type="button"
                onClick={() => setKhoang('thang')}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  khoang === 'thang'
                    ? 'bg-gradient-to-r from-[#ffaa00] to-[#ff6000] text-black shadow-sm'
                    : 'text-[#a6a39b] hover:text-[#f8f7f4]'
                }`}
              >
                Tháng
              </button>
              <button
                type="button"
                onClick={() => setKhoang('nam')}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  khoang === 'nam'
                    ? 'bg-gradient-to-r from-[#ffaa00] to-[#ff6000] text-black shadow-sm'
                    : 'text-[#a6a39b] hover:text-[#f8f7f4]'
                }`}
              >
                Năm
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#a6a39b] hover:text-[#f8f7f4] hover:bg-[#1f2028]"
            title={collapsed ? 'Mở rộng' : 'Thu gọn'}
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="mt-3.5 space-y-3">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 text-center p-2.5 bg-[#090a0c] rounded-xl border border-[#24262c]">
            <div>
              <div className="text-[10px] text-[#a6a39b] flex items-center justify-center gap-1">
                <Utensils className="w-3 h-3 text-[#ffaa00]" /> {khoang === 'nam' ? 'Tổng Nạp' : 'TB Nạp'}
              </div>
              <div className="text-xs font-bold text-[#f8f7f4] mt-0.5">{avgNap} kcal</div>
            </div>
            <div>
              <div className="text-[10px] text-[#a6a39b] flex items-center justify-center gap-1">
                <Flame className="w-3 h-3 text-[#38b000]" /> {khoang === 'nam' ? 'Tổng Tiêu thụ' : 'TB Tiêu thụ'}
              </div>
              <div className="text-xs font-bold text-[#f8f7f4] mt-0.5">{avgTieuThu} kcal</div>
            </div>
            <div>
              <div className="text-[10px] text-[#a6a39b]">Chênh lệch</div>
              <div
                className={`text-xs font-bold mt-0.5 ${
                  avgChenhLech > 0
                    ? 'text-[#ffaa00]'
                    : avgChenhLech < 0
                    ? 'text-[#38b000]'
                    : 'text-[#f8f7f4]'
                }`}
              >
                {avgChenhLech > 0 ? `+${avgChenhLech}` : avgChenhLech} kcal
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-52 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#22242c" vertical={false} />
                <XAxis
                  dataKey="nhanNgay"
                  stroke="#a6a39b"
                  fontSize={khoang === 'thang' ? 8 : 10}
                  tickLine={false}
                  axisLine={{ stroke: '#2e313c' }}
                  interval={khoang === 'thang' ? 2 : 0}
                />
                <YAxis
                  stroke="#a6a39b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#2e313c' }}
                  tickFormatter={(val) => `${val}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-[#131418] border border-[#2e313c] p-2.5 rounded-xl text-xs shadow-xl space-y-1">
                          <div className="font-bold text-[#f8f7f4]">{item.chuThich}</div>
                          <div className="text-[#ffaa00]">
                            Calo nạp: <span className="font-bold">{item.caloNap} kcal</span>
                          </div>
                          <div className="text-[#38b000]">
                            Calo tiêu thụ: <span className="font-bold">{item.caloTieuThu} kcal</span>
                          </div>
                          <div className={`text-[10px] font-semibold ${item.chenhLech > 0 ? 'text-[#ffaa00]' : 'text-[#38b000]'}`}>
                            Chênh lệch: {item.chenhLech > 0 ? `+${item.chenhLech}` : item.chenhLech} kcal
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="caloNap" fill="#ffaa00" radius={[3, 3, 0, 0]} maxBarSize={khoang === 'thang' ? 8 : 16} name="Nạp" />
                <Bar dataKey="caloTieuThu" fill="#38b000" radius={[3, 3, 0, 0]} maxBarSize={khoang === 'thang' ? 8 : 16} name="Tiêu thụ" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-[11px] text-[#a6a39b]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#ffaa00]" />
              <span>Calo Nạp (Ăn uống)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#38b000]" />
              <span>Calo Tiêu thụ (TDEE + Tập)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
