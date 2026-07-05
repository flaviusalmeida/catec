-- Renomeia APROVADA → AGUARDANDO_ENVIO (alinhado ao rótulo exibido na interface).

ALTER TABLE proposta DROP CONSTRAINT ck_proposta_status;

UPDATE proposta SET status = 'AGUARDANDO_ENVIO' WHERE status = 'APROVADA';

UPDATE auditoria_fluxo SET status_novo = 'AGUARDANDO_ENVIO'
WHERE tipo_entidade = 'PROPOSTA' AND status_novo = 'APROVADA';

UPDATE auditoria_fluxo SET status_anterior = 'AGUARDANDO_ENVIO'
WHERE tipo_entidade = 'PROPOSTA' AND status_anterior = 'APROVADA';

ALTER TABLE proposta ADD CONSTRAINT ck_proposta_status CHECK (status IN (
    'RASCUNHO',
    'PENDENTE_AVALIACAO',
    'AGUARDANDO_ENVIO',
    'ENVIADA_AO_CLIENTE',
    'AGUARDANDO_AJUSTE',
    'ACEITA',
    'NEGADA'
));
