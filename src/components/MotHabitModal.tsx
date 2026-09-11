import React, { useState } from 'react';
import { X, Edit2, Trash2, Flame, Award } from 'lucide-react';
import { Habit } from '../types';
import { Chuoi } from '../chuoi';
import { Ngay } from '../ngay';
import { CongThuc } from '../cong_thuc';
import { StorageService } from '../storage';

interface MotHabitModalProps {
  habit: Habit;
  selectedDate: Date;
  onClose: () => void;
  onEdit: () => void;
  onDeleted: () => void;
}

export const MotHabitModal: React.FC<MotHabitModalProps> = ({
  habit,
  selectedDate,
  onClose,
  onEdit,
  onDeleted,
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Month days
  const prefixThang = Ngay.prefixThang(selectedDate);
  const allTicks = StorageService.getTicksForHabit(habit.id);
  const tickDates = new Set(allTicks.map((t) => t.ngay));

  const monthDays = Ngay.cacNgayThang(selectedDate);
  const ticksThisMonth = monthDays.filter((d) => tickDates.has(Ngay.iso(d))).length;

  const remaining = Math.max(0, habit.mucTieuThang - ticksThisMonth);
  const streak = Ngay.chuoiLienTiep(tickDates, new Date());

  // Calorie calculation if exercise
  const profile = StorageService.getProfile();
  const latestWeight = StorageService.getLatestWeighIn()?.kg ?? profile.startKg ?? null;
  const kcalPerSession = habit.met && habit.phutMacDinh && latestWeight
    ? Math.round(CongThuc.kcalTap({ met: habit.met, kg: latestWeight, phut: habit.phutMacDinh }) ?? 0)
    : null;

  const handleDelete = () => {
    StorageService.deleteHabit(habit.id);
    onDeleted();
    onClose();
  };

  return (
    <div
      id="modal-mot-habit-backdrop"
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="modal-mot-habit-content"
        className="w-full max-w-md bg-[#1a1a1a] rounded-2xl border border-[#3a322c] p-5 shadow-2xl animate-in fade-in duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#3a322c]/50 mb-4">
          <div className="flex-1 pr-2">
            <h3 className="text-lg font-bold text-[#f3ece4] leading-snug">{habit.ten}</h3>
            <span className="text-xs text-[#c4b6a8]">
              {Chuoi.dongNgay(selectedDate)}
            </span>
          </div>
          <button
            id="nut-dong-mot-habit"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#c4b6a8] hover:text-[#f3ece4]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Row: Streak & Target */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-[#0d0d0d] p-3 rounded-xl border border-[#3a322c]/60 flex items-center gap-2.5">
            <Flame className="w-5 h-5 text-[#ff7a00] shrink-0" />
            <div>
              <div className="text-[11px] text-[#c4b6a8] font-medium">{Chuoi.chuoiNgay}</div>
              <div className="text-sm font-bold text-[#f3ece4]">
                {Chuoi.chuoiNNgay(streak)}
              </div>
            </div>
          </div>

          <div className="bg-[#0d0d0d] p-3 rounded-xl border border-[#3a322c]/60 flex items-center gap-2.5">
            <Award className="w-5 h-5 text-[#3d9a7a] shrink-0" />
            <div>
              <div className="text-[11px] text-[#c4b6a8] font-medium">{Chuoi.mucTieu}</div>
              <div className="text-sm font-bold text-[#f3ece4]">
                {ticksThisMonth}/{habit.mucTieuThang}
              </div>
            </div>
          </div>
        </div>

        {/* Progress note */}
        <div className="mb-4 text-center">
          <span className="text-xs font-medium text-[#c4b6a8]">
            {Chuoi.conKDatN(remaining, habit.mucTieuThang)}
          </span>
          {kcalPerSession !== null && (
            <span className="text-xs text-[#ffb000] ml-2">
              · ~{kcalPerSession} kcal/{Chuoi.phut}
            </span>
          )}
        </div>

        {/* Month 28-31 Day Grid */}
        <div className="bg-[#0d0d0d] p-3 rounded-xl border border-[#3a322c]/60 mb-5">
          <div className="text-xs font-semibold text-[#c4b6a8] mb-2.5">
            {Chuoi.thang(selectedDate.getMonth() + 1)} / {selectedDate.getFullYear()}
          </div>
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {monthDays.map((d) => {
              const isTicked = tickDates.has(Ngay.iso(d));
              const isToday = Ngay.cungNgay(d, new Date());
              return (
                <div
                  key={d.getDate()}
                  className={`h-8 rounded-lg flex flex-col items-center justify-center text-[11px] font-medium transition-colors ${
                    isTicked
                      ? 'bg-[#3d9a7a] text-[#0d0d0d] font-bold'
                      : isToday
                      ? 'border border-[#ff7a00] text-[#f3ece4]'
                      : 'bg-[#1a1a1a] text-[#c4b6a8]/70'
                  }`}
                >
                  {d.getDate()}
                </div>
              );
            })}
          </div>
        </div>

        {/* Delete confirmation or buttons */}
        {showConfirmDelete ? (
          <div className="p-3 bg-[#d94a38]/10 border border-[#d94a38]/40 rounded-xl mb-2">
            <p className="text-xs font-medium text-[#f3ece4] text-center mb-3">
              {Chuoi.xoaKhoiMay}
            </p>
            <div className="flex gap-2">
              <button
                id="nut-huy-xoa-habit"
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="flex-1 py-2 bg-[#1a1a1a] text-[#c4b6a8] hover:text-[#f3ece4] rounded-lg text-xs font-medium"
              >
                {Chuoi.huy}
              </button>
              <button
                id="nut-xac-nhan-xoa-habit"
                type="button"
                onClick={handleDelete}
                className="flex-1 py-2 bg-[#d94a38] text-white font-semibold rounded-lg text-xs"
              >
                {Chuoi.xoa}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              id="nut-sua-habit"
              type="button"
              onClick={() => {
                onClose();
                onEdit();
              }}
              className="flex-1 min-h-[44px] py-2 bg-[#0d0d0d] hover:bg-[#2a1c14] border border-[#3a322c] text-[#f3ece4] rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              {Chuoi.sua}
            </button>
            <button
              id="nut-mo-xoa-habit"
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              className="flex-1 min-h-[44px] py-2 bg-[#0d0d0d] hover:bg-[#d94a38]/15 border border-[#3a322c] text-[#d94a38] rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {Chuoi.xoa}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
