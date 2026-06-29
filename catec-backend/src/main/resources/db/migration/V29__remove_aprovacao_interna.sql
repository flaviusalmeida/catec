-- Remove status APROVADA_INTERNA e permissão de aprovação interna.

UPDATE proposta SET status = 'RASCUNHO' WHERE status = 'APROVADA_INTERNA';

ALTER TABLE proposta DROP CONSTRAINT ck_proposta_status;
ALTER TABLE proposta ADD CONSTRAINT ck_proposta_status CHECK (status IN (
    'RASCUNHO',
    'PENDENTE_AVALIACAO_SOCIO',
    'ENVIADA_AO_CLIENTE',
    'EM_AVALIACAO_CLIENTE',
    'AGUARDANDO_AJUSTE_ADM',
    'ACEITA',
    'NEGADA'
));

DELETE FROM grupo_permissao
WHERE permissao_id IN (SELECT id FROM permissao WHERE codigo = 'acao.proposta.aprovar_interno');

DELETE FROM permissao WHERE codigo = 'acao.proposta.aprovar_interno';
