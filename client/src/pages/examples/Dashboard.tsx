import Dashboard from "../Dashboard";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";

export default function DashboardExample() {
  return (
    <ThemeProvider>
      <Dashboard />
      <Toaster />
    </ThemeProvider>
  );
}
