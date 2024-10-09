import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import {
	createUser,
	saveUserToDatabase,
	signIn,
	getAccount,
	getCurrentUser,
	signOut,
	createPost,
	uploadFile,
	getFilePreview,
	deleteFile,
	searchPosts,
	getInfinitePosts,
	getPostById,
	updatePost,
	deletePost,
	likePost,
	savePost,
	deleteSavedPost,
	getUserPosts,
	getRecentPosts,
	getUsers,
	getUserById,
	updateUser,
} from "../appwrite/api";
import { INewUser } from "@/types";

export const useCreateUserMutation = () => {
	return useMutation({
		mutationFn: (user: INewUser) => createUser(user),
	});
};

export const useSignInMutation = () => {
	return useMutation({
		mutationFn: (user: { email: string; password: string }) => signIn(user),
	});
};

export const useSignOutMutation = () => {
	return useMutation({
		mutationFn: () => signOut(),
	});
};

export const 
