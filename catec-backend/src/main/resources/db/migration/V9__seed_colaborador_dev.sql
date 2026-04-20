-- Usuário de desenvolvimento com perfil COLABORADOR (senha: "password", mesmo BCrypt que V2).
WITH colab AS (
    INSERT INTO usuario (nome, email, senha_hash, telefone, ativo, criado_em, atualizado_em)
    VALUES (
        'Colaborador dev',
        'colab@catec.local',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        NULL,
        TRUE,
        now(),
        now()
    )
    RETURNING id
)
INSERT INTO usuario_perfil (usuario_id, perfil, criado_em)
SELECT id, 'COLABORADOR', now() FROM colab;
