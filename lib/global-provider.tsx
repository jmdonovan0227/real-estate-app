import { createContext, useContext } from "react";
import { useAppwrite } from "./useAppwrite";
import { getCurrentUser } from "./appwrite";

interface User {
  $id: string;
  name: string;
  email: string;
  avatar: string;
}

interface GlobalContextType {
  isLoggedIn: boolean; // is user logged in?
  user: User | null | undefined; // current user
  loading: boolean; // is loading?
  refetch: (newParams?: Record<string, string | number>) => Promise<void>; // refetch the data
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    data: user,
    loading,
    refetch,
  } = useAppwrite({
    fn: getCurrentUser,
  });

  const isLoggedIn = !!user; // !! is to convert objects to booleans

  return (
    <GlobalContext.Provider
      value={{
        isLoggedIn,
        user: user ?? null,
        loading,
        refetch: (newParams = {}) => refetch(newParams),
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);

  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }

  return context;
};

export default GlobalProvider;
