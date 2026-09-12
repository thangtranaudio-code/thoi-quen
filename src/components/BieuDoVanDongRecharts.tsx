import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Activity, ChevronDown, ChevronUp, Clock, Flame } from 'lucide-react';
import { StorageService } from '../storage';
import { Chuoi } from '../chuoi';
import { Ngay } from '../ngay';
import { CongThuc } from '../cong_thuc';

interface BieuDoVanDongRechartsProps {
  selectedDate: Date;
  className?: string;
}

export const BieuDoVanDongRecharts: React.FC<BieuDoVanDongRechartsProps> = ({
  selectedDate,
  className = '',
}) => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [cheDo, setCheDo] = useState<'tuan' | 'thang' | 'nam'>('tuan');
  const data = StorageService.getData();
  const currentWeight = StorageService.getLatestWeighIn()?.kg ?? data.profile.startKg ?? null;

  const chartData = useMemo(() => {
    if (cheDo === 'tuan') {
      // 7 days of the week containing selectedDate
      const weekDays = Ngay.tuan(selectedDate);
      return weekDays.map((d, idx) => {
        const iso = Ngay.iso(d);
        const workouts = data.tapIns.filter((t) => t.ngay === iso);
        const totalPhut = workouts.reduce((sum, w) => sum + w.phut, 0);

        const totalKcal = workouts.reduce((sum, w) => {
          const met = CongThuc.metCua(w.loai) ?? 5.0;
          const burned = currentWeight
            ? CongThuc.kcalTap({ met, kg: currentWeight, phut: w.phut }) ?? 0
            : 0;
          return sum + Math.round(burned);
        }, 0);

        return {
          tenTruc: Chuoi.thuNgan[idx],
          chuThich: `${Chuoi.thuNgan[idx]} (ngày ${d.getDate()})`,
          phut: totalPhut,
          kcal: totalKcal,
          soBuoi: workouts.length,
        };
      });
    } else if (cheDo === 'thang') {
      // All days of the current month
      const monthDays = Ngay.cacNgayThang(selectedDate);
      return monthDays.map((d) => {
        const iso = Ngay.iso(d);
        const workouts = data.tapIns.filter((t) => t.ngay === iso);
        const totalPhut = workouts.reduce((sum, w) => sum + w.phut, 0);

        const totalKcal = workouts.reduce((sum, w) => {
          const met = CongThuc.metCua(w.loai) ?? 5.0;
          const burned = currentWeight
            ? CongThuc.kcalTap({ met, kg: currentWeight, phut: w.phut }) ?? 0
            : 0;
          return sum + Math.round(burned);
        }, 0);

        return {
          tenTruc: `${d.getDate()}`,
          chuThich: `Ngày ${d.getDate()}/${d.getMonth() + 1}`,
          phut: totalPhut,
          kcal: totalKcal,
          soBuoi: workouts.length,
        };
      });
    } else {
      // 12 months of the year
      const nam = selectedDate.getFullYear();
      const months = [];
      for (let m = 1; m <= 12; m++) {
        const prefixThang = `${nam}-${String(m).padStart(2, '0')}`;
        const workouts = data.tapIns.filter((t) => t.ngay.startsWith(prefixThang));
        const totalPhut = workouts.reduce((sum, w) => sum + w.phut, 0);

        const totalKcal = workouts.reduce((sum, w) => {
          const met = CongThuc.metCua(w.loai) ?? 5.0;
          const burned = currentWeight
            ? CongThuc.kcalTap({ met, kg: currentWeight, phut: w.phut }) ?? 0
            : 0;
          return sum + Math.round(burned);
        }, 0);

        months.push({
          tenTruc: `T${m}`,
          chuThich: `Tháng ${m}/${nam}`,
          phut: totalPhut,
          kcal: totalKcal,
          soBuoi: workouts.length,
        });
      }
      return months;
    }
  }, [selectedDate, cheDo, data.tapIns, currentWeight]);

  const tongPhut = chartData.reduce((s, i) => s + i.phut, 0);
  const tongBuoi = chartData.reduce((s, i) => s + i.soBuoi, 0);
  const tongKcal = chartData.reduce((s, i) => s + i.kcal, 0);

  const tieuDeKhoang =
    cheDo === 'tuan'
      ? 'Thời lượng Vận động Tuần'
      : cheDo === 'thang'
      ? `Thời lượng Vận động Tháng ${selectedDate.getMonth() + 1}`
      : `Thời lượng Vận động Năm ${selectedDate.getFullYear()}`;

  const moTaKhoang =
    cheDo === 'tuan'
      ? 'Số phút tập luyện mỗi ngày (T2 - CN)'
      : cheDo === 'thang'
      ? `Tổng hợp các ngày trong tháng ${selectedDate.getMonth() + 1}`
      : `Tổng hợp 12 tháng năm ${selectedDate.getFullYear()}`;

  return (
    <div
      id="bieu-do-van-dong"
      className={`p-4 bg-[#131418] rounded-2xl border border-[#24262c] shadow-sm ${className}`}
    >
      {/* Header with Collapsible toggle */}
      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => setCollapsed(!collapsed)}
        >
          <Activity className="w-4 h-4 text-[#ffaa00]" />
          <div>
            <span className="text-xs font-semibold text-[#a6a39b] uppercase tracking-wider block">
              {tieuDeKhoang}
            </span>
            <span className="text-[11px] text-[#f8f7f4] font-medium">
              {moTaKhoang}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* View switcher: Tuần / Tháng / Năm */}
          <div className="flex items-center bg-[#1c1e26] p-0.5 rounded-xl border border-[#2e313c]">
            <button
              type="button"
              onClick={() => setCheDo('tuan')}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${
                cheDo === 'tuan'
                  ? 'bg-gradient-to-r from-[#ffaa00] to-[#ff6000] text-black shadow-sm'
                  : 'text-[#a6a39b] hover:text-[#f8f7f4]'
              }`}
            >
              Tuần
            </button>
            <button
              type="button"
              onClick={() => setCheDo('thang')}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${
                cheDo === 'thang'
                  ? 'bg-gradient-to-r from-[#ffaa00] to-[#ff6000] text-black shadow-sm'
                  : 'text-[#a6a39b] hover:text-[#f8f7f4]'
              }`}
            >
              Tháng
            </button>
            <button
              type="button"
              onClick={() => setCheDo('nam')}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${
                cheDo === 'nam'
                  ? 'bg-gradient-to-r from-[#ffaa00] to-[#ff6000] text-black shadow-sm'
                  : 'text-[#a6a39b] hover:text-[#f8f7f4]'
              }`}
            >
              Năm
            </button>
          </div>

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
          {/* Summary Row */}
          <div className="grid grid-cols-3 gap-2 text-center p-2.5 bg-[#090a0c] rounded-xl border border-[#24262c]">
            <div>
              <div className="text-[10px] text-[#a6a39b] flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-[#ffaa00]" /> Tổng thời lượng
              </div>
              <div className="text-xs font-bold text-[#f8f7f4] mt-0.5">{tongPhut} phút</div>
            </div>
            <div>
              <div className="text-[10px] text-[#a6a39b]">Số buổi tập</div>
              <div className="text-xs font-bold text-[#f8f7f4] mt-0.5">{tongBuoi} buổi</div>
            </div>
            <div>
              <div className="text-[10px] text-[#a6a39b] flex items-center justify-center gap-1">
                <Flame className="w-3 h-3 text-[#ff6000] fill-[#ff6000]" /> Tiêu hao
              </div>
              <div className="text-xs font-bold text-[#38b000] mt-0.5">~{tongKcal} kcal</div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="h-44 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#22242c" vertical={false} />
                <XAxis
                  dataKey="tenTruc"
                  stroke="#a6a39b"
                  fontSize={cheDo === 'thang' ? 8 : 10}
                  tickLine={false}
                  axisLine={{ stroke: '#2e313c' }}
                  interval={cheDo === 'thang' ? 2 : 0}
                />
                <YAxis
                  stroke="#a6a39b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#2e313c' }}
                  tickFormatter={(val) => `${val}p`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-[#131418] border border-[#2e313c] p-2.5 rounded-xl text-xs shadow-xl space-y-1">
                          <div className="font-bold text-[#f8f7f4]">
                            {item.chuThich}
                          </div>
                          <div className="text-[#ffaa00] font-semibold">
                            Thời gian tập: {item.phut} phút ({item.soBuoi} buổi)
                          </div>
                          {item.kcal > 0 && (
                            <div className="text-[#38b000] text-[10px]">
                              Ước tính tiêu thụ: ~{item.kcal} kcal
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="phut"
                  fill="#ffaa00"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={cheDo === 'thang' ? 12 : 24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
