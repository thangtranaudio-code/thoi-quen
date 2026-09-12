import React, { useState } from 'react';
import { Target, Plus, Clock, Check, Trash2, Edit3, Calendar as CalendarIcon, AlertTriangle, Sparkles, ChevronRight, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { StorageService } from '../storage';
import { Ngay } from '../ngay';
import { Chuoi } from '../chuoi';
import { FocusTask } from '../types';
import { CamXucService } from '../services/camXucService';

interface ManFocusProps {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
}

export const ManFocus: React.FC<ManFocusProps> = ({ selectedDate, onSelectDate }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<FocusTask | null>(null);
  const [filterMode, setFilterMode] = useState<'selected' | 'all'>('selected');
  const [statusFilter, setStatusFilter] = useState<'tat_ca' | 'chua_xong' | 'da_xong'>('tat_ca');
  const [collapseDoneTasks, setCollapseDoneTasks] = useState(false);

  // Form states for Add/Edit Modal
  const [tieuDe, setTieuDe] = useState('');
  const [ghiChu, setGhiChu] = useState('');
  const [ngay, setNgay] = useState(Ngay.iso(selectedDate));
  const [gioBatDau, setGioBatDau] = useState('15:00');
  const [gioKetThuc, setGioKetThuc] = useState('17:20');
  const [mucDoUuTien, setMucDoUuTien] = useState<'cao' | 'trung_binh' | 'binh_thuong'>('cao');
  const [formError, setFormError] = useState<string | null>(null);

  const dateIso = Ngay.iso(selectedDate);
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const isSelectedToday = Ngay.cungNgay(selectedDate, now);

  // Trigger overdue check
  StorageService.checkAndUpdateOverdueTasks();

  const allFocusTasks = StorageService.getFocusTasks(filterMode === 'selected' ? dateIso : undefined);

  const openAddModal = () => {
    setTaskToEdit(null);
    setTieuDe('');
    setGhiChu('');
    setNgay(dateIso);
    // Suggest next round hour
    const nextH = (now.getHours() + 1) % 24;
    const pad = (n: number) => n.toString().padStart(2, '0');
    setGioBatDau(`${pad(nextH)}:00`);
    setGioKetThuc(`${pad((nextH + 2) % 24)}:00`);
    setMucDoUuTien('cao');
    setFormError(null);
    setShowAddModal(true);
  };

  const openEditModal = (task: FocusTask) => {
    setTaskToEdit(task);
    setTieuDe(task.tieuDe);
    setGhiChu(task.ghiChu ?? '');
    setNgay(task.ngay);
    setGioBatDau(task.gioBatDau);
    setGioKetThuc(task.gioKetThuc);
    setMucDoUuTien(task.mucDoUuTien);
    setFormError(null);
    setShowAddModal(true);
  };

  const handleSave = () => {
    if (!tieuDe.trim()) {
      setFormError('Vui lòng nhập tên công việc');
      return;
    }

    const sMin = StorageService.timeToMinutes(gioBatDau);
    const eMin = StorageService.timeToMinutes(gioKetThuc);
    if (eMin <= sMin) {
      setFormError('Giờ kết thúc phải lớn hơn giờ bắt đầu');
      return;
    }

    if (taskToEdit) {
      StorageService.updateFocusTask(taskToEdit.id, {
        tieuDe,
        ghiChu: ghiChu.trim() || undefined,
        ngay,
        gioBatDau,
        gioKetThuc,
        mucDoUuTien,
      });
    } else {
      StorageService.addFocusTask({
        tieuDe,
        ghiChu: ghiChu.trim() || undefined,
        ngay,
        gioBatDau,
        gioKetThuc,
        mucDoUuTien,
      });
    }

    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Xoá công việc Focus này khỏi máy?')) {
      StorageService.deleteFocusTask(id);
    }
  };

  const handleToggle = (id: string) => {
    const task = allFocusTasks.find((t) => t.id === id);
    const isNowDone = StorageService.toggleFocusTask(id);
    if (isNowDone && task) {
      CamXucService.kichHoatFocusDone(task.tieuDe);
    }
  };

  // Quick preset intervals
  const applyPreset = (durationMinutes: number) => {
    const sMin = StorageService.timeToMinutes(gioBatDau);
    const eMin = (sMin + durationMinutes) % 1440;
    const h = Math.floor(eMin / 60);
    const m = eMin % 60;
    setGioKetThuc(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
  };

  const completedCount = allFocusTasks.filter((t) => t.trangThai === 'hoan_thanh').length;

  return (
    <div id="man-focus" className="flex flex-col min-h-full pb-20 px-4 pt-3 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#ff7a00]" />
            <h1 className="text-xl font-bold tracking-tight text-[#f3ece4]">Focus</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#ff7a00]/20 text-[#ff7a00] border border-[#ff7a00]/40">
              Ưu tiên cao
            </span>
          </div>
          <p className="text-xs text-[#c4b6a8] mt-0.5">
            Lịch công việc quan trọng · Tự động gạch ngang thói quen cùng giờ
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-3 py-2 bg-[#ff7a00] text-[#0c0d0b] text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Đặt lịch
        </button>
      </div>

      {/* Date Switcher & Filter */}
      <div className="flex items-center justify-between gap-2 p-2.5 bg-[#161714] border border-[#3a322c]/50 rounded-2xl mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-[#ff7a00]" />
          <div>
            <span className="text-xs font-bold text-[#f3ece4]">
              {Chuoi.dongNgay(selectedDate)}
            </span>
            <div className="text-[10px] text-[#c4b6a8]">
              {completedCount}/{allFocusTasks.length} công việc hoàn thành
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-[#0c0d0b] p-1 rounded-xl border border-[#3a322c]/40">
          <button
            type="button"
            onClick={() => setFilterMode('selected')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
              filterMode === 'selected' ? 'bg-[#ff7a00] text-[#0c0d0b]' : 'text-[#c4b6a8]'
            }`}
          >
            Ngày này
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
              filterMode === 'all' ? 'bg-[#ff7a00] text-[#0c0d0b]' : 'text-[#c4b6a8]'
            }`}
          >
            Tất cả
          </button>
        </div>
      </div>

      {/* Task List (Sorted chronologically) */}
      {allFocusTasks.length === 0 ? (
        <div className="p-8 text-center bg-[#161714] rounded-2xl border border-[#3a322c]/50 my-4">
          <div className="w-12 h-12 rounded-2xl bg-[#2a1c14] text-[#ff7a00] flex items-center justify-center mx-auto mb-3 border border-[#ff7a00]/30">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#f3ece4] mb-1">Chưa có việc Focus nào</h3>
          <p className="text-xs text-[#c4b6a8] max-w-xs mx-auto mb-4 leading-relaxed">
            Đặt lịch các công việc trọng tâm (vd: 15h đến 17h20). App sẽ tự động ưu tiên và gạch ngang các thói quen bên tab Hôm nay.
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2.5 bg-[#ff7a00] text-[#0c0d0b] text-xs font-bold rounded-xl inline-flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Thêm công việc đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-2.5 mb-6">
          {/* Thanh phân loại và thu gọn công việc */}
          {allFocusTasks.length > 1 && (
            <div className="flex items-center justify-between pb-1 text-xs">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setStatusFilter('tat_ca')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                    statusFilter === 'tat_ca'
                      ? 'bg-[#161714] text-[#f3ece4] border border-[#3a322c]'
                      : 'text-[#c4b6a8] hover:text-[#f3ece4]'
                  }`}
                >
                  Tất cả ({allFocusTasks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('chua_xong')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                    statusFilter === 'chua_xong'
                      ? 'bg-[#161714] text-[#ff7a00] border border-[#ff7a00]/40'
                      : 'text-[#c4b6a8] hover:text-[#f3ece4]'
                  }`}
                >
                  Đang chờ ({allFocusTasks.filter((t) => t.trangThai !== 'hoan_thanh').length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('da_xong')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                    statusFilter === 'da_xong'
                      ? 'bg-[#161714] text-[#3d9a7a] border border-[#3d9a7a]/40'
                      : 'text-[#c4b6a8] hover:text-[#f3ece4]'
                  }`}
                >
                  Đã xong ({allFocusTasks.filter((t) => t.trangThai === 'hoan_thanh').length})
                </button>
              </div>

              {statusFilter === 'tat_ca' && allFocusTasks.some((t) => t.trangThai === 'hoan_thanh') && (
                <button
                  type="button"
                  onClick={() => setCollapseDoneTasks(!collapseDoneTasks)}
                  className="text-[11px] text-[#c4b6a8] hover:text-[#f3ece4] flex items-center gap-1 font-medium"
                >
                  <SlidersHorizontal className="w-3 h-3 text-[#ff7a00]" />
                  <span>{collapseDoneTasks ? 'Hiện đã xong' : 'Thu gọn'}</span>
                </button>
              )}
            </div>
          )}

          {allFocusTasks
            .filter((task) => {
              const isDone = task.trangThai === 'hoan_thanh';
              if (statusFilter === 'chua_xong') return !isDone;
              if (statusFilter === 'da_xong') return isDone;
              if (statusFilter === 'tat_ca' && collapseDoneTasks && isDone) return false;
              return true;
            })
            .map((task) => {
            const sMin = StorageService.timeToMinutes(task.gioBatDau);
            const eMin = StorageService.timeToMinutes(task.gioKetThuc);
            const isToday = task.ngay === Ngay.iso(now);
            const isOngoing = isToday && nowMinutes >= sMin && nowMinutes <= eMin;
            const isDone = task.trangThai === 'hoan_thanh';
            const isOverdue = task.trangThai === 'qua_han';

            let priorityColor = 'border-[#3a322c] text-[#c4b6a8] bg-[#161714]';
            if (task.mucDoUuTien === 'cao') {
              priorityColor = 'border-[#d94a38]/60 text-[#d94a38] bg-[#d94a38]/10';
            } else if (task.mucDoUuTien === 'trung_binh') {
              priorityColor = 'border-[#ff7a00]/60 text-[#ff7a00] bg-[#ff7a00]/10';
            }

            return (
              <div
                key={task.id}
                id={`card-focus-${task.id}`}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isOngoing
                    ? 'bg-[#24170e] border-[#ff7a00] ring-1 ring-[#ff7a00]/50'
                    : isDone
                    ? 'bg-[#161714] border-[#3d9a7a]/50 opacity-80'
                    : isOverdue
                    ? 'bg-[#161714] border-[#d94a38]/40'
                    : 'bg-[#161714] border-[#3a322c]/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left content */}
                  <div className="flex-1 min-w-0">
                    {/* Header tags */}
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#ff7a00] bg-[#0c0d0b] px-2 py-0.5 rounded-lg border border-[#ff7a00]/30 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.gioBatDau} – {task.gioKetThuc}
                      </span>

                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${priorityColor}`}>
                        {task.mucDoUuTien === 'cao' ? 'Ưu tiên cao' : task.mucDoUuTien === 'trung_binh' ? 'Trung bình' : 'Bình thường'}
                      </span>

                      {isOngoing && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#d94a38] text-white animate-pulse">
                          Đang diễn ra
                        </span>
                      )}

                      {isOverdue && !isDone && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#d94a38]/20 text-[#d94a38] border border-[#d94a38]/40">
                          Quá hạn (+30p)
                        </span>
                      )}
                    </div>

                    {/* Task Title */}
                    <div
                      className={`text-sm font-bold ${
                        isDone
                          ? 'line-through text-[#c4b6a8]'
                          : isOverdue
                          ? 'line-through text-[#d94a38]/80'
                          : 'text-[#f3ece4]'
                      }`}
                    >
                      {task.tieuDe}
                    </div>

                    {/* Task Note */}
                    {task.ghiChu && (
                      <p className="text-xs text-[#c4b6a8] mt-1 leading-relaxed">
                        {task.ghiChu}
                      </p>
                    )}

                    {/* Auto-prioritization note */}
                    <div className="text-[11px] text-[#ff7a00] mt-1.5 flex items-center gap-1 font-medium">
                      <Sparkles className="w-3 h-3" />
                      Tự động gạch ngang thói quen cùng giờ bên tab Hôm nay
                    </div>

                    {filterMode === 'all' && (
                      <div className="text-[10px] text-[#c4b6a8]/70 mt-1">
                        Ngày: {task.ngay}
                      </div>
                    )}
                  </div>

                  {/* Right Actions: Tick Button, Edit, Delete */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggle(task.id)}
                      aria-label={isDone ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
                      className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform active:scale-90 ${
                        isDone
                          ? 'bg-[#3d9a7a] text-[#0c0d0b]'
                          : 'bg-[#0c0d0b] border border-[#3a322c] text-transparent hover:border-[#ff7a00]'
                      }`}
                    >
                      <Check className={`w-6 h-6 stroke-[3] ${isDone ? 'opacity-100' : 'opacity-0'}`} />
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(task)}
                        className="w-8 h-8 rounded-lg bg-[#0c0d0b] border border-[#3a322c]/50 text-[#c4b6a8] hover:text-[#f3ece4] flex items-center justify-center"
                        title="Sửa"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(task.id)}
                        className="w-8 h-8 rounded-lg bg-[#0c0d0b] border border-[#3a322c]/50 text-[#c4b6a8] hover:text-[#d94a38] flex items-center justify-center"
                        title="Xoá"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Dòng tóm tắt khi đã thu gọn các công việc đã xong */}
          {statusFilter === 'tat_ca' && collapseDoneTasks && allFocusTasks.some((t) => t.trangThai === 'hoan_thanh') && (
            <div
              onClick={() => setCollapseDoneTasks(false)}
              className="p-2.5 bg-[#0c0d0b] rounded-xl border border-dashed border-[#3a322c] flex items-center justify-between cursor-pointer hover:border-[#3d9a7a] transition-colors"
            >
              <span className="text-xs text-[#3d9a7a] font-medium flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>
                  Đã xong {allFocusTasks.filter((t) => t.trangThai === 'hoan_thanh').length} việc (chạm để mở rộng)
                </span>
              </span>
              <ChevronDown className="w-4 h-4 text-[#c4b6a8]" />
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Focus Task Modal */}
      {showAddModal && (
        <div
          id="modal-them-focus"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-[#161714] border border-[#3a322c] rounded-2xl w-full max-w-md p-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#3a322c]/60 mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#ff7a00]" />
                <h3 className="text-base font-bold text-[#f3ece4]">
                  {taskToEdit ? 'Sửa công việc Focus' : 'Đặt lịch công việc Focus'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg bg-[#0c0d0b] text-[#c4b6a8] hover:text-[#f3ece4] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 bg-[#d94a38]/20 border border-[#d94a38]/50 text-[#d94a38] rounded-xl text-xs font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {formError}
              </div>
            )}

            <div className="space-y-3.5">
              {/* Task Title */}
              <div>
                <label className="block text-xs font-semibold text-[#c4b6a8] mb-1">
                  Tên công việc quan trọng *
                </label>
                <input
                  type="text"
                  value={tieuDe}
                  onChange={(e) => setTieuDe(e.target.value)}
                  placeholder="vd: Họp đối tác chiến lược, Soạn hợp đồng..."
                  className="w-full bg-[#0c0d0b] border border-[#3a322c] focus:border-[#ff7a00] rounded-xl px-3 py-2.5 text-sm text-[#f3ece4] outline-none"
                  autoFocus
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-[#c4b6a8] mb-1">
                  Ngày thực hiện
                </label>
                <input
                  type="date"
                  value={ngay}
                  onChange={(e) => setNgay(e.target.value)}
                  className="w-full bg-[#0c0d0b] border border-[#3a322c] focus:border-[#ff7a00] rounded-xl px-3 py-2 text-sm text-[#f3ece4] outline-none"
                />
              </div>

              {/* Time Range (from - to) */}
              <div>
                <label className="block text-xs font-semibold text-[#c4b6a8] mb-1">
                  Khung giờ (từ - đến) *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-[#c4b6a8] block mb-0.5">Giờ bắt đầu</span>
                    <input
                      type="time"
                      value={gioBatDau}
                      onChange={(e) => setGioBatDau(e.target.value)}
                      className="w-full bg-[#0c0d0b] border border-[#3a322c] focus:border-[#ff7a00] rounded-xl px-3 py-2 text-sm text-[#f3ece4] font-mono outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#c4b6a8] block mb-0.5">Giờ kết thúc</span>
                    <input
                      type="time"
                      value={gioKetThuc}
                      onChange={(e) => setGioKetThuc(e.target.value)}
                      className="w-full bg-[#0c0d0b] border border-[#3a322c] focus:border-[#ff7a00] rounded-xl px-3 py-2 text-sm text-[#f3ece4] font-mono outline-none"
                    />
                  </div>
                </div>

                {/* Quick duration presets */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[10px] text-[#c4b6a8]">Chọn nhanh:</span>
                  <button
                    type="button"
                    onClick={() => applyPreset(30)}
                    className="px-2 py-0.5 bg-[#0c0d0b] border border-[#3a322c] text-[10px] text-[#c4b6a8] hover:text-[#f3ece4] rounded-md"
                  >
                    +30p
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset(60)}
                    className="px-2 py-0.5 bg-[#0c0d0b] border border-[#3a322c] text-[10px] text-[#c4b6a8] hover:text-[#f3ece4] rounded-md"
                  >
                    +1h
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset(90)}
                    className="px-2 py-0.5 bg-[#0c0d0b] border border-[#3a322c] text-[10px] text-[#c4b6a8] hover:text-[#f3ece4] rounded-md"
                  >
                    +1h30
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset(140)}
                    className="px-2 py-0.5 bg-[#0c0d0b] border border-[#3a322c] text-[10px] text-[#c4b6a8] hover:text-[#f3ece4] rounded-md"
                  >
                    +2h20 (vd 15h–17h20)
                  </button>
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-semibold text-[#c4b6a8] mb-1">
                  Mức độ ưu tiên
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMucDoUuTien('cao')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-colors ${
                      mucDoUuTien === 'cao'
                        ? 'bg-[#d94a38]/20 text-[#d94a38] border-[#d94a38]'
                        : 'bg-[#0c0d0b] text-[#c4b6a8] border-[#3a322c]'
                    }`}
                  >
                    Cao
                  </button>
                  <button
                    type="button"
                    onClick={() => setMucDoUuTien('trung_binh')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-colors ${
                      mucDoUuTien === 'trung_binh'
                        ? 'bg-[#ff7a00]/20 text-[#ff7a00] border-[#ff7a00]'
                        : 'bg-[#0c0d0b] text-[#c4b6a8] border-[#3a322c]'
                    }`}
                  >
                    Trung bình
                  </button>
                  <button
                    type="button"
                    onClick={() => setMucDoUuTien('binh_thuong')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-colors ${
                      mucDoUuTien === 'binh_thuong'
                        ? 'bg-[#3d9a7a]/20 text-[#3d9a7a] border-[#3d9a7a]'
                        : 'bg-[#0c0d0b] text-[#c4b6a8] border-[#3a322c]'
                    }`}
                  >
                    Bình thường
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#c4b6a8] mb-1">
                  Ghi chú (tuỳ chọn)
                </label>
                <textarea
                  value={ghiChu}
                  onChange={(e) => setGhiChu(e.target.value)}
                  placeholder="Ghi chú thêm về địa điểm, nội dung..."
                  rows={2}
                  className="w-full bg-[#0c0d0b] border border-[#3a322c] focus:border-[#ff7a00] rounded-xl px-3 py-2 text-xs text-[#f3ece4] outline-none resize-none"
                />
              </div>

              {/* Hint Box */}
              <div className="p-3 bg-[#0c0d0b] border border-[#ff7a00]/30 rounded-xl text-[11px] text-[#c4b6a8] leading-relaxed">
                ⚡ <strong className="text-[#ff7a00]">Nguyên tắc ưu tiên:</strong> Khi công việc này được đặt lịch, các thói quen bên tab Hôm nay có cùng ngày và thời gian sẽ được tự động gạch ngang (vẫn tính là hoàn thành).
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-[#3a322c]/50">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 rounded-xl border border-[#3a322c] text-xs font-semibold text-[#c4b6a8] hover:text-[#f3ece4]"
              >
                Huỷ
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2.5 rounded-xl bg-[#ff7a00] text-[#0c0d0b] text-xs font-bold active:scale-95 shadow-md"
              >
                {taskToEdit ? 'Cập nhật' : 'Lưu lịch Focus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
