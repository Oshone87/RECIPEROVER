import KYC from "../KYC";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function KYCExample() {
  return (
    <ThemeProvider>
      <KYC />
    </ThemeProvider>
  );
}
