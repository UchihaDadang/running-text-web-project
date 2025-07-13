import { createContext, useContext } from "react";

export const LoginHistoryContext = createContext();
export const useLoginHistory = () => useContext(LoginHistoryContext);
