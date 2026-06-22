-- Grupos de acesso e catálogo de permissões (telas e ações).
-- Migra vínculos de usuario_perfil para usuario_grupo (perfis viram grupos padrão).

CREATE TABLE grupo_acesso (
    id              BIGSERIAL PRIMARY KEY,
    codigo          VARCHAR(40) NOT NULL,
    nome            VARCHAR(120) NOT NULL,
    descricao       TEXT,
    ativo           BOOLEAN NOT NULL DEFAULT TRUE,
    sistema         BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),
    atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_grupo_acesso_codigo UNIQUE (codigo)
);

CREATE TABLE permissao (
    id              BIGSERIAL PRIMARY KEY,
    codigo          VARCHAR(80) NOT NULL,
    nome            VARCHAR(160) NOT NULL,
    tipo            VARCHAR(10) NOT NULL,
    modulo          VARCHAR(40) NOT NULL,
    descricao       TEXT,
    CONSTRAINT uq_permissao_codigo UNIQUE (codigo),
    CONSTRAINT ck_permissao_tipo CHECK (tipo IN ('TELA', 'ACAO'))
);

CREATE TABLE grupo_permissao (
    grupo_id        BIGINT NOT NULL REFERENCES grupo_acesso (id) ON DELETE CASCADE,
    permissao_id    BIGINT NOT NULL REFERENCES permissao (id) ON DELETE CASCADE,
    PRIMARY KEY (grupo_id, permissao_id)
);

CREATE TABLE usuario_grupo (
    id              BIGSERIAL PRIMARY KEY,
    usuario_id      BIGINT NOT NULL REFERENCES usuario (id) ON DELETE CASCADE,
    grupo_id        BIGINT NOT NULL REFERENCES grupo_acesso (id) ON DELETE CASCADE,
    criado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_usuario_grupo UNIQUE (usuario_id, grupo_id)
);

CREATE INDEX idx_grupo_permissao_permissao_id ON grupo_permissao (permissao_id);
CREATE INDEX idx_usuario_grupo_grupo_id ON usuario_grupo (grupo_id);
CREATE INDEX idx_usuario_grupo_usuario_id ON usuario_grupo (usuario_id);

INSERT INTO permissao (codigo, nome, tipo, modulo, descricao) VALUES
    ('tela.painel', 'Painel', 'TELA', 'painel', 'Visão geral e indicadores'),
    ('tela.projetos', 'Listagem de projetos', 'TELA', 'projeto', 'Lista de demandas/projetos'),
    ('tela.projeto.detalhe', 'Detalhe do projeto', 'TELA', 'projeto', 'Página de detalhe de um projeto'),
    ('tela.clientes', 'Clientes', 'TELA', 'cliente', 'Cadastro e listagem de clientes'),
    ('tela.usuarios', 'Usuários', 'TELA', 'usuario', 'Gestão de usuários'),
    ('tela.socio.propostas', 'Fila do sócio', 'TELA', 'proposta', 'Propostas pendentes de avaliação do sócio'),
    ('tela.grupos', 'Grupos de acesso', 'TELA', 'acesso', 'Gestão de grupos e permissões'),
    ('acao.projeto.criar', 'Criar projeto', 'ACAO', 'projeto', 'Abrir nova demanda'),
    ('acao.projeto.editar', 'Editar projeto', 'ACAO', 'projeto', 'Alterar título, escopo e dados do projeto'),
    ('acao.projeto.associar_cliente', 'Associar cliente ao projeto', 'ACAO', 'projeto', 'Vincular cliente em projeto pendente'),
    ('acao.projeto.listar_todos', 'Listar todos os projetos', 'ACAO', 'projeto', 'Ver projetos de outros usuários'),
    ('acao.cliente.criar', 'Criar cliente', 'ACAO', 'cliente', 'Incluir novo cliente'),
    ('acao.cliente.editar', 'Editar cliente', 'ACAO', 'cliente', 'Alterar cadastro de cliente'),
    ('acao.cliente.excluir', 'Excluir cliente', 'ACAO', 'cliente', 'Remover cliente do cadastro'),
    ('acao.usuario.gerir', 'Gerir usuários', 'ACAO', 'usuario', 'CRUD de usuários'),
    ('acao.usuario.redefinir_senha', 'Redefinir senha', 'ACAO', 'usuario', 'Gerar senha provisória'),
    ('acao.proposta.criar', 'Criar proposta', 'ACAO', 'proposta', 'Nova proposta comercial'),
    ('acao.proposta.editar', 'Editar proposta', 'ACAO', 'proposta', 'Alterar proposta em elaboração'),
    ('acao.proposta.enviar_cliente', 'Enviar proposta ao cliente', 'ACAO', 'proposta', 'Transição de envio ao cliente'),
    ('acao.proposta.aprovar_interno', 'Aprovar proposta internamente', 'ACAO', 'proposta', 'Aprovação administrativa antes do envio'),
    ('acao.socio.proposta.aprovar', 'Aprovar proposta (sócio)', 'ACAO', 'proposta', 'Parecer positivo do sócio'),
    ('acao.socio.proposta.devolver', 'Devolver proposta (sócio)', 'ACAO', 'proposta', 'Devolver proposta para ajustes'),
    ('acao.contrato.criar', 'Criar contrato', 'ACAO', 'contrato', 'Nova proposta de contrato'),
    ('acao.contrato.enviar', 'Enviar contrato ao cliente', 'ACAO', 'contrato', 'Envio do contrato para aceite'),
    ('acao.documento.upload', 'Upload de documento', 'ACAO', 'documento', 'Anexar arquivos ao fluxo'),
    ('acao.interacao.registrar', 'Registrar interação', 'ACAO', 'interacao', 'Registrar resposta ou interação do cliente'),
    ('acao.grupo.gerir', 'Gerir grupos de acesso', 'ACAO', 'acesso', 'CRUD de grupos e atribuição de permissões');

INSERT INTO grupo_acesso (codigo, nome, descricao, ativo, sistema) VALUES
    ('COLABORADOR', 'Colaborador', 'Operações do dia a dia com demandas próprias.', TRUE, TRUE),
    ('ADMINISTRATIVO', 'Administrativo', 'Gestão completa de cadastros, fluxo comercial e usuários.', TRUE, TRUE),
    ('SOCIO', 'Sócio', 'Avaliação estratégica de propostas e visão ampliada.', TRUE, TRUE),
    ('SALA_TECNICA', 'Sala técnica', 'Grupo reservado para trilha técnica (fases futuras).', TRUE, TRUE),
    ('CAMPO', 'Campo', 'Grupo reservado para execução em campo (fases futuras).', TRUE, TRUE),
    ('FINANCEIRO', 'Financeiro', 'Grupo reservado para controle financeiro (fases futuras).', TRUE, TRUE);

-- Colaborador
INSERT INTO grupo_permissao (grupo_id, permissao_id)
SELECT g.id, p.id
FROM grupo_acesso g
CROSS JOIN permissao p
WHERE g.codigo = 'COLABORADOR'
  AND p.codigo IN (
    'tela.painel',
    'tela.projetos',
    'tela.projeto.detalhe',
    'acao.projeto.criar',
    'acao.projeto.editar',
    'acao.projeto.associar_cliente'
  );

-- Administrativo (todas as permissões)
INSERT INTO grupo_permissao (grupo_id, permissao_id)
SELECT g.id, p.id
FROM grupo_acesso g
CROSS JOIN permissao p
WHERE g.codigo = 'ADMINISTRATIVO';

-- Sócio
INSERT INTO grupo_permissao (grupo_id, permissao_id)
SELECT g.id, p.id
FROM grupo_acesso g
CROSS JOIN permissao p
WHERE g.codigo = 'SOCIO'
  AND p.codigo IN (
    'tela.painel',
    'tela.projeto.detalhe',
    'tela.socio.propostas',
    'acao.projeto.listar_todos',
    'acao.socio.proposta.aprovar',
    'acao.socio.proposta.devolver'
  );

-- Grupos reservados: apenas painel por enquanto
INSERT INTO grupo_permissao (grupo_id, permissao_id)
SELECT g.id, p.id
FROM grupo_acesso g
JOIN permissao p ON p.codigo = 'tela.painel'
WHERE g.codigo IN ('SALA_TECNICA', 'CAMPO', 'FINANCEIRO');

-- Migra usuario_perfil → usuario_grupo
INSERT INTO usuario_grupo (usuario_id, grupo_id, criado_em)
SELECT up.usuario_id, g.id, up.criado_em
FROM usuario_perfil up
JOIN grupo_acesso g ON g.codigo = up.perfil
ON CONFLICT (usuario_id, grupo_id) DO NOTHING;
