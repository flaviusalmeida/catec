-- Sócio: acesso à listagem de projetos (home pós-login).

INSERT INTO grupo_permissao (grupo_id, permissao_id)
SELECT g.id, p.id
FROM grupo_acesso g
JOIN permissao p ON p.codigo = 'tela.projetos'
WHERE g.codigo = 'SOCIO'
ON CONFLICT DO NOTHING;
