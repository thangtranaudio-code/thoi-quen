import React, { useState, useEffect } from 'react';
import { Sparkles, Volume2, VolumeX, X, Trophy, Heart, Award } from 'lucide-react';
import { CamXucService, PhanThuongItem } from '../services/camXucService';

export const PhanThuongCamXuc: React.FC = () => {
  const [activeReward, setActiveReward] = useState<PhanThuongItem | null>(null);
  const [showGrandModal, setShowGrandModal] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(CamXucService.isSoundEnabled());

  useEffect(() => {
    const unsub = CamXucService.subscribe((thuong) => {
      setActiveReward(thuong);
      if (thuong.loai === 'all_habits_done') {
        setShowGrandModal(true);
      }
    });
    return unsub;
  }, []);

  // Auto dismiss toast after 4 seconds
  useEffect(() => {
    if (!activeReward) return;
    const timer = setTimeout(() => {
      setActiveReward(null);
    }, 4200);
    return () => clearTimeout(timer);
  }, [activeReward]);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    CamXucService.setSoundEnabled(next);
  };

  return (
    <>
      {/* 1. FLOATING EMOTIONAL TOAST NOTIFICATION */}
      {activeReward && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1c1e26] via-[#16181f] to-[#1a1714] p-3.5 border border-[#ffaa00]/40 shadow-2xl backdrop-blur-md">
            {/* Ambient glow */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#ffaa00]/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-[#38b000]/15 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start gap-3 relative z-10">
              {/* Icon / Badge */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ffaa00]/20 to-[#ff6000]/30 border border-[#ffaa00]/50 flex items-center justify-center shrink-0 shadow-inner text-xl">
                {activeReward.bieuTuong}
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#ffaa00] uppercase tracking-wider">
                    {activeReward.tieuDe}
                  </span>
                  <span className="text-[10px] font-bold text-[#38b000] px-1.5 py-0.2 rounded-md bg-[#38b000]/15 border border-[#38b000]/30">
                    +{activeReward.diemThuong} EXP
                  </span>
                </div>

                {activeReward.tenDoiTuong && (
                  <div className="text-[11px] font-semibold text-[#f8f7f4] truncate mt-0.5">
                    {activeReward.tenDoiTuong}
                  </div>
                )}

                <p className="text-[11px] text-[#a6a39b] mt-1 leading-relaxed italic">
                  "{activeReward.thongDiep}"
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={toggleSound}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#a6a39b] hover:text-[#f8f7f4] hover:bg-[#252834] transition-colors"
                  title={soundOn ? 'Tắt âm thanh hiệu ứng' : 'Bật âm thanh hiệu ứng'}
                >
                  {soundOn ? (
                    <Volume2 className="w-3.5 h-3.5 text-[#ffaa00]" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-[#a6a39b]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveReward(null)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#a6a39b] hover:text-[#f8f7f4] hover:bg-[#252834] transition-colors"
                  title="Đóng"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sparkle decorative dots */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#2e313c]/50 text-[10px] text-[#a6a39b]">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-[#ff6000] fill-[#ff6000]" /> Giữ vững phong độ
              </span>
              <span className="flex items-center gap-1 text-[#ffaa00]">
                <Sparkles className="w-3 h-3" /> Chuỗi tích lũy tiếp diễn
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. GRAND CELEBRATION MODAL FOR 100% DAILY COMPLETION */}
      {showGrandModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-[#16181f] border border-[#ffaa00]/60 p-6 text-center shadow-2xl relative overflow-hidden">
            {/* Background ambient lighting */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-b from-[#ffaa00]/25 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ffaa00] to-[#ff6000] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#ffaa00]/30 text-black">
              <Trophy className="w-8 h-8 stroke-[2.5]" />
            </div>

            <span className="text-xs font-black uppercase tracking-widest text-[#ffaa00] px-3 py-1 rounded-full bg-[#ffaa00]/15 border border-[#ffaa00]/30 inline-block mb-2">
              Hoàn Thành 100% Ngày
            </span>

            <h3 className="text-xl font-bold text-[#f8f7f4] mb-2">
              Kỷ luật Đỉnh cao!
            </h3>

            <p className="text-xs text-[#a6a39b] leading-relaxed mb-5">
              Bạn đã hoàn tất mọi thói quen mục tiêu hôm nay. Sự kiên trì không ồn ào nhưng tạo nên những thay đổi bền bỉ và lớn lao nhất.
            </p>

            <div className="p-3 bg-[#0f1015] rounded-2xl border border-[#2e313c] mb-5 flex items-center justify-around">
              <div className="text-center">
                <div className="text-[10px] text-[#a6a39b]">Phần thưởng</div>
                <div className="text-sm font-black text-[#ffaa00] mt-0.5">+50 EXP</div>
              </div>
              <div className="h-6 w-px bg-[#2e313c]" />
              <div className="text-center">
                <div className="text-[10px] text-[#a6a39b]">Trạng thái</div>
                <div className="text-sm font-black text-[#38b000] mt-0.5">Trọn vẹn 100%</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGrandModal(false)}
              className="w-full py-3 bg-gradient-to-r from-[#ffaa00] to-[#ff6000] text-black font-black text-sm rounded-2xl shadow-lg active:scale-95 transition-transform"
            >
              Tiếp tục ngày tuyệt vời ✨
            </button>
          </div>
        </div>
      )}
    </>
  );
};
