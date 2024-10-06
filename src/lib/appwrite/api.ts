import { INewUser, INewUserDB } from "@/types";
import { ID, Query } from "appwrite";
import { appwriteAccount, appwriteDatabase, appwriteAvatars, appwriteConfig } from "./config";

export async function createUser(user: INewUser) {
	try {
		const newAccount = await appwriteAccount.create(ID.unique(), user.email, user.password, user.username);

		if (!newAccount) throw new Error("Failed to create a new account");

		const avatarURL = appwriteAvatars.getInitials(user.name);
		const newUserData = await saveUserToDatabase({
			accountID: newAccount.$id,
			email: newAccount.email,
			name: user.name,
			username: user.username,
			imageURL: new URL(avatarURL),
		});

		return newUserData;
	} catch (error) {
		console.error("Error creating user:", error);
	}
}

export async function saveUserToDatabase(user: INewUserDB) {
	try {
		const response = await appwriteDatabase.createDocument(
			appwriteConfig.databaseID,
			appwriteConfig.userCollectionID,
			ID.unique(),
			user
		);

		return response;
	} catch (error) {
		console.error("Failed to add user to database", error);
	}
}

export async function signIn(user: { email: string; password: string }) {
	try {
		const session = await appwriteAccount.createEmailPasswordSession(user.email, user.password);
		
		return session;
	} catch (error) {
		console.error("Error signing in:", error);
	}
}

export async function getCurrentUser() {
	try {
		const currentAccount = await appwriteAccount.get();
		const currentUser = await appwriteDatabase.listDocuments(
			appwriteConfig.databaseID,
			appwriteConfig.userCollectionID,
			[Query.equal("accountID", currentAccount.$id)]
		);

		return currentUser.documents[0];
	} catch (error) {
		console.error("Error getting current user:", error);
	}
}

export async function signOut() {
	try {
		const session = await appwriteAccount.deleteSession("current");
		return session;
	} catch (error) {
		console.log(error);
	}
}
