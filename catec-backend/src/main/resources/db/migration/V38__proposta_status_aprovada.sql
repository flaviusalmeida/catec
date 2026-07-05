-- Proposta aprovada pelo sócio, aguardando envio ao cliente (antes: RASCUNHO + avaliada_socio_em).

ALTER TABLE proposta DROP CONSTRAINT ck_proposta_status;

UPDATE proposta
SET status = 'APROVADA'
WHERE status = 'RASCUNHO'
  AND avaliada_socio_em IS NOT NULL;

UPDATE auditoria_fluxo
SET status_novo = 'APROVADA'
WHERE tipo_entidade = 'PROPOSTA'
  AND acao = 'APROVAR_SOCIO'
  AND status_novo = 'RASCUNHO';

ALTER TABLE proposta ADD CONSTRAINT ck_proposta_status CHECK (status IN (
    'RASCUNHO',
    'PENDENTE_AVALIACAO',
    'APROVADA',
    'ENVIADA_AO_CLIENTE',
    'AGUARDANDO_AJUSTE',
    'ACEITA',
    'NEGADA'
));
