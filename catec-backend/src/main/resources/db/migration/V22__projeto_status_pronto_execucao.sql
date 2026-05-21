-- Projeto pronto para execução quando a proposta comercial é aceita pelo cliente.

ALTER TABLE projeto DROP CONSTRAINT IF EXISTS ck_projeto_status;

ALTER TABLE projeto ADD CONSTRAINT ck_projeto_status CHECK (status IN (
    'PENDENTE_CLIENTE',
    'AGUARDANDO_PROPOSTA_COMERCIAL',
    'ELABORANDO_PROPOSTA',
    'AGUARDANDO_ACEITE_PROPOSTA',
    'PRONTO_PARA_EXECUCAO',
    'CANCELADO'
));
