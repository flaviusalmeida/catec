package br.com.smarti.selenium;

import java.io.File;
import java.io.FileNotFoundException;
import java.net.URL;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeDriverService;
import org.openqa.selenium.chrome.ChromeOptions;
import org.springframework.util.ResourceUtils;

import br.com.smarti.exceptions.FileException;
import br.com.smarti.exceptions.SeleniumException;
import br.com.smarti.util.AmbienteUtil;

public abstract class BaseSelenium {

    protected static WebDriver driver;

    public void setup() throws SeleniumException {
	try {
	    driver = getDriver();
	} catch (Exception e) {
	    throw new SeleniumException("Falha ao instanciar as configurações iniciais do Selenium.", e.getMessage(),
		    e);
	}
    }

    private ChromeDriver getDriver() throws FileNotFoundException {
	if (AmbienteUtil.isDevelopment()) {
	    return getDriverDevelopment();
	} else if (AmbienteUtil.isProduction()) {
	    return getDriverProduction();
	} else {
	    throw new SeleniumException("Ambiente do sistema nao reconhecido.");
	}
    }

    private ChromeDriver getDriverDevelopment() throws FileNotFoundException {
	ChromeOptions capabilities = new ChromeOptions();

	ChromeDriverService service = new ChromeDriverService.Builder().usingDriverExecutable(findFile()).build();
	ChromeOptions options = new ChromeOptions();
	options.addArguments("--no-sandbox");
	options.addArguments("--headless");
	options.setExperimentalOption("useAutomationExtension", false);
	options.addArguments("disable-infobars"); // disabling infobars
	options.addArguments("--disable-extensions"); // disabling extensions
	options.addArguments("--disable-gpu"); // applicable to windows os only
	options.addArguments("--disable-dev-shm-usage"); // overcome limited resource problems

	options.merge(capabilities);
	return new ChromeDriver(service, options);
    }

    private ChromeDriver getDriverProduction() {
	System.setProperty("GOOGLE_CHROME_BIN", "/app/.apt/usr/bin/google-chrome");
	System.setProperty("CHROMEDRIVER_PATH", "/app/.chromedriver/bin/chromedriver");

	ChromeOptions capabilities = new ChromeOptions();

	ChromeOptions options = new ChromeOptions();
	options.setBinary("/app/.apt/usr/bin/google-chrome");

	options.addArguments("--no-sandbox");
	options.addArguments("--headless");
	options.setExperimentalOption("useAutomationExtension", false);
	options.addArguments("disable-infobars"); // disabling infobars
	options.addArguments("--disable-extensions"); // disabling extensions
	options.addArguments("--disable-gpu"); // applicable to windows os only
	options.addArguments("--disable-dev-shm-usage"); // overcome limited resource problems
	options.addArguments("--lang=pt");
	options.merge(capabilities);

	return new ChromeDriver(options);
    }

    private File findFile() throws FileException {
	try {
	    ClassLoader classLoader = getClass().getClassLoader();
	    URL url = classLoader.getResource("chromedriver102.exe");
	    File file = ResourceUtils.getFile(url);
	    return file;
	} catch (FileNotFoundException e) {
	    throw new FileException("Falha ao tentar obter o drive.", e.getMessage(), e);
	}
    }

    public static void tearDown() throws SeleniumException {
	try {
	    if (driver != null) {
		driver.quit();
	    }
	} catch (Exception e) {
	    throw new SeleniumException("Falha ao tentar encerrar o Selenium.", e.getMessage(), e);
	}
    }

}
