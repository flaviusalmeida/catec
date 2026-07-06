ALTER TABLE contrato ADD COLUMN IF NOT EXISTS consideracoes_cliente TEXT;

UPDATE contrato c
SET consideracoes_cliente = sub.texto
FROM (
    SELECT DISTINCT ON (i.entidade_id) i.entidade_id, i.texto
    FROM interacao_fluxo i
    WHERE i.tipo_entidade = 'CONTRATO'
      AND i.tipo_interacao = 'CONSIDERACOES_CLIENTE'
    ORDER BY i.entidade_id, i.criado_em DESC
) sub
WHERE c.id = sub.entidade_id
  AND c.consideracoes_pendentes = TRUE
  AND c.consideracoes_cliente IS NULL;
