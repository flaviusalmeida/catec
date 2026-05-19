package br.com.catec.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(AppDocumentoProperties.class)
public class DocumentoConfig {}
