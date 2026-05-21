-- Contrato vinculado ao projeto (elaboração após aceite da proposta comercial).

CREATE TABLE contrato (
    id               BIGSERIAL PRIMARY KEY,
    projeto_id       BIGINT NOT NULL REFERENCES projeto (id),
    status           VARCHAR(40) NOT NULL,
    elaborado_por_id BIGINT NOT NULL REFERENCES usuario (id),
    criado_em        TIMESTAMPTZ NOT NULL DEFAULT now(),
    atualizado_em    TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_contrato_status CHECK (status IN ('RASCUNHO')),
    CONSTRAINT uq_contrato_projeto UNIQUE (projeto_id)
);

CREATE INDEX idx_contrato_projeto ON contrato (projeto_id);
