import { ID, Query } from "appwrite";
import {
	appwriteAccount as account,
	appwriteDatabase as databases,
	appwriteAvatars as avatars,
	appwriteConfig,
	appwriteStorage as storage,
} from "./config";
import { IUpdatePost, INewPost, INewUser, IUpdateUser } from "@/types";
export async function createUser(user: INewUser) {
	try {
		const newAccount = await account.create(ID.unique(), user.email, user.password, user.name);
		if (!newAccount) throw Error;
		const avatarURL = avatars.getInitials(user.name);
		const newUser = await saveUserToDatabase({
			accountID: newAccount.$id,
			name: newAccount.name,
			email: newAccount.email,
			username: user.username,
			imageURL: avatarURL,
		});
		return newUser;
	} catch (error) {
		console.log(error);
		return error;
	}
}
export async function saveUserToDatabase(user: {
	accountID: string;
	email: string;
	name: string;
	imageURL: string;
	username?: string;
}) {
	try {
		const newUser = await databases.createDocument(
			appwriteConfig.databaseID,
			appwriteConfig.userCollectionID,
			ID.unique(),
			user
		);
		return newUser;
	} catch (error) {
		console.log(error);
	}
}
export async function signIn(user: { email: string; password: string }) {
	try {
		const session = await account.createEmailPasswordSession(user.email, user.password);
		return session;
	} catch (error) {
		console.log(error);
	}
}
export async function getAccount() {
	try {
		const currentAccount = await account.get();
		return currentAccount;
	} catch (error) {
		console.log(error);
	}
}
export async function getCurrentUser() {
	try {
		const currentAccount = await getAccount();
		if (!currentAccount) throw Error;
		const currentUser = await databases.listDocuments(appwriteConfig.databaseID, appwriteConfig.userCollectionID, [
			Query.equal("accountID", currentAccount.$id),
		]);
		if (!currentUser) throw Error;
		return currentUser.documents[0];
	} catch (error) {
		console.log(error);
		return null;
	}
}
export async function signOut() {
	try {
		const session = await account.deleteSession("current");
		return session;
	} catch (error) {
		console.log(error);
	}
}
export async function createPost(post: INewPost) {
	try {
		const uploadedFile = await uploadFile(post.file[0]);
		if (!uploadedFile) throw Error;
		const fileUrl = getFilePreview(uploadedFile.$id);
		if (!fileUrl) {
			await deleteFile(uploadedFile.$id);
			throw Error;
		}
		const tags = post.tags?.replace(/ /g, "").split(",") || [];
		const newPost = await databases.createDocument(
			appwriteConfig.databaseID,
			appwriteConfig.postCollectionID,
			ID.unique(),
			{
				creator: post.userId,
				caption: post.caption,
				imageURL: fileUrl,
				imageID: uploadedFile.$id,
				location: post.location,
				tags: tags,
			}
		);
		if (!newPost) {
			await deleteFile(uploadedFile.$id);
			throw Error;
		}
		return newPost;
	} catch (error) {
		console.log(error);
	}
}
export async function uploadFile(file: File) {
	try {
		const uploadedFile = await storage.createFile(appwriteConfig.storageID, ID.unique(), file);
		return uploadedFile;
	} catch (error) {
		console.log(error);
	}
}
export function getFilePreview(fileId: string) {
	try {
		const fileUrl = storage.getFilePreview(appwriteConfig.storageID, fileId, 2000, 2000, "top", 100);
		if (!fileUrl) throw Error;
		return fileUrl;
	} catch (error) {
		console.log(error);
	}
}
export async function deleteFile(fileId: string) {
	try {
		await storage.deleteFile(appwriteConfig.storageID, fileId);
		return { status: "ok" };
	} catch (error) {
		console.log(error);
	}
}
export async function searchPosts(searchTerm: string) {
	try {
		const posts = await databases.listDocuments(appwriteConfig.databaseID, appwriteConfig.postCollectionID, [
			Query.search("caption", searchTerm),
		]);
		if (!posts) throw Error;
		return posts;
	} catch (error) {
		console.log(error);
	}
}
export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
	const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(9)];
	if (pageParam) {
		queries.push(Query.cursorAfter(pageParam.toString()));
	}
	try {
		const posts = await databases.listDocuments(appwriteConfig.databaseID, appwriteConfig.postCollectionID, queries);
		if (!posts) throw Error;
		return posts;
	} catch (error) {
		console.log(error);
	}
}
export async function getPostById(postId?: string) {
	if (!postId) throw Error;
	try {
		const post = await databases.getDocument(appwriteConfig.databaseID, appwriteConfig.postCollectionID, postId);
		if (!post) throw Error;
		return post;
	} catch (error) {
		console.log(error);
	}
}
export async function updatePost(post: IUpdatePost) {
	const hasFileToUpdate = post.file.length > 0;
	try {
		let image = {
			imageURL: post.imageURL,
			imageID: post.imageID,
		};
		if (hasFileToUpdate) {
			const uploadedFile = await uploadFile(post.file[0]);
			if (!uploadedFile) throw Error;
			const fileUrl = getFilePreview(uploadedFile.$id);
			if (!fileUrl) {
				await deleteFile(uploadedFile.$id);
				throw Error;
			}
			image = { ...image, imageURL: fileUrl, imageID: uploadedFile.$id };
		}
		const tags = post.tags?.replace(/ /g, "").split(",") || [];
		const updatedPost = await databases.updateDocument(
			appwriteConfig.databaseID,
			appwriteConfig.postCollectionID,
			post.postId,
			{
				caption: post.caption,
				imageURL: image.imageURL,
				imageID: image.imageID,
				location: post.location,
				tags: tags,
			}
		);
		if (!updatedPost) {
			if (hasFileToUpdate) {
				await deleteFile(image.imageID);
			}
			throw Error;
		}
		if (hasFileToUpdate) {
			await deleteFile(post.imageID);
		}
		return updatedPost;
	} catch (error) {
		console.log(error);
	}
}
export async function deletePost(postId?: string, imageID?: string) {
	if (!postId || !imageID) return;
	try {
		const statusCode = await databases.deleteDocument(
			appwriteConfig.databaseID,
			appwriteConfig.postCollectionID,
			postId
		);
		if (!statusCode) throw Error;
		await deleteFile(imageID);
		return { status: "Ok" };
	} catch (error) {
		console.log(error);
	}
}
export async function likePost(postId: string, likesArray: string[]) {
	try {
		const updatedPost = await databases.updateDocument(
			appwriteConfig.databaseID,
			appwriteConfig.postCollectionID,
			postId,
			{
				likes: likesArray,
			}
		);
		if (!updatedPost) throw Error;
		return updatedPost;
	} catch (error) {
		console.log(error);
	}
}
export async function savePost(userId: string, postId: string) {
	try {
		const updatedPost = await databases.createDocument(
			appwriteConfig.databaseID,
			appwriteConfig.savesCollectionID,
			ID.unique(),
			{
				user: userId,
				post: postId,
			}
		);
		if (!updatedPost) throw Error;
		return updatedPost;
	} catch (error) {
		console.log(error);
	}
}
export async function deleteSavedPost(savedRecordId: string) {
	try {
		const statusCode = await databases.deleteDocument(
			appwriteConfig.databaseID,
			appwriteConfig.savesCollectionID,
			savedRecordId
		);
		if (!statusCode) throw Error;
		return { status: "Ok" };
	} catch (error) {
		console.log(error);
	}
}
export async function getUserPosts(userId?: string) {
	if (!userId) return;
	try {
		const post = await databases.listDocuments(appwriteConfig.databaseID, appwriteConfig.postCollectionID, [
			Query.equal("creator", userId),
			Query.orderDesc("$createdAt"),
		]);
		if (!post) throw Error;
		return post;
	} catch (error) {
		console.log(error);
	}
}
export async function getRecentPosts() {
	try {
		const posts = await databases.listDocuments(appwriteConfig.databaseID, appwriteConfig.postCollectionID, [
			Query.orderDesc("$createdAt"),
			Query.limit(20),
		]);
		if (!posts) throw Error;
		return posts;
	} catch (error) {
		console.log(error);
	}
}
export async function getUsers(limit?: number) {
	const queries: any[] = [Query.orderDesc("$createdAt")];
	if (limit) {
		queries.push(Query.limit(limit));
	}
	try {
		const users = await databases.listDocuments(appwriteConfig.databaseID, appwriteConfig.userCollectionID, queries);
		if (!users) throw Error;
		return users;
	} catch (error) {
		console.log(error);
	}
}
export async function getUserById(userId: string) {
	try {
		const user = await databases.getDocument(appwriteConfig.databaseID, appwriteConfig.userCollectionID, userId);
		if (!user) throw Error;
		return user;
	} catch (error) {
		console.log(error);
	}
}
export async function updateUser(user: IUpdateUser) {
	const hasFileToUpdate = user.file.length > 0;
	try {
		let image = {
			imageURL: user.imageURL,
			imageID: user.imageID,
		};
		if (hasFileToUpdate) {
			const uploadedFile = await uploadFile(user.file[0]);
			if (!uploadedFile) throw Error;
			const fileUrl = getFilePreview(uploadedFile.$id);
			if (!fileUrl) {
				await deleteFile(uploadedFile.$id);
				throw Error;
			}
			image = { ...image, imageURL: fileUrl, imageID: uploadedFile.$id };
		}
		const updatedUser = await databases.updateDocument(
			appwriteConfig.databaseID,
			appwriteConfig.userCollectionID,
			user.userId,
			{
				name: user.name,
				bio: user.bio,
				imageURL: image.imageURL,
				imageID: image.imageID,
			}
		);
		if (!updatedUser) {
			if (hasFileToUpdate) {
				await deleteFile(image.imageID);
			}
			throw Error;
		}
		if (user.imageID && hasFileToUpdate) {
			await deleteFile(user.imageID);
		}
		return updatedUser;
	} catch (error) {
		console.log(error);
	}
}
