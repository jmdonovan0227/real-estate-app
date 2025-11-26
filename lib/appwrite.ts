import {
  Client,
  Avatars,
  Account,
  OAuthProvider,
  TablesDB,
  Query,
} from "react-native-appwrite";
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import type { Properties } from "@/types/appwrite";

interface GetPropertiesProps {
  filter?: string;
  query?: string;
  limit?: number;
}

export const config = {
  platform: "com.jd.real-estate-app",
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
  agentsTableName: "agents",
  propertiesTableName: "properties",
  galleriesTableName: "galleries",
  reviewsTableName: "reviews",
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
// generate new databases
export const databases = new TablesDB(client);

export async function login() {
  try {
    // Create deep link that works across expo environments
    // Ensure localhost is used for hostname to validation error for success/failure URLs
    const deepLink = new URL(makeRedirectUri({ preferLocalhost: true }));
    const scheme = `${deepLink.protocol}//`; // where do we want to redirect the user after login

    // Start OAuth flow
    const loginUrl = await account.createOAuth2Token({
      provider: OAuthProvider.Google,
      success: `${deepLink}?status=success`,
      failure: `${deepLink}?status=failure`,
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
      // if their is a user id, then get the user avatar (userAvatar is an ArrayBuffer)
      const userAvatar = await avatar.getInitials(); // get the user avatar initials using the currently logged in user (we need a session to be set on client)

      // convert ArrayBuffer to uint8Array so we can iterate over the memory (bytes) of the ArrayBuffer
      const uint8Array = new Uint8Array(userAvatar);
      // convert array of bytes to binary string that we can pass to btoa to create a base64 string
      const binaryString = String.fromCharCode(...uint8Array);
      // convert binary string to base64 string
      const base64 = btoa(binaryString);
      // create a data url for the avatar (ex: data:image/image type;base64,image data as base64 string)
      const avatarUrl = `data:image/jpeg;base64,${base64}`;

      return {
        ...response,
        avatar: avatarUrl,
      };
    }

    return null;
  } catch (error) {
    console.error("Error getting current user: ", error);
    return null;
  }
}

export async function getLatestProperties(): Promise<Properties[]> {
  try {
    const result = await databases.listRows({
      databaseId: config.databaseId!,
      tableId: config.propertiesTableName!,
      queries: [Query.orderDesc("$createdAt"), Query.limit(5)],
    });

    return result.rows as unknown as Properties[];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getProperties({
  filter,
  query,
  limit,
}: GetPropertiesProps): Promise<Properties[]> {
  try {
    const buildQuery = [Query.orderDesc("$createdAt")];

    if (filter && filter !== "All") {
      buildQuery.push(Query.equal("type", filter));
    }

    if (query) {
      buildQuery.push(
        Query.or([
          Query.search("name", query),
          Query.search("address", query),
          Query.search("description", query),
          Query.search("type", query),
        ])
      );
    }

    if (limit) {
      buildQuery.push(Query.limit(limit));
    }

    const result = await databases.listRows({
      databaseId: config.databaseId!,
      tableId: config.propertiesTableName!,
      queries: buildQuery,
    });

    return result.rows as unknown as Properties[];
  } catch (error) {
    console.error(error);
    return [];
  }
}
