import React from 'react';
import { CheckCircle2, Calendar, Plus, TrendingUp, Hexagon, User } from 'lucide-react';
import { Chuoi } from '../chuoi';

interface ThanhDayProps {
  tab: number;
  onTab: (tabIndex: number) => void;
  onCong: () => void;
}

export const ThanhDay: React.FC<ThanhDayProps> = ({ tab, onTab, onCong }) => {
  return (
    <nav
      id="thanh-day-bar"
      aria-label="Thanh điều hướng chính"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#161714] border-t border-[#3a322c]/50 h-16 max-w-lg mx-auto"
    >
      <div className="flex items-center justify-between h-full px-2">
        {/* Tab 0: Hôm nay */}
        <button
          id="tab-hom-nay"
          type="button"
          onClick={() => onTab(0)}
          className={`flex-1 flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            tab === 0 ? 'text-[#ff7a00]' : 'text-[#c4b6a8] hover:text-[#f3ece4]'
          }`}
        >
          <CheckCircle2 className={`w-5 h-5 ${tab === 0 ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
          <span className="text-[11px] font-medium tracking-tight mt-1 whitespace-nowrap">
            {Chuoi.homNay}
          </span>
        </button>

        {/* Tab 1: Lịch */}
        <button
          id="tab-lich"
          type="button"
          onClick={() => onTab(1)}
          className={`flex-1 flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            tab === 1 ? 'text-[#ff7a00]' : 'text-[#c4b6a8] hover:text-[#f3ece4]'
          }`}
        >
          <Calendar className={`w-5 h-5 ${tab === 1 ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
          <span className="text-[11px] font-medium tracking-tight mt-1 whitespace-nowrap">
            {Chuoi.lich}
          </span>
        </button>

        {/* Center (+): Lưới ghi */}
        <div className="w-14 flex items-center justify-center">
          <button
            id="nut-cong-ghi-nhanh"
            type="button"
            onClick={onCong}
            aria-label="Ghi nhanh"
            className="w-11 h-11 rounded-full bg-[#ff7a00] text-[#0d0d0d] flex items-center justify-center shadow-md active:scale-95 transition-transform"
          >
            <Plus className="w-6 h-6 stroke-[2.75]" />
          </button>
        </div>

        {/* Tab 2: Tiến độ */}
        <button
          id="tab-tien-do"
          type="button"
          onClick={() => onTab(2)}
          className={`flex-1 flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            tab === 2 ? 'text-[#ff7a00]' : 'text-[#c4b6a8] hover:text-[#f3ece4]'
          }`}
        >
          <TrendingUp className={`w-5 h-5 ${tab === 2 ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
          <span className="text-[11px] font-medium tracking-tight mt-1 whitespace-nowrap">
            {Chuoi.tienDo}
          </span>
        </button>

        {/* Tab 3: Hệ */}
        <button
          id="tab-he"
          type="button"
          onClick={() => onTab(3)}
          className={`flex-1 flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            tab === 3 ? 'text-[#ff7a00]' : 'text-[#c4b6a8] hover:text-[#f3ece4]'
          }`}
        >
          <Hexagon className={`w-5 h-5 ${tab === 3 ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
          <span className="text-[11px] font-medium tracking-tight mt-1 whitespace-nowrap">
            {Chuoi.he}
          </span>
        </button>

        {/* Tab 4: Tài khoản */}
        <button
          id="tab-tai-khoan"
          type="button"
          onClick={() => onTab(4)}
          className={`flex-1 flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            tab === 4 ? 'text-[#ff7a00]' : 'text-[#c4b6a8] hover:text-[#f3ece4]'
          }`}
        >
          <User className={`w-5 h-5 ${tab === 4 ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
          <span className="text-[11px] font-medium tracking-tight mt-1 whitespace-nowrap">
            {Chuoi.taiKhoan}
          </span>
        </button>
      </div>
    </nav>
  );
};
