package inji.pages;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.WebElement;

public class AddNewCardPage extends BasePage{

    @AndroidFindBy(accessibility = "issuersScreenHeader")
    @iOSXCUITFindBy(accessibility = "title")
    private WebElement addNewCardHeader;

    @AndroidFindBy(accessibility = "issuerHeading-Mosip")
    @iOSXCUITFindBy(accessibility = "issuerHeading-Mosip")
    private WebElement downloadViaUin;
    
    @AndroidFindBy(accessibility = "goBack")
    @iOSXCUITFindBy(accessibility = "goBack")
    private WebElement backButton;
    
    @AndroidFindBy(accessibility = "issuer-ESignet")
    @iOSXCUITFindBy(accessibility = "issuerHeading-ESignet")
    private WebElement downloadViaEsignet;
    
    @AndroidFindBy(uiAutomator = "new UiSelector().textContains(\"Please choose your preferred issuer from the options below to add a new card.\")")
    private WebElement addNewCardGuideMessage;
    
    @AndroidFindBy(uiAutomator = "new UiSelector().textContains(\"Mangyaring piliin ang iyong gustong tagabigay mula sa mga opsyon sa ibaba upang magdagdag ng bagong card.\")")
    private WebElement addNewCardGuideMessageInFillpino;
    
    @AndroidFindBy(accessibility = "issuerDescription-Mosip")
    @iOSXCUITFindBy(accessibility = "issuerDescription-Mosip")
    private WebElement issuerDescriptionMosip;
    
    @AndroidFindBy(accessibility = "issuerDescription-ESignet")
    @iOSXCUITFindBy(accessibility = "issuerDescription-ESignet")
    private WebElement issuerDescriptionEsignet;
    
    @AndroidFindBy(className = "android.widget.EditText")
    @iOSXCUITFindBy(accessibility = "issuerSearchBar")
    private WebElement issuerSearchBar;
    
    public AddNewCardPage(AppiumDriver driver) {
        super(driver);
    }

    public boolean isAddNewCardPageLoaded() {
        return this.isElementDisplayed(addNewCardHeader);
    }

    public RetrieveIdPage clickOnDownloadViaUin(){
        clickOnElement(downloadViaUin);
        return new RetrieveIdPage(driver);
    }
    
    public void clickOnBack() {
    	clickOnElement(backButton);
    }
    
    public boolean isAddNewCardGuideMessageDisplayed() {
        return this.isElementDisplayed(addNewCardGuideMessage);
    }
    
    public boolean isDownloadViaUinDisplayed() {
        return this.isElementDisplayed(downloadViaUin);
    }
    
    public boolean isDownloadViaEsignetDisplayed() {
        return this.isElementDisplayed(downloadViaEsignet);
    }
    
    public boolean isDownloadViaEsignetDisplayedinFillpino() {
        return this.isElementDisplayed(downloadViaEsignet);
    }
    
    public EsignetLoginPage clickOnDownloadViaEsignet(){
        clickOnElement(downloadViaEsignet);
        return new EsignetLoginPage(driver);
    }
    
    public void isBackButtonDisplayed() {
        backButton.isDisplayed();
    }
    
    public boolean isAddNewCardGuideMessageDisplayedInFillopin() {
        return this.isElementDisplayed(addNewCardGuideMessageInFillpino);
    }
    
    public boolean isIssuerDescriptionMosipDisplayed() {
        return this.isElementDisplayed(issuerDescriptionMosip);
    }
    
    public boolean isIssuerDescriptionEsignetDisplayed() {
        return this.isElementDisplayed(issuerDescriptionEsignet);
    }
    
    public boolean isIssuerSearchBarDisplayed() {
    	return this.isElementDisplayed(issuerSearchBar);
    }
    
    public boolean isIssuerSearchBarDisplayedInFilipino() {
    	return this.isElementDisplayed(issuerSearchBar);
    }
    
    public void sendTextInIssuerSearchBar(String text) {
    	clearTextBoxAndSendKeys(issuerSearchBar,text);
    }


}
