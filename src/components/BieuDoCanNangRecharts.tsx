import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { Scale, TrendingDown, TrendingUp, Plus, Calendar } from 'lucide-react';
import { StorageService } from '../storage';
import { Chuoi, So } from '../chuoi';
import { Ngay } from '../ngay';
import { GhiCanModal } from './GhiCanModal';

interface BieuDoCanNangRechartsProps {
  onOpenGhiCan?: () => void;
  className?: string;
}

type KhoangThoiGian = '7ngay' | '30ngay' | 'nam' | 'tatCa';

export const BieuDoCanNangRecharts: React.FC<BieuDoCanNangRechartsProps> = ({
  onOpenGhiCan,
  className = '',
}) => {
  const [, setTick] = useState(0);
  const [khoang, setKhoang] = useState<KhoangThoiGian>('tatCa');
  const [showModalInternal, setShowModalInternal] = useState(false);

  // Subscribe to storage updates
  useEffect(() => {
    const unsub = StorageService.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsub;
  }, []);

  const data = StorageService.getData();
  const profile = data.profile;
  const targetWeight = profile.targetKg ?? null;
  const rawWeighIns = data.weighIns;

  // Sort weigh-ins ascending by date (oldest to newest)
  const sortedWeighIns = useMemo(() => {
    return [...rawWeighIns].sort((a, b) => a.ngay.localeCompare(b.ngay));
  }, [rawWeighIns]);

  // Filter based on selected time range
  const filteredData = useMemo(() => {
    if (sortedWeighIns.length === 0) return [];
    if (khoang === 'tatCa') return sortedWeighIns;

    const now = new Date();
    if (khoang === 'nam') {
      const yearPrefix = `${now.getFullYear()}-`;
      const yearData = sortedWeighIns.filter((item) => item.ngay.startsWith(yearPrefix));
      // If no data for this year yet, fallback to 365 days
      if (yearData.length > 0) return yearData;
      const cutoffYear = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      return sortedWeighIns.filter((item) => item.ngay >= Ngay.iso(cutoffYear));
    }

    const daysLimit = khoang === '7ngay' ? 7 : 30;
    const cutoff = new Date(now.getTime() - daysLimit * 24 * 60 * 60 * 1000);
    const cutoffIso = Ngay.iso(cutoff);

    return sortedWeighIns.filter((item) => item.ngay >= cutoffIso);
  }, [sortedWeighIns, khoang]);

  // Chart data formatted
  const chartData = useMemo(() => {
    return filteredData.map((item) => {
      const parts = item.ngay.split('-');
      const nhanNgay = parts.length === 3 ? `${parts[2]}/${parts[1]}` : item.ngay;
      return {
        ngay: item.ngay,
        nhanNgay,
        kg: item.kg,
        dich: targetWeight,
      };
    });
  }, [filteredData, targetWeight]);

  // Stats
  const latestWeighIn = StorageService.getLatestWeighIn();
  const currentWeight = latestWeighIn?.kg ?? profile.startKg ?? null;
  const firstWeightInFiltered = filteredData.length > 0 ? filteredData[0].kg : null;
  const weightChange =
    currentWeight !== null && firstWeightInFiltered !== null && filteredData.length > 1
      ? Math.round((currentWeight - firstWeightInFiltered) * 10) / 10
      : null;

  const remainingToTarget =
    currentWeight !== null && targetWeight !== null
      ? Math.round(Math.abs(currentWeight - targetWeight) * 10) / 10
      : null;

  // Min and Max for Y-axis domain
  const { yMin, yMax } = useMemo(() => {
    if (chartData.length === 0) {
      return { yMin: 50, yMax: 80 };
    }
    const values = chartData.map((d) => d.kg);
    if (targetWeight !== null) values.push(targetWeight);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const buffer = Math.max(1, (maxVal - minVal) * 0.15);
    return {
      yMin: Math.floor(Math.max(0, minVal - buffer)),
      yMax: Math.ceil(maxVal + buffer),
    };
  }, [chartData, targetWeight]);

  const handleOpenGhi = () => {
    if (onOpenGhiCan) {
      onOpenGhiCan();
    } else {
      setShowModalInternal(true);
    }
  };

  return (
    <div
      id="bieu-do-can-nang-recharts"
      className={`p-4 bg-[#161714] rounded-2xl border border-[#3a322c]/50 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-[#ff7a00]" />
          <h2 className="text-xs font-semibold text-[#c4b6a8] uppercase tracking-wider">
            {Chuoi.lichSuCanNang}
          </h2>
        </div>

        <button
          id="nut-them-can-recharts"
          type="button"
          onClick={handleOpenGhi}
          className="min-h-[44px] px-2.5 py-1.5 text-xs text-[#ff7a00] hover:text-[#f3ece4] font-semibold flex items-center gap-1 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ghi cân</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="p-2.5 bg-[#0d0d0d] rounded-xl border border-[#3a322c]/40 text-center">
          <div className="text-[10px] text-[#c4b6a8] font-medium leading-tight">
            {Chuoi.canHienTaiNhan}
          </div>
          <div className="text-sm font-bold text-[#f3ece4] mt-0.5">
            {currentWeight !== null ? `${So.kg(currentWeight)} kg` : '—'}
          </div>
          {latestWeighIn && (
            <div className="text-[9px] text-[#c4b6a8]/70 mt-0.5 font-mono">
              {latestWeighIn.ngay}
            </div>
          )}
        </div>

        <div className="p-2.5 bg-[#0d0d0d] rounded-xl border border-[#3a322c]/40 text-center">
          <div className="text-[10px] text-[#c4b6a8] font-medium leading-tight">
            {Chuoi.canDich}
          </div>
          <div className="text-sm font-bold text-[#3d9a7a] mt-0.5">
            {targetWeight !== null ? `${So.kg(targetWeight)} kg` : '—'}
          </div>
          {remainingToTarget !== null && (
            <div className="text-[9px] text-[#c4b6a8] mt-0.5">
              {remainingToTarget === 0 ? 'Đã đạt' : `còn ${So.kg(remainingToTarget)} kg`}
            </div>
          )}
        </div>

        <div className="p-2.5 bg-[#0d0d0d] rounded-xl border border-[#3a322c]/40 text-center">
          <div className="text-[10px] text-[#c4b6a8] font-medium leading-tight">
            {Chuoi.bienThien}
          </div>
          <div className="text-sm font-bold mt-0.5 flex items-center justify-center gap-0.5">
            {weightChange !== null ? (
              <>
                {weightChange > 0 ? (
                  <TrendingUp className="w-3 h-3 text-[#c45c4a]" />
                ) : weightChange < 0 ? (
                  <TrendingDown className="w-3 h-3 text-[#3d9a7a]" />
                ) : null}
                <span
                  className={
                    weightChange > 0
                      ? 'text-[#c45c4a]'
                      : weightChange < 0
                      ? 'text-[#3d9a7a]'
                      : 'text-[#e7e4dc]'
                  }
                >
                  {weightChange > 0 ? `+${So.kg(weightChange)}` : `${So.kg(weightChange)}`} kg
                </span>
              </>
            ) : (
              <span className="text-[#c4b6a8]">—</span>
            )}
          </div>
          <div className="text-[9px] text-[#c4b6a8]/70 mt-0.5">
            {filteredData.length} mốc ghi
          </div>
        </div>
      </div>

      {/* Time Filter Tabs */}
      {sortedWeighIns.length > 1 && (
        <div className="flex items-center justify-between mb-3 pt-1 border-t border-[#3a322c]/30">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-[#c4b6a8]" />
            <span className="text-[11px] text-[#c4b6a8]">Khoảng thời gian:</span>
          </div>

          <div className="flex items-center gap-1 bg-[#1c1e26] p-0.5 rounded-xl border border-[#2e313c]">
            <button
              type="button"
              onClick={() => setKhoang('7ngay')}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${
                khoang === '7ngay'
                  ? 'bg-gradient-to-r from-[#ffaa00] to-[#ff6000] text-black shadow-sm'
                  : 'text-[#a6a39b] hover:text-[#f8f7f4]'
              }`}
            >
              7 ngày
            </button>
            <button
              type="button"
              onClick={() => setKhoang('30ngay')}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${
                khoang === '30ngay'
                  ? 'bg-gradient-to-r from-[#ffaa00] to-[#ff6000] text-black shadow-sm'
                  : 'text-[#a6a39b] hover:text-[#f8f7f4]'
              }`}
            >
              Tháng
            </button>
            <button
              type="button"
              onClick={() => setKhoang('nam')}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${
                khoang === 'nam'
                  ? 'bg-gradient-to-r from-[#ffaa00] to-[#ff6000] text-black shadow-sm'
                  : 'text-[#a6a39b] hover:text-[#f8f7f4]'
              }`}
            >
              Năm
            </button>
            <button
              type="button"
              onClick={() => setKhoang('tatCa')}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${
                khoang === 'tatCa'
                  ? 'bg-gradient-to-r from-[#ffaa00] to-[#ff6000] text-black shadow-sm'
                  : 'text-[#a6a39b] hover:text-[#f8f7f4]'
              }`}
            >
              Tất cả
            </button>
          </div>
        </div>
      )}

      {/* Chart Canvas Area */}
      {sortedWeighIns.length === 0 ? (
        <div className="py-8 px-4 text-center bg-[#0d0d0d] rounded-xl border border-[#3a322c]/30">
          <Scale className="w-8 h-8 text-[#c4b6a8]/50 mx-auto mb-2" />
          <p className="text-xs text-[#c4b6a8] leading-relaxed mb-3">
            {Chuoi.chuaCoCan}
          </p>
          <button
            type="button"
            onClick={handleOpenGhi}
            className="min-h-[44px] px-4 py-2 bg-[#ff7a00] text-[#0c0d0b] font-bold text-xs rounded-xl shadow hover:bg-[#ff8e26] transition-colors"
          >
            + Ghi cân ngay
          </button>
        </div>
      ) : sortedWeighIns.length === 1 ? (
        <div className="py-6 px-4 text-center bg-[#0d0d0d] rounded-xl border border-[#3a322c]/30">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#2a1c14] border border-[#ff7a00]/40 rounded-full mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff7a00]" />
            <span className="text-xs font-bold text-[#f3ece4]">
              {So.kg(sortedWeighIns[0].kg)} kg ({sortedWeighIns[0].ngay})
            </span>
          </div>
          <p className="text-[11px] text-[#c4b6a8] mt-1">
            Ghi thêm từ 2 mốc cân trở lên để thấy biểu đồ đường xu hướng.
          </p>
        </div>
      ) : (
        <div className="h-52 w-full pt-1 pb-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 12, left: -22, bottom: 0 }}>
              <CartesianGrid
                stroke="#3a322c"
                strokeDasharray="3 3"
                opacity={0.35}
                vertical={false}
              />
              <XAxis
                dataKey="nhanNgay"
                stroke="#b9c0b8"
                tick={{ fill: '#b9c0b8', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#3a322c' }}
              />
              <YAxis
                domain={[yMin, yMax]}
                stroke="#b9c0b8"
                tick={{ fill: '#b9c0b8', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#3a322c' }}
                unit="kg"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-[#161714] border border-[#3a322c] rounded-xl p-2.5 shadow-xl text-xs">
                        <div className="text-[10px] text-[#b9c0b8] font-mono mb-1">{d.ngay}</div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#ff7a00]" />
                          <span className="font-bold text-[#f3ece4]">{So.kg(d.kg)} kg</span>
                        </div>
                        {targetWeight !== null && (
                          <div className="text-[10px] text-[#3d9a7a] mt-1 flex items-center gap-1">
                            <span>Mục tiêu:</span>
                            <span className="font-semibold">{So.kg(targetWeight)} kg</span>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {targetWeight !== null && (
                <ReferenceLine
                  y={targetWeight}
                  stroke="#3d9a7a"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                />
              )}
              <Line
                type="monotone"
                dataKey="kg"
                name="Cân nặng"
                stroke="#ff7a00"
                strokeWidth={2.5}
                dot={{ fill: '#ff7a00', r: 3.5, stroke: '#161714', strokeWidth: 1.5 }}
                activeDot={{ r: 5.5, fill: '#ff7a00', stroke: '#ffffff', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Target indicator note */}
      {targetWeight !== null && sortedWeighIns.length > 1 && (
        <div className="flex items-center justify-between text-[10px] text-[#c4b6a8] mt-2 pt-2 border-t border-[#3a322c]/30">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-b-2 border-dashed border-[#3d9a7a] inline-block" />
            <span>Đường vạch đích ({So.kg(targetWeight)} kg)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-[#ff7a00] inline-block" />
            <span>Lịch sử cân</span>
          </div>
        </div>
      )}

      {/* Internal GhiCanModal if triggered internally */}
      {showModalInternal && (
        <GhiCanModal
          selectedDate={new Date()}
          onClose={() => setShowModalInternal(false)}
          onSuccess={() => setShowModalInternal(false)}
        />
      )}
    </div>
  );
};
