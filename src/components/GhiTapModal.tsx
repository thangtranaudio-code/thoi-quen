import React, { useState, useMemo } from 'react';
import { X, Check, Flame, Trash2, Search, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [loai, setLoai] = useState<string>('chay');
  const [phut, setPhut] = useState<number>(30);
  const [nhomLoc, setNhomLoc] = useState<string>('tat_ca');
  const [search, setSearch] = useState<string>('');
  const [collapseDaTap, setCollapseDaTap] = useState<boolean>(false);

  const data = StorageService.getData();
  const dateIso = Ngay.iso(selectedDate);

  const dayTapIns = data.tapIns.filter((t) => t.ngay === dateIso);
  const latestWeight = StorageService.getLatestWeighIn()?.kg ?? data.profile.startKg ?? null;

  const met = CongThuc.metCua(loai) ?? 5.0;
  const estimatedKcal = latestWeight
    ? Math.round(CongThuc.kcalTap({ met, kg: latestWeight, phut }) ?? 0)
    : null;

  const filteredMon = useMemo(() => {
    return CongThuc.mon.filter((m) => {
      const matchNhom = nhomLoc === 'tat_ca' || m.nhom === nhomLoc;
      const matchSearch =
        !search.trim() ||
        m.ten.toLowerCase().includes(search.toLowerCase()) ||
        Chuoi.tenMon(m.loai).toLowerCase().includes(search.toLowerCase());
      return matchNhom && matchSearch;
    });
  }, [nhomLoc, search]);

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
        className="w-full max-w-md bg-[#161714] rounded-2xl border border-[#3a322c] p-5 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#3a322c]/50 mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#ff7a00]" />
            <h3 className="text-base font-semibold text-[#e7e4dc]">{Chuoi.hoatDongO}</h3>
          </div>
          <button
            id="nut-dong-ghi-tap"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#c4b6a8] hover:text-[#e7e4dc]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-[#c4b6a8] mb-3">
          {Chuoi.dongNgay(selectedDate)}
        </div>

        {/* Categories Tab */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 mb-2.5 no-scrollbar text-xs">
          {[
            { id: 'tat_ca', label: 'Tất cả' },
            { id: 'cardio', label: 'Cardio' },
            { id: 'gym', label: 'Kháng lực & Gym' },
            { id: 'the_thao', label: 'Thể thao' },
            { id: 'deo_dai', label: 'Dẻo dai' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setNhomLoc(cat.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-xs font-medium transition-all ${
                nhomLoc === cat.id
                  ? 'bg-[#ff7a00] text-[#0c0d0b] font-bold'
                  : 'bg-[#1f201c] text-[#c4b6a8] hover:text-[#e7e4dc] border border-[#3a322c]/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative mb-3">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#c4b6a8]" />
          <input
            type="text"
            placeholder="Tìm bài tập, môn thể thao..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#0c0d0b] text-xs text-[#e7e4dc] border border-[#3a322c] rounded-xl outline-none focus:border-[#ff7a00]"
          />
        </div>

        {/* Sport selection grid */}
        <div className="grid grid-cols-2 gap-2 mb-3.5 max-h-52 overflow-y-auto pr-1">
          {filteredMon.map((m) => (
            <button
              key={m.loai}
              type="button"
              onClick={() => setLoai(m.loai)}
              className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex flex-col justify-between transition-colors ${
                loai === m.loai
                  ? 'bg-[#ff7a00]/15 border-[#ff7a00] text-[#ff7a00]'
                  : 'bg-[#0c0d0b] border-[#3a322c] text-[#e7e4dc] hover:bg-[#1f201c]'
              }`}
            >
              <span className="truncate">{m.ten}</span>
              <span className="text-[10px] text-[#c4b6a8]/70 mt-1">MET {m.met}</span>
            </button>
          ))}
          {filteredMon.length === 0 && (
            <div className="col-span-2 py-4 text-center text-xs text-[#c4b6a8]">
              Không tìm thấy bài tập phù hợp
            </div>
          )}
        </div>

        {/* Minutes input & quick presets */}
        <div className="mb-3 p-3 bg-[#0c0d0b] rounded-xl border border-[#3a322c]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#c4b6a8]">Thời lượng vận động</span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={phut}
                onChange={(e) => setPhut(parseInt(e.target.value, 10) || 1)}
                min={1}
                max={360}
                className="w-16 px-2 py-1 bg-[#161714] text-[#e7e4dc] border border-[#3a322c] rounded-lg text-center text-xs font-bold focus:border-[#ff7a00] outline-none"
              />
              <span className="text-xs text-[#c4b6a8]">{Chuoi.phut}</span>
            </div>
          </div>
          {/* Quick presets */}
          <div className="flex items-center gap-1.5">
            {[15, 30, 45, 60, 90].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setPhut(preset)}
                className={`flex-1 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                  phut === preset
                    ? 'bg-[#ff7a00]/20 border-[#ff7a00] text-[#ff7a00]'
                    : 'bg-[#161714] border-[#3a322c]/70 text-[#c4b6a8] hover:text-[#e7e4dc]'
                }`}
              >
                {preset}p
              </button>
            ))}
          </div>
        </div>

        {/* Estimated burn */}
        {estimatedKcal !== null && (
          <div className="mb-4 text-center text-xs text-[#ff7a00] font-medium bg-[#ff7a00]/10 py-2 rounded-xl border border-[#ff7a00]/20">
            Ước tính tiêu thụ: <span className="font-bold text-sm">~{estimatedKcal} kcal</span> (MET {met})
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-[44px] px-3 py-2 bg-[#0c0d0b] text-[#c4b6a8] hover:text-[#e7e4dc] border border-[#3a322c] rounded-xl text-sm font-medium"
          >
            {Chuoi.huy}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 min-h-[44px] px-3 py-2 bg-[#ff7a00] text-[#0c0d0b] hover:bg-[#ff7a00]/90 font-semibold rounded-xl text-sm flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            {Chuoi.luu}
          </button>
        </div>

        {/* Day's workouts list with Collapsible toggle */}
        {dayTapIns.length > 0 && (
          <div className="border-t border-[#3a322c]/50 pt-3">
            <div
              className="flex items-center justify-between cursor-pointer py-1"
              onClick={() => setCollapseDaTap(!collapseDaTap)}
            >
              <div className="text-xs font-semibold text-[#c4b6a8] flex items-center gap-1.5">
                <span>Đã tập trong ngày ({dayTapIns.length})</span>
              </div>
              <button type="button" className="text-[#c4b6a8] text-xs flex items-center gap-1">
                <span>{collapseDaTap ? 'Mở rộng' : 'Thu gọn'}</span>
                {collapseDaTap ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            </div>

            {!collapseDaTap && (
              <div className="space-y-1.5 mt-2">
                {dayTapIns.map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 bg-[#0c0d0b] rounded-lg border border-[#3a322c]/40 flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-[#e7e4dc]">
                      {Chuoi.tenMon(t.loai)} · {t.phut} {Chuoi.phut}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(t.id)}
                      className="text-[#c45c4a] p-1 hover:bg-[#c45c4a]/10 rounded"
                      title="Xóa bài tập này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
