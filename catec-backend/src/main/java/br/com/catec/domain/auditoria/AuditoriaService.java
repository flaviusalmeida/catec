package br.com.catec.domain.auditoria;

import br.com.catec.domain.usuario.Usuario;
import br.com.catec.domain.usuario.UsuarioRepository;
import java.time.Instant;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditoriaService {

    private final AuditoriaFluxoRepository auditoriaFluxoRepository;
    private final UsuarioRepository usuarioRepository;

    public AuditoriaService(AuditoriaFluxoRepository auditoriaFluxoRepository, UsuarioRepository usuarioRepository) {
        this.auditoriaFluxoRepository = auditoriaFluxoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public void registrarTransicaoStatus(
            TipoEntidadeAuditoria tipoEntidade,
            Long entidadeId,
            String acao,
            String statusAnterior,
            String statusNovo,
            Long usuarioId) {
        registrar(tipoEntidade, entidadeId, acao, statusAnterior, statusNovo, usuarioId, null);
    }

    @Transactional
    public void registrar(
            TipoEntidadeAuditoria tipoEntidade,
            Long entidadeId,
            String acao,
            String statusAnterior,
            String statusNovo,
            Long usuarioId,
            String payloadJson) {
        Usuario usuario = usuarioRepository.getReferenceById(usuarioId);
        AuditoriaFluxo registro = new AuditoriaFluxo();
        registro.setTipoEntidade(tipoEntidade);
        registro.setEntidadeId(entidadeId);
        registro.setAcao(acao);
        registro.setStatusAnterior(statusAnterior);
        registro.setStatusNovo(statusNovo);
        registro.setUsuario(usuario);
        registro.setPayloadJson(payloadJson);
        registro.setCriadoEm(Instant.now());
        auditoriaFluxoRepository.save(registro);
    }
}
