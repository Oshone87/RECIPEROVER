import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TrendingUp,
  Upload,
  Camera,
  CheckCircle,
  User,
  FileText,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function KYC() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [idImage, setIdImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selfieInputRef = useRef<HTMLInputElement>(null);
  const idInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (file: File, type: "selfie" | "id") => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === "selfie") {
          setSelfieImage(result);
        } else {
          setIdImage(result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        title: "Invalid file",
        description: "Please upload a valid image file",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!fullName || !dateOfBirth || !address || !selfieImage || !idImage) {
      toast({
        title: "Incomplete information",
        description: "Please fill all fields and upload both images",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate verification process
    setTimeout(() => {
      toast({
        title: "KYC Submitted Successfully!",
        description:
          "Your verification is being processed. You can now access your dashboard.",
      });

      // Update user verification status
      const registeredUsers = JSON.parse(
        localStorage.getItem("registeredUsers") || "[]"
      );
      const updatedUsers = registeredUsers.map((u: any) =>
        u.email === user?.email ? { ...u, isVerified: true } : u
      );
      localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));

      const updatedUser = { ...user, isVerified: true };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setIsSubmitting(false);
      setLocation("/dashboard");
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl p-8 space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">CryptoInvest</span>
          </div>

          <h1 className="text-2xl font-bold">KYC Verification</h1>
          <p className="text-muted-foreground text-center">
            Complete your identity verification to access all features
          </p>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 w-full max-w-md">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1">
                <div
                  className={`h-1 rounded-full ${
                    s <= step ? "bg-primary" : "bg-muted"
                  }`}
                />
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Step {step} of 3</p>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full legal name"
                  data-testid="input-full-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  data-testid="input-date-of-birth"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your full address"
                  data-testid="input-address"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Selfie Verification
            </h3>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Take a clear selfie for identity verification. Make sure your
                face is clearly visible and well-lit.
              </p>

              <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center space-y-4">
                {selfieImage ? (
                  <div className="space-y-4">
                    <img
                      src={selfieImage}
                      alt="Selfie preview"
                      className="max-w-48 max-h-48 mx-auto rounded-lg object-cover"
                    />
                    <Button
                      variant="outline"
                      onClick={() => selfieInputRef.current?.click()}
                      data-testid="button-retake-selfie"
                    >
                      Retake Selfie
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Camera className="h-16 w-16 text-muted-foreground mx-auto" />
                    <div>
                      <h4 className="font-medium">Upload Selfie</h4>
                      <p className="text-sm text-muted-foreground">
                        Click to upload a clear photo of yourself
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => selfieInputRef.current?.click()}
                      data-testid="button-upload-selfie"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Selfie
                    </Button>
                  </div>
                )}

                <input
                  ref={selfieInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, "selfie");
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              ID Document
            </h3>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Upload a clear photo of your government-issued ID (passport,
                driver's license, or national ID card).
              </p>

              <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center space-y-4">
                {idImage ? (
                  <div className="space-y-4">
                    <img
                      src={idImage}
                      alt="ID document preview"
                      className="max-w-64 max-h-48 mx-auto rounded-lg object-cover"
                    />
                    <Button
                      variant="outline"
                      onClick={() => idInputRef.current?.click()}
                      data-testid="button-reupload-id"
                    >
                      Upload Different ID
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto" />
                    <div>
                      <h4 className="font-medium">Upload ID Document</h4>
                      <p className="text-sm text-muted-foreground">
                        Passport, driver's license, or national ID
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => idInputRef.current?.click()}
                      data-testid="button-upload-id"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload ID
                    </Button>
                  </div>
                )}

                <input
                  ref={idInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, "id");
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => (step > 1 ? setStep(step - 1) : setLocation("/"))}
            data-testid="button-kyc-back"
          >
            {step === 1 ? "Skip for Now" : "Back"}
          </Button>

          {step < 3 ? (
            <Button
              onClick={() => {
                if (step === 1 && (!fullName || !dateOfBirth || !address)) {
                  toast({
                    title: "Required fields",
                    description: "Please fill in all personal information",
                    variant: "destructive",
                  });
                  return;
                }
                if (step === 2 && !selfieImage) {
                  toast({
                    title: "Selfie required",
                    description: "Please upload a selfie to continue",
                    variant: "destructive",
                  });
                  return;
                }
                setStep(step + 1);
              }}
              data-testid="button-kyc-next"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !idImage}
              data-testid="button-kyc-submit"
            >
              {isSubmitting ? "Submitting..." : "Complete Verification"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
