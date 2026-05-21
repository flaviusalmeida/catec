-- Após envio ao cliente, o projeto aguarda aceite (ou considerações) da proposta comercial.

ALTER TABLE projeto DROP CONSTRAINT IF EXISTS ck_projeto_status;

UPDATE projeto
SET status = 'AGUARDANDO_ACEITE_PROPOSTA'
WHERE status = 'PROPOSTA_CONCLUIDA';

ALTER TABLE projeto ADD CONSTRAINT ck_projeto_status CHECK (status IN (
    'PENDENTE_CLIENTE',
    'AGUARDANDO_PROPOSTA_COMERCIAL',
    'ELABORANDO_PROPOSTA',
    'AGUARDANDO_ACEITE_PROPOSTA'
));
