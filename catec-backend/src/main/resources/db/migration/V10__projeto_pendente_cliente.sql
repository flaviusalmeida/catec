-- Demanda pode existir sem cliente (título + descrição); estado PENDENTE_CLIENTE até associar cliente.
-- Auditoria: quando o cliente foi associado e por qual usuário.

ALTER TABLE projeto DROP CONSTRAINT IF EXISTS ck_projeto_status;

ALTER TABLE projeto ALTER COLUMN cliente_id DROP NOT NULL;
ALTER TABLE projeto ALTER COLUMN email_contato DROP NOT NULL;

ALTER TABLE projeto
    ADD COLUMN cliente_associado_em TIMESTAMPTZ,
    ADD COLUMN cliente_associado_por_id BIGINT REFERENCES usuario (id);

UPDATE projeto
SET cliente_associado_em = criado_em,
    cliente_associado_por_id = criado_por_id
WHERE cliente_id IS NOT NULL;

ALTER TABLE projeto ADD CONSTRAINT ck_projeto_status CHECK (status IN (
    'PENDENTE_CLIENTE',
    'CRIADO',
    'AGUARDANDO_ADM',
    'EM_PROPOSTA'
));

ALTER TABLE projeto ADD CONSTRAINT ck_projeto_cliente_coerente CHECK (
    (status = 'PENDENTE_CLIENTE' AND cliente_id IS NULL)
    OR (status <> 'PENDENTE_CLIENTE' AND cliente_id IS NOT NULL)
);

ALTER TABLE projeto ADD CONSTRAINT ck_projeto_email_quando_cliente CHECK (
    (cliente_id IS NULL)
    OR (cliente_id IS NOT NULL AND email_contato IS NOT NULL AND length(trim(email_contato)) > 0)
);
