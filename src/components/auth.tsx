"use client";

import React from "react";

type AuthContextType = [
  loggedIn: boolean,
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>,
];

const authContext = React.createContext<AuthContextType | undefined>(undefined);

const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [loggedIn, setLoggedIn] = React.useState(false);
  return (
    <authContext.Provider
      value={React.useMemo(() => [loggedIn, setLoggedIn], [loggedIn])}
    >
      {children}
    </authContext.Provider>
  );
};

export function useAuth() {
  const context = React.useContext(authContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
}

export default AuthProvider;
