import { CreateUserParams, GetMenuParams, SignInParams } from "@/type";
import { Account, Avatars, Client, Databases, ID, Query, Storage } from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  platform: "com.adm.foodapp",
  databaseId: "697c345a0028c972d1ea",
  bucketId: "69857d1d00166a44ecb4",
  userTable: "user",
  categoriesTable: "categories",
  menuTable: "menu",
  customizationsTable: "customizations",
  menuCustomizationTable: "menu_customizations",
};

export const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform)

export const account = new Account(client)
export const databases = new Databases(client)
export const storage = new Storage(client)
const avatars = new Avatars(client)

export const createUser = async ({ email, password, name, }: CreateUserParams) => {
  try {
    const newAccount = await account.create(ID.unique(), email, password, name);
    if (!newAccount) throw Error;

    await signIn({ email, password });

    const avatarUrl = avatars.getInitialsURL(name);

    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userTable,
      ID.unique(),
      { email, name: name, accountId: newAccount.$id, avatar: avatarUrl },
    );

    console.log('User created successfully:', newUser);
    return newUser;
  } catch (e) {
    console.error('Error creating user:', e);
    throw new Error(e as string);
  }
};

export const signIn = async ({ email, password }: SignInParams) => {
  try {
    // Delete any existing session first
    try {
      await account.deleteSession("current");
    } catch (error) {
      // No active session, continue
    }

    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error(String(e));
  }
};

export const signOut = async () => {
  try {
    await account.deleteSession("current");
  } catch (e) {
    throw new Error(e as string);
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get()
    if (!currentAccount) return null;

    console.log('User status Active');

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userTable,
      [Query.equal("accountId", currentAccount.$id)]
    )

    if (!currentUser || currentUser.documents.length === 0) {
      console.warn('User document not found in database for account:', currentAccount.$id);
      return null;
    }

    return currentUser.documents[0];
  } catch (e: any) {
      // If user is not logged in (guests role), return null instead of throwing
      if (e.message?.includes('guests') || e.code === 401) {
        console.log('No active session - user not logged in');
        return null;
      }
      console.error('Error in getCurrentUser:', e)
      return null;
  }
}

export const getMenu = async ({ category, query }: GetMenuParams) => {
  try{
    const queries: string[] = [];

    if (category) queries.push(Query.equal('categories', category));
    if (query) queries.push(Query.search('name', query));

    const menus = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.menuTable,
      queries
    )

    return menus.documents;
  } catch (e) {
    throw new Error(e as string);
  }
}

export const getCategories = async () => {
  try {
    const categories = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesTable
    )
    return categories.documents;
  } catch (e) {
      throw new Error (e as string)
  }
}