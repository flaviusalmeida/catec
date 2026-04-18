-- Núcleo de autenticação e cadastro (alinhado a ESPECIFICACAO §8.1 e PLANO §3.2).

CREATE TABLE usuario (
    id              BIGSERIAL PRIMARY KEY,
    nome            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    senha_hash      VARCHAR(255) NOT NULL,
    telefone        VARCHAR(50),
    ativo           BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),
    atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_usuario_email UNIQUE (email)
);

CREATE TABLE usuario_perfil (
    id              BIGSERIAL PRIMARY KEY,
    usuario_id      BIGINT NOT NULL REFERENCES usuario (id) ON DELETE CASCADE,
    perfil          VARCHAR(30) NOT NULL,
    criado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_usuario_perfil_perfil CHECK (perfil IN (
        'COLABORADOR',
        'ADMINISTRATIVO',
        'SOCIO',
        'SALA_TECNICA',
        'CAMPO',
        'FINANCEIRO'
    )),
    CONSTRAINT uq_usuario_perfil_usuario_perfil UNIQUE (usuario_id, perfil)
);

CREATE INDEX idx_usuario_perfil_usuario_id ON usuario_perfil (usuario_id);

CREATE TABLE cliente (
    id                      BIGSERIAL PRIMARY KEY,
    tipo_pessoa             VARCHAR(2) NOT NULL,
    razao_social_ou_nome    VARCHAR(255) NOT NULL,
    nome_fantasia           VARCHAR(255),
    documento               VARCHAR(20),
    email                   VARCHAR(255),
    telefone                VARCHAR(50),
    endereco_logradouro     VARCHAR(255),
    endereco_cidade         VARCHAR(120),
    endereco_uf             CHAR(2),
    endereco_cep            VARCHAR(10),
    observacoes             TEXT,
    cadastro_completo       BOOLEAN NOT NULL DEFAULT FALSE,
    completado_por_id       BIGINT REFERENCES usuario (id),
    completado_em           TIMESTAMPTZ,
    criado_em               TIMESTAMPTZ NOT NULL DEFAULT now(),
    atualizado_em           TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_cliente_tipo_pessoa CHECK (tipo_pessoa IN ('PJ', 'PF'))
);

CREATE UNIQUE INDEX uq_cliente_documento ON cliente (documento)
    WHERE documento IS NOT NULL AND btrim(documento) <> '';
