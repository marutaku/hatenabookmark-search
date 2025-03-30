import { createContext, useContext } from "react";


export const AuthorizationContext = createContext<{
  username: string | undefined;
  apikey: string | undefined;
}>({
  username: undefined,
  apikey: undefined,
});

export const useAuth = () => {
  const { username, apikey } = useContext(AuthorizationContext);
  const hasAuthInfo = username !== undefined && apikey !== undefined;
  return {
    username,
    apikey,
    hasAuthInfo
  };
}