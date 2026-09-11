import React from 'react';
import { Scale, Flame, Utensils, Ruler, X } from 'lucide-react';
import { Chuoi } from '../chuoi';

interface LuoiGhiModalProps {
  dongNgay: string;
  khoaGhi: boolean;
  onClose: () => void;
  onChon: (loai: 'can' | 'tap' | 'nap' | 'chiSo') => void;
}

export const LuoiGhiModal: React.FC<LuoiGhiModalProps> = ({
  dongNgay,
  khoaGhi,
  onClose,
  onChon,
}) => {
  return (
    <div
      id="modal-luoi-ghi-backdrop"
      className="fixed inset-0 z-50 bg-black/75 flex items-end justify-center p-0 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="modal-luoi-ghi-content"
        className="w-full max-w-lg bg-[#1a1a1a] rounded-t-2xl border-t border-[#3a322c] p-5 pb-8 animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#3a322c]/40 mb-4">
          <div>
            <div className="text-sm font-medium text-[#f3ece4]">{dongNgay}</div>
            {khoaGhi && (
              <div className="text-xs text-[#d94a38] font-medium mt-0.5">{Chuoi.chiXem}</div>
            )}
          </div>
          <button
            id="nut-dong-luoi-ghi"
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#c4b6a8] hover:text-[#f3ece4] hover:bg-[#2a1c14]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Cân nặng */}
          <button
            id="nut-ghi-can"
            type="button"
            onClick={() => onChon('can')}
            className="min-h-[88px] p-4 bg-[#0d0d0d] hover:bg-[#2a1c14] border border-[#3a322c]/60 rounded-xl flex flex-col items-center justify-center gap-2 text-center transition-colors active:scale-98"
          >
            <Scale className="w-6 h-6 text-[#ff7a00]" />
            <span className="text-sm font-semibold text-[#f3ece4] leading-tight">
              {Chuoi.canNang}
            </span>
          </button>

          {/* Hoạt động (Tập) */}
          <button
            id="nut-ghi-tap"
            type="button"
            onClick={() => onChon('tap')}
            className="min-h-[88px] p-4 bg-[#0d0d0d] hover:bg-[#2a1c14] border border-[#3a322c]/60 rounded-xl flex flex-col items-center justify-center gap-2 text-center transition-colors active:scale-98"
          >
            <Flame className="w-6 h-6 text-[#ffb000]" />
            <span className="text-sm font-semibold text-[#f3ece4] leading-tight">
              {Chuoi.hoatDongO}
            </span>
          </button>

          {/* Nhật ký (Ăn) */}
          <button
            id="nut-ghi-nap"
            type="button"
            onClick={() => onChon('nap')}
            className="min-h-[88px] p-4 bg-[#0d0d0d] hover:bg-[#2a1c14] border border-[#3a322c]/60 rounded-xl flex flex-col items-center justify-center gap-2 text-center transition-colors active:scale-98"
          >
            <Utensils className="w-6 h-6 text-[#3d9a7a]" />
            <span className="text-sm font-semibold text-[#f3ece4] leading-tight">
              {Chuoi.nhatKy}
            </span>
          </button>

          {/* Chỉ số (Số đo) */}
          <button
            id="nut-ghi-chi-so"
            type="button"
            onClick={() => onChon('chiSo')}
            className="min-h-[88px] p-4 bg-[#0d0d0d] hover:bg-[#2a1c14] border border-[#3a322c]/60 rounded-xl flex flex-col items-center justify-center gap-2 text-center transition-colors active:scale-98"
          >
            <Ruler className="w-6 h-6 text-[#c4b6a8]" />
            <span className="text-sm font-semibold text-[#f3ece4] leading-tight">
              {Chuoi.chiSo}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
