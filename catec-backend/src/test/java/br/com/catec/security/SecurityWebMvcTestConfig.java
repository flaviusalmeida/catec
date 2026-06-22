package br.com.catec.security;

import br.com.catec.domain.acesso.PermissaoResolver;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Import;

/** Beans mínimos de segurança para testes {@code @WebMvcTest}. */
@TestConfiguration
@Import({MethodSecurityConfig.class, PermissaoResolver.class, AuthorizationService.class})
public class SecurityWebMvcTestConfig {}
