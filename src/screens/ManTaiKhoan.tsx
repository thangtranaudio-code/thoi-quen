import React, { useState } from 'react';
import { User, Download, Upload, Trash2, HelpCircle, ShieldAlert, ChevronRight, Check } from 'lucide-react';
import { Chuoi, So } from '../chuoi';
import { CongThuc } from '../cong_thuc';
import { StorageService } from '../storage';
import { ManHoSoModal } from '../components/ManHoSoModal';

export const ManTaiKhoan: React.FC = () => {
  const [showHoSo, setShowHoSo] = useState(false);
  const [showNguon, setShowNguon] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const data = StorageService.getData();
  const profile = data.profile;
  const currentWeight = StorageService.getLatestWeighIn()?.kg ?? profile.startKg ?? null;
  const targetWeight = profile.targetKg ?? null;

  // Local target form states
  const [targetInput, setTargetInput] = useState(targetWeight ? So.kg(targetWeight) : '');
  const [nhipVal, setNhipVal] = useState(profile.nhipKg ?? 0.5);

  const handleSaveTarget = () => {
    const parsed = So.parseKg(targetInput);
    StorageService.updateProfile({
      targetKg: parsed,
      nhipKg: nhipVal,
    });
    setNotification('Đã lưu mục tiêu.');
    setTimeout(() => setNotification(null), 2500);
  };

  // Calculations
  const age = CongThuc.tuoi(profile.dob, new Date());
  const bmiVal = CongThuc.bmi(currentWeight, profile.heightCm);
  const bmiLabel = CongThuc.bmiNhan(bmiVal);
  const bmrVal = CongThuc.bmr({
    sex: profile.sex,
    kg: currentWeight,
    cm: profile.heightCm,
    tuoi: age,
  });
  const tdeeVal = CongThuc.tdee(bmrVal, profile.activity);
  const suggestedKcal = CongThuc.kcalGoiY({
    tdee: tdeeVal,
    nhip: profile.nhipKg,
    kg: currentWeight,
    target: targetWeight,
  });

  // Export JSON backup
  const handleExport = () => {
    const jsonStr = StorageService.exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thoi_quen_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setNotification(Chuoi.daXuat);
    setTimeout(() => setNotification(null), 2500);
  };

  // Restore JSON backup
  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        const ok = confirm(`${Chuoi.khoiPhuc}?\n\n${Chuoi.thayToanBo}`);
        if (ok) {
          const success = StorageService.restoreBackup(content);
          if (success) {
            setNotification(Chuoi.daKhoiPhuc);
          } else {
            alert(Chuoi.fileKhongPhaiBanSao);
          }
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    StorageService.resetAll();
    setShowConfirmReset(false);
    setNotification('Đã xoá hết dữ liệu.');
    setTimeout(() => setNotification(null), 2500);
  };

  return (
    <div id="man-tai-khoan" className="flex flex-col min-h-full pb-20 px-4 pt-3 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#f3ece4]">{Chuoi.taiKhoan}</h1>
          <p className="text-xs text-[#c4b6a8] mt-0.5">{Chuoi.duLieuChiTrenMay}</p>
        </div>
      </div>

      {notification && (
        <div className="mb-4 p-3 bg-[#3d9a7a]/20 border border-[#3d9a7a]/50 rounded-xl text-xs font-semibold text-[#3d9a7a] flex items-center gap-2">
          <Check className="w-4 h-4" />
          {notification}
        </div>
      )}

      {/* Info notice: 2 máy cùng ghi sẽ lệch */}
      <div className="p-3 bg-[#161714] rounded-xl border border-[#3a322c]/40 mb-4 text-xs text-[#c4b6a8] leading-relaxed">
        {Chuoi.haiMayLech}
      </div>

      {/* Profile & Target summary */}
      <div className="p-4 bg-[#161714] rounded-2xl border border-[#3a322c]/50 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#ff7a00]" />
            <span className="text-xs font-semibold text-[#c4b6a8] uppercase tracking-wider">
              {Chuoi.hoSoChiSo}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowHoSo(true)}
            className="text-xs text-[#ff7a00] font-semibold hover:underline flex items-center gap-0.5"
          >
            Chỉnh sửa <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Target Weight & Pace inline inputs */}
        <div className="grid grid-cols-2 gap-2 my-2">
          <div>
            <label className="block text-[11px] text-[#c4b6a8] mb-1">{Chuoi.canDich} (kg)</label>
            <input
              type="text"
              inputMode="decimal"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              placeholder="65,0"
              className="w-full px-3 py-2 bg-[#0d0d0d] text-[#f3ece4] border border-[#3a322c] rounded-xl text-xs font-semibold outline-none focus:border-[#ff7a00]"
            />
          </div>
          <div>
            <label className="block text-[11px] text-[#c4b6a8] mb-1">{Chuoi.nhipTuan}</label>
            <select
              value={nhipVal}
              onChange={(e) => setNhipVal(parseFloat(e.target.value))}
              className="w-full px-3 py-2 bg-[#0d0d0d] text-[#f3ece4] border border-[#3a322c] rounded-xl text-xs font-semibold outline-none focus:border-[#ff7a00]"
            >
              <option value={0.25}>0,25 kg/tuần</option>
              <option value={0.5}>0,50 kg/tuần</option>
              <option value={0.75}>0,75 kg/tuần</option>
              <option value={1.0}>1,00 kg/tuần</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveTarget}
          className="mt-2 w-full py-2 bg-[#0d0d0d] hover:bg-[#2a1c14] border border-[#3a322c] text-xs font-semibold text-[#f3ece4] rounded-xl transition-colors"
        >
          Lưu mục tiêu
        </button>

        {/* Health indexes display (only if data exists, no hallucinated numbers) */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#3a322c]/40 text-center">
          <div className="p-2 bg-[#0d0d0d] rounded-lg">
            <div className="text-[10px] text-[#c4b6a8]">{Chuoi.bmi}</div>
            <div className="text-xs font-bold text-[#f3ece4] mt-0.5">
              {bmiVal ? So.kg(bmiVal) : '—'}
            </div>
            {bmiLabel && <div className="text-[9px] text-[#ff7a00]">{bmiLabel}</div>}
          </div>

          <div className="p-2 bg-[#0d0d0d] rounded-lg">
            <div className="text-[10px] text-[#c4b6a8]">{Chuoi.bmr}</div>
            <div className="text-xs font-bold text-[#f3ece4] mt-0.5">
              {bmrVal ? `${Math.round(bmrVal)}` : '—'}
            </div>
            <div className="text-[9px] text-[#c4b6a8]">Mifflin 1990</div>
          </div>

          <div className="p-2 bg-[#0d0d0d] rounded-lg">
            <div className="text-[10px] text-[#c4b6a8]">{Chuoi.tdee}</div>
            <div className="text-xs font-bold text-[#f3ece4] mt-0.5">
              {tdeeVal ? `${Math.round(tdeeVal)}` : '—'}
            </div>
            <div className="text-[9px] text-[#c4b6a8]">±200–400</div>
          </div>
        </div>

        {suggestedKcal && (
          <div className="mt-3 text-center text-xs text-[#ff7a00] font-medium">
            {Chuoi.kcalGoiY}: <span className="font-bold">{suggestedKcal} kcal</span>
          </div>
        )}
      </div>

      {/* Data Management (Xuất, Khôi phục, Xoá hết) */}
      <div className="p-4 bg-[#161714] rounded-2xl border border-[#3a322c]/50 mb-4 space-y-2.5">
        <div className="text-xs font-semibold text-[#c4b6a8] uppercase tracking-wider mb-2">
          Quản lý dữ liệu
        </div>

        {/* Export backup */}
        <button
          id="nut-xuat-ban-sao"
          type="button"
          onClick={handleExport}
          className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#0d0d0d] hover:bg-[#2a1c14] border border-[#3a322c] rounded-xl text-xs font-semibold text-[#f3ece4] flex items-center justify-between transition-colors"
        >
          <span className="flex items-center gap-2">
            <Download className="w-4 h-4 text-[#3d9a7a]" />
            {Chuoi.xuatBanSao}
          </span>
          <span className="text-[11px] text-[#c4b6a8]">JSON</span>
        </button>

        {/* Restore backup */}
        <label
          id="nut-khoi-phuc-ban-sao"
          className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#0d0d0d] hover:bg-[#2a1c14] border border-[#3a322c] rounded-xl text-xs font-semibold text-[#f3ece4] flex items-center justify-between transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#ff7a00]" />
            {Chuoi.khoiPhuc}
          </span>
          <span className="text-[11px] text-[#c4b6a8]">Chọn file</span>
          <input
            type="file"
            accept=".json"
            onChange={handleRestoreFile}
            className="hidden"
          />
        </label>

        {/* Reset All */}
        {showConfirmReset ? (
          <div className="p-3 bg-[#d94a38]/10 border border-[#d94a38]/40 rounded-xl">
            <p className="text-xs font-semibold text-[#f3ece4] text-center mb-3">
              {Chuoi.xoaHetMay}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="flex-1 py-2 bg-[#1a1a1a] text-[#c4b6a8] rounded-lg text-xs font-medium"
              >
                {Chuoi.huy}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-2 bg-[#d94a38] text-white font-bold rounded-lg text-xs"
              >
                Xác nhận xoá
              </button>
            </div>
          </div>
        ) : (
          <button
            id="nut-xoa-het-du-lieu"
            type="button"
            onClick={() => setShowConfirmReset(true)}
            className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#0d0d0d] hover:bg-[#d94a38]/15 border border-[#3a322c] rounded-xl text-xs font-semibold text-[#d94a38] flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              {Chuoi.xoaDuLieu}
            </span>
          </button>
        )}
      </div>

      {/* Sources & Disclaimer Button */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setShowNguon(true)}
          className="w-full flex items-center justify-between p-3.5 bg-[#161714] hover:bg-[#2a1c14] border border-[#3a322c]/50 rounded-xl text-xs text-[#c4b6a8] transition-colors"
        >
          <span className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#c4b6a8]" />
            {Chuoi.nguonDisclaimer}
          </span>
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="text-center text-[11px] text-[#c4b6a8]/60 mt-4">
          {Chuoi.phienBan}
        </div>
      </div>

      {/* Modals */}
      {showHoSo && (
        <ManHoSoModal
          onClose={() => setShowHoSo(false)}
          onSaved={() => {}}
        />
      )}

      {/* Nguon Disclaimer Modal */}
      {showNguon && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setShowNguon(false)}
        >
          <div
            className="w-full max-w-md bg-[#1a1a1a] rounded-2xl border border-[#3a322c] p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-[#f3ece4] mb-3">
              {Chuoi.nguonDisclaimer}
            </h3>
            <p className="text-xs text-[#c4b6a8] leading-relaxed mb-4">
              {Chuoi.uocTinh}
            </p>

            <div className="space-y-2 text-xs text-[#f3ece4] mb-5">
              <div className="p-2.5 bg-[#0d0d0d] rounded-lg border border-[#3a322c]/40">
                • {Chuoi.mifflin}
              </div>
              <div className="p-2.5 bg-[#0d0d0d] rounded-lg border border-[#3a322c]/40">
                • {Chuoi.whoA}
              </div>
              <div className="p-2.5 bg-[#0d0d0d] rounded-lg border border-[#3a322c]/40">
                • {Chuoi.compendium}
              </div>
              <div className="p-2.5 bg-[#0d0d0d] rounded-lg border border-[#3a322c]/40">
                • {Chuoi.heSoKhongMifflin}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowNguon(false)}
              className="w-full min-h-[44px] py-2 bg-[#ff7a00] text-[#0d0d0d] font-bold rounded-xl text-xs"
            >
              {Chuoi.xong}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
