import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { PieChart as PieIcon, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { StorageService } from '../storage';
import { Ngay } from '../ngay';

interface BieuDoMacroRechartsProps {
  selectedDate: Date;
  className?: string;
}

const COLORS = {
  dam: '#38b000', // Green - Protein
  bot: '#ffaa00', // Amber/Orange - Carbs
  beo: '#b9c0b8', // Steel - Fat
};

export const BieuDoMacroRecharts: React.FC<BieuDoMacroRechartsProps> = ({
  selectedDate,
  className = '',
}) => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [cheDo, setCheDo] = useState<'ngay' | 'tuan' | 'thang' | 'nam'>('ngay');

  const data = StorageService.getData();
  const dateIso = Ngay.iso(selectedDate);

  // Calculate macros for selected day, week, month, or year
  const macroStats = useMemo(() => {
    let logs = [];
    let divisor = 1;

    if (cheDo === 'ngay') {
      logs = data.foodLogs.filter((f) => f.ngay === dateIso);
      divisor = 1;
    } else if (cheDo === 'tuan') {
      const baseDate = new Date(selectedDate);
      const pastDates = new Set<string>();
      for (let i = 0; i < 7; i++) {
        const d = new Date(baseDate.getTime() - i * 24 * 60 * 60 * 1000);
        pastDates.add(Ngay.iso(d));
      }
      logs = data.foodLogs.filter((f) => pastDates.has(f.ngay));
      divisor = 7;
    } else if (cheDo === 'thang') {
      const prefix = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`;
      logs = data.foodLogs.filter((f) => f.ngay.startsWith(prefix));
      const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
      divisor = daysInMonth;
    } else {
      const prefix = `${selectedDate.getFullYear()}-`;
      logs = data.foodLogs.filter((f) => f.ngay.startsWith(prefix));
      divisor = 365;
    }

    const totalDam = logs.reduce((sum, f) => sum + (f.dam || 0), 0);
    const totalBot = logs.reduce((sum, f) => sum + (f.bot || 0), 0);
    const totalBeo = logs.reduce((sum, f) => sum + (f.beo || 0), 0);

    const avgDam = Math.round((totalDam / divisor) * 10) / 10;
    const avgBot = Math.round((totalBot / divisor) * 10) / 10;
    const avgBeo = Math.round((totalBeo / divisor) * 10) / 10;

    // Calories from each macro: Protein = 4 kcal/g, Carbs = 4 kcal/g, Fat = 9 kcal/g
    const kcalDam = avgDam * 4;
    const kcalBot = avgBot * 4;
    const kcalBeo = avgBeo * 9;
    const totalKcal = kcalDam + kcalBot + kcalBeo;

    const pctDam = totalKcal > 0 ? Math.round((kcalDam / totalKcal) * 100) : 0;
    const pctBot = totalKcal > 0 ? Math.round((kcalBot / totalKcal) * 100) : 0;
    const pctBeo = totalKcal > 0 ? Math.round((kcalBeo / totalKcal) * 100) : 0;

    const pieData = [
      { name: 'Đạm (Protein)', gram: avgDam, kcal: Math.round(kcalDam), pct: pctDam, fill: COLORS.dam },
      { name: 'Tinh bột (Carbs)', gram: avgBot, kcal: Math.round(kcalBot), pct: pctBot, fill: COLORS.bot },
      { name: 'Chất béo (Fat)', gram: avgBeo, kcal: Math.round(kcalBeo), pct: pctBeo, fill: COLORS.beo },
    ].filter((item) => item.gram > 0);

    return {
      avgDam,
      avgBot,
      avgBeo,
      pctDam,
      pctBot,
      pctBeo,
      totalKcal: Math.round(totalKcal),
      pieData,
      hasData: pieData.length > 0,
    };
  }, [data.foodLogs, dateIso, selectedDate, cheDo]);

  return (
    <div
      id="bieu-do-macro"
      className={`p-4 bg-[#131418] rounded-2xl border border-[#24262c] shadow-sm ${className}`}
    >
      {/* Header with Collapsible toggle */}
      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => setCollapsed(!collapsed)}
        >
          <PieIcon className="w-4 h-4 text-[#38b000]" />
          <div>
            <span className="text-xs font-semibold text-[#a6a39b] uppercase tracking-wider block">
              Cơ cấu Dinh dưỡng Macro
            </span>
            <span className="text-[11px] text-[#f8f7f4] font-medium">
              Tỷ lệ Đạm - Tinh bột - Chất béo
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {!collapsed && (
            <div className="flex bg-[#1c1e26] p-0.5 rounded-xl border border-[#2e313c] text-[10px]">
              <button
                type="button"
                onClick={() => setCheDo('ngay')}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  cheDo === 'ngay' ? 'bg-gradient-to-r from-[#ffaa00] to-[#ff6000] text-black shadow-sm' : 'text-[#a6a39b] hover:text-[#f8f7f4]'
                }`}
              >
                Ngày
              </button>
              <button
                type="button"
                onClick={() => setCheDo('tuan')}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  cheDo === 'tuan' ? 'bg-gradient-to-r from-[#ffaa00] to-[#ff6000] text-black shadow-sm' : 'text-[#a6a39b] hover:text-[#f8f7f4]'
                }`}
              >
                Tuần
              </button>
              <button
                type="button"
                onClick={() => setCheDo('thang')}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  cheDo === 'thang' ? 'bg-gradient-to-r from-[#ffaa00] to-[#ff6000] text-black shadow-sm' : 'text-[#a6a39b] hover:text-[#f8f7f4]'
                }`}
              >
                Tháng
              </button>
              <button
                type="button"
                onClick={() => setCheDo('nam')}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  cheDo === 'nam' ? 'bg-gradient-to-r from-[#ffaa00] to-[#ff6000] text-black shadow-sm' : 'text-[#a6a39b] hover:text-[#f8f7f4]'
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
        <div className="mt-3.5">
          {macroStats.hasData ? (
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                {/* Donut Chart */}
                <div className="w-28 h-28 shrink-0 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={macroStats.pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={48}
                        paddingAngle={3}
                        dataKey="gram"
                      >
                        {macroStats.pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const p = payload[0].payload;
                            return (
                              <div className="bg-[#161714] border border-[#3a322c] px-2 py-1.5 rounded-lg text-xs shadow-lg">
                                <span className="font-bold text-[#e7e4dc]">{p.name}: </span>
                                <span className="text-[#ff7a00] font-semibold">{p.gram}g ({p.pct}%)</span>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-[11px] font-black text-[#e7e4dc]">{macroStats.totalKcal}</span>
                    <span className="text-[8px] text-[#c4b6a8]">kcal</span>
                  </div>
                </div>

                {/* Macro Breakdown Rows */}
                <div className="flex-1 space-y-2 text-xs">
                  {/* Đạm */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="flex items-center gap-1.5 text-[#e7e4dc] font-semibold">
                        <span className="w-2 h-2 rounded-full bg-[#3d9a7a]" /> Đạm (Protein)
                      </span>
                      <span className="text-[#c4b6a8]">
                        <span className="font-bold text-[#e7e4dc]">{macroStats.avgDam}g</span> ({macroStats.pctDam}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#0c0d0b] h-1.5 rounded-full overflow-hidden border border-[#3a322c]/40">
                      <div
                        className="bg-[#3d9a7a] h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, macroStats.pctDam)}%` }}
                      />
                    </div>
                  </div>

                  {/* Tinh bột */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="flex items-center gap-1.5 text-[#e7e4dc] font-semibold">
                        <span className="w-2 h-2 rounded-full bg-[#ff7a00]" /> Tinh bột (Carbs)
                      </span>
                      <span className="text-[#c4b6a8]">
                        <span className="font-bold text-[#e7e4dc]">{macroStats.avgBot}g</span> ({macroStats.pctBot}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#0c0d0b] h-1.5 rounded-full overflow-hidden border border-[#3a322c]/40">
                      <div
                        className="bg-[#ff7a00] h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, macroStats.pctBot)}%` }}
                      />
                    </div>
                  </div>

                  {/* Chất béo */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="flex items-center gap-1.5 text-[#e7e4dc] font-semibold">
                        <span className="w-2 h-2 rounded-full bg-[#b9c0b8]" /> Chất béo (Fat)
                      </span>
                      <span className="text-[#c4b6a8]">
                        <span className="font-bold text-[#e7e4dc]">{macroStats.avgBeo}g</span> ({macroStats.pctBeo}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#0c0d0b] h-1.5 rounded-full overflow-hidden border border-[#3a322c]/40">
                      <div
                        className="bg-[#b9c0b8] h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, macroStats.pctBeo)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Benchmark comparison banner */}
              <div className="p-2 bg-[#0c0d0b] rounded-xl border border-[#3a322c]/40 flex items-center justify-between text-[10px] text-[#c4b6a8]">
                <span>Tỷ lệ khuyến nghị thể hình:</span>
                <span className="font-semibold text-[#e7e4dc]">30% Đạm · 40% Bột · 30% Béo</span>
              </div>
            </div>
          ) : (
            <div className="py-5 text-center text-xs text-[#c4b6a8] bg-[#0c0d0b] rounded-xl border border-[#3a322c]/40">
              Chưa có dữ liệu dinh dưỡng trong ngày này. Hãy ghi thêm món ăn vào Nhật ký.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
