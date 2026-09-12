import React, { useState } from 'react';
import {
  User,
  Download,
  Upload,
  Trash2,
  HelpCircle,
  ShieldAlert,
  ChevronRight,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Chuoi, So } from '../chuoi';
import { CongThuc } from '../cong_thuc';
import { StorageService } from '../storage';
import { ManHoSoModal } from '../components/ManHoSoModal';
import { BieuDoCanNangRecharts } from '../components/BieuDoCanNangRecharts';
import { GhiCanModal } from '../components/GhiCanModal';

export const ManTaiKhoan: React.FC = () => {
  const [showHoSo, setShowHoSo] = useState(false);
  const [showNguon, setShowNguon] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showGhiCan, setShowGhiCan] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Collapsible section states
  const [collapseHoSo, setCollapseHoSo] = useState(false);
  const [collapseQuanLy, setCollapseQuanLy] = useState(false);
  const [collapseNguon, setCollapseNguon] = useState(false);

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
          <h1 className="text-xl font-bold tracking-tight text-[#e7e4dc]">{Chuoi.taiKhoan}</h1>
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

      {/* Profile & Target summary (Collapsible) */}
      <div className="p-4 bg-[#161714] rounded-2xl border border-[#3a322c]/50 mb-4">
        <div className="flex items-center justify-between mb-1">
          <div
            className="flex items-center gap-2 cursor-pointer select-none flex-1"
            onClick={() => setCollapseHoSo(!collapseHoSo)}
          >
            <User className="w-4 h-4 text-[#ff7a00]" />
            <span className="text-xs font-semibold text-[#c4b6a8] uppercase tracking-wider">
              {Chuoi.hoSoChiSo}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowHoSo(true)}
              className="text-xs text-[#ff7a00] font-semibold hover:underline flex items-center gap-0.5"
            >
              Chỉnh sửa <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setCollapseHoSo(!collapseHoSo)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#c4b6a8] hover:text-[#e7e4dc]"
              title={collapseHoSo ? 'Mở rộng' : 'Thu gọn'}
            >
              {collapseHoSo ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {!collapseHoSo && (
          <div className="mt-3">
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
                  className="w-full px-3 py-2 bg-[#0c0d0b] text-[#e7e4dc] border border-[#3a322c] rounded-xl text-xs font-semibold outline-none focus:border-[#ff7a00]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#c4b6a8] mb-1">{Chuoi.nhipTuan}</label>
                <select
                  value={nhipVal}
                  onChange={(e) => setNhipVal(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-[#0c0d0b] text-[#e7e4dc] border border-[#3a322c] rounded-xl text-xs font-semibold outline-none focus:border-[#ff7a00]"
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
              className="mt-2 w-full py-2 bg-[#0c0d0b] hover:bg-[#1f201c] border border-[#3a322c] text-xs font-semibold text-[#e7e4dc] rounded-xl transition-colors"
            >
              Lưu mục tiêu
            </button>

            {/* Health indexes display */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#3a322c]/40 text-center">
              <div className="p-2 bg-[#0c0d0b] rounded-lg">
                <div className="text-[10px] text-[#c4b6a8]">{Chuoi.bmi}</div>
                <div className="text-xs font-bold text-[#e7e4dc] mt-0.5">
                  {bmiVal ? So.kg(bmiVal) : '—'}
                </div>
                {bmiLabel && <div className="text-[9px] text-[#ff7a00]">{bmiLabel}</div>}
              </div>

              <div className="p-2 bg-[#0c0d0b] rounded-lg">
                <div className="text-[10px] text-[#c4b6a8]">{Chuoi.bmr}</div>
                <div className="text-xs font-bold text-[#e7e4dc] mt-0.5">
                  {bmrVal ? `${Math.round(bmrVal)}` : '—'}
                </div>
                <div className="text-[9px] text-[#c4b6a8]">Mifflin 1990</div>
              </div>

              <div className="p-2 bg-[#0c0d0b] rounded-lg">
                <div className="text-[10px] text-[#c4b6a8]">{Chuoi.tdee}</div>
                <div className="text-xs font-bold text-[#e7e4dc] mt-0.5">
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
        )}
      </div>

      {/* Weight History Recharts Line Chart */}
      <BieuDoCanNangRecharts
        onOpenGhiCan={() => setShowGhiCan(true)}
        className="mb-4"
      />

      {/* Data Management (Xuất, Khôi phục, Xoá hết) (Collapsible) */}
      <div className="p-4 bg-[#161714] rounded-2xl border border-[#3a322c]/50 mb-4">
        <div
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={() => setCollapseQuanLy(!collapseQuanLy)}
        >
          <div className="text-xs font-semibold text-[#c4b6a8] uppercase tracking-wider">
            Quản lý dữ liệu sao lưu
          </div>
          <button
            type="button"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#c4b6a8] hover:text-[#e7e4dc]"
            title={collapseQuanLy ? 'Mở rộng' : 'Thu gọn'}
          >
            {collapseQuanLy ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {!collapseQuanLy && (
          <div className="space-y-2.5 mt-3 pt-1">
            {/* Export backup */}
            <button
              id="nut-xuat-ban-sao"
              type="button"
              onClick={handleExport}
              className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#0c0d0b] hover:bg-[#1f201c] border border-[#3a322c] rounded-xl text-xs font-semibold text-[#e7e4dc] flex items-center justify-between transition-colors"
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
              className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#0c0d0b] hover:bg-[#1f201c] border border-[#3a322c] rounded-xl text-xs font-semibold text-[#e7e4dc] flex items-center justify-between transition-colors cursor-pointer"
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
              <div className="p-3 bg-[#c45c4a]/10 border border-[#c45c4a]/40 rounded-xl">
                <p className="text-xs font-semibold text-[#e7e4dc] text-center mb-3">
                  {Chuoi.xoaHetMay}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmReset(false)}
                    className="flex-1 py-2 bg-[#1f201c] text-[#c4b6a8] rounded-lg text-xs font-medium"
                  >
                    {Chuoi.huy}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 py-2 bg-[#c45c4a] text-white font-bold rounded-lg text-xs"
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
                className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#0c0d0b] hover:bg-[#c45c4a]/15 border border-[#3a322c] rounded-xl text-xs font-semibold text-[#c45c4a] flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  {Chuoi.xoaDuLieu}
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sources & Disclaimer Section (Collapsible) */}
      <div className="p-4 bg-[#161714] rounded-2xl border border-[#3a322c]/50 mb-6">
        <div
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={() => setCollapseNguon(!collapseNguon)}
        >
          <span className="flex items-center gap-2 text-xs font-semibold text-[#c4b6a8]">
            <HelpCircle className="w-4 h-4 text-[#c4b6a8]" />
            {Chuoi.nguonDisclaimer}
          </span>
          <button
            type="button"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#c4b6a8] hover:text-[#e7e4dc]"
            title={collapseNguon ? 'Mở rộng' : 'Thu gọn'}
          >
            {collapseNguon ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {!collapseNguon && (
          <div className="mt-3 pt-3 border-t border-[#3a322c]/40 space-y-2 text-xs text-[#c4b6a8] leading-relaxed">
            <p className="text-[11px] mb-2">{Chuoi.uocTinh}</p>
            <div className="p-2 bg-[#0c0d0b] rounded-lg border border-[#3a322c]/30 text-[11px] text-[#e7e4dc]">
              • {Chuoi.mifflin}
            </div>
            <div className="p-2 bg-[#0c0d0b] rounded-lg border border-[#3a322c]/30 text-[11px] text-[#e7e4dc]">
              • {Chuoi.whoA}
            </div>
            <div className="p-2 bg-[#0c0d0b] rounded-lg border border-[#3a322c]/30 text-[11px] text-[#e7e4dc]">
              • {Chuoi.compendium}
            </div>
            <div className="p-2 bg-[#0c0d0b] rounded-lg border border-[#3a322c]/30 text-[11px] text-[#e7e4dc]">
              • {Chuoi.heSoKhongMifflin}
            </div>
          </div>
        )}

        <div className="text-center text-[11px] text-[#c4b6a8]/60 mt-3 pt-2 border-t border-[#3a322c]/20">
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

      {/* Ghi Can Modal */}
      {showGhiCan && (
        <GhiCanModal
          selectedDate={new Date()}
          onClose={() => setShowGhiCan(false)}
          onSuccess={() => setShowGhiCan(false)}
        />
      )}
    </div>
  );
};

export const ManThongKe = ManTaiKhoan;
