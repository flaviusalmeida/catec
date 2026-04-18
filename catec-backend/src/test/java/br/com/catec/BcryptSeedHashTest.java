package br.com.catec;

import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/** Garante que o hash usado em V2__seed_usuarios_dev.sql corresponde à senha documentada. */
class BcryptSeedHashTest {

    private static final String SEED_HASH =
            "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi";

    @Test
    void seedHashMatchesDevPassword() {
        assertTrue(new BCryptPasswordEncoder().matches("password", SEED_HASH));
    }
}
