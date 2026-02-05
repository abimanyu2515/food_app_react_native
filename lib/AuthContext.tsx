import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCurrentUser, signOut as appwriteSignOut } from "./appwrite";
import { Models } from "react-native-appwrite";

interface AuthContextType {
  user: Models.Document | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: Models.Document | null) => void;
  signOut: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Models.Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetchUser = async () => {
    setIsLoading(true);
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        console.log('User fetched successfully:', currentUser.email);
      } else {
        setUser(null);
        console.log('No user logged in');
      }
    } catch (error) {
      console.error('Error refetching user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refetchUser();
  }, []);

  const signOut = async () => {
    await appwriteSignOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        setUser,
        signOut,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
