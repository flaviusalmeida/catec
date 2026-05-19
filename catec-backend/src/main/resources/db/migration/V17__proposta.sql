-- Proposta comercial vinculada ao projeto (máquina de estados §4.2).

CREATE TABLE proposta (
    id                          BIGSERIAL PRIMARY KEY,
    projeto_id                  BIGINT NOT NULL REFERENCES projeto (id),
    status                      VARCHAR(40) NOT NULL,
    versao                      INT NOT NULL DEFAULT 1,
    requer_avaliacao_socio      BOOLEAN NOT NULL DEFAULT FALSE,
    elaborado_por_id            BIGINT NOT NULL REFERENCES usuario (id),
    enviada_cliente_em           TIMESTAMPTZ,
    avaliada_socio_em            TIMESTAMPTZ,
    avaliada_por_socio_id       BIGINT REFERENCES usuario (id),
    aceita_cliente_em            TIMESTAMPTZ,
    negada_cliente_em            TIMESTAMPTZ,
    motivo_negativa_cliente      TEXT,
    consideracoes_pendentes     BOOLEAN NOT NULL DEFAULT FALSE,
    cobranca_proposta_inicio_em TIMESTAMPTZ,
    criado_em                   TIMESTAMPTZ NOT NULL DEFAULT now(),
    atualizado_em               TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_proposta_status CHECK (status IN (
        'RASCUNHO',
        'PENDENTE_AVALIACAO_SOCIO',
        'APROVADA_INTERNA',
        'ENVIADA_AO_CLIENTE',
        'EM_AVALIACAO_CLIENTE',
        'AGUARDANDO_AJUSTE_ADM',
        'ACEITA',
        'NEGADA'
    )),
    CONSTRAINT ck_proposta_versao CHECK (versao >= 1)
);

CREATE INDEX idx_proposta_projeto ON proposta (projeto_id, versao DESC);
CREATE INDEX idx_proposta_status ON proposta (status);
