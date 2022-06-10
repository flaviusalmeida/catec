package br.com.smarti.service;

import java.io.File;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.Select;
import org.springframework.stereotype.Service;

import br.com.smarti.exceptions.SeleniumException;
import br.com.smarti.selenium.BaseSelenium;
import br.com.smarti.util.ArquivoUtil;

@Service
public class SeleniumService extends BaseSelenium {

    private static final String popup = "//*[@id=\"qc-cmp2-ui\"]/div[2]/div/button[1]";
    private static final String select_dias = "wt-hbh-select";
    private static final String linhas_tabela = "//*[@id=\"wt-hbh\"]/tbody/tr";

    public File capturaDadosClimaticos(String url) {

	setup();

	driver.get(url);
	try {
	    Thread.sleep(8000);
	} catch (InterruptedException e) {
	    // TODO Auto-generated catch block
	    e.printStackTrace();
	}

	Map<String, Object> params = new HashMap<>();
	params.put("latitude", -3.731862);
	params.put("longitude", -38.526669);
	params.put("accuracy", 1);

	((ChromeDriver) driver).executeCdpCommand("Emulation.setGeolocationOverride", params);

	try {
	    Thread.sleep(3000);
	} catch (InterruptedException e) {
	    // TODO Auto-generated catch block
	    e.printStackTrace();
	}
	List<WebElement> privacidade = driver.findElements(By.xpath(popup));
	if (!privacidade.isEmpty()) {
	    privacidade.get(0).click();
	}

	StringBuilder result = new StringBuilder();

	obterDadosTabela(result);

	File resultFile = ArquivoUtil.escreverArquivo(result);

	tearDown();

	return resultFile;
    }

    private static void obterDadosTabela(StringBuilder result) {
	try {
	    Select selectDias = new Select(driver.findElement(By.id(select_dias)));
	    List<WebElement> optionsDias = selectDias.getOptions();
	    int qtdDias = optionsDias.size();

	    for (int i = 1; i < qtdDias; i++) {
		selectDias.selectByIndex(i);

		Thread.sleep(500);

		String dia = selectDias.getFirstSelectedOption().getText();

		int numLinhas = driver.findElements(By.xpath(linhas_tabela)).size();

		for (int j = 1; j <= numLinhas; j++) {
		    String hora = driver.findElement(By.xpath(linhas_tabela + "[" + j + "]/th")).getText();
		    hora = hora.substring(0, 5);

		    String temperatura = driver.findElement(By.xpath(linhas_tabela + "[" + j + "]/td[2]")).getText();
		    temperatura = temperatura.replace(" °C", "");

		    String vento = driver.findElement(By.xpath(linhas_tabela + "[" + j + "]/td[5]")).getText();
		    vento = vento.replace(" km/h", "");

		    result.append(dia + ";" + hora + ";" + temperatura + ";" + vento + "\n");

		}
	    }
	} catch (Exception e) {
	    e.printStackTrace();
	    throw new SeleniumException("Erro ao tentar obter os dados da tabela.");
	}
    }

}
