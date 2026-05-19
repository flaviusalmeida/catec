package br.com.catec.domain.auditoria;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.catec.domain.usuario.Usuario;
import br.com.catec.domain.usuario.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AuditoriaServiceTest {

    @Mock
    private AuditoriaFluxoRepository auditoriaFluxoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private AuditoriaService service;

    @Test
    void registrarTransicaoStatus_devePersistirRegistro() {
        when(usuarioRepository.getReferenceById(1L)).thenReturn(new Usuario());

        service.registrarTransicaoStatus(
                TipoEntidadeAuditoria.PROPOSTA, 5L, "ENVIAR_CLIENTE", "APROVADA_INTERNA", "ENVIADA_AO_CLIENTE", 1L);

        verify(auditoriaFluxoRepository).save(any(AuditoriaFluxo.class));
    }
}
