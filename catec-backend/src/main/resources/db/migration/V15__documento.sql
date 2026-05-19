-- Metadados de arquivos; bytes em storage externo (chave opaca, sem path público).

CREATE TABLE documento (
    id                  BIGSERIAL PRIMARY KEY,
    tipo_vinculo        VARCHAR(40) NOT NULL,
    vinculo_id          BIGINT NOT NULL,
    tipo_arquivo        VARCHAR(60),
    nome_original       VARCHAR(500) NOT NULL,
    chave_storage       VARCHAR(512) NOT NULL,
    mime_type           VARCHAR(127) NOT NULL,
    tamanho_bytes       BIGINT NOT NULL,
    versao              INT NOT NULL DEFAULT 1,
    uploaded_por_id     BIGINT NOT NULL REFERENCES usuario (id),
    criado_em           TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_documento_tipo_vinculo CHECK (
        tipo_vinculo IN ('PROJETO', 'PROPOSTA', 'CONTRATO', 'RELATORIO_ENTREGA', 'NF', 'BOLETO', 'OUTRO')
    ),
    CONSTRAINT ck_documento_tamanho CHECK (tamanho_bytes > 0),
    CONSTRAINT ck_documento_versao CHECK (versao >= 1),
    CONSTRAINT uq_documento_chave_storage UNIQUE (chave_storage)
);

CREATE INDEX idx_documento_vinculo ON documento (tipo_vinculo, vinculo_id);
CREATE INDEX idx_documento_uploaded_por ON documento (uploaded_por_id);
CREATE INDEX idx_documento_vinculo_versao ON documento (tipo_vinculo, vinculo_id, versao DESC);
