import { useEffect, useState } from "react";
import api from "./services/api";
import Icon from "./components/ui/Icon";

export default function App() {
  const [status, setStatus] = useState("Checking API...");

  useEffect(() => {
    api.get("/health")
      .then((res) => setStatus(res.data.message))
      .catch((err) => setStatus(`Error: ${err.message}`));
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-space-md">
      <h1 className="font-headline-xl text-headline-xl text-primary uppercase">GigCraft</h1>
      <p className="font-body-md text-body-md text-on-surface-variant">{status}</p>
      <button className="flex items-center gap-2 py-3 px-6 bg-primary text-on-primary font-headline-sm text-headline-sm border border-primary hover:bg-primary-container transition-colors">
        <Icon name="login" /> Sign In to Workspace
      </button>
    </div>
  );
}