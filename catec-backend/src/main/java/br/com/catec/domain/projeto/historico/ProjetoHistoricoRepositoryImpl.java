package br.com.catec.domain.projeto.historico;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
class ProjetoHistoricoRepositoryImpl implements ProjetoHistoricoRepository {

    private static final String COLUNAS =
            """
            registro_id, origem, ocorrido_em, tipo_entidade, entidade_id, acao,
            status_anterior, status_novo, tipo_interacao, texto, documento_id,
            usuario_id, usuario_nome
            """;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public long contarHistoricoProjeto(long projetoId, List<Long> propostaIds, Long contratoId) {
        Query q = entityManager.createNativeQuery(
                "SELECT COUNT(*) FROM (" + unionSql(propostaIds, contratoId) + ") h");
        bindParams(q, projetoId, propostaIds, contratoId);
        return ((Number) q.getSingleResult()).longValue();
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<ProjetoHistoricoLinha> listarHistoricoProjeto(
            long projetoId, List<Long> propostaIds, Long contratoId, int offset, int limit) {
        Query q = entityManager.createNativeQuery(
                "SELECT " + COLUNAS + " FROM (" + unionSql(propostaIds, contratoId) + ") h ORDER BY ocorrido_em DESC");
        bindParams(q, projetoId, propostaIds, contratoId);
        q.setFirstResult(offset);
        q.setMaxResults(limit);
        List<Object[]> rows = q.getResultList();
        List<ProjetoHistoricoLinha> out = new ArrayList<>(rows.size());
        for (Object[] r : rows) {
            out.add(mapRow(r));
        }
        return out;
    }

    private static String unionSql(List<Long> propostaIds, Long contratoId) {
        StringBuilder sb = new StringBuilder();
        sb.append(
                """
                SELECT a.id AS registro_id,
                       'AUDITORIA' AS origem,
                       a.criado_em AS ocorrido_em,
                       a.tipo_entidade,
                       a.entidade_id,
                       a.acao,
                       a.status_anterior,
                       a.status_novo,
                       NULL::varchar AS tipo_interacao,
                       NULL::text AS texto,
                       NULL::bigint AS documento_id,
                       u.id AS usuario_id,
                       u.nome AS usuario_nome
                FROM auditoria_fluxo a
                JOIN usuario u ON u.id = a.usuario_id
                WHERE a.tipo_entidade = 'PROJETO' AND a.entidade_id = :projetoId
                """);
        if (!propostaIds.isEmpty()) {
            sb.append(
                    """
                    UNION ALL
                    SELECT a.id,
                           'AUDITORIA',
                           a.criado_em,
                           a.tipo_entidade,
                           a.entidade_id,
                           a.acao,
                           a.status_anterior,
                           a.status_novo,
                           NULL,
                           NULL,
                           NULL::bigint,
                           u.id,
                           u.nome
                    FROM auditoria_fluxo a
                    JOIN usuario u ON u.id = a.usuario_id
                    WHERE a.tipo_entidade = 'PROPOSTA' AND a.entidade_id IN (:propostaIds)
                    UNION ALL
                    SELECT i.id,
                           'INTERACAO',
                           i.criado_em,
                           i.tipo_entidade,
                           i.entidade_id,
                           NULL,
                           NULL,
                           NULL,
                           i.tipo_interacao,
                           i.texto,
                           i.documento_id,
                           u.id,
                           u.nome
                    FROM interacao_fluxo i
                    JOIN usuario u ON u.id = i.registrado_por_usuario_id
                    WHERE i.tipo_entidade = 'PROPOSTA' AND i.entidade_id IN (:propostaIds)
                    """);
        }
        if (contratoId != null) {
            sb.append(
                    """
                    UNION ALL
                    SELECT a.id,
                           'AUDITORIA',
                           a.criado_em,
                           a.tipo_entidade,
                           a.entidade_id,
                           a.acao,
                           a.status_anterior,
                           a.status_novo,
                           NULL,
                           NULL,
                           NULL::bigint,
                           u.id,
                           u.nome
                    FROM auditoria_fluxo a
                    JOIN usuario u ON u.id = a.usuario_id
                    WHERE a.tipo_entidade = 'CONTRATO' AND a.entidade_id = :contratoId
                    UNION ALL
                    SELECT i.id,
                           'INTERACAO',
                           i.criado_em,
                           i.tipo_entidade,
                           i.entidade_id,
                           NULL,
                           NULL,
                           NULL,
                           i.tipo_interacao,
                           i.texto,
                           i.documento_id,
                           u.id,
                           u.nome
                    FROM interacao_fluxo i
                    JOIN usuario u ON u.id = i.registrado_por_usuario_id
                    WHERE i.tipo_entidade = 'CONTRATO' AND i.entidade_id = :contratoId
                    """);
        }
        return sb.toString();
    }

    private static void bindParams(Query q, long projetoId, List<Long> propostaIds, Long contratoId) {
        q.setParameter("projetoId", projetoId);
        if (!propostaIds.isEmpty()) {
            q.setParameter("propostaIds", propostaIds);
        }
        if (contratoId != null) {
            q.setParameter("contratoId", contratoId);
        }
    }

    private static ProjetoHistoricoLinha mapRow(Object[] r) {
        return new ProjetoHistoricoLinha(
                (String) r[1],
                ((Number) r[0]).longValue(),
                (String) r[3],
                ((Number) r[4]).longValue(),
                (String) r[5],
                (String) r[6],
                (String) r[7],
                (String) r[8],
                (String) r[9],
                r[10] != null ? ((Number) r[10]).longValue() : null,
                ((Number) r[11]).longValue(),
                (String) r[12],
                toInstant(r[2]));
    }

    private static Instant toInstant(Object value) {
        if (value instanceof Instant instant) {
            return instant;
        }
        if (value instanceof Timestamp ts) {
            return ts.toInstant();
        }
        throw new IllegalStateException("Tipo de data inesperado: " + value.getClass());
    }
}
