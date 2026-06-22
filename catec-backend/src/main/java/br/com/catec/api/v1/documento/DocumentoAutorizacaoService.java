package br.com.catec.api.v1.documento;

import br.com.catec.domain.documento.Documento;
import br.com.catec.domain.documento.TipoVinculoDocumento;
import br.com.catec.domain.projeto.Projeto;
import br.com.catec.domain.contrato.Contrato;
import br.com.catec.domain.contrato.ContratoRepository;
import br.com.catec.domain.projeto.ProjetoRepository;
import br.com.catec.domain.proposta.Proposta;
import br.com.catec.domain.proposta.PropostaRepository;
import br.com.catec.security.AuthorizationService;
import br.com.catec.security.UsuarioAutenticado;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Regras de acesso a documentos por permissão e tipo de vínculo.
 */
@Service
public class DocumentoAutorizacaoService {

    private final ProjetoRepository projetoRepository;
    private final PropostaRepository propostaRepository;
    private final ContratoRepository contratoRepository;
    private final AuthorizationService authz;

    public DocumentoAutorizacaoService(
            ProjetoRepository projetoRepository,
            PropostaRepository propostaRepository,
            ContratoRepository contratoRepository,
            AuthorizationService authz) {
        this.projetoRepository = projetoRepository;
        this.propostaRepository = propostaRepository;
        this.contratoRepository = contratoRepository;
        this.authz = authz;
    }

    public void garantirLeitura(Documento documento, UsuarioAutenticado principal) {
        garantirLeituraVinculo(documento.getTipoVinculo(), documento.getVinculoId(), principal);
    }

    public void garantirLeituraVinculo(
            TipoVinculoDocumento tipoVinculo, Long vinculoId, UsuarioAutenticado principal) {
        garantirAcesso(tipoVinculo, vinculoId, principal);
    }

    public void garantirEscrita(TipoVinculoDocumento tipoVinculo, Long vinculoId, UsuarioAutenticado principal) {
        if (tipoVinculo == TipoVinculoDocumento.PROPOSTA || tipoVinculo == TipoVinculoDocumento.CONTRATO) {
            if (!authz.podeGerirFluxoAdministrativo(principal)) {
                negado("Upload de documentos deste vínculo é restrito ao perfil administrativo.");
            }
            return;
        }
        garantirAcesso(tipoVinculo, vinculoId, principal);
    }

    private void garantirAcesso(TipoVinculoDocumento tipoVinculo, Long vinculoId, UsuarioAutenticado principal) {
        if (authz.podeGerirFluxoAdministrativo(principal)) {
            return;
        }
        switch (tipoVinculo) {
            case PROJETO -> garantirAcessoProjeto(vinculoId, principal);
            case PROPOSTA -> garantirAcessoProposta(vinculoId, principal);
            case CONTRATO -> garantirAcessoContrato(vinculoId, principal);
            case RELATORIO_ENTREGA, NF, BOLETO, OUTRO -> negado(
                    "Acesso a documentos deste vínculo é restrito ao perfil administrativo.");
            default -> negado("Tipo de vínculo não suportado para este perfil.");
        }
    }

    private void garantirAcessoProjeto(Long projetoId, UsuarioAutenticado principal) {
        if (authz.podeAprovarComoSocio(principal)) {
            negado("Perfil sócio não tem acesso a documentos de projeto.");
        }
        if (!authz.podeTrabalharComoColaborador(principal)) {
            negado("Perfil sem permissão para documentos de projeto.");
        }
        Projeto projeto = projetoRepository
                .findById(projetoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Projeto não encontrado."));
        if (!authz.podeLerProjeto(principal, projeto.getCriadoPor().getId())) {
            negado("Acesso negado a documentos deste projeto.");
        }
    }

    private void garantirAcessoContrato(Long contratoId, UsuarioAutenticado principal) {
        if (authz.podeAprovarComoSocio(principal)) {
            return;
        }
        if (!authz.podeTrabalharComoColaborador(principal)) {
            negado("Perfil sem permissão para documentos deste contrato.");
        }
        Contrato contrato = contratoRepository
                .findById(contratoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contrato não encontrado."));
        garantirAcessoProjeto(contrato.getProjeto().getId(), principal);
    }

    private void garantirAcessoProposta(Long propostaId, UsuarioAutenticado principal) {
        if (authz.podeAprovarComoSocio(principal)) {
            return;
        }
        if (!authz.podeTrabalharComoColaborador(principal)) {
            negado("Perfil sem permissão para documentos desta proposta.");
        }
        Proposta proposta = propostaRepository
                .findById(propostaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Proposta não encontrada."));
        garantirAcessoProjeto(proposta.getProjeto().getId(), principal);
    }

    private static void negado(String mensagem) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, mensagem);
    }
}
