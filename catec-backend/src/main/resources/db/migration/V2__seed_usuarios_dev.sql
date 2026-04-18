-- Utilizadores de exemplo (só desenvolvimento). Palavra-passe: "password" (BCrypt).
-- admin@catec.local — ativo, perfil ADMINISTRATIVO
-- inativo@catec.local — inativo (não deve autenticar)

WITH admin AS (
    INSERT INTO usuario (nome, email, senha_hash, telefone, ativo, criado_em, atualizado_em)
    VALUES (
        'Administrador dev',
        'admin@catec.local',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        NULL,
        TRUE,
        now(),
        now()
    )
    RETURNING id
)
INSERT INTO usuario_perfil (usuario_id, perfil, criado_em)
SELECT id, 'ADMINISTRATIVO', now() FROM admin;

WITH ina AS (
    INSERT INTO usuario (nome, email, senha_hash, telefone, ativo, criado_em, atualizado_em)
    VALUES (
        'Conta inativa',
        'inativo@catec.local',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        NULL,
        FALSE,
        now(),
        now()
    )
    RETURNING id
)
INSERT INTO usuario_perfil (usuario_id, perfil, criado_em)
SELECT id, 'COLABORADOR', now() FROM ina;
