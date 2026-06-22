package br.com.catec.api.v1.admin.usuario;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import java.util.List;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/** Garante que o cadastro admin não exige envio de senha no JSON (senha é gerada no servidor). */
class UsuarioCreateRequestValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    @Test
    void criacaoComNomeEmailGrupos_semSenha_noPayload_estaValido() {
        var req = new UsuarioCreateRequest("Fulano", "fulano@example.com", null, List.of("COLABORADOR"));
        assertTrue(validator.validate(req).isEmpty());
    }

    @Test
    void criacaoSemNome_deveSerInvalida() {
        var req = new UsuarioCreateRequest("", "fulano@example.com", null, List.of("COLABORADOR"));
        assertFalse(validator.validate(req).isEmpty());
    }

    @Test
    void criacaoComEmailInvalido_deveSerInvalida() {
        var req = new UsuarioCreateRequest("Fulano", "email-invalido", null, List.of("COLABORADOR"));
        assertFalse(validator.validate(req).isEmpty());
    }

    @Test
    void criacaoSemGrupos_deveSerInvalida() {
        var req = new UsuarioCreateRequest("Fulano", "fulano@example.com", null, List.of());
        assertFalse(validator.validate(req).isEmpty());
    }
}
