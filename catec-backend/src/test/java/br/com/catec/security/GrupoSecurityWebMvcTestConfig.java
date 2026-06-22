package br.com.catec.security;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Import;

@TestConfiguration
@Import({SecurityWebMvcTestConfig.class, AuthorizationService.class})
public class GrupoSecurityWebMvcTestConfig {}
