import React, { useState } from 'react';
import { X, Check, Utensils, Sparkles, Trash2 } from 'lucide-react';
import { Chuoi } from '../chuoi';
import { CongThuc } from '../cong_thuc';
import { Ngay } from '../ngay';
import { StorageService } from '../storage';

interface GhiNapModalProps {
  selectedDate: Date;
  onClose: () => void;
  onSuccess: () => void;
}

export const GhiNapModal: React.FC<GhiNapModalProps> = ({
  selectedDate,
  onClose,
  onSuccess,
}) => {
  const [khung, setKhung] = useState<'sang' | 'trua' | 'chieu' | 'toi'>('sang');
  const [ten, setTen] = useState('');
  const [kcal, setKcal] = useState<string>('');
  const [gram, setGram] = useState<string>('');
  const [dam, setDam] = useState<string>('');
  const [bot, setBot] = useState<string>('');
  const [beo, setBeo] = useState<string>('');
  const [quickText, setQuickText] = useState('');
  const [showParser, setShowParser] = useState(false);

  const data = StorageService.getData();
  const dateIso = Ngay.iso(selectedDate);
  const dayLogs = data.foodLogs.filter((l) => l.ngay === dateIso);
  const totalKcalDay = dayLogs.reduce((acc, cur) => acc + cur.kcal, 0);

  const handleParseText = () => {
    if (!quickText.trim()) return;
    const parsed = CongThuc.docMon(quickText);
    if (parsed.ten) setTen(parsed.ten);
    if (parsed.kcal !== undefined) setKcal(parsed.kcal.toString());
    if (parsed.gram !== undefined) setGram(parsed.gram.toString());
    if (parsed.dam !== undefined) setDam(parsed.dam.toString());
    if (parsed.bot !== undefined) setBot(parsed.bot.toString());
    if (parsed.beo !== undefined) setBeo(parsed.beo.toString());
    setShowParser(false);
  };

  const handleSave = () => {
    const k = parseInt(kcal, 10);
    if (isNaN(k) || k <= 0) return;
    const cleanTen = ten.trim() || 'Bữa ăn';

    StorageService.addFoodLog({
      ngay: dateIso,
      ten: cleanTen,
      kcal: k,
      gram: gram ? parseFloat(gram) : null,
      dam: dam ? parseFloat(dam) : null,
      bot: bot ? parseFloat(bot) : null,
      beo: beo ? parseFloat(beo) : null,
      khung,
    });

    setTen('');
    setKcal('');
    setGram('');
    setDam('');
    setBot('');
    setBeo('');
    onSuccess();
  };

  const handleDelete = (id: number) => {
    StorageService.deleteFoodLog(id);
    onSuccess();
  };

  return (
    <div
      id="modal-ghi-nap-backdrop"
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="modal-ghi-nap-content"
        className="w-full max-w-md bg-[#1a1a1a] rounded-2xl border border-[#3a322c] p-5 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#3a322c]/50 mb-3">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-[#3d9a7a]" />
            <h3 className="text-base font-semibold text-[#f3ece4]">{Chuoi.nhatKy}</h3>
          </div>
          <button
            id="nut-dong-ghi-nap"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#c4b6a8] hover:text-[#f3ece4]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between text-xs text-[#c4b6a8] mb-4">
          <span>{Chuoi.dongNgay(selectedDate)}</span>
          <span className="text-[#3d9a7a] font-bold">Tổng: {totalKcalDay} kcal</span>
        </div>

        {/* Meal Frame Tabs */}
        <div className="grid grid-cols-4 gap-1.5 mb-4">
          {(
            [
              { key: 'sang', label: Chuoi.sang },
              { key: 'trua', label: Chuoi.trua },
              { key: 'chieu', label: Chuoi.chieu },
              { key: 'toi', label: Chuoi.toi },
            ] as const
          ).map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setKhung(m.key)}
              className={`py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                khung === m.key
                  ? 'bg-[#3d9a7a] border-[#3d9a7a] text-[#0d0d0d] font-bold'
                  : 'bg-[#0d0d0d] border-[#3a322c] text-[#c4b6a8] hover:text-[#f3ece4]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Quick paste button */}
        <div className="mb-3">
          <button
            type="button"
            onClick={() => setShowParser(!showParser)}
            className="text-xs text-[#ff7a00] flex items-center gap-1 hover:underline"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {showParser ? 'Ẩn dán văn bản' : 'Dán văn bản phân tích món ăn'}
          </button>
        </div>

        {showParser && (
          <div className="mb-4 p-3 bg-[#0d0d0d] rounded-xl border border-[#3a322c]">
            <textarea
              value={quickText}
              onChange={(e) => setQuickText(e.target.value)}
              placeholder="Dán nội dung ví dụ: Phở bò 1 bát 450 kcal đạm 25g bột 60g béo 12g..."
              rows={3}
              className="w-full bg-transparent text-[#f3ece4] text-xs outline-none resize-none placeholder-[#c4b6a8]/50"
            />
            <button
              type="button"
              onClick={handleParseText}
              className="mt-2 w-full py-1.5 bg-[#3a322c] hover:bg-[#ff7a00] hover:text-[#0d0d0d] text-xs font-semibold rounded-lg transition-colors"
            >
              Tách món & Calo
            </button>
          </div>
        )}

        {/* Inputs */}
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-[#c4b6a8] mb-1">Tên món</label>
            <input
              type="text"
              value={ten}
              onChange={(e) => setTen(e.target.value)}
              placeholder="Ví dụ: Cơm gà nướng, Trứng ốp la..."
              className="w-full px-3 py-2 bg-[#0d0d0d] text-[#f3ece4] border border-[#3a322c] rounded-xl text-xs focus:border-[#3d9a7a] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-[#c4b6a8] mb-1">Kcal *</label>
              <input
                type="number"
                value={kcal}
                onChange={(e) => setKcal(e.target.value)}
                placeholder="450"
                className="w-full px-3 py-2 bg-[#0d0d0d] text-[#f3ece4] border border-[#3a322c] rounded-xl text-xs font-bold text-[#3d9a7a] focus:border-[#3d9a7a] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#c4b6a8] mb-1">Khối lượng (g)</label>
              <input
                type="number"
                value={gram}
                onChange={(e) => setGram(e.target.value)}
                placeholder="200"
                className="w-full px-3 py-2 bg-[#0d0d0d] text-[#f3ece4] border border-[#3a322c] rounded-xl text-xs focus:border-[#3d9a7a] outline-none"
              />
            </div>
          </div>

          {/* Macros (optional) */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] text-[#c4b6a8] mb-1">{Chuoi.dam} (g)</label>
              <input
                type="number"
                value={dam}
                onChange={(e) => setDam(e.target.value)}
                placeholder="25"
                className="w-full px-2 py-1.5 bg-[#0d0d0d] text-[#f3ece4] border border-[#3a322c] rounded-lg text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#c4b6a8] mb-1">{Chuoi.bot} (g)</label>
              <input
                type="number"
                value={bot}
                onChange={(e) => setBot(e.target.value)}
                placeholder="40"
                className="w-full px-2 py-1.5 bg-[#0d0d0d] text-[#f3ece4] border border-[#3a322c] rounded-lg text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#c4b6a8] mb-1">{Chuoi.beo} (g)</label>
              <input
                type="number"
                value={beo}
                onChange={(e) => setBeo(e.target.value)}
                placeholder="10"
                className="w-full px-2 py-1.5 bg-[#0d0d0d] text-[#f3ece4] border border-[#3a322c] rounded-lg text-xs outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <button
            type="button"
            onClick={handleSave}
            className="w-full min-h-[44px] px-3 py-2 bg-[#3d9a7a] text-[#0d0d0d] hover:bg-[#3d9a7a]/90 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            Thêm món vào nhật ký
          </button>
        </div>

        {/* Today's Meals List */}
        {dayLogs.length > 0 && (
          <div className="border-t border-[#3a322c]/50 pt-3">
            <div className="text-xs font-semibold text-[#c4b6a8] mb-2">Các món đã ghi hôm nay</div>
            <div className="space-y-1.5">
              {dayLogs.map((l) => (
                <div
                  key={l.id}
                  className="p-2.5 bg-[#0d0d0d] rounded-lg border border-[#3a322c]/40 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-[#f3ece4]">{l.ten}</span>
                    <span className="text-[#3d9a7a] font-bold ml-2">{l.kcal} kcal</span>
                    <span className="text-[#c4b6a8]/70 text-[11px] ml-2">({l.khung})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(l.id)}
                    className="text-[#d94a38] p-1 hover:bg-[#d94a38]/10 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
