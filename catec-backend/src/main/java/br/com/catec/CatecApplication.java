package br.com.catec;

import br.com.catec.config.DotenvLoader;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class CatecApplication {

    public static void main(String[] args) {
        DotenvLoader.load();
        SpringApplication.run(CatecApplication.class, args);
    }
}
