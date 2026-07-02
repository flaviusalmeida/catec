-- Encerramento manual de projetos aguardando execução (solução paleativa Fase 1).

ALTER TABLE projeto DROP CONSTRAINT IF EXISTS ck_projeto_status;

ALTER TABLE projeto ADD CONSTRAINT ck_projeto_status CHECK (status IN (
    'PENDENTE_CLIENTE',
    'AGUARDANDO_PROPOSTA_COMERCIAL',
    'ELABORANDO_PROPOSTA',
    'AGUARDANDO_ACEITE_PROPOSTA',
    'AGUARDANDO_CONTRATO',
    'AGUARDANDO_EXECUCAO',
    'EM_EXECUCAO',
    'CANCELADO',
    'FINALIZADO'
));
