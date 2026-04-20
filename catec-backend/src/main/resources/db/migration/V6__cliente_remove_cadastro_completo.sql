-- Coluna não utilizada pela aplicação (cadastro de cliente via admin).

ALTER TABLE cliente DROP COLUMN IF EXISTS cadastro_completo;
