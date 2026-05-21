-- Fluxo do contrato: envio ao cliente, considerações, aceite e recusa.

ALTER TABLE contrato DROP CONSTRAINT IF EXISTS ck_contrato_status;

ALTER TABLE contrato ADD COLUMN IF NOT EXISTS enviado_cliente_em TIMESTAMPTZ;
ALTER TABLE contrato ADD COLUMN IF NOT EXISTS aceito_cliente_em TIMESTAMPTZ;
ALTER TABLE contrato ADD COLUMN IF NOT EXISTS recusado_cliente_em TIMESTAMPTZ;
ALTER TABLE contrato ADD COLUMN IF NOT EXISTS motivo_recusa_cliente TEXT;
ALTER TABLE contrato ADD COLUMN IF NOT EXISTS consideracoes_pendentes BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE contrato ADD CONSTRAINT ck_contrato_status CHECK (status IN (
    'RASCUNHO',
    'ENVIADO_AO_CLIENTE',
    'AGUARDANDO_AJUSTE_ADM',
    'ACEITO',
    'RECUSADO'
));
