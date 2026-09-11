import React, { useState } from 'react';
import { Minus, Plus, X, Check, Flame } from 'lucide-react';
import { Habit } from '../types';
import { Chuoi, Ten } from '../chuoi';
import { StorageService } from '../storage';

interface ThemHabitModalProps {
  habitToEdit?: Habit | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ThemHabitModal: React.FC<ThemHabitModalProps> = ({
  habitToEdit,
  onClose,
  onSuccess,
}) => {
  const [ten, setTen] = useState(habitToEdit?.ten ?? '');
  const [mucTieu, setMucTieu] = useState(habitToEdit?.mucTieuThang ?? 25);
  const [isVanDong, setIsVanDong] = useState(habitToEdit?.met != null);
  const [phut, setPhut] = useState(habitToEdit?.phutMacDinh ?? 30);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    const cleanTen = Ten.sach(ten);
    if (!cleanTen) {
      setError('Vui lòng nhập tên thói quen');
      return;
    }

    if (habitToEdit) {
      const ok = StorageService.updateHabit(habitToEdit.id, {
        ten: cleanTen,
        mucTieuThang: mucTieu,
        met: isVanDong ? 5.5 : null,
        phutMacDinh: isVanDong ? phut : null,
      });
      if (!ok) {
        setError(Chuoi.daCoThoiQuen);
        return;
      }
    } else {
      const newHabit = StorageService.addHabit({
        ten: cleanTen,
        mucTieuThang: mucTieu,
        met: isVanDong ? 5.5 : null,
        phutMacDinh: isVanDong ? phut : null,
      });
      if (!newHabit) {
        setError(Chuoi.daCoThoiQuen);
        return;
      }
    }

    onSuccess();
    onClose();
  };

  return (
    <div
      id="modal-them-habit-backdrop"
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="modal-them-habit-content"
        className="w-full max-w-md bg-[#1a1a1a] rounded-2xl border border-[#3a322c] p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#3a322c]/50 mb-4">
          <h3 className="text-base font-semibold text-[#f3ece4]">
            {habitToEdit ? Chuoi.sua : Chuoi.themThoiQuen}
          </h3>
          <button
            id="nut-dong-them-habit"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#c4b6a8] hover:text-[#f3ece4]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#d94a38]/15 border border-[#d94a38]/40 rounded-xl text-xs text-[#d94a38] font-medium">
            {error}
          </div>
        )}

        {/* Name input */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-[#c4b6a8] mb-1.5">
            {Chuoi.tenThoiQuen}
          </label>
          <input
            id="input-ten-habit"
            type="text"
            value={ten}
            onChange={(e) => {
              setTen(e.target.value);
              setError(null);
            }}
            placeholder="Ví dụ: Đọc sách, Đi bộ 5000 bước..."
            className="w-full px-3.5 py-3 bg-[#0d0d0d] text-[#f3ece4] border border-[#3a322c] rounded-xl text-sm focus:border-[#ff7a00] outline-none placeholder-[#c4b6a8]/50"
            autoFocus
          />
        </div>

        {/* Monthly Target Stepper */}
        <div className="mb-5 p-4 bg-[#0d0d0d] rounded-xl border border-[#3a322c]/60">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-[#c4b6a8] font-medium">{Chuoi.mucTieu}</div>
              <div className="text-sm font-semibold text-[#f3ece4] mt-0.5">
                {Chuoi.nNgayTrongThang(mucTieu)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="nut-giam-muc-tieu"
                type="button"
                onClick={() => setMucTieu((prev) => Math.max(1, prev - 1))}
                className="w-9 h-9 rounded-lg bg-[#1a1a1a] text-[#f3ece4] border border-[#3a322c] flex items-center justify-center active:scale-95 transition-transform"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center text-base font-bold text-[#ff7a00]">
                {mucTieu}
              </span>
              <button
                id="nut-tang-muc-tieu"
                type="button"
                onClick={() => setMucTieu((prev) => Math.min(31, prev + 1))}
                className="w-9 h-9 rounded-lg bg-[#1a1a1a] text-[#f3ece4] border border-[#3a322c] flex items-center justify-center active:scale-95 transition-transform"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Exercise Toggle (Vận động) */}
        <div className="mb-5 p-4 bg-[#0d0d0d] rounded-xl border border-[#3a322c]/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#ffb000]" />
              <div>
                <div className="text-sm font-medium text-[#f3ece4]">{Chuoi.vanDong}</div>
                <div className="text-[11px] text-[#c4b6a8]">Tính calo tiêu hao (MET 5.5)</div>
              </div>
            </div>
            <input
              id="checkbox-van-dong"
              type="checkbox"
              checked={isVanDong}
              onChange={(e) => setIsVanDong(e.target.checked)}
              className="w-5 h-5 accent-[#ff7a00] rounded cursor-pointer"
            />
          </div>

          {isVanDong && (
            <div className="mt-3 pt-3 border-t border-[#3a322c]/40 flex items-center justify-between">
              <span className="text-xs text-[#c4b6a8]">Thời gian mặc định</span>
              <div className="flex items-center gap-1.5">
                <input
                  id="input-phut-van-dong"
                  type="number"
                  value={phut}
                  onChange={(e) => setPhut(parseInt(e.target.value, 10) || 15)}
                  className="w-16 px-2 py-1 bg-[#1a1a1a] text-[#f3ece4] border border-[#3a322c] rounded-lg text-center text-xs font-semibold focus:border-[#ff7a00] outline-none"
                />
                <span className="text-xs text-[#c4b6a8]">{Chuoi.phut}</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <button
            id="nut-huy-them-habit"
            type="button"
            onClick={onClose}
            className="flex-1 min-h-[44px] px-4 py-2.5 bg-[#0d0d0d] text-[#c4b6a8] hover:text-[#f3ece4] border border-[#3a322c] rounded-xl text-sm font-medium transition-colors"
          >
            {Chuoi.huy}
          </button>
          <button
            id="nut-luu-them-habit"
            type="button"
            onClick={handleSave}
            className="flex-1 min-h-[44px] px-4 py-2.5 bg-[#ff7a00] text-[#0d0d0d] hover:bg-[#ff7a00]/90 font-semibold rounded-xl text-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            {Chuoi.luu}
          </button>
        </div>
      </div>
    </div>
  );
};
