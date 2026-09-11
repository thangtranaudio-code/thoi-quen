import React, { useState } from 'react';
import { X, Check, User } from 'lucide-react';
import { Chuoi, So } from '../chuoi';
import { StorageService } from '../storage';

interface ManHoSoModalProps {
  onClose: () => void;
  onSaved: () => void;
}

export const ManHoSoModal: React.FC<ManHoSoModalProps> = ({
  onClose,
  onSaved,
}) => {
  const profile = StorageService.getProfile();

  const [sex, setSex] = useState<'nam' | 'nu' | null>(profile.sex ?? 'nam');
  const [heightCm, setHeightCm] = useState(profile.heightCm?.toString() ?? '');
  const [dob, setDob] = useState(profile.dob ?? '1995-01-01');
  const [activity, setActivity] = useState(profile.activity ?? 1.2);
  const [targetKg, setTargetKg] = useState(profile.targetKg ? So.kg(profile.targetKg) : '');
  const [nhipKg, setNhipKg] = useState(profile.nhipKg ?? 0.5);
  const [startKg, setStartKg] = useState(profile.startKg ? So.kg(profile.startKg) : '');
  const [startEo, setStartEo] = useState(profile.startEo?.toString() ?? '');
  const [startHong, setStartHong] = useState(profile.startHong?.toString() ?? '');
  const [startNguc, setStartNguc] = useState(profile.startNguc?.toString() ?? '');
  const [startBapTay, setStartBapTay] = useState(profile.startBapTay?.toString() ?? '');

  const handleSave = () => {
    StorageService.updateProfile({
      sex,
      heightCm: heightCm ? parseFloat(heightCm) : null,
      dob: dob || null,
      activity,
      targetKg: targetKg ? So.parseKg(targetKg) : null,
      nhipKg,
      startKg: startKg ? So.parseKg(startKg) : null,
      startEo: startEo ? parseFloat(startEo) : null,
      startHong: startHong ? parseFloat(startHong) : null,
      startNguc: startNguc ? parseFloat(startNguc) : null,
      startBapTay: startBapTay ? parseFloat(startBapTay) : null,
    });
    onSaved();
    onClose();
  };

  return (
    <div
      id="modal-ho-so-backdrop"
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="modal-ho-so-content"
        className="w-full max-w-md bg-[#1a1a1a] rounded-2xl border border-[#3a322c] p-5 shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#3a322c]/50 mb-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#ff7a00]" />
            <h3 className="text-base font-semibold text-[#f3ece4]">{Chuoi.hoSoChiSo}</h3>
          </div>
          <button
            id="nut-dong-ho-so"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#c4b6a8] hover:text-[#f3ece4]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sex Selection */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-[#c4b6a8] mb-1.5">{Chuoi.gioi}</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSex('nam')}
              className={`py-2 rounded-xl text-xs font-semibold border transition-colors ${
                sex === 'nam'
                  ? 'bg-[#ff7a00] border-[#ff7a00] text-[#0d0d0d]'
                  : 'bg-[#0d0d0d] border-[#3a322c] text-[#f3ece4]'
              }`}
            >
              {Chuoi.nam}
            </button>
            <button
              type="button"
              onClick={() => setSex('nu')}
              className={`py-2 rounded-xl text-xs font-semibold border transition-colors ${
                sex === 'nu'
                  ? 'bg-[#ff7a00] border-[#ff7a00] text-[#0d0d0d]'
                  : 'bg-[#0d0d0d] border-[#3a322c] text-[#f3ece4]'
              }`}
            >
              {Chuoi.nu}
            </button>
          </div>
        </div>

        {/* Height & DOB */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div>
            <label className="block text-xs font-medium text-[#c4b6a8] mb-1">
              {Chuoi.chieuCao} (cm)
            </label>
            <input
              type="number"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              placeholder="170"
              className="w-full px-3 py-2 bg-[#0d0d0d] text-[#f3ece4] border border-[#3a322c] rounded-xl text-xs font-semibold outline-none focus:border-[#ff7a00]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#c4b6a8] mb-1">{Chuoi.ngaySinh}</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-3 py-2 bg-[#0d0d0d] text-[#f3ece4] border border-[#3a322c] rounded-xl text-xs font-semibold outline-none focus:border-[#ff7a00]"
            />
          </div>
        </div>

        {/* Activity Level */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-[#c4b6a8] mb-1.5">
            {Chuoi.mucHoatDong}
          </label>
          <select
            value={activity}
            onChange={(e) => setActivity(parseFloat(e.target.value))}
            className="w-full px-3 py-2 bg-[#0d0d0d] text-[#f3ece4] border border-[#3a322c] rounded-xl text-xs font-medium outline-none focus:border-[#ff7a00]"
          >
            <option value={1.2}>{Chuoi.itVanDong}</option>
            <option value={1.375}>{Chuoi.nheVanDong}</option>
            <option value={1.55}>{Chuoi.vuaVanDong}</option>
            <option value={1.725}>{Chuoi.nhieuVanDong}</option>
            <option value={1.9}>{Chuoi.ratNhieuVanDong}</option>
          </select>
        </div>

        {/* Target Weight & Pace */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div>
            <label className="block text-xs font-medium text-[#c4b6a8] mb-1">
              {Chuoi.canDich} (kg)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={targetKg}
              onChange={(e) => setTargetKg(e.target.value)}
              placeholder="65,0"
              className="w-full px-3 py-2 bg-[#0d0d0d] text-[#f3ece4] border border-[#3a322c] rounded-xl text-xs font-semibold outline-none focus:border-[#ff7a00]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#c4b6a8] mb-1">
              {Chuoi.nhipTuan}
            </label>
            <select
              value={nhipKg}
              onChange={(e) => setNhipKg(parseFloat(e.target.value))}
              className="w-full px-3 py-2 bg-[#0d0d0d] text-[#f3ece4] border border-[#3a322c] rounded-xl text-xs font-medium outline-none focus:border-[#ff7a00]"
            >
              <option value={0.25}>0,25 kg/tuần</option>
              <option value={0.5}>0,50 kg/tuần</option>
              <option value={0.75}>0,75 kg/tuần</option>
              <option value={1.0}>1,00 kg/tuần</option>
            </select>
          </div>
        </div>

        {/* Initial Measurements */}
        <div className="p-3 bg-[#0d0d0d] rounded-xl border border-[#3a322c]/60 mb-5">
          <div className="text-xs font-semibold text-[#c4b6a8] mb-2.5">Mốc số đo ban đầu</div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-[11px] text-[#c4b6a8] mb-1">{Chuoi.canBanDau} (kg)</label>
              <input
                type="text"
                inputMode="decimal"
                value={startKg}
                onChange={(e) => setStartKg(e.target.value)}
                placeholder="70,0"
                className="w-full px-2.5 py-1.5 bg-[#1a1a1a] text-[#f3ece4] border border-[#3a322c] rounded-lg text-xs font-medium outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#c4b6a8] mb-1">{Chuoi.eoCm} (cm)</label>
              <input
                type="number"
                value={startEo}
                onChange={(e) => setStartEo(e.target.value)}
                placeholder="78"
                className="w-full px-2.5 py-1.5 bg-[#1a1a1a] text-[#f3ece4] border border-[#3a322c] rounded-lg text-xs font-medium outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] text-[#c4b6a8] mb-1">{Chuoi.hongCm}</label>
              <input
                type="number"
                value={startHong}
                onChange={(e) => setStartHong(e.target.value)}
                placeholder="96"
                className="w-full px-2 py-1 bg-[#1a1a1a] text-[#f3ece4] border border-[#3a322c] rounded-lg text-xs font-medium outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#c4b6a8] mb-1">{Chuoi.ngucCm}</label>
              <input
                type="number"
                value={startNguc}
                onChange={(e) => setStartNguc(e.target.value)}
                placeholder="92"
                className="w-full px-2 py-1 bg-[#1a1a1a] text-[#f3ece4] border border-[#3a322c] rounded-lg text-xs font-medium outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#c4b6a8] mb-1">{Chuoi.bapTayCm}</label>
              <input
                type="number"
                value={startBapTay}
                onChange={(e) => setStartBapTay(e.target.value)}
                placeholder="32"
                className="w-full px-2 py-1 bg-[#1a1a1a] text-[#f3ece4] border border-[#3a322c] rounded-lg text-xs font-medium outline-none"
              />
            </div>
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
            {Chuoi.luuHoSo}
          </button>
        </div>
      </div>
    </div>
  );
};
