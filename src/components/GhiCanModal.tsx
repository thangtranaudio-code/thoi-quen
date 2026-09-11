import React, { useState } from 'react';
import { X, Check, Scale } from 'lucide-react';
import { Chuoi, So } from '../chuoi';
import { Ngay } from '../ngay';
import { StorageService } from '../storage';

interface GhiCanModalProps {
  selectedDate: Date;
  onClose: () => void;
  onSuccess: () => void;
}

export const GhiCanModal: React.FC<GhiCanModalProps> = ({
  selectedDate,
  onClose,
  onSuccess,
}) => {
  const data = StorageService.getData();
  const dateIso = Ngay.iso(selectedDate);
  const existingWeighIn = data.weighIns.find((w) => w.ngay === dateIso);
  const latest = existingWeighIn ?? data.weighIns[0];

  const [kgStr, setKgStr] = useState(
    existingWeighIn ? So.kg(existingWeighIn.kg) : latest ? So.kg(latest.kg) : ''
  );
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    const val = So.parseKg(kgStr);
    if (val === null) {
      setError('Cân nặng không hợp lệ (ví dụ: 68,5)');
      return;
    }

    StorageService.saveWeighIn(dateIso, val);
    onSuccess();
    onClose();
  };

  return (
    <div
      id="modal-ghi-can-backdrop"
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="modal-ghi-can-content"
        className="w-full max-w-sm bg-[#1a1a1a] rounded-2xl border border-[#3a322c] p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#3a322c]/50 mb-4">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#ff7a00]" />
            <h3 className="text-base font-semibold text-[#f3ece4]">{Chuoi.canHomNay}</h3>
          </div>
          <button
            id="nut-dong-ghi-can"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#c4b6a8] hover:text-[#f3ece4]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-[#c4b6a8] mb-3">
          {Chuoi.dongNgay(selectedDate)}
        </div>

        {error && (
          <div className="mb-3 p-2 bg-[#d94a38]/15 border border-[#d94a38]/40 rounded-lg text-xs text-[#d94a38]">
            {error}
          </div>
        )}

        <div className="flex items-center justify-center gap-2 my-4">
          <input
            id="input-so-kg"
            type="text"
            inputMode="decimal"
            value={kgStr}
            onChange={(e) => {
              setKgStr(e.target.value);
              setError(null);
            }}
            placeholder="65,0"
            className="w-36 text-3xl font-extrabold text-center py-2 bg-[#0d0d0d] text-[#f3ece4] border border-[#3a322c] rounded-xl focus:border-[#ff7a00] outline-none"
            autoFocus
          />
          <span className="text-xl font-bold text-[#c4b6a8]">{Chuoi.kg}</span>
        </div>

        {data.profile.targetKg && (
          <div className="text-xs text-[#c4b6a8] text-center mb-4">
            Mục tiêu: <span className="text-[#ff7a00] font-semibold">{So.kg(data.profile.targetKg)} kg</span>
          </div>
        )}

        <div className="flex items-center gap-2 mt-4">
          <button
            id="nut-huy-ghi-can"
            type="button"
            onClick={onClose}
            className="flex-1 min-h-[44px] px-3 py-2 bg-[#0d0d0d] text-[#c4b6a8] hover:text-[#f3ece4] border border-[#3a322c] rounded-xl text-sm font-medium transition-colors"
          >
            {Chuoi.huy}
          </button>
          <button
            id="nut-luu-ghi-can"
            type="button"
            onClick={handleSave}
            className="flex-1 min-h-[44px] px-3 py-2 bg-[#ff7a00] text-[#0d0d0d] hover:bg-[#ff7a00]/90 font-semibold rounded-xl text-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            {Chuoi.luu}
          </button>
        </div>
      </div>
    </div>
  );
};
