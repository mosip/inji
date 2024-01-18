package inji.pages;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.WebElement;
import org.testng.Assert;

public class WelcomePage extends BasePage {

    @AndroidFindBy(accessibility = "introTitle")
    @iOSXCUITFindBy(xpath = "(//XCUIElementTypeStaticText[@name=\"introTitle\"])[1]")
    private WebElement welcomeText;

    @AndroidFindBy(accessibility = "introText")
    @iOSXCUITFindBy(xpath = "(//XCUIElementTypeStaticText[@name=\"introText\"])[1]")
    private WebElement welcomeTextDescription;

    @AndroidFindBy(accessibility = "skip")
    @iOSXCUITFindBy(iOSClassChain = "**/XCUIElementTypeButton[`label == \"Skip\"`][1]")
    private WebElement skipButton;

    @AndroidFindBy(accessibility = "next")
    @iOSXCUITFindBy(xpath = "(//XCUIElementTypeOther[@name=\"Susunod\" or @name=\"next\" or @name=\"अगला\" or @name=\"ಮುಂದೆ\" or @name=\"அடுத்தது\"])[4]\n")
    private WebElement nextButton;

    @AndroidFindBy(uiAutomator = "new UiSelector().textContains(\"Back\")")
    @iOSXCUITFindBy(iOSClassChain = "**/XCUIElementTypeButton[`label == \"Back\"`][1]")
    public WebElement backButton;

    public WelcomePage(AppiumDriver driver) {
        super(driver);
    }
    
    public String  verifyLanguageforWelcomePageLoaded(){
    	return getTextFromLocator(welcomeText);

//    	switch (language) {
//    	case "Hindi":
//    		boolean isHederLoadedInHindi  = (actualText.equalsIgnoreCase("सुरक्षित साझाकरण!")==true) ? true : false;
//    		return isHederLoadedInHindi ;
//    	case "Filipino":
//    		boolean isHederLoadedInFilipino  = (actualText.equalsIgnoreCase("Ligtas na Pagbabahagi!")==true) ? true : false;
//    		return isHederLoadedInFilipino ;
//    	case "Tamil":
//    		boolean isHederLoadedInTamil  = (actualText.equalsIgnoreCase("பாதுகாப்பான பகிர்வு!")==true) ? true : false;
//    		return isHederLoadedInTamil ;
//    	case "Kannada":
//    		boolean isHederLoadedInKannada  = (actualText.equalsIgnoreCase("ಸುರಕ್ಷಿತ ಹಂಚಿಕೆ!")==true) ? true : false;
//    		return isHederLoadedInKannada ;
//    	}
//    	Assert.fail("noCaseFound");
//    	return false;
    }
    
    public boolean isWelcomePageLoaded() {
        return this.isElementDisplayed(welcomeText);
    }
    
    public AppUnlockMethodPage clickOnSkipButton() {
        this.clickOnElement(skipButton);
        return new AppUnlockMethodPage(driver);
    }

    public void clickOnNextButton() {
        this.clickOnElement(nextButton);
        new AppUnlockMethodPage(driver);
    }

    public String getWelcomeDescription() {
        return this.getTextFromLocator(welcomeTextDescription);
    }

    public void clickOnBackButton() {
        this.clickOnElement(backButton);
    }
}
