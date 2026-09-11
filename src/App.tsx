import React, { useState, useEffect } from 'react';
import { StorageService } from './storage';
import { Ngay } from './ngay';
import { Chuoi } from './chuoi';
import { ThanhDay } from './components/ThanhDay';
import { LuoiGhiModal } from './components/LuoiGhiModal';
import { GhiCanModal } from './components/GhiCanModal';
import { GhiTapModal } from './components/GhiTapModal';
import { GhiNapModal } from './components/GhiNapModal';
import { GhiChiSoModal } from './components/GhiChiSoModal';
import { ManHomNay } from './screens/ManHomNay';
import { ManLich } from './screens/ManLich';
import { ManTienDo } from './screens/ManTienDo';
import { ManHe } from './screens/ManHe';
import { ManTaiKhoan } from './screens/ManTaiKhoan';
import { Sparkles, X } from 'lucide-react';

export const App: React.FC = () => {
  const [tab, setTab] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showLuoiGhi, setShowLuoiGhi] = useState(false);
  const [activeModal, setActiveModal] = useState<'can' | 'tap' | 'nap' | 'chiSo' | null>(null);
  const [, setTick] = useState(0);

  // Subscribe to storage changes
  useEffect(() => {
    const unsub = StorageService.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsub;
  }, []);

  const levelUpMoment = StorageService.getLevelUpMoment();
  const dateIso = Ngay.iso(selectedDate);
  const khoaGhi = !Ngay.ghiDuoc(selectedDate, new Date());

  const handleOpenModal = (loai: 'can' | 'tap' | 'nap' | 'chiSo') => {
    setShowLuoiGhi(false);
    setActiveModal(loai);
  };

  return (
    <div className="min-h-screen bg-[#0c0d0b] text-[#e7e4dc] font-sans antialiased flex flex-col selection:bg-[#ff7a00] selection:text-black">
      {/* Level Up Celebration Toast */}
      {levelUpMoment && (
        <div
          id="toast-len-cap"
          className="fixed top-4 left-4 right-4 z-50 max-w-sm mx-auto bg-[#161714] border-2 border-[#ff7a00] rounded-2xl p-4 shadow-2xl flex items-center justify-between animate-in slide-in-from-top duration-300"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-[#ffb000] shrink-0 animate-spin" />
            <div>
              <div className="text-xs font-black uppercase text-[#ff7a00] tracking-wider">
                Lên cấp mới!
              </div>
              <div className="text-xs font-semibold text-[#f3ece4] mt-0.5">
                {levelUpMoment}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => StorageService.clearLevelUpMoment()}
            className="w-7 h-7 rounded-full bg-[#2a1c14] text-[#c4b6a8] flex items-center justify-center hover:text-[#f3ece4]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-lg mx-auto">
        {tab === 0 && (
          <ManHomNay
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onOpenTienDo={() => setTab(2)}
          />
        )}
        {tab === 1 && (
          <ManLich
            selectedDate={selectedDate}
            onSelectDate={(d) => {
              setSelectedDate(d);
              setTab(0); // Switch to Home on date tap as in Flutter
            }}
          />
        )}
        {tab === 2 && (
          <ManTienDo
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        )}
        {tab === 3 && <ManHe />}
        {tab === 4 && <ManTaiKhoan />}
      </main>

      {/* Bottom Navigation Bar */}
      <ThanhDay
        tab={tab}
        onTab={setTab}
        onCong={() => setShowLuoiGhi(true)}
      />

      {/* Quick Add Sheet (+) */}
      {showLuoiGhi && (
        <LuoiGhiModal
          dongNgay={Chuoi.dongNgay(selectedDate)}
          khoaGhi={khoaGhi}
          onClose={() => setShowLuoiGhi(false)}
          onChon={handleOpenModal}
        />
      )}

      {/* Sub Modals */}
      {activeModal === 'can' && (
        <GhiCanModal
          selectedDate={selectedDate}
          onClose={() => setActiveModal(null)}
          onSuccess={() => {}}
        />
      )}

      {activeModal === 'tap' && (
        <GhiTapModal
          selectedDate={selectedDate}
          onClose={() => setActiveModal(null)}
          onSuccess={() => {}}
        />
      )}

      {activeModal === 'nap' && (
        <GhiNapModal
          selectedDate={selectedDate}
          onClose={() => setActiveModal(null)}
          onSuccess={() => {}}
        />
      )}

      {activeModal === 'chiSo' && (
        <GhiChiSoModal
          selectedDate={selectedDate}
          onClose={() => setActiveModal(null)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
};
