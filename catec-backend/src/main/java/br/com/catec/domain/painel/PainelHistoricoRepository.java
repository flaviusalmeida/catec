package br.com.catec.domain.painel;

import java.time.Instant;
import java.util.List;

public interface PainelHistoricoRepository {

    long contarHistoricoProjeto(long projetoId, List<Long> propostaIds);

    List<PainelHistoricoLinha> listarHistoricoProjeto(
            long projetoId, List<Long> propostaIds, int offset, int limit);

    record PainelHistoricoLinha(
            String origem,
            long registroId,
            String tipoEntidade,
            long entidadeId,
            String acao,
            String statusAnterior,
            String statusNovo,
            String tipoInteracao,
            String texto,
            Long documentoId,
            long usuarioId,
            String usuarioNome,
            Instant ocorridoEm) {}
}
