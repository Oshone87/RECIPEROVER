import Login from "../Login";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";

export default function LoginExample() {
  return (
    <ThemeProvider>
      <Login />
      <Toaster />
    </ThemeProvider>
  );
}
