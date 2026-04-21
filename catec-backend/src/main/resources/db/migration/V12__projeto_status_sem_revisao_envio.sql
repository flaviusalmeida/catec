-- Revisão / envio ao cliente saem do status do projeto (ficam no CRUD de proposta no futuro).

ALTER TABLE projeto DROP CONSTRAINT IF EXISTS ck_projeto_status;

UPDATE projeto
SET status = 'PROPOSTA_CONCLUIDA'
WHERE status IN (
    'AGUARDANDO_REVISAO',
    'EM_REVISAO',
    'PROPOSTA_APROVADA_SOCIO',
    'PROPOSTA_ENVIADA_CLIENTE'
);

ALTER TABLE projeto ADD CONSTRAINT ck_projeto_status CHECK (status IN (
    'PENDENTE_CLIENTE',
    'AGUARDANDO_PROPOSTA_COMERCIAL',
    'ELABORANDO_PROPOSTA',
    'PROPOSTA_CONCLUIDA'
));
