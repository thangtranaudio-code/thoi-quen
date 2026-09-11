import { AuraProfile } from './types';

export const He = {
  napNgay: 200,
  expTick: 10,
  expCan: 10,
  kindHabit: 'habit',
  kindTap: 'tap',
  kindCan: 'can',
  kindLua: 'lua',

  canCap: (level: number): number => 80 + level * 40,

  expTap: (kcal: number): number => {
    const k = kcal < 0 ? 0 : kcal;
    return 20 + Math.floor(k / 25);
  },

  sucTam: ({
    luc,
    ben,
    coKy,
  }: {
    luc: number;
    ben: number;
    coKy: boolean;
  }): number => 10 + luc * 2 + ben + (coKy ? 5 : 0),

  lenCap: ({
    level,
    exp,
    unspent,
  }: {
    level: number;
    exp: number;
    unspent: number;
  }): { level: number; exp: number; unspent: number; lan: number } => {
    let lv = level;
    let e = exp;
    let u = unspent;
    let n = 0;
    while (e >= He.canCap(lv)) {
      e -= He.canCap(lv);
      lv++;
      u += 3;
      n++;
    }
    return { level: lv, exp: e, unspent: u, lan: n };
  },

  cauLenCap: [
    'Cấp mới. Cơ thể nhớ.',
    'Bạn vừa vượt chính mình.',
    'Nặng hơn một bậc. Đứng vững.',
    'Sức không đến từ lời. Đến từ hôm nay.',
    'Cấp lên. Không quay lại.',
    'Một bước thật. Giữ lấy.',
    'Thân này vừa chắc hơn.',
    'Im. Rồi đi tiếp.',
    'Bạn đã chứng minh.',
    'Lửa còn. Đi tiếp.',
  ],

  cauKhichLe: [
    'Xong một việc. Còn hơi.',
    'Đúng nhịp. Giữ.',
    'Nhỏ nhưng thật.',
    'Hôm nay đang thành hình.',
    'Một lần. Một lần thắng.',
    'Không cần lớn. Cần đều.',
    'Cơ thể ghi nhận.',
    'Sạch. Gọn. Xong.',
    'Bạn đang xây Hệ.',
    'Ổn. Tiếp.',
    'Việc này thuộc về bạn.',
    'Không ồn. Chỉ làm.',
    'Đủ để đi tiếp.',
    'Nặng nhẹ không quan trọng. Đã làm.',
  ],

  cauLuaTang: 'Lửa vừa nối. Đừng để tắt.',

  manhPool: [
    'Có thứ đang lắng trong người. Chưa có tên.',
    'Hôm nay để lại một mảnh. Nhặt sau.',
    'Nhịp thở vừa đổi. Nhẹ thôi.',
    'Một góc tối vừa sáng hơn một tấc.',
    'Cơ thể biết. Đầu chưa kịp.',
    'Im lặng cũng là dấu. Giữ.',
    'Mảnh này không lớn. Nhưng thật.',
  ],

  ngaunhien: (arr: string[]): string => {
    return arr[Math.floor(Math.random() * arr.length)];
  },
};
