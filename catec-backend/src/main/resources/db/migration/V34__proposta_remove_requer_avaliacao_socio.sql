-- Toda proposta passa pela avaliação do sócio; coluna requer_avaliacao_socio deixa de ser usada.

DROP INDEX IF EXISTS idx_proposta_status_requer_socio;

ALTER TABLE proposta DROP COLUMN IF EXISTS requer_avaliacao_socio;

CREATE INDEX idx_proposta_status_pendente_avaliacao
    ON proposta (status)
    WHERE status = 'PENDENTE_AVALIACAO';
