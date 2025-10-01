import Landing from "../Landing";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";

export default function LandingExample() {
  return (
    <ThemeProvider>
      <Landing />
      <Toaster />
    </ThemeProvider>
  );
}
