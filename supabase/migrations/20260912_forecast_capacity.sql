-- ====================================================================
-- VEXIM SPRINT 3.3 — FORECAST VELOCITY 50/30/20
-- Migration: 20260912_forecast_capacity.sql (idempotent — chạy lại không sao)
-- Thêm cột velocity 14 ngày vào inventory + backfill giá trị khởi tạo
-- (trung bình 7d/30d) cho các dòng chưa có.
-- ====================================================================

-- 1. Thêm cột (IF NOT EXISTS -> chạy lại an toàn)
ALTER TABLE public.inventory
  ADD COLUMN IF NOT EXISTS daily_velocity_14d NUMERIC(8, 2);

-- 2. Backfill: dòng chưa có dữ liệu 14d -> suy từ trung bình 7d/30d
UPDATE public.inventory
SET daily_velocity_14d = ROUND(((COALESCE(daily_velocity_7d, 0) + COALESCE(daily_velocity_30d, 0)) / 2)::numeric, 2)
WHERE daily_velocity_14d IS NULL;

-- 3. (Tuỳ chọn chính xác hơn) Backfill theo công thức suy rộng 7->14->30
--    v14 ≈ v7 + (v30 - v7) * (7/23) — nội suy tuyến tính giữa 2 mốc
UPDATE public.inventory
SET daily_velocity_14d = ROUND(
  (COALESCE(daily_velocity_7d, 0) + (COALESCE(daily_velocity_30d, 0) - COALESCE(daily_velocity_7d, 0)) * (7.0 / 23.0))::numeric,
  2
)
WHERE daily_velocity_14d IS NOT NULL
  AND daily_velocity_14d = ROUND(((COALESCE(daily_velocity_7d, 0) + COALESCE(daily_velocity_30d, 0)) / 2)::numeric, 2)
  AND daily_velocity_7d IS DISTINCT FROM daily_velocity_30d;

-- Xác minh:
--   SELECT sku, daily_velocity_7d, daily_velocity_14d, daily_velocity_30d FROM public.inventory;
