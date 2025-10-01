import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, CheckCircle } from "lucide-react";
import { Link } from "wouter";

export default function KYC() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 space-y-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">CryptoInvest</span>
          </div>
          
          <div className="w-16 h-16 rounded-full bg-chart-2/10 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-chart-2" />
          </div>
          
          <h1 className="text-2xl font-bold">KYC Verification</h1>
          <p className="text-muted-foreground">
            Your account has been created successfully. KYC verification will be available soon.
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/dashboard">
            <Button className="w-full" size="lg" data-testid="button-go-dashboard">
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full" size="lg" data-testid="button-back-home">
              Back to Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
