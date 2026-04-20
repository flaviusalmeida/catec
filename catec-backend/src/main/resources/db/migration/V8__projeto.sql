-- Demanda inicial (projeto) vinculada a cliente existente.
-- Política: cliente_id obrigatório — referência a registo já persistido em `cliente` (sem "cliente rascunho" nesta fase).

CREATE TABLE projeto (
    id                  BIGSERIAL PRIMARY KEY,
    cliente_id          BIGINT NOT NULL REFERENCES cliente (id),
    titulo              VARCHAR(500) NOT NULL,
    escopo              TEXT NOT NULL,
    email_contato       VARCHAR(255) NOT NULL,
    telefone_contato    VARCHAR(20),
    criado_por_id       BIGINT NOT NULL REFERENCES usuario (id),
    status              VARCHAR(40) NOT NULL,
    criado_em           TIMESTAMPTZ NOT NULL DEFAULT now(),
    atualizado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_projeto_status CHECK (status IN ('CRIADO', 'AGUARDANDO_ADM', 'EM_PROPOSTA'))
);

CREATE INDEX idx_projeto_cliente_id ON projeto (cliente_id);
CREATE INDEX idx_projeto_criado_por_id ON projeto (criado_por_id);
CREATE INDEX idx_projeto_status ON projeto (status);
