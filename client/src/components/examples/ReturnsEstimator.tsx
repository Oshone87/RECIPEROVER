import { ReturnsEstimator } from "../ReturnsEstimator";
import { ThemeProvider } from "../ThemeProvider";

export default function ReturnsEstimatorExample() {
  return (
    <ThemeProvider>
      <div className="p-8 flex justify-center bg-background">
        <ReturnsEstimator />
      </div>
    </ThemeProvider>
  );
}
