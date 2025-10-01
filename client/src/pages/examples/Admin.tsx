import Admin from "../Admin";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function AdminExample() {
  return (
    <ThemeProvider>
      <Admin />
    </ThemeProvider>
  );
}
