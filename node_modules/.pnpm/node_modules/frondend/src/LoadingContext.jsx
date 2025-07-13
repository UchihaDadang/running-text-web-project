import { useState } from "react";
import LoadingModalComponent from "./components/modals/LoadingModalComponent";
import { LoadingContext } from "./contexts/LoadingContext";

export default function LoadingProvider({ children }) {
  const [loading, setLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}
      {loading && <LoadingModalComponent/>}
    </LoadingContext.Provider>
  );
}