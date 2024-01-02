package inji.pages;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.WebElement;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

public class SettingsPage extends BasePage {

    @AndroidFindBy(accessibility = "settingsScreen")
    @iOSXCUITFindBy(accessibility = "settingsScreen")
    private WebElement settingsTittle;

    @AndroidFindBy(accessibility = "logout")
    @iOSXCUITFindBy(accessibility = "Logout")
    private WebElement logoutButton;

    @AndroidFindBy(accessibility = "languageTitle")
    @iOSXCUITFindBy(accessibility = "languageTitle")
    private WebElement languageButton;

    @AndroidFindBy(xpath = "//*[contains(@text,'Filipino')]")
    @iOSXCUITFindBy(iOSClassChain = "**/XCUIElementTypeStaticText[`label == \"Filipino\"`]")
    private WebElement filipinoLanguageButton;
    
    @AndroidFindBy(xpath = "//*[contains(@text,'தமிழ்')]")
    @iOSXCUITFindBy(iOSClassChain = "**/XCUIElementTypeStaticText[`label == \"தமிழ்\"`]")
    private WebElement tamilLanguageButton;

    @AndroidFindBy(xpath = "//*[contains(@text,'Wika')]")
    @iOSXCUITFindBy(iOSClassChain = "**/XCUIElementTypeOther[`label == \"\uE037 Wika \uE5CC\"`][1]")
    private WebElement wikaButton;

    @AndroidFindBy(uiAutomator = "new UiSelector().resourceId(\"listItemTitle\")")
    @iOSXCUITFindBy(iOSNsPredicate = "name == \"listItemTitle\"")
    private List<WebElement> languages;

    @AndroidFindBy(accessibility = "aboutInjiTitle")
    @iOSXCUITFindBy(accessibility = "aboutInjiTitle")
    private WebElement aboutInji;

    @AndroidFindBy(xpath = "//*[contains(@text,'Tuvali-version:')]")
    @iOSXCUITFindBy(xpath = "//*[contains(@name,'Tuvali-version: 0.4.6')]")
    private WebElement tuvaliVersion;

    @AndroidFindBy(accessibility = "injiTourGuide")
    @iOSXCUITFindBy(accessibility = "injiTourGuide")
    private WebElement injiTourGuide;

    @AndroidFindBy(accessibility = "receivedCards")
    @iOSXCUITFindBy(accessibility = "injiTourGuide")
    private WebElement receivedCards;

    @AndroidFindBy(accessibility = "credentialRegistryTitle")
    @iOSXCUITFindBy(accessibility = "credentialRegistryTitle")
    public WebElement credentialRegistryText;

    @AndroidFindBy(accessibility = "receiveCard")
    public WebElement receiveCardText;

    @AndroidFindBy(xpath = "//*[contains(@text,'Tumanggap ng Card')]")
    public WebElement receiveCardInfilipinoLanguageText;

    @AndroidFindBy(xpath = "(//*[@resource-id=\"padView\"])[3]")
    @iOSXCUITFindBy(accessibility = "عربى")
    private WebElement arabicLanguageButton;
    
    @AndroidFindBy(accessibility = "arrowLeft")
    private WebElement backButton;

    public SettingsPage(AppiumDriver driver) {
        super(driver);
    }

    public boolean isSettingPageLoaded() {
        return this.isElementDisplayed(settingsTittle, "Setting page");
    }
    
    public boolean isSettingPageLoadedInFilipion() {
        return this.isElementDisplayed(settingsTittle, "Mga setting");
    }

    public UnlockApplicationPage clickOnLogoutButton() {
        clickOnElement(logoutButton);
        return new UnlockApplicationPage(driver);
    }

    public SettingsPage clickOnLanguage() {
        clickOnElement(languageButton);
        return this;
    }

    public void clickOnFilipinoLanguage() {
        clickOnElement(filipinoLanguageButton);
    }
    
    public void clickOnTamilLanguage() {
        clickOnElement(tamilLanguageButton);
    }

    public boolean verifyFilipinoLanguage() {
        return this.isElementDisplayed(wikaButton, "Filipino language");
    }
    
    public boolean verifyTamilLanguage() {
        return this.isElementDisplayed(languageButton, "மொழி");
    }

    public boolean verifyLanguagesInLanguageFilter() {
        List<String> expectedLanguages = Arrays.asList("English", "Filipino", "عربى", "हिंदी", "ಕನ್ನಡ", "தமிழ்");

        List<String> actualLanguages = languages.stream()
                .map(WebElement::getText)
                .collect(Collectors.toList());

        return new HashSet<>(expectedLanguages).equals(new HashSet<>(actualLanguages));
    }

    public SettingsPage clickOnAboutInji() {
        clickOnElement(aboutInji);
        return this;
    }

    public boolean isTuvaliVersionPresent() {
        return this.isElementDisplayed(tuvaliVersion, "Tuvali-version");
    }

    public void clickOnInjiTourGuide() {
        clickOnElement(injiTourGuide);
    }

    public boolean isReceivedCardsPresent() {
        return this.isElementDisplayed(receivedCards, "Received Cards");
    }

    public CredentialRegistryPage clickOnCredentialRegistry() {
        clickOnElement(credentialRegistryText);
        return new CredentialRegistryPage(driver);
    }

    public ReceiveCardPage clickOnReceiveCard() {
        clickOnElement(receiveCardText);
        return new ReceiveCardPage(driver);
    }

    public ReceiveCardPage clickOnReceiveCardFilipinoLanguage() {
        clickOnElement(receiveCardInfilipinoLanguageText);
        return new ReceiveCardPage(driver);
    }

    public AboutInjiPage clickOnAbouInji() {
        clickOnElement(aboutInji);
        return new AboutInjiPage(driver);
    }

    public SettingsPage clickOnBackArrow() {
        clickOnElement(backButton);
        return this;
    }
    
    public UnlockApplicationPage clickOnArabicLanguageButton() {
        clickOnElement(arabicLanguageButton);
        return new UnlockApplicationPage(driver);
    }
}
