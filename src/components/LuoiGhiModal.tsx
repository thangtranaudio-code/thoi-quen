import React from 'react';
import { Scale, Flame, Utensils, Ruler, Target, X } from 'lucide-react';
import { Chuoi } from '../chuoi';

interface LuoiGhiModalProps {
  dongNgay: string;
  khoaGhi: boolean;
  onClose: () => void;
  onChon: (loai: 'can' | 'tap' | 'nap' | 'chiSo') => void;
  onChonFocus?: () => void;
}

export const LuoiGhiModal: React.FC<LuoiGhiModalProps> = ({
  dongNgay,
  khoaGhi,
  onClose,
  onChon,
  onChonFocus,
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

        {/* Quick Focus Button */}
        {onChonFocus && (
          <button
            id="nut-ghi-nhanh-focus"
            type="button"
            onClick={() => {
              onClose();
              onChonFocus();
            }}
            className="w-full mb-3 p-3 bg-gradient-to-r from-[#2a1c14] to-[#1f1610] hover:from-[#352319] hover:to-[#2a1c14] border border-[#ff7a00]/60 rounded-xl flex items-center justify-between transition-colors active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#ff7a00] text-[#0c0d0b] flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-[#f3ece4]">Đặt lịch Focus</div>
                <div className="text-[11px] text-[#ff7a00]">Khung giờ làm việc quan trọng & ưu tiên</div>
              </div>
            </div>
            <span className="text-xs font-semibold text-[#ff7a00]">Mở Focus →</span>
          </button>
        )}

        <div className="grid grid-cols-2 gap-3">
          {/* Cân nặng */}
          <button
            id="nut-ghi-can"
            type="button"
            onClick={() => onChon('can')}
            className="min-h-[80px] p-3.5 bg-[#0d0d0d] hover:bg-[#2a1c14] border border-[#3a322c]/60 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center transition-colors active:scale-98"
          >
            <Scale className="w-5 h-5 text-[#ff7a00]" />
            <span className="text-sm font-semibold text-[#f3ece4] leading-tight">
              {Chuoi.canNang}
            </span>
          </button>

          {/* Hoạt động (Tập) */}
          <button
            id="nut-ghi-tap"
            type="button"
            onClick={() => onChon('tap')}
            className="min-h-[80px] p-3.5 bg-[#0d0d0d] hover:bg-[#2a1c14] border border-[#3a322c]/60 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center transition-colors active:scale-98"
          >
            <Flame className="w-5 h-5 text-[#ffb000]" />
            <span className="text-sm font-semibold text-[#f3ece4] leading-tight">
              {Chuoi.hoatDongO}
            </span>
          </button>

          {/* Nhật ký (Ăn) */}
          <button
            id="nut-ghi-nap"
            type="button"
            onClick={() => onChon('nap')}
            className="min-h-[80px] p-3.5 bg-[#0d0d0d] hover:bg-[#2a1c14] border border-[#3a322c]/60 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center transition-colors active:scale-98"
          >
            <Utensils className="w-5 h-5 text-[#3d9a7a]" />
            <span className="text-sm font-semibold text-[#f3ece4] leading-tight">
              {Chuoi.nhatKy}
            </span>
          </button>

          {/* Chỉ số (Số đo) */}
          <button
            id="nut-ghi-chi-so"
            type="button"
            onClick={() => onChon('chiSo')}
            className="min-h-[80px] p-3.5 bg-[#0d0d0d] hover:bg-[#2a1c14] border border-[#3a322c]/60 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center transition-colors active:scale-98"
          >
            <Ruler className="w-5 h-5 text-[#c4b6a8]" />
            <span className="text-sm font-semibold text-[#f3ece4] leading-tight">
              {Chuoi.chiSo}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
