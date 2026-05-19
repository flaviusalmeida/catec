-- Responsáveis pela empresa (1:N com cliente; UI inicial com um registro).

CREATE TABLE cliente_responsavel (
    id              BIGSERIAL PRIMARY KEY,
    cliente_id      BIGINT NOT NULL REFERENCES cliente (id) ON DELETE CASCADE,
    nome            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    telefone        VARCHAR(11) NOT NULL,
    criado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),
    atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cliente_responsavel_cliente_id ON cliente_responsavel (cliente_id);
