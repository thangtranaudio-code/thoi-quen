import React, { useState } from 'react';
import { X, Check, Flame, Trash2 } from 'lucide-react';
import { Chuoi } from '../chuoi';
import { CongThuc } from '../cong_thuc';
import { Ngay } from '../ngay';
import { StorageService } from '../storage';

interface GhiTapModalProps {
  selectedDate: Date;
  onClose: () => void;
  onSuccess: () => void;
}

export const GhiTapModal: React.FC<GhiTapModalProps> = ({
  selectedDate,
  onClose,
  onSuccess,
}) => {
  const [loai, setLoai] = useState<string>('di_bo');
  const [phut, setPhut] = useState<number>(30);
  const data = StorageService.getData();
  const dateIso = Ngay.iso(selectedDate);

  const dayTapIns = data.tapIns.filter((t) => t.ngay === dateIso);
  const latestWeight = StorageService.getLatestWeighIn()?.kg ?? data.profile.startKg ?? null;

  const met = CongThuc.metCua(loai) ?? 5.0;
  const estimatedKcal = latestWeight
    ? Math.round(CongThuc.kcalTap({ met, kg: latestWeight, phut }) ?? 0)
    : null;

  const handleSave = () => {
    if (phut <= 0) return;
    StorageService.addTapIn(dateIso, loai, phut);
    onSuccess();
    onClose();
  };

  const handleDelete = (id: number) => {
    StorageService.deleteTapIn(id);
    onSuccess();
  };

  return (
    <div
      id="modal-ghi-tap-backdrop"
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="modal-ghi-tap-content"
        className="w-full max-w-md bg-[#1a1a1a] rounded-2xl border border-[#3a322c] p-5 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#3a322c]/50 mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#ffb000]" />
            <h3 className="text-base font-semibold text-[#f3ece4]">{Chuoi.hoatDongO}</h3>
          </div>
          <button
            id="nut-dong-ghi-tap"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#c4b6a8] hover:text-[#f3ece4]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-[#c4b6a8] mb-4">
          {Chuoi.dongNgay(selectedDate)}
        </div>

        {/* Sport selection grid */}
        <label className="block text-xs font-medium text-[#c4b6a8] mb-2">Loại hoạt động</label>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {CongThuc.mon.map((m) => (
            <button
              key={m.loai}
              type="button"
              onClick={() => setLoai(m.loai)}
              className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                loai === m.loai
                  ? 'bg-[#ff7a00]/15 border-[#ff7a00] text-[#ff7a00]'
                  : 'bg-[#0d0d0d] border-[#3a322c] text-[#f3ece4] hover:bg-[#2a1c14]'
              }`}
            >
              <span>{m.ten}</span>
              <span className="text-[10px] text-[#c4b6a8]/70">MET {m.met}</span>
            </button>
          ))}
        </div>

        {/* Minutes input */}
        <div className="mb-4 p-3 bg-[#0d0d0d] rounded-xl border border-[#3a322c]/60 flex items-center justify-between">
          <span className="text-xs text-[#c4b6a8]">Thời gian tập</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={phut}
              onChange={(e) => setPhut(parseInt(e.target.value, 10) || 1)}
              min={1}
              max={360}
              className="w-20 px-2 py-1.5 bg-[#1a1a1a] text-[#f3ece4] border border-[#3a322c] rounded-lg text-center text-sm font-bold focus:border-[#ff7a00] outline-none"
            />
            <span className="text-xs text-[#c4b6a8]">{Chuoi.phut}</span>
          </div>
        </div>

        {/* Estimated burn */}
        {estimatedKcal !== null && (
          <div className="mb-4 text-center text-xs text-[#ffb000] font-medium">
            Ước tính tiêu thụ: <span className="font-bold">~{estimatedKcal} kcal</span> (MET {met})
          </div>
        )}

        <div className="flex items-center gap-2 mb-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-[44px] px-3 py-2 bg-[#0d0d0d] text-[#c4b6a8] hover:text-[#f3ece4] border border-[#3a322c] rounded-xl text-sm font-medium"
          >
            {Chuoi.huy}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 min-h-[44px] px-3 py-2 bg-[#ff7a00] text-[#0d0d0d] hover:bg-[#ff7a00]/90 font-semibold rounded-xl text-sm flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            {Chuoi.luu}
          </button>
        </div>

        {/* Day's workouts list */}
        {dayTapIns.length > 0 && (
          <div className="border-t border-[#3a322c]/50 pt-3">
            <div className="text-xs font-semibold text-[#c4b6a8] mb-2">Đã tập trong ngày</div>
            <div className="space-y-1.5">
              {dayTapIns.map((t) => (
                <div
                  key={t.id}
                  className="p-2.5 bg-[#0d0d0d] rounded-lg border border-[#3a322c]/40 flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-[#f3ece4]">
                    {Chuoi.tenMon(t.loai)} · {t.phut} {Chuoi.phut}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(t.id)}
                    className="text-[#d94a38] p-1 hover:bg-[#d94a38]/10 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
