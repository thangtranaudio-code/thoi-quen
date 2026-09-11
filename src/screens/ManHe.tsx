import React from 'react';
import { Hexagon, Plus, Shield, Zap, Target, Eye, Sparkles, CheckCircle2, Circle } from 'lucide-react';
import { Chuoi } from '../chuoi';
import { He } from '../he';
import { Ngay } from '../ngay';
import { StorageService } from '../storage';

export const ManHe: React.FC = () => {
  const data = StorageService.getData();
  const aura = data.auraProfile;
  const todayIso = Ngay.iso(new Date());

  const canExp = He.canCap(aura.level);
  const expPercent = Math.min(100, Math.round((aura.exp / canExp) * 100));

  // Quests status for today
  const todayTicks = StorageService.getTicksForDay(todayIso);
  const todayTaps = data.tapIns.filter((t) => t.ngay === todayIso);
  const todayWeigh = data.weighIns.some((w) => w.ngay === todayIso);

  const hasHabitDone = todayTicks.length > 0;
  const hasTapDone = todayTaps.length > 0;
  const hasCanDone = todayWeigh;

  // Skills
  const kyNhipThoVung = hasTapDone;
  const kyBuocDau = hasHabitDone;

  const sucTam = He.sucTam({
    luc: aura.luc,
    ben: aura.ben,
    coKy: kyNhipThoVung,
  });

  const handlePlusStat = (stat: 'luc' | 'ben' | 'chi' | 'tinh') => {
    StorageService.congChiSo(stat);
  };

  return (
    <div id="man-he" className="flex flex-col min-h-full pb-20 px-4 pt-3 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#f3ece4]">{Chuoi.he}</h1>
          <p className="text-xs text-[#c4b6a8] mt-0.5">Tiến trình nội lực & rèn luyện thân tâm</p>
        </div>

        {/* Level Emblem */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#161714] border border-[#ff7a00]/50 rounded-xl">
          <Hexagon className="w-5 h-5 text-[#ff7a00] fill-[#ff7a00]/20" />
          <div>
            <div className="text-[10px] text-[#c4b6a8] uppercase tracking-wider font-semibold">
              {Chuoi.cap}
            </div>
            <div className="text-sm font-black text-[#ff7a00] leading-none">
              {aura.level}
            </div>
          </div>
        </div>
      </div>

      {/* EXP Progress Bar */}
      <div className="p-4 bg-[#161714] rounded-2xl border border-[#3a322c]/50 mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-[#f3ece4]">
            {Chuoi.cap} {aura.level}
          </span>
          <span className="text-[#c4b6a8] font-medium">
            {aura.exp} / {canExp} {Chuoi.expNhan} ({expPercent}%)
          </span>
        </div>

        <div className="w-full bg-[#0d0d0d] h-3 rounded-full overflow-hidden border border-[#3a322c]/40">
          <div
            style={{ width: `${expPercent}%` }}
            className="h-full bg-gradient-to-r from-[#ff7a00] to-[#ffb000] rounded-full transition-all duration-300"
          />
        </div>

        <div className="flex items-center justify-between mt-3 text-xs">
          <span className="text-[#c4b6a8]">
            {Chuoi.sucTam}: <span className="font-bold text-[#f3ece4]">{sucTam}</span>
          </span>
          {aura.unspent > 0 && (
            <span className="text-[#ff7a00] font-bold animate-pulse">
              {Chuoi.diemChuaCong}: {aura.unspent}
            </span>
          )}
        </div>
      </div>

      {/* Attributes (Lực, Bền, Chí, Tĩnh) */}
      <div className="p-4 bg-[#161714] rounded-2xl border border-[#3a322c]/50 mb-4">
        <div className="text-xs font-semibold text-[#c4b6a8] uppercase tracking-wider mb-3">
          Chỉ số thuộc tính
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Lực */}
          <div className="p-3 bg-[#0d0d0d] rounded-xl border border-[#3a322c]/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#d94a38]" />
              <div>
                <div className="text-xs font-semibold text-[#f3ece4]">{Chuoi.luc}</div>
                <div className="text-[10px] text-[#c4b6a8]">Sức phát ra</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#f3ece4]">{aura.luc}</span>
              {aura.unspent > 0 && (
                <button
                  type="button"
                  onClick={() => handlePlusStat('luc')}
                  className="w-6 h-6 rounded-lg bg-[#ff7a00] text-[#0d0d0d] flex items-center justify-center font-black active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              )}
            </div>
          </div>

          {/* Bền */}
          <div className="p-3 bg-[#0d0d0d] rounded-xl border border-[#3a322c]/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#3d9a7a]" />
              <div>
                <div className="text-xs font-semibold text-[#f3ece4]">{Chuoi.ben}</div>
                <div className="text-[10px] text-[#c4b6a8]">Sức chịu đựng</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#f3ece4]">{aura.ben}</span>
              {aura.unspent > 0 && (
                <button
                  type="button"
                  onClick={() => handlePlusStat('ben')}
                  className="w-6 h-6 rounded-lg bg-[#ff7a00] text-[#0d0d0d] flex items-center justify-center font-black active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              )}
            </div>
          </div>

          {/* Chí */}
          <div className="p-3 bg-[#0d0d0d] rounded-xl border border-[#3a322c]/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#ffb000]" />
              <div>
                <div className="text-xs font-semibold text-[#f3ece4]">{Chuoi.chiNhan}</div>
                <div className="text-[10px] text-[#c4b6a8]">Ý chí duy trì</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#f3ece4]">{aura.chi}</span>
              {aura.unspent > 0 && (
                <button
                  type="button"
                  onClick={() => handlePlusStat('chi')}
                  className="w-6 h-6 rounded-lg bg-[#ff7a00] text-[#0d0d0d] flex items-center justify-center font-black active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              )}
            </div>
          </div>

          {/* Tĩnh */}
          <div className="p-3 bg-[#0d0d0d] rounded-xl border border-[#3a322c]/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#c4b6a8]" />
              <div>
                <div className="text-xs font-semibold text-[#f3ece4]">{Chuoi.tinh}</div>
                <div className="text-[10px] text-[#c4b6a8]">Điềm tĩnh</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#f3ece4]">{aura.tinh}</span>
              {aura.unspent > 0 && (
                <button
                  type="button"
                  onClick={() => handlePlusStat('tinh')}
                  className="w-6 h-6 rounded-lg bg-[#ff7a00] text-[#0d0d0d] flex items-center justify-center font-black active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Quests (Việc hôm nay) */}
      <div className="p-4 bg-[#161714] rounded-2xl border border-[#3a322c]/50 mb-4">
        <div className="text-xs font-semibold text-[#c4b6a8] uppercase tracking-wider mb-3">
          {Chuoi.questHomNay}
        </div>

        <div className="space-y-2">
          {/* Habit Quest */}
          <div className="p-3 bg-[#0d0d0d] rounded-xl border border-[#3a322c]/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {hasHabitDone ? (
                <CheckCircle2 className="w-5 h-5 text-[#3d9a7a]" />
              ) : (
                <Circle className="w-5 h-5 text-[#c4b6a8]" />
              )}
              <div>
                <div className="text-xs font-semibold text-[#f3ece4]">
                  {Chuoi.thoiQuen} ({todayTicks.length} đã tick)
                </div>
                <div className="text-[10px] text-[#c4b6a8]">+{He.expTick} EXP mỗi tick</div>
              </div>
            </div>
            <span className="text-xs font-semibold text-[#ff7a00]">+{todayTicks.length * 10} EXP</span>
          </div>

          {/* Exercise Quest */}
          <div className="p-3 bg-[#0d0d0d] rounded-xl border border-[#3a322c]/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {hasTapDone ? (
                <CheckCircle2 className="w-5 h-5 text-[#3d9a7a]" />
              ) : (
                <Circle className="w-5 h-5 text-[#c4b6a8]" />
              )}
              <div>
                <div className="text-xs font-semibold text-[#f3ece4]">{Chuoi.tapHomNayQuest}</div>
                <div className="text-[10px] text-[#c4b6a8]">Ghi ít nhất 1 buổi tập</div>
              </div>
            </div>
            <span className="text-xs font-semibold text-[#ff7a00]">
              {hasTapDone ? 'Đã nhận' : '+20~50 EXP'}
            </span>
          </div>

          {/* Weight Quest */}
          <div className="p-3 bg-[#0d0d0d] rounded-xl border border-[#3a322c]/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {hasCanDone ? (
                <CheckCircle2 className="w-5 h-5 text-[#3d9a7a]" />
              ) : (
                <Circle className="w-5 h-5 text-[#c4b6a8]" />
              )}
              <div>
                <div className="text-xs font-semibold text-[#f3ece4]">{Chuoi.ghiCanQuest}</div>
                <div className="text-[10px] text-[#c4b6a8]">Ghi nhận số cân trong ngày</div>
              </div>
            </div>
            <span className="text-xs font-semibold text-[#ff7a00]">
              {hasCanDone ? 'Đã nhận' : `+${He.expCan} EXP`}
            </span>
          </div>
        </div>
      </div>

      {/* Skills (Kỹ) */}
      <div className="p-4 bg-[#161714] rounded-2xl border border-[#3a322c]/50 mb-4">
        <div className="text-xs font-semibold text-[#c4b6a8] uppercase tracking-wider mb-3">
          {Chuoi.kyNhan}
        </div>

        <div className="space-y-2">
          {/* Nhịp thở vững */}
          <div className="p-3 bg-[#0d0d0d] rounded-xl border border-[#3a322c]/40">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[#f3ece4]">{Chuoi.nhipThoVung}</span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  kyNhipThoVung
                    ? 'bg-[#3d9a7a]/20 text-[#3d9a7a]'
                    : 'bg-[#2a1c14] text-[#c4b6a8]'
                }`}
              >
                {kyNhipThoVung ? Chuoi.dangHieuLuc : Chuoi.tamYeu}
              </span>
            </div>
            <p className="text-[11px] text-[#c4b6a8] leading-relaxed">
              {Chuoi.nhipThoVungMoTa} (+5 sức tạm)
            </p>
          </div>

          {/* Bước đầu */}
          <div className="p-3 bg-[#0d0d0d] rounded-xl border border-[#3a322c]/40">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[#f3ece4]">{Chuoi.buocDau}</span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  kyBuocDau
                    ? 'bg-[#3d9a7a]/20 text-[#3d9a7a]'
                    : 'bg-[#2a1c14] text-[#c4b6a8]'
                }`}
              >
                {kyBuocDau ? Chuoi.dangHieuLuc : Chuoi.tamYeu}
              </span>
            </div>
            <p className="text-[11px] text-[#c4b6a8] leading-relaxed">
              {Chuoi.buocDauMoTa}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
