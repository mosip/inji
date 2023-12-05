package io.mosip.test.mob.inji.testcases;

import org.testng.annotations.Test;

import io.mosip.test.mob.inji.api.BaseTestCase;
import io.mosip.test.mob.inji.pages.*;
import io.mosip.test.mob.inji.utils.TestDataReader;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

public class VcDownloadAndVerifyUsingEsignetTest extends BaseTest {
    @Test
    public void downloadAndVerifyVcUsingUinViaEsignet() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), target);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.confirmPasscode(TestDataReader.readData("passcode"), target);

        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        assertTrue(addNewCardPage.isAddNewCardGuideMessageDisplayed(), "Verify if add new card guide message displayed");
        assertTrue(addNewCardPage.isDownloadViaUinDisplayed(), "Verify if download via uin displayed");
        assertTrue(addNewCardPage.isDownloadViaEsignetDisplayed(), "Verify if download via uin displayed");
        EsignetLoginPage esignetLoginPage =  addNewCardPage.clickOnDownloadViaEsignet();

        assertTrue(esignetLoginPage.isLoadingPageTextLoaded(), "Verify if loading page displayed");
        assertTrue(esignetLoginPage.isSettingUpTextDisplayed(), "Verify if loading page displayed");
        assertTrue(esignetLoginPage.isEsignetLoginPageDisplayed(), "Verify if esignet login page displayed");
        esignetLoginPage.clickOnEsignetLoginWithOtpButton();
        
        assertTrue(esignetLoginPage.isEnterYourVidTextDisplayed(), "Verify if enter your vid text is displayed");
        OtpVerificationPage otpVerification= esignetLoginPage.setEnterIdTextBox(TestDataReader.readData("uin"));
        
        esignetLoginPage.clickOnGetOtpButton();
        assertTrue(esignetLoginPage.isOtpHasSendMessageDisplayed(),"verify if otp page is displayed");
        
        otpVerification.enterOtpForEsignet(TestDataReader.readData("otp"), target);
        esignetLoginPage.clickOnVerifyButton();
        
        assertTrue(homePage.isNameDisplayed(TestDataReader.readData("fullName")), "Verify if full name is displayed");
        DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView(TestDataReader.readData("fullName"));
        
        detailedVcViewPage.clickOnQrCodeButton();
        assertTrue(detailedVcViewPage.isQrCodeDisplayed(), "Verify if QR Code header is displayed");

        detailedVcViewPage.clickOnQrCrossIcon();
        assertTrue(detailedVcViewPage.isEsignetLogoDisplayed(), "Verify if detailed Vc esignet logo is displayed");
        assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");
        assertEquals(detailedVcViewPage.getNameInDetailedVcView(), TestDataReader.readData("fullName"), "Verify if full name is displayed");
        assertEquals(detailedVcViewPage.getDateOfBirthInDetailedVcView(), TestDataReader.readData("dateOfBirth"), "Verify if date of birth is displayed");
        assertEquals(detailedVcViewPage.getGenderInDetailedVcView(), TestDataReader.readData("gender"), "Verify if gender is displayed");
        assertEquals(detailedVcViewPage.getIdTypeValueInDetailedVcView(), TestDataReader.readData("idType"), "Verify if id type is displayed");
        assertEquals(detailedVcViewPage.getStatusInDetailedVcView(), TestDataReader.readData("status"), "Verify if status is displayed");
        assertEquals(detailedVcViewPage.getUinInDetailedVcView(), TestDataReader.readData("uin"), "Verify if uin is displayed");
        assertEquals(detailedVcViewPage.getPhoneInDetailedVcView(), TestDataReader.readData("phoneNumber"), "Verify if phone number is displayed");
        assertEquals(detailedVcViewPage.getEmailInDetailedVcView(), TestDataReader.readData("externalemail"), "Verify if email is displayed");
        assertTrue(detailedVcViewPage.isActivateButtonDisplayed(), "Verify if activate vc button displayed");
        
        PleaseConfirmPopupPage pleaseConfirmPopupPage  =detailedVcViewPage.clickOnActivateButton();
        assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if confirm popup page is displayed");
        
        pleaseConfirmPopupPage.clickOnConfirmButton();
        assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
       
        otpVerification.enterOtp(TestDataReader.readData("passcode"), target);
        assertTrue(detailedVcViewPage.isProfileAuthenticatedDisplayed(), "Verify profile authenticated displayed");
        
        detailedVcViewPage.clickOnCrossIcon();
        assertTrue(detailedVcViewPage.isEsignetLogoDisplayed(), "Verify if detailed Vc esignet logo is displayed");
        
        
    }
    
//    @Test
//    public void downloadAndVerifyVcUsingVidViaEsignet() throws InterruptedException {
//        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);
//
//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
//        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
//
//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
//        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
//
//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
//        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
//
//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
//        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), target);
//
//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
//        HomePage homePage = confirmPasscode.confirmPasscode(TestDataReader.readData("passcode"), target);
//
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
//        AddNewCardPage addNewCardPage = homePage.downloadCard();
//
//        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
//        EsignetLoginPage esignetLoginPage =  addNewCardPage.clickOnDownloadViaEsignet();
//
//        assertTrue(esignetLoginPage.isEsignetLoginPageDisplayed(), "Verify if esignet login page displayed");
//        esignetLoginPage.clickOnEsignetLoginWithOtpButton();
//        
//        assertTrue(esignetLoginPage.isEnterYourVidTextDisplayed(), "Verify if enter your vid text is displayed");
//        OtpVerificationPage otpVerification= esignetLoginPage.setEnterIdTextBox(BaseTestCase.perpetualVid);
//        esignetLoginPage.clickOnGetOtpButton();
//        Thread.sleep(3000);
//        otpVerification.enterOtpForEsignet(TestDataReader.readData("otp"), target);
//        esignetLoginPage.clickOnVerifyButton();
//        assertTrue(homePage.isNameDisplayed(TestDataReader.readData("fullName")), "Verify if full name is displayed");
//        DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView(TestDataReader.readData("fullName"));
//        detailedVcViewPage.clickOnQrCodeButton();
//        assertTrue(detailedVcViewPage.isQrCodeDisplayed(), "Verify if QR Code header is displayed");
//
//        detailedVcViewPage.clickOnQrCrossIcon();
//        assertTrue(detailedVcViewPage.isEsignetLogoDisplayed(), "Verify if detailed Vc esignet logo is displayed");
//        assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");
//        assertEquals(detailedVcViewPage.getNameInDetailedVcView(), TestDataReader.readData("fullName"), "Verify if full name is displayed");
//        assertEquals(detailedVcViewPage.getDateOfBirthInDetailedVcView(), TestDataReader.readData("dateOfBirth"), "Verify if date of birth is displayed");
//        assertEquals(detailedVcViewPage.getGenderInDetailedVcView(), TestDataReader.readData("gender"), "Verify if gender is displayed");
//        assertEquals(detailedVcViewPage.getIdTypeValueInDetailedVcView(), TestDataReader.readData("idType"), "Verify if id type is displayed");
//        assertEquals(detailedVcViewPage.getStatusInDetailedVcView(), TestDataReader.readData("status"), "Verify if status is displayed");
//       // assertEquals(detailedVcViewPage.getUinInDetailedVcView(), TestDataReader.readData("uin"), "Verify if uin is displayed");
//        assertEquals(detailedVcViewPage.getPhoneInDetailedVcView(), TestDataReader.readData("phoneNumber"), "Verify if phone number is displayed");
//        assertEquals(detailedVcViewPage.getEmailInDetailedVcView(), TestDataReader.readData("externalemail"), "Verify if email is displayed");
//        assertTrue(detailedVcViewPage.isActivateButtonDisplayed(), "Verify if activate vc button displayed");
//        
//        PleaseConfirmPopupPage pleaseConfirmPopupPage  =detailedVcViewPage.clickOnActivateButton();
//        assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if confirm popup page is displayed");
//        
//        pleaseConfirmPopupPage.clickOnConfirmButton();
//        assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
//       
//        otpVerification.enterOtp(TestDataReader.readData("passcode"), target);
//        assertTrue(detailedVcViewPage.isProfileAuthenticatedDisplayed(), "Verify profile authenticated displayed");
//        
//    }

   }