# Inji

Inji Mobile Wallet is a mobile application specifically created to streamline all types of identification and credentials into one digital wallet.
It offers a secure, trustworthy, and dependable mobile Verifiable Credentials wallet designed to fulfil the following functions

- Download and store Verifiable Credentials
- Conduct offline face authentication
- Share Verifiable Credentials
- Enable users to log in to online portals

for more details refer [here](https://docs.mosip.io/inji)

## Setup PreRequisites

Be sure to have the following build tools installed before proceeding:

- [React Native 0.71.8](https://reactnative.dev/docs/0.71/getting-started)
  - Hermes Engine enabled
- [Expo 49.0.16](https://docs.expo.dev/get-started/installation/)
- [node v16.19.0](https://nodejs.org/en/blog/release/v16.19.0)
- [npm 8.19.3](https://www.npmjs.com/package/npm/v/8.19.3)

### Android

- [Java 11](https://openjdk.org/projects/jdk/11/)
- [Gradle 7.5.1](https://gradle.org/install/)
- [Android SDK](https://developer.android.com/)
- minSdkVersion = 23
- compileSdkVersion = 33
- targetSdkVersion = 33
- ndkVersion = 21.4.7075529
- kotlinVersion = 1.9.0

### iOS

- [XCode](https://developer.apple.com/xcode/) = >15
- Minimum Deployment Target = 13.0
- cocoapods > 1.12
- Ruby >= 2.6.10

## Configuring the Environment

Create a `.env.local` file using `.env` as your template in your root directory :

```
# Mimoto Server
MIMOTO_HOST =  https://api.collab.mosip.net/

# ESignet Server
ESIGNET_HOST =  https://esignet.collab.mosip.net/

# Telemetry Server
OBSRV_HOST = https://dataset-api.obsrv.mosip.net
Telemetry Dashboard = https://druid.obsrv.mosip.net/unified-console.html#workbench
```

for more information on the backend services
refer [here](https://docs.mosip.io/inji/inji-mobile-wallet/backend-services).

## Building & Running for Android

### Generate keystore

```shell
# Generate and use Release keystore for Publishing to Play store
keytool \
-genkey -v \
-storetype PKCS12 \
-keyalg RSA \
-keysize 2048 \
-validity 10000 \
-storepass '<USE-YOUR-RELEASE-PASSWORD-HERE>' \
-keypass '<USE-YOUR-RELEASE-PASSWORD-HERE>' \
-alias androidreleasekey \
-keystore android/app/release.keystore \
-dname "CN=io.mosip.residentapp,OU=,O=,L=,S=,C=US"
```

### Build via Android Studio

The app is available in this repository's `frontend/android` directory. Open this directory in Android Studio (version  
4.1 and above) and the app can be built and run from there.

More info here: [Build your app using Android Studio](https://developer.android.com/studio/run)

### Build via command line

You need Android SDK CLI to build APK.

```shell
# 1. Install dependencies
npm install

# 2. Setup the environment variables for the keystore

# Debug keystore
export DEBUG_KEYSTORE_ALIAS=androiddebugkey
export DEBUG_KEYSTORE_PASSWORD=android

# Release keystore
export RELEASE_KEYSTORE_ALIAS=androidreleasekey
export RELEASE_KEYSTORE_PASSWORD=<USE-YOUR-RELEASE-PASSWORD-HERE>

# https://hostname/residentmobileapp is the Mimoto service url
export BACKEND_SERVICE_URL=https://hostname/residentmobileapp

# Build for MOSIP test
npm run build:android:mosip
```

More info here: [Build your app from the command line](https://developer.android.com/studio/build/building-cmdline)

## Building & Running for iOS

### Build for TestFlight

- Install all dependencies

```shell
npm install
npx pod-install
```

- Open the `ios/` directory in XCode
- Set the build target to "Any iOS device (arm64)"
- Use an Apple Developer account that can provision builds for release/TestFlight

![Screen Shot 2022-09-01 at 10 34 45 AM](https://user-images.githubusercontent.com/1631922/187820476-52111665-d6b9-447c-953d-c6451d66b634.png)

- Don't forget to bump the version number when creating an archive
- Open the Product menu and from there click Archive
- Once done you can follow the dialog wizard to distribute the app to TestFlight

![Screen Shot 2022-09-01 at 1 08 34 PM](https://user-images.githubusercontent.com/1631922/187836055-617fbba8-2eca-4ad3-805b-9627b925f0df.png)

- Go to your [App Store Connect](https://appstoreconnect.apple.com/) dashboard to manage the newly-uploaded build.

More info here:

- [React Native - Publishing to the App Store](https://reactnative.dev/docs/publishing-to-app-store)
- [Apple Developer - Distributing Your App for Beta Testing and Releases](https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases)

## Contributions

Please refer [here](https://docs.mosip.io/inji/inji-mobile-wallet/contribution) for contributing to Inji

## Credits

Credits listed [here](/Credits.md)

## Troubleshooting

If you can't get this to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.
this project runtime can be debugged using [Flipper](https://fbflipper.com/).

## Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup
  your  
  environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for  
  React Native.
