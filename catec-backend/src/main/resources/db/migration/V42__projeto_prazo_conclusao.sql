ALTER TABLE projeto ADD COLUMN IF NOT EXISTS prazo_conclusao_dias INTEGER;
ALTER TABLE projeto ADD COLUMN IF NOT EXISTS previsao_conclusao_em TIMESTAMPTZ;
