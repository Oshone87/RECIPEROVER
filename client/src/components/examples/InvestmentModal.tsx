import { useState } from "react";
import { InvestmentModal } from "../InvestmentModal";
import { ThemeProvider } from "../ThemeProvider";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";

export default function InvestmentModalExample() {
  const [open, setOpen] = useState(false);

  return (
    <ThemeProvider>
      <div className="p-8">
        <Button onClick={() => setOpen(true)}>Open Investment Modal</Button>
        <InvestmentModal open={open} onOpenChange={setOpen} />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
