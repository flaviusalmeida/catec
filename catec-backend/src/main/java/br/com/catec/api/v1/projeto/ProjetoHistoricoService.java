package br.com.catec.api.v1.projeto;

import br.com.catec.api.v1.common.PageResponse;
import br.com.catec.domain.contrato.Contrato;
import br.com.catec.domain.contrato.ContratoRepository;
import br.com.catec.domain.projeto.Projeto;
import br.com.catec.domain.projeto.ProjetoRepository;
import br.com.catec.domain.projeto.historico.ProjetoHistoricoRepository;
import br.com.catec.domain.projeto.historico.ProjetoHistoricoRepository.ProjetoHistoricoLinha;
import br.com.catec.domain.proposta.Proposta;
import br.com.catec.domain.proposta.PropostaRepository;
import br.com.catec.security.AuthorizationService;
import br.com.catec.security.UsuarioAutenticado;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProjetoHistoricoService {

    private final ProjetoRepository projetoRepository;
    private final PropostaRepository propostaRepository;
    private final ContratoRepository contratoRepository;
    private final ProjetoHistoricoRepository projetoHistoricoRepository;
    private final AuthorizationService authz;

    public ProjetoHistoricoService(
            ProjetoRepository projetoRepository,
            PropostaRepository propostaRepository,
            ContratoRepository contratoRepository,
            ProjetoHistoricoRepository projetoHistoricoRepository,
            AuthorizationService authz) {
        this.projetoRepository = projetoRepository;
        this.propostaRepository = propostaRepository;
        this.contratoRepository = contratoRepository;
        this.projetoHistoricoRepository = projetoHistoricoRepository;
        this.authz = authz;
    }

    @Transactional(readOnly = true)
    public PageResponse<ProjetoHistoricoItemResponse> historico(
            UsuarioAutenticado principal, Long projetoId, int page, int size) {
        Projeto projeto = projetoRepository
                .findById(projetoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Projeto não encontrado."));
        garantirLeitura(projeto, principal);

        int safeSize = Math.max(1, Math.min(size, 100));
        int safePage = Math.max(page, 0);
        int offset = safePage * safeSize;

        List<Long> propostaIds = propostaRepository.findByProjetoIdOrderByVersaoDesc(projetoId).stream()
                .map(Proposta::getId)
                .toList();

        Long contratoId = contratoRepository.findByProjetoId(projetoId).map(Contrato::getId).orElse(null);

        long total = projetoHistoricoRepository.contarHistoricoProjeto(projetoId, propostaIds, contratoId);
        List<ProjetoHistoricoLinha> linhas = projetoHistoricoRepository.listarHistoricoProjeto(
                projetoId, propostaIds, contratoId, offset, safeSize);

        List<ProjetoHistoricoItemResponse> content = linhas.stream().map(this::toResponse).toList();
        return PageResponse.of(content, safePage, safeSize, total);
    }

    private ProjetoHistoricoItemResponse toResponse(ProjetoHistoricoLinha linha) {
        return new ProjetoHistoricoItemResponse(
                linha.origem(),
                linha.registroId(),
                linha.tipoEntidade(),
                linha.entidadeId(),
                linha.acao(),
                linha.statusAnterior(),
                linha.statusNovo(),
                linha.tipoInteracao(),
                linha.texto(),
                linha.documentoId(),
                linha.usuarioId(),
                linha.usuarioNome(),
                linha.ocorridoEm());
    }

    private void garantirLeitura(Projeto p, UsuarioAutenticado principal) {
        if (!authz.podeLerProjeto(principal, p.getCriadoPor().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado a este projeto.");
        }
    }
}
