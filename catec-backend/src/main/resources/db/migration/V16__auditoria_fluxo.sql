-- Auditoria de transições e ações sensíveis no fluxo comercial/contratual.

CREATE TABLE auditoria_fluxo (
    id              BIGSERIAL PRIMARY KEY,
    tipo_entidade   VARCHAR(40) NOT NULL,
    entidade_id     BIGINT NOT NULL,
    acao            VARCHAR(80) NOT NULL,
    status_anterior VARCHAR(40),
    status_novo     VARCHAR(40),
    usuario_id      BIGINT NOT NULL REFERENCES usuario (id),
    payload_json    TEXT,
    criado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_auditoria_tipo_entidade CHECK (
        tipo_entidade IN ('PROJETO', 'PROPOSTA', 'CONTRATO', 'ORDEM_SERVICO', 'RELATORIO_ENTREGA')
    )
);

CREATE INDEX idx_auditoria_entidade ON auditoria_fluxo (tipo_entidade, entidade_id, criado_em DESC);
CREATE INDEX idx_auditoria_usuario ON auditoria_fluxo (usuario_id, criado_em DESC);
