import { Client, Account, Databases, Storage, Avatars } from "appwrite";

export const appwriteConfig = {
	projectID: import.meta.env.VITE_APPWRITE_PROJECT_ID,
	endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT,
    storageID: import.meta.env.VITE_APPWRITE_STORAGE_ID,
    databaseID: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    savesCollectionID: import.meta.env.VITE_APPWRITE_SAVES_COLLECTION_ID,
    postCollectionID: import.meta.env.VITE_APPWRITE_POST_COLLECTION_ID,
    userCollectionID: import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID,
};

export const appwriteClient = new Client();
appwriteClient.setEndpoint(appwriteConfig.endpoint)
              .setProject(appwriteConfig.projectID);

export const appwriteAccount = new Account(appwriteClient);
export const appwriteDatabase = new Databases(appwriteClient);
export const appwriteStorage = new Storage(appwriteClient);
export const appwriteAvatars = new Avatars(appwriteClient);
