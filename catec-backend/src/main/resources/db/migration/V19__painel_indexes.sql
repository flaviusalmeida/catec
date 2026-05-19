-- Índices para consultas do painel (resumo, filtros por cliente/prazo).

CREATE INDEX IF NOT EXISTS idx_projeto_atualizado_em ON projeto (atualizado_em DESC);
CREATE INDEX IF NOT EXISTS idx_projeto_cliente_atualizado ON projeto (cliente_id, atualizado_em DESC);

CREATE INDEX IF NOT EXISTS idx_proposta_status_requer_socio
    ON proposta (status, requer_avaliacao_socio)
    WHERE status = 'PENDENTE_AVALIACAO_SOCIO';
