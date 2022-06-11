package br.com.smarti.controller;

import java.io.File;
import java.io.FileNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;

import br.com.smarti.form.Form;
import br.com.smarti.service.SeleniumService;
import br.com.smarti.util.DownloadUtil;

@Controller
public class ClimaController {
    @Value("${spring.application.name}")
    String appName;

    @Autowired
    private SeleniumService seleniumService;

    @GetMapping("/")
    public String homePage(Model model) {
	model.addAttribute("appName", appName);
	model.addAttribute("form", new Form());

	return "home";
    }

    @GetMapping("/consultarClima")
    public ResponseEntity<InputStreamResource> consultarClima(Model model, @ModelAttribute("form") Form form)
	    throws FileNotFoundException {

	File dados = seleniumService.capturaDadosClimaticos(form.getUrl());

	return DownloadUtil.preparaDownload(dados, "Dados climaticos.csv");

    }

}
