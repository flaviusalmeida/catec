package br.com.catec.api.v1.documento;

import br.com.catec.domain.documento.Documento;
import br.com.catec.domain.documento.TipoVinculoDocumento;
import br.com.catec.domain.projeto.Projeto;
import br.com.catec.domain.projeto.ProjetoRepository;
import br.com.catec.domain.proposta.Proposta;
import br.com.catec.domain.proposta.PropostaRepository;
import br.com.catec.security.UsuarioAutenticado;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Regras de acesso a documentos por perfil e tipo de vínculo.
 */
@Service
public class DocumentoAutorizacaoService {

    private final ProjetoRepository projetoRepository;
    private final PropostaRepository propostaRepository;

    public DocumentoAutorizacaoService(ProjetoRepository projetoRepository, PropostaRepository propostaRepository) {
        this.projetoRepository = projetoRepository;
        this.propostaRepository = propostaRepository;
    }

    public void garantirLeitura(Documento documento, UsuarioAutenticado principal) {
        garantirLeituraVinculo(documento.getTipoVinculo(), documento.getVinculoId(), principal);
    }

    public void garantirLeituraVinculo(
            TipoVinculoDocumento tipoVinculo, Long vinculoId, UsuarioAutenticado principal) {
        garantirAcesso(tipoVinculo, vinculoId, principal);
    }

    public void garantirEscrita(TipoVinculoDocumento tipoVinculo, Long vinculoId, UsuarioAutenticado principal) {
        if (tipoVinculo == TipoVinculoDocumento.PROPOSTA) {
            if (!isAdministrativo(principal)) {
                negado("Upload de documentos da proposta é restrito ao perfil administrativo.");
            }
            return;
        }
        garantirAcesso(tipoVinculo, vinculoId, principal);
    }

    private void garantirAcesso(TipoVinculoDocumento tipoVinculo, Long vinculoId, UsuarioAutenticado principal) {
        if (isAdministrativo(principal)) {
            return;
        }
        switch (tipoVinculo) {
            case PROJETO -> garantirAcessoProjeto(vinculoId, principal);
            case PROPOSTA -> garantirAcessoProposta(vinculoId, principal);
            case CONTRATO, RELATORIO_ENTREGA, NF, BOLETO, OUTRO -> negado(
                    "Acesso a documentos deste vínculo é restrito ao perfil administrativo.");
            default -> negado("Tipo de vínculo não suportado para este perfil.");
        }
    }

    private void garantirAcessoProjeto(Long projetoId, UsuarioAutenticado principal) {
        if (isSocio(principal)) {
            negado("Perfil sócio não tem acesso a documentos de projeto.");
        }
        if (!isColaborador(principal)) {
            negado("Perfil sem permissão para documentos de projeto.");
        }
        Projeto projeto = projetoRepository
                .findById(projetoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Projeto não encontrado."));
        if (!projeto.getCriadoPor().getId().equals(principal.id())) {
            negado("Acesso negado a documentos deste projeto.");
        }
    }

    private void garantirAcessoProposta(Long propostaId, UsuarioAutenticado principal) {
        if (isSocio(principal)) {
            return;
        }
        if (!isColaborador(principal)) {
            negado("Perfil sem permissão para documentos desta proposta.");
        }
        Proposta proposta = propostaRepository
                .findById(propostaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Proposta não encontrada."));
        garantirAcessoProjeto(proposta.getProjeto().getId(), principal);
    }

    private static boolean isAdministrativo(UsuarioAutenticado principal) {
        return hasRole(principal, "ROLE_ADMINISTRATIVO");
    }

    private static boolean isSocio(UsuarioAutenticado principal) {
        return hasRole(principal, "ROLE_SOCIO");
    }

    private static boolean isColaborador(UsuarioAutenticado principal) {
        return hasRole(principal, "ROLE_COLABORADOR");
    }

    private static boolean hasRole(UsuarioAutenticado principal, String role) {
        for (GrantedAuthority authority : principal.getAuthorities()) {
            if (role.equals(authority.getAuthority())) {
                return true;
            }
        }
        return false;
    }

    private static void negado(String mensagem) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, mensagem);
    }
}
