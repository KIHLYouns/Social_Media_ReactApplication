import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { IContextType, IUser } from "@/types";
import { getCurrentUser } from "@/lib/appwrite/api";
import { useNavigate } from "react-router-dom";

// Initial user state
export const INITIAL_USER: IUser = {
	id: "",
	name: "",
	username: "",
	email: "",
	imageURL: "",
	bio: "",
};

// Initial context state
export const INITIAL_STATE: IContextType = {
	user: INITIAL_USER,
	isAuthenticated: false,
	isLoading: false,
	setUser: () => {},
	setIsAuthenticated: () => {},
	checkAuth: async () => false as boolean,
};

// Creating the context
const AuthContext = createContext<IContextType>(INITIAL_STATE);

// AuthProvider component
const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<IUser>(INITIAL_USER);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const navigate = useNavigate();

	// Function to check authentication
	const checkAuth = async () => {
		setIsLoading(true);
		try {
			const currentUser = await getCurrentUser();
			if (currentUser) {
				setUser({
					id: currentUser.$id,
					name: currentUser.name,
					username: currentUser.username,
					email: currentUser.email,
					imageURL: currentUser.imageURL,
					bio: currentUser.bio,
				});
				setIsAuthenticated(true);
				return true;
			}
			setIsAuthenticated(false);
			return false;
		} catch (error) {
			console.error("Error checking authentication:", error);
			setIsAuthenticated(false);
			return false;
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		// || localStorage.getItem("cookieFallback") === "null"
		if (localStorage.getItem("cookieFallback") === "[]") {
			navigate("/sign-in");
		}
	}, []);

	// Context provider
	return (
		<AuthContext.Provider value={{ user, isAuthenticated, isLoading, setUser, setIsAuthenticated, checkAuth }}>
			{children}
		</AuthContext.Provider>
	);
};

// Custom hook to use context
export const useUserContext = () => useContext(AuthContext);

export default AuthProvider;
