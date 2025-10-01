import Signup from "../Signup";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";

export default function SignupExample() {
  return (
    <ThemeProvider>
      <Signup />
      <Toaster />
    </ThemeProvider>
  );
}
