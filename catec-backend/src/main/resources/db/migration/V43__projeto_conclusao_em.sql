ALTER TABLE projeto ADD COLUMN IF NOT EXISTS conclusao_em TIMESTAMPTZ;

UPDATE projeto
SET conclusao_em = atualizado_em
WHERE status = 'FINALIZADO'
  AND conclusao_em IS NULL;
