import React, { useState } from 'react';
import { Calendar as CalendarIcon, X, Check } from 'lucide-react';
import { Chuoi } from '../chuoi';
import { Ngay } from '../ngay';

interface LanNgayModalProps {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  onClose: () => void;
}

export const LanNgayModal: React.FC<LanNgayModalProps> = ({
  selectedDate,
  onSelectDate,
  onClose,
}) => {
  const [day, setDay] = useState(selectedDate.getDate());
  const [month, setMonth] = useState(selectedDate.getMonth() + 1);
  const [year, setYear] = useState(selectedDate.getFullYear());

  const daysInSelectedMonth = Ngay.soNgayThang(year, month);
  const validDay = Math.min(day, daysInSelectedMonth);

  const handleConfirm = () => {
    const newDate = new Date(year, month - 1, validDay);
    onSelectDate(newDate);
    onClose();
  };

  const handleGoToday = () => {
    onSelectDate(new Date());
    onClose();
  };

  return (
    <div
      id="modal-lan-ngay-backdrop"
      className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="modal-lan-ngay-content"
        className="w-full max-w-sm bg-[#1a1a1a] rounded-2xl border border-[#3a322c] p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#3a322c]/50 mb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#ff7a00]" />
            <h3 className="text-base font-semibold text-[#f3ece4]">{Chuoi.chonNgay}</h3>
          </div>
          <button
            id="nut-dong-lan-ngay"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#c4b6a8] hover:text-[#f3ece4]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Roller selections for Day, Month, Year */}
        <div className="grid grid-cols-3 gap-2 my-4">
          {/* Day */}
          <div className="flex flex-col">
            <label className="text-xs text-[#c4b6a8] mb-1 text-center font-medium">Ngày</label>
            <select
              id="select-day"
              value={validDay}
              onChange={(e) => setDay(parseInt(e.target.value, 10))}
              className="bg-[#0d0d0d] text-[#f3ece4] border border-[#3a322c] rounded-lg p-2.5 text-center text-base focus:border-[#ff7a00] outline-none"
            >
              {Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div className="flex flex-col">
            <label className="text-xs text-[#c4b6a8] mb-1 text-center font-medium">Tháng</label>
            <select
              id="select-month"
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value, 10))}
              className="bg-[#0d0d0d] text-[#f3ece4] border border-[#3a322c] rounded-lg p-2.5 text-center text-base focus:border-[#ff7a00] outline-none"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {Chuoi.thang(m)}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div className="flex flex-col">
            <label className="text-xs text-[#c4b6a8] mb-1 text-center font-medium">Năm</label>
            <select
              id="select-year"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
              className="bg-[#0d0d0d] text-[#f3ece4] border border-[#3a322c] rounded-lg p-2.5 text-center text-base focus:border-[#ff7a00] outline-none"
            >
              {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-6">
          <button
            id="nut-ve-hom-nay-picker"
            type="button"
            onClick={handleGoToday}
            className="flex-1 min-h-[44px] px-3 py-2 bg-[#0d0d0d] text-[#c4b6a8] hover:text-[#f3ece4] border border-[#3a322c] rounded-xl text-sm font-medium transition-colors"
          >
            {Chuoi.homNay}
          </button>
          <button
            id="nut-xac-nhan-lan-ngay"
            type="button"
            onClick={handleConfirm}
            className="flex-1 min-h-[44px] px-3 py-2 bg-[#ff7a00] text-[#0d0d0d] hover:bg-[#ff7a00]/90 font-semibold rounded-xl text-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            {Chuoi.xong}
          </button>
        </div>
      </div>
    </div>
  );
};
