import React, { useState } from 'react';
import { X, Check, Ruler } from 'lucide-react';
import { Chuoi } from '../chuoi';
import { Ngay } from '../ngay';
import { StorageService } from '../storage';

interface GhiChiSoModalProps {
  selectedDate: Date;
  onClose: () => void;
  onSuccess: () => void;
}

export const GhiChiSoModal: React.FC<GhiChiSoModalProps> = ({
  selectedDate,
  onClose,
  onSuccess,
}) => {
  const data = StorageService.getData();
  const dateIso = Ngay.iso(selectedDate);
  const existing = data.chiSoIns.find((c) => c.ngay === dateIso);

  const [eo, setEo] = useState(existing?.eo?.toString() ?? '');
  const [hong, setHong] = useState(existing?.hong?.toString() ?? '');
  const [nguc, setNguc] = useState(existing?.nguc?.toString() ?? '');
  const [bapTay, setBapTay] = useState(existing?.bapTay?.toString() ?? '');

  const handleSave = () => {
    StorageService.saveChiSo(dateIso, {
      eo: eo ? parseFloat(eo) : null,
      hong: hong ? parseFloat(hong) : null,
      nguc: nguc ? parseFloat(nguc) : null,
      bapTay: bapTay ? parseFloat(bapTay) : null,
    });
    onSuccess();
    onClose();
  };

  return (
    <div
      id="modal-ghi-chi-so-backdrop"
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="modal-ghi-chi-so-content"
        className="w-full max-w-sm bg-[#1a1a1a] rounded-2xl border border-[#3a322c] p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#3a322c]/50 mb-3">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-[#c4b6a8]" />
            <h3 className="text-base font-semibold text-[#f3ece4]">{Chuoi.chiSo}</h3>
          </div>
          <button
            id="nut-dong-ghi-chi-so"
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

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <label className="block text-xs font-medium text-[#c4b6a8] mb-1">{Chuoi.eoCm} (cm)</label>
            <input
              type="number"
              value={eo}
              onChange={(e) => setEo(e.target.value)}
              placeholder="75"
              className="w-full px-3 py-2 bg-[#0d0d0d] text-[#f3ece4] border border-[#3a322c] rounded-xl text-sm font-semibold outline-none focus:border-[#ff7a00]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#c4b6a8] mb-1">{Chuoi.hongCm} (cm)</label>
            <input
              type="number"
              value={hong}
              onChange={(e) => setHong(e.target.value)}
              placeholder="95"
              className="w-full px-3 py-2 bg-[#0d0d0d] text-[#f3ece4] border border-[#3a322c] rounded-xl text-sm font-semibold outline-none focus:border-[#ff7a00]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#c4b6a8] mb-1">{Chuoi.ngucCm} (cm)</label>
            <input
              type="number"
              value={nguc}
              onChange={(e) => setNguc(e.target.value)}
              placeholder="90"
              className="w-full px-3 py-2 bg-[#0d0d0d] text-[#f3ece4] border border-[#3a322c] rounded-xl text-sm font-semibold outline-none focus:border-[#ff7a00]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#c4b6a8] mb-1">{Chuoi.bapTayCm} (cm)</label>
            <input
              type="number"
              value={bapTay}
              onChange={(e) => setBapTay(e.target.value)}
              placeholder="30"
              className="w-full px-3 py-2 bg-[#0d0d0d] text-[#f3ece4] border border-[#3a322c] rounded-xl text-sm font-semibold outline-none focus:border-[#ff7a00]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
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
      </div>
    </div>
  );
};
