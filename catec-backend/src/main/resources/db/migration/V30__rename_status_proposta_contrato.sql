-- Renomeia PENDENTE_AVALIACAO_SOCIO → PENDENTE_AVALIACAO e AGUARDANDO_AJUSTE_ADM → AGUARDANDO_AJUSTE.

UPDATE proposta SET status = 'PENDENTE_AVALIACAO' WHERE status = 'PENDENTE_AVALIACAO_SOCIO';
UPDATE proposta SET status = 'AGUARDANDO_AJUSTE' WHERE status = 'AGUARDANDO_AJUSTE_ADM';

UPDATE contrato SET status = 'AGUARDANDO_AJUSTE' WHERE status = 'AGUARDANDO_AJUSTE_ADM';

UPDATE auditoria_fluxo SET status_anterior = 'PENDENTE_AVALIACAO' WHERE status_anterior = 'PENDENTE_AVALIACAO_SOCIO';
UPDATE auditoria_fluxo SET status_novo = 'PENDENTE_AVALIACAO' WHERE status_novo = 'PENDENTE_AVALIACAO_SOCIO';
UPDATE auditoria_fluxo SET status_anterior = 'AGUARDANDO_AJUSTE' WHERE status_anterior = 'AGUARDANDO_AJUSTE_ADM';
UPDATE auditoria_fluxo SET status_novo = 'AGUARDANDO_AJUSTE' WHERE status_novo = 'AGUARDANDO_AJUSTE_ADM';

ALTER TABLE proposta DROP CONSTRAINT ck_proposta_status;
ALTER TABLE proposta ADD CONSTRAINT ck_proposta_status CHECK (status IN (
    'RASCUNHO',
    'PENDENTE_AVALIACAO',
    'ENVIADA_AO_CLIENTE',
    'EM_AVALIACAO_CLIENTE',
    'AGUARDANDO_AJUSTE',
    'ACEITA',
    'NEGADA'
));

ALTER TABLE contrato DROP CONSTRAINT ck_contrato_status;
ALTER TABLE contrato ADD CONSTRAINT ck_contrato_status CHECK (status IN (
    'RASCUNHO',
    'ENVIADO_AO_CLIENTE',
    'AGUARDANDO_AJUSTE',
    'ACEITO',
    'RECUSADO'
));

DROP INDEX IF EXISTS idx_proposta_status_requer_socio;
CREATE INDEX idx_proposta_status_requer_socio
    ON proposta (status, requer_avaliacao_socio)
    WHERE status = 'PENDENTE_AVALIACAO';
