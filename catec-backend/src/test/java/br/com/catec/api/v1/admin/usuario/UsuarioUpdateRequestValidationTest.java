package br.com.catec.api.v1.admin.usuario;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import br.com.catec.domain.usuario.PerfilMacro;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import java.util.List;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

class UsuarioUpdateRequestValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    @Test
    void atualizacaoComDadosValidos_deveSerValida() {
        var req = new UsuarioUpdateRequest(
                "Usuário Válido",
                "usuario@catec.local",
                "11999990000",
                true,
                List.of(PerfilMacro.COLABORADOR));

        assertTrue(validator.validate(req).isEmpty());
    }

    @Test
    void atualizacaoSemNome_deveSerInvalida() {
        var req = new UsuarioUpdateRequest("", "usuario@catec.local", null, true, List.of(PerfilMacro.COLABORADOR));

        assertFalse(validator.validate(req).isEmpty());
    }

    @Test
    void atualizacaoComEmailInvalido_deveSerInvalida() {
        var req = new UsuarioUpdateRequest("Usuário", "email-invalido", null, true, List.of(PerfilMacro.COLABORADOR));

        assertFalse(validator.validate(req).isEmpty());
    }

    @Test
    void atualizacaoSemPerfis_deveSerInvalida() {
        var req = new UsuarioUpdateRequest("Usuário", "usuario@catec.local", null, true, List.of());

        assertFalse(validator.validate(req).isEmpty());
    }
}
