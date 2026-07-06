ALTER TABLE proposta ADD COLUMN IF NOT EXISTS consideracoes_cliente TEXT;

UPDATE proposta p
SET consideracoes_cliente = sub.texto
FROM (
    SELECT DISTINCT ON (i.entidade_id) i.entidade_id, i.texto
    FROM interacao_fluxo i
    WHERE i.tipo_entidade = 'PROPOSTA'
      AND i.tipo_interacao = 'CONSIDERACOES_CLIENTE'
    ORDER BY i.entidade_id, i.criado_em DESC
) sub
WHERE p.id = sub.entidade_id
  AND p.consideracoes_pendentes = TRUE
  AND p.consideracoes_cliente IS NULL;
