import { ThemeProvider } from "../ThemeProvider";

export default function ThemeProviderExample() {
  return (
    <ThemeProvider>
      <div className="p-8">
        <p>Theme provider is working!</p>
      </div>
    </ThemeProvider>
  );
}
