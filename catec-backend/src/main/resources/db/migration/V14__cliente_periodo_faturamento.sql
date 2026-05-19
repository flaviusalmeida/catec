-- Período de faturamento do cliente (texto livre, obrigatório).

ALTER TABLE cliente
    ADD COLUMN periodo_faturamento VARCHAR(100) NOT NULL DEFAULT 'A definir';

ALTER TABLE cliente
    ALTER COLUMN periodo_faturamento DROP DEFAULT;
