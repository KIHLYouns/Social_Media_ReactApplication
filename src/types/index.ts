export type INavLink = {
	imgURL: string;
	route: string;
	label: string;
};

export type IUpdateUser = {
	userId: string;
	name: string;
	bio: string;
	imageID: string;
	imageURL: string | URL;
	file: File[];
};

export type INewPost = {
	userId: string;
	caption: string;
	file: File[];
	location?: string;
	tags?: string;
};

export type IUpdatePost = {
	postId: string;
	caption: string;
	imageID: string;
	imageURL: string | URL;
	file: File[];
	location?: string;
	tags?: string;
};

export type IUser = {
	id: string;
	name: string;
	username: string;
	email: string;
	imageURL: string | URL;
	bio: string;
};

export type INewUser = {
	name: string;
	email: string;
	username: string;
	password: string;
};

export type INewUserDB = {
	accountID: string;
	email: string;
	name: string;
	username?: string;
	imageURL: string | URL;
};

export interface IContextType {
  user: IUser;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<IUser>>;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  checkAuth: () => Promise<boolean>;
}