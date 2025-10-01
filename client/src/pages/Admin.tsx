import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MOCK_USERS = [
  { id: 1, email: "john@example.com", kycStatus: "Approved", activeInvestments: 2, totalInvested: 6500 },
  { id: 2, email: "sarah@example.com", kycStatus: "Pending", activeInvestments: 1, totalInvested: 5000 },
  { id: 3, email: "mike@example.com", kycStatus: "Approved", activeInvestments: 3, totalInvested: 15000 },
  { id: 4, email: "emma@example.com", kycStatus: "Rejected", activeInvestments: 0, totalInvested: 0 },
];

export default function Admin() {
  const getKycBadgeVariant = (status: string) => {
    if (status === "Approved") return "secondary";
    if (status === "Pending") return "default";
    return "destructive";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage users and investments</p>
          </div>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">User Management</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">KYC Status</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">Active Investments</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Total Invested</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_USERS.map((user) => (
                    <tr key={user.id} className="border-b hover-elevate" data-testid={`row-user-${user.id}`}>
                      <td className="py-4 px-4 text-sm" data-testid={`text-email-${user.id}`}>
                        {user.email}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={getKycBadgeVariant(user.kycStatus)} data-testid={`badge-kyc-${user.id}`}>
                          {user.kycStatus}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-center text-sm font-mono" data-testid={`text-investments-${user.id}`}>
                        {user.activeInvestments}
                      </td>
                      <td className="py-4 px-4 text-right text-sm font-mono" data-testid={`text-total-${user.id}`}>
                        ${user.totalInvested.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
