package br.com.smarti.controller;

import org.springframework.web.client.RestTemplate;

import br.com.smarti.model.Cidade;
import br.com.smarti.model.Estado;

public class Localidade {

    public Cidade[] consultarCidades(String idEstado) {

	String url = "https://servicodados.ibge.gov.br/api/v1/localidades/estados/" + idEstado + "/distritos";

	RestTemplate restTemplate = new RestTemplate();
	return restTemplate.getForObject(url, Cidade[].class);

    }

    public Estado[] consultarEstados() {
	String url = "https://servicodados.ibge.gov.br/api/v1/localidades/estados/";
	RestTemplate restTemplate = new RestTemplate();
	return restTemplate.getForObject(url, Estado[].class);
    }

}
