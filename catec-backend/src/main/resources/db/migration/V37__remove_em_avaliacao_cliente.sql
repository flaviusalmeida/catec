-- Migra registros legados e remove EM_AVALIACAO_CLIENTE do domínio.
UPDATE proposta SET status = 'ENVIADA_AO_CLIENTE' WHERE status = 'EM_AVALIACAO_CLIENTE';
UPDATE auditoria_fluxo SET status_anterior = 'ENVIADA_AO_CLIENTE' WHERE status_anterior = 'EM_AVALIACAO_CLIENTE';
UPDATE auditoria_fluxo SET status_novo = 'ENVIADA_AO_CLIENTE' WHERE status_novo = 'EM_AVALIACAO_CLIENTE';

ALTER TABLE proposta DROP CONSTRAINT ck_proposta_status;
ALTER TABLE proposta ADD CONSTRAINT ck_proposta_status CHECK (status IN (
    'RASCUNHO',
    'PENDENTE_AVALIACAO',
    'ENVIADA_AO_CLIENTE',
    'AGUARDANDO_AJUSTE',
    'ACEITA',
    'NEGADA'
));
