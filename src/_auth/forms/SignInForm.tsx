import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { SignInValidation } from "../../lib/validations";
import Loader from "@/components/shared/Loader";
import { useSignInMutation } from "@/lib/react_query/queries_mutations";
import { useUserContext } from "@/context/AuthContext";

const SignInForm = () => {
	const { toast } = useToast();
	const { checkAuth } = useUserContext();
	const navigate = useNavigate();

	const { mutateAsync: signIn, isPending: isSigningIn } = useSignInMutation();

	const form = useForm<z.infer<typeof SignInValidation>>({
		resolver: zodResolver(SignInValidation),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	async function onSubmit(values: z.infer<typeof SignInValidation>) {
		const session = await signIn(values);
		if (!session) {
			return toast({ variant: "destructive", title: "Error", description: "Failed to sign in" });
		}
		const isLoggedIn = await checkAuth();
		if (isLoggedIn) {
			form.reset();
			navigate("/");
		} else {
			return toast({ variant: "destructive", title: "Error", description: "Failed to sign in" });
		}
	}

	return (
		<Form {...form}>
			<div className="sm:w-420 flex-center flex-col">
				<img src="/public/assets/images/logo.svg" alt="logo" />
				<h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">Sign in to your account</h2>
				<p className="text-light-3 small-medium md:base-regular mt-2">
					Welcome back! Please enter your details.
				</p>

				<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full mt-4">
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input type="email" className="shad-input" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<Input type="password" className="shad-input" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit" className="shad-button_primary">
						{isSigningIn ? (
							<div className="flex-center gap-2">
								<Loader /> Loading...
							</div>
						) : (
							"Login"
						)}
					</Button>
					<p className="text-light-2 small-regular text-center mt-1">
						Don't have an account?
						<Link to="/sign-up" className="text-primary-500 text-small-semibold ml-2">
							Sign Up
						</Link>
					</p>
				</form>
			</div>
		</Form>
	);
};

export default SignInForm;
