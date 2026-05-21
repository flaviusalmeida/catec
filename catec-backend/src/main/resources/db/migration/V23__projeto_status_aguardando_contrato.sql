-- Após aceite da proposta: projeto aguardando contrato (substitui PRONTO_PARA_EXECUCAO).

UPDATE projeto SET status = 'AGUARDANDO_CONTRATO' WHERE status = 'PRONTO_PARA_EXECUCAO';

ALTER TABLE projeto DROP CONSTRAINT IF EXISTS ck_projeto_status;

ALTER TABLE projeto ADD CONSTRAINT ck_projeto_status CHECK (status IN (
    'PENDENTE_CLIENTE',
    'AGUARDANDO_PROPOSTA_COMERCIAL',
    'ELABORANDO_PROPOSTA',
    'AGUARDANDO_ACEITE_PROPOSTA',
    'AGUARDANDO_CONTRATO',
    'CANCELADO'
));
