-- Registro interno de interações que representam resposta/decisão do cliente (sem login externo).

CREATE TABLE interacao_fluxo (
    id                          BIGSERIAL PRIMARY KEY,
    tipo_entidade               VARCHAR(40) NOT NULL,
    entidade_id                 BIGINT NOT NULL,
    tipo_interacao              VARCHAR(60) NOT NULL,
    texto                       TEXT NOT NULL,
    registrado_por_usuario_id   BIGINT NOT NULL REFERENCES usuario (id),
    documento_id                BIGINT REFERENCES documento (id),
    criado_em                   TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_interacao_tipo_entidade CHECK (tipo_entidade IN ('PROPOSTA', 'CONTRATO')),
    CONSTRAINT ck_interacao_tipo_interacao CHECK (tipo_interacao IN (
        'CONSIDERACOES_CLIENTE',
        'ACEITE_CLIENTE',
        'RECUSA_CLIENTE'
    ))
);

CREATE INDEX idx_interacao_fluxo_entidade ON interacao_fluxo (tipo_entidade, entidade_id, criado_em DESC);
