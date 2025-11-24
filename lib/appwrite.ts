import { Client, Avatars, Account, OAuthProvider } from "react-native-appwrite";
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

export const config = {
  platform: "com.jd.real-estate-app",
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
};

export const client = new Client();

client
  .setEndpoint(config.endpoint!) // ! at the end is to tell typescript that the value is not null
  .setProject(config.projectId!)
  .setPlatform(config.platform);

// generate avatar for the user
export const avatar = new Avatars(client);
// generate new user accounts
export const account = new Account(client);

export async function login() {
  try {
    // Create deep link that works across expo environments
    // Ensure localhost is used for hostname to validation error for success/failure URLs
    const deepLink = new URL(makeRedirectUri({ preferLocalhost: true }));
    const scheme = `${deepLink.protocol}//`; // where do we want to redirect the user after login

    // Start OAuth flow
    const loginUrl = await account.createOAuth2Token({
      provider: OAuthProvider.Google,
      success: `${deepLink}`,
      failure: `${deepLink}`,
    });

    if (!loginUrl) {
      throw new Error("Failed to login, could not create OAuth2 token");
    }

    // Open loginurl and listen for the scheme redirect
    const browserResult = await WebBrowser.openAuthSessionAsync(
      `${loginUrl}`,
      scheme
    );

    if (browserResult.type !== "success") {
      throw new Error("Failed to login, could not create browser session");
    }

    // Extract credential from Oauth redirect URL
    const url = new URL(browserResult.url);
    const secret = url.searchParams.get("secret");
    const userId = url.searchParams.get("userId");

    if (!secret || !userId) {
      throw new Error(
        "Failed to login, could not extract credentials from redirect URL"
      );
    }

    // create session with OAuth credentials
    const session = await account.createSession({
      userId: userId,
      secret: secret,
    });

    if (!session) {
      throw new Error("Failed to login, could not create session");
    }

    return true;
  } catch (error) {
    console.error("Error logging in: ", error);
    return false;
  }
}

export async function logout() {
  try {
    await account.deleteSession({
      sessionId: "current",
    });

    return true;
  } catch (error) {
    console.error("Error logging out: ", error);
    return false;
  }
}

export async function getCurrentUser() {
  try {
    const response = await account.get(); // get currently logged in user

    if (response.$id) {
      // if their is a user id, then get the user avatar
      const userAvatar = await avatar.getInitials(); // get the user avatar initials using the currently logged in user (we need a session to be set on client)
      return {
        ...response,
        avatar: userAvatar.toString(),
      };
    }
  } catch (error) {
    console.error("Error getting current user: ", error);
    return null;
  }
}
