package br.com.catec.domain.projeto.historico;

import java.time.Instant;
import java.util.List;

public interface ProjetoHistoricoRepository {

    long contarHistoricoProjeto(long projetoId, List<Long> propostaIds);

    List<ProjetoHistoricoLinha> listarHistoricoProjeto(
            long projetoId, List<Long> propostaIds, int offset, int limit);

    record ProjetoHistoricoLinha(
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
