import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  Upload,
  Camera,
  CheckCircle,
  User,
  FileText,
  MapPin,
  Phone,
  Globe,
  CreditCard,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function KYC() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState(1);

  // Personal Information
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nationality, setNationality] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Address Information
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // Document Information
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [idImage, setIdImage] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const idInputRef = useRef<HTMLInputElement>(null);

  // Compress image on client and return base64 data URL; enforce <= 2MB post-compression
  const compressImageToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) {
        return reject(new Error("Invalid image type"));
      }
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            const maxDim = 1280;
            let { width, height } = img;
            if (width > height && width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else if (height >= width && height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) return reject(new Error("Canvas not supported"));
            ctx.drawImage(img, 0, 0, width, height);
            const quality = 0.7; // JPEG quality
            const mime = file.type.includes("png")
              ? "image/jpeg"
              : "image/jpeg";
            const dataUrl = canvas.toDataURL(mime, quality);
            // Validate size <= 2MB after compression
            const base64 = dataUrl.split(",")[1] || "";
            const sizeBytes = Math.ceil((base64.length * 3) / 4);
            if (sizeBytes > 2 * 1024 * 1024) {
              return reject(
                new Error(
                  "Compressed image is over 2MB. Please choose a smaller image."
                )
              );
            }
            resolve(dataUrl);
          } catch (e) {
            reject(e);
          }
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = reader.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    if (
      !firstName ||
      !lastName ||
      !dateOfBirth ||
      !nationality ||
      !phoneNumber ||
      !address ||
      !city ||
      !country ||
      !postalCode ||
      !documentType ||
      !documentNumber ||
      !idImage
    ) {
      toast({
        title: "Incomplete information",
        description: "Please fill all fields and upload your ID document",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit KYC request to backend
      const response = await fetch("/api/requests/kyc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          dateOfBirth,
          nationality,
          phoneNumber,
          address,
          city,
          country,
          postalCode,
          documentType,
          documentNumber,
          documentImageDataUrl: idImage,
          documentImageMimeType:
            idImage?.split(":")[1]?.split(";")[0] || "image/jpeg",
        }),
      });

      if (response.ok) {
        toast({
          title: "KYC Submitted Successfully!",
          description:
            "Your verification request has been submitted for admin review.",
        });
        setLocation("/dashboard");
      } else {
        const error = await response.json();
        toast({
          title: "Submission Failed",
          description: error.message || "Failed to submit KYC request",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  const nextStep = () => {
    if (step === 1) {
      if (
        !firstName ||
        !lastName ||
        !dateOfBirth ||
        !nationality ||
        !phoneNumber
      ) {
        toast({
          title: "Incomplete information",
          description: "Please fill all personal information fields",
          variant: "destructive",
        });
        return;
      }
    } else if (step === 2) {
      if (!address || !city || !country || !postalCode) {
        toast({
          title: "Incomplete information",
          description: "Please fill all address information fields",
          variant: "destructive",
        });
        return;
      }
    }
    setStep(step + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 mb-4">
            <TrendingUp className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">RecipeRover</span>
          </div>
          <h1 className="text-3xl font-bold">Identity Verification</h1>
          <p className="text-muted-foreground">
            Complete your KYC verification to start investing
          </p>
        </div>

        <Card className="p-6">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
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

          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter your first name"
                    data-testid="input-first-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter your last name"
                    data-testid="input-last-name"
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
                  <Label htmlFor="nationality">Nationality</Label>
                  <Select value={nationality} onValueChange={setNationality}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select nationality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="GB">United Kingdom</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                      <SelectItem value="DE">Germany</SelectItem>
                      <SelectItem value="FR">France</SelectItem>
                      <SelectItem value="JP">Japan</SelectItem>
                      <SelectItem value="NG">Nigeria</SelectItem>
                      <SelectItem value="KE">Kenya</SelectItem>
                      <SelectItem value="ZA">South Africa</SelectItem>
                      <SelectItem value="IN">India</SelectItem>
                      <SelectItem value="CN">China</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter your phone number"
                    data-testid="input-phone-number"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Address Information */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address Information
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your street address"
                    data-testid="input-address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Enter your city"
                      data-testid="input-city"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="Enter postal code"
                      data-testid="input-postal-code"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="GB">United Kingdom</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                      <SelectItem value="DE">Germany</SelectItem>
                      <SelectItem value="FR">France</SelectItem>
                      <SelectItem value="JP">Japan</SelectItem>
                      <SelectItem value="NG">Nigeria</SelectItem>
                      <SelectItem value="KE">Kenya</SelectItem>
                      <SelectItem value="ZA">South Africa</SelectItem>
                      <SelectItem value="IN">India</SelectItem>
                      <SelectItem value="CN">China</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Document Verification */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Document Verification
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="documentType">Document Type</Label>
                    <Select
                      value={documentType}
                      onValueChange={setDocumentType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="passport">Passport</SelectItem>
                        <SelectItem value="driver_license">
                          Driver's License
                        </SelectItem>
                        <SelectItem value="national_id">National ID</SelectItem>
                        <SelectItem value="state_id">State ID</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documentNumber">Document Number</Label>
                    <Input
                      id="documentNumber"
                      value={documentNumber}
                      onChange={(e) => setDocumentNumber(e.target.value)}
                      placeholder="Enter document number"
                      data-testid="input-document-number"
                    />
                  </div>
                </div>

                {/* Document Upload */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Upload ID Document</Label>
                    <div
                      className="border-2 border-dashed border-muted rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => idInputRef.current?.click()}
                    >
                      {idImage ? (
                        <div className="space-y-2">
                          <img
                            src={idImage}
                            alt="ID Document"
                            className="max-h-32 mx-auto rounded"
                          />
                          <p className="text-sm text-green-600 flex items-center justify-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            Document uploaded
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload ID document (max 2MB after
                            compression)
                          </p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={idInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        try {
                          const dataUrl = await compressImageToDataUrl(f);
                          setIdImage(dataUrl);
                        } catch (err: any) {
                          toast({
                            title: "Image too large",
                            description:
                              err?.message ||
                              "Please choose a smaller image (<= 2MB)",
                            variant: "destructive",
                          });
                          setIdImage(null);
                        }
                      }}
                      data-testid="input-id-upload"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between pt-6 border-t">
            <div className="space-x-2">
              <Link href="/dashboard">
                <Button variant="outline">Cancel</Button>
              </Link>
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              )}
            </div>

            {step < 3 ? (
              <Button onClick={nextStep}>Next</Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !idImage}
                data-testid="button-kyc-submit"
              >
                {isSubmitting ? "Submitting..." : "Submit KYC for Verification"}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
