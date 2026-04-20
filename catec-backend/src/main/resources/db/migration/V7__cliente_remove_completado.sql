-- Remove rastreamento de "completado" não utilizado pela aplicação.

ALTER TABLE cliente DROP COLUMN IF EXISTS completado_por_id;
ALTER TABLE cliente DROP COLUMN IF EXISTS completado_em;
