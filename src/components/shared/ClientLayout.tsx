"use client";
import { ThemeProvider } from "./ThemeProvider";
import Sidebar from "./Sidebar";
import { Toaster } from "react-hot-toast";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-muted/20">{children}</main>
      </div>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: { background: "var(--background)", color: "var(--foreground)", border: "1px solid var(--border)" },
        }}
      />
    </ThemeProvider>
  );
}
