// Dịch vụ Quản lý Âm thanh & Phần thưởng Cảm xúc (Emotional Rewards Service)
// Hoạt động 100% offline, không phụ thuộc thư viện ngoài, dùng Web Audio API tổng hợp âm thanh nhẹ nhàng.

export interface PhanThuongItem {
  id: string;
  loai: 'habit_tick' | 'all_habits_done' | 'focus_done' | 'streak_milestone';
  tieuDe: string;
  thongDiep: string;
  bieuTuong: string; // Emoji / Icon descriptor
  diemThuong: number;
  tenDoiTuong?: string;
  thoiGian: number;
}

type Listener = (thuong: PhanThuongItem) => void;

class CamXucServiceImpl {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private listeners: Set<Listener> = new Set();

  constructor() {
    // Load sound preference from localStorage
    try {
      const saved = localStorage.getItem('thoi_quen_am_thanh');
      if (saved !== null) {
        this.soundEnabled = saved === 'true';
      }
    } catch {
      this.soundEnabled = true;
    }
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    try {
      localStorage.setItem('thoi_quen_am_thanh', String(enabled));
    } catch {
      // Ignore
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(item: PhanThuongItem): void {
    this.listeners.forEach((fn) => fn(item));
  }

  // --- ÂM THANH CHIME BẰNG WEB AUDIO API (OFFLINE) ---
  private getAudioContext(): AudioContext | null {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Phát nốt nhạc êm ái, âm sắc ấm
  private playTone(freq: number, duration: number, delay: number = 0, gainLevel: number = 0.08) {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine'; // Sóng sin êm dịu, không chói tai
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(gainLevel, ctx.currentTime + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration + 0.05);
    } catch {
      // Browsers might block audio until first user interaction
    }
  }

  // 1. Chime khi tick 1 thói quen (Double Chime nhẹ nhàng: Do5 -> Mi5)
  public playHabitTickSound() {
    this.playTone(523.25, 0.15, 0, 0.07); // C5
    this.playTone(659.25, 0.28, 0.08, 0.09); // E5
  }

  // 2. Chime khi hoàn thành Focus (Zen Bell: La4 -> Đô#5 -> Mi5)
  public playFocusDoneSound() {
    this.playTone(440.0, 0.2, 0, 0.08); // A4
    this.playTone(554.37, 0.22, 0.1, 0.09); // C#5
    this.playTone(659.25, 0.35, 0.2, 0.1); // E5
  }

  // 3. Âm thanh ăn mừng hoàn thành 100% ngày (Arpeggio hân hoan: C5 -> E5 -> G5 -> C6)
  public playCelebrationSound() {
    this.playTone(523.25, 0.18, 0, 0.08);
    this.playTone(659.25, 0.2, 0.1, 0.09);
    this.playTone(783.99, 0.25, 0.2, 0.1);
    this.playTone(1046.5, 0.45, 0.32, 0.12);
  }

  // --- BỘ SƯU TẬP CÂU NÓI TRUYỀN CẢM HỨNG (VIỆT HÓA CHUẨN MỰC) ---
  private readonly CAU_NOI_HABIT = [
    'Mỗi hành động nhỏ hôm nay là một lời hứa với chính mình đã được giữ trọn.',
    'Kỷ luật là tự do và là niềm kiêu hãnh của ngày mai.',
    'Bạn đang từng bước trở thành phiên bản tốt hơn của ngày hôm qua.',
    'Thêm một viên gạch vững chãi trên hành trình xây dựng lối sống bền bỉ.',
    'Sự kiên trì đang dần biến nỗ lực thành thói quen tự nhiên.',
    'Chiến thắng lớn nhất chính là chiến thắng sự chần chừ của bản thân!',
    'Một việc nhỏ hoàn tất, một nguồn năng lượng tích cực lan tỏa.',
    'Tuyệt vời! Hãy tự hào về sự kiên định không ngừng nghỉ của bạn.',
  ];

  private readonly CAU_NOI_FOCUS = [
    'Tập trung sâu xuất sắc! Bạn đã làm chủ trọn vẹn thời gian của mình.',
    'Tâm trí tĩnh lặng và sắc bén tạo nên năng suất vượt bậc.',
    'Hoàn thành một mục tiêu quan trọng mang lại cảm giác nhẹ nhõm tuyệt vời.',
    'Khả năng tập trung cao độ là tài sản quý giá nhất trong kỷ nguyên số.',
    'Trạng thái dòng chảy (Flow State) hoàn hảo! Hãy hít thở sâu và thư giãn nhé.',
  ];

  private readonly CAU_NOI_ALL_DONE = [
    'Xuất sắc! Bạn đã hoàn thành 100% thói quen của ngày hôm nay!',
    'Một ngày trọn vẹn và đáng tự hào! Hãy dành cho mình một buổi tối thảnh thơi.',
    'Kỷ luật trọn vẹn: Không thói quen nào bị bỏ lại phía sau!',
    'Bạn đã chứng minh rằng ý chí kiên định có thể chinh phục mọi mục tiêu.',
  ];

  // Kích hoạt phần thưởng cảm xúc khi tick thói quen
  public kichHoatTickHabit(tenHabit: string, isAllCompletedToday: boolean = false): void {
    if (isAllCompletedToday) {
      this.playCelebrationSound();
      const quote = this.CAU_NOI_ALL_DONE[Math.floor(Math.random() * this.CAU_NOI_ALL_DONE.length)];
      this.notify({
        id: `reward-${Date.now()}`,
        loai: 'all_habits_done',
        tieuDe: '🎉 100% Ngày Trọn Vẹn!',
        thongDiep: quote,
        bieuTuong: '🏆',
        diemThuong: 50,
        tenDoiTuong: tenHabit,
        thoiGian: Date.now(),
      });
    } else {
      this.playHabitTickSound();
      const quote = this.CAU_NOI_HABIT[Math.floor(Math.random() * this.CAU_NOI_HABIT.length)];
      this.notify({
        id: `reward-${Date.now()}`,
        loai: 'habit_tick',
        tieuDe: '✨ Giữ Vững Kỷ Luật',
        thongDiep: quote,
        bieuTuong: '🌟',
        diemThuong: 20,
        tenDoiTuong: tenHabit,
        thoiGian: Date.now(),
      });
    }
  }

  // Kích hoạt phần thưởng cảm xúc khi hoàn thành Focus
  public kichHoatFocusDone(tieuDeFocus: string): void {
    this.playFocusDoneSound();
    const quote = this.CAU_NOI_FOCUS[Math.floor(Math.random() * this.CAU_NOI_FOCUS.length)];
    this.notify({
      id: `reward-${Date.now()}`,
      loai: 'focus_done',
      tieuDe: '🧠 Tập Trung Sâu Hoàn Thành',
      thongDiep: quote,
      bieuTuong: '⚡',
      diemThuong: 30,
      tenDoiTuong: tieuDeFocus,
      thoiGian: Date.now(),
    });
  }
}

export const CamXucService = new CamXucServiceImpl();
