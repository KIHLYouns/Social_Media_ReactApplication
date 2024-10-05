import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { createUser, signIn } from "@/lib/appwrite/api";
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
}
