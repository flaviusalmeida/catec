-- Contrato aceito: projeto aguarda início da execução (não mais EM_EXECUCAO direto).

UPDATE projeto SET status = 'AGUARDANDO_EXECUCAO' WHERE status = 'EM_EXECUCAO';

UPDATE auditoria_fluxo SET status_novo = 'AGUARDANDO_EXECUCAO'
WHERE status_novo = 'EM_EXECUCAO' AND acao = 'CONTRATO_ACEITO_CLIENTE';

ALTER TABLE projeto DROP CONSTRAINT IF EXISTS ck_projeto_status;

ALTER TABLE projeto ADD CONSTRAINT ck_projeto_status CHECK (status IN (
    'PENDENTE_CLIENTE',
    'AGUARDANDO_PROPOSTA_COMERCIAL',
    'ELABORANDO_PROPOSTA',
    'AGUARDANDO_ACEITE_PROPOSTA',
    'AGUARDANDO_CONTRATO',
    'AGUARDANDO_EXECUCAO',
    'EM_EXECUCAO',
    'CANCELADO'
));
