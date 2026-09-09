// ====================================================================
// VEXIM AUTH CONSTANTS (Sprint audit production)
// MỘT nguồn duy nhất cho mật khẩu demo — không còn lặp literal trong
// mock-data/login/profile (trước đây 'Anthai@88' + backdoor 'admin123'
// bị lặp >10 lần trong JS bundle client).
//
// ⚠️ LƯU Ý TRUNG THỰC: đăng nhập hiện tại là DEMO phía client (cosmetic).
// Client bundle luôn nhìn thấy được NEXT_PUBLIC_* — không bao giờ coi đây
// là bảo mật thật. Production bắt buộc dùng Supabase Auth + RLS
// (xem docs/DATABASE_GO_LIVE_GUIDE.md mục checklist).
// ====================================================================

/** Mật khẩu demo duy nhất — override bằng .env.local nếu muốn đổi */
export const DEMO_PASSWORD: string =
  process.env.NEXT_PUBLIC_DEMO_PASSWORD || 'Anthai@88'
