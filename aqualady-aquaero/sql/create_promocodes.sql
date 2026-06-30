-- SQL для создания таблицы promocodes
-- Выполните этот код в SQL Editor панели Supabase (https://supabase.com/dashboard)

CREATE TABLE IF NOT EXISTS public.promocodes (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  max_uses INTEGER NOT NULL DEFAULT 0,
  used_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Индекс для быстрого поиска по коду
CREATE INDEX IF NOT EXISTS idx_promocodes_code ON public.promocodes (code);

-- Разрешаем анонимный доступ (если нужно через anon key)
ALTER TABLE public.promocodes ENABLE ROW LEVEL SECURITY;

-- Политика: анонимные пользователи могут читать промокоды (для проверки при бронировании)
CREATE POLICY "Anyone can read promocodes" ON public.promocodes
  FOR SELECT USING (true);

-- Политика: тренеры (анонимные) могут вставлять/обновлять/удалять
CREATE POLICY "Anyone can insert promocodes" ON public.promocodes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update promocodes" ON public.promocodes
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can delete promocodes" ON public.promocodes
  FOR DELETE USING (true);
