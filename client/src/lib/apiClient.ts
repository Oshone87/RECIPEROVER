// API utility for backend communication
// Prefer same-origin /api to leverage Vercel serverless routing and avoid CORS.
// Allow override via VITE_API_BASE_URL when deploying backend separately.
const API_BASE_URL: string =
  (import.meta.env as any).VITE_API_BASE_URL?.toString() || "/api";
// Debug: surface the effective API base URL at runtime
try {
  // Avoid breaking SSR/build
  // eslint-disable-next-line no-console
  console.info(
    "[ApiClient] Using API base:",
    API_BASE_URL,
    "env override:",
    Boolean((import.meta.env as any).VITE_API_BASE_URL)
  );
} catch {}

class ApiClient {
  private getAuthHeaders() {
    const token = localStorage.getItem("authToken");
    let tz: string | undefined;
    try {
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {}
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(tz && { "x-user-timezone": tz }),
    };
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Network error" }));
      throw new Error(error.message || "API request failed");
    }
    return response.json();
  }

  // Authentication APIs
  async register(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const data = await this.handleResponse(response);

    // Store token for future requests
    if (data.token) {
      localStorage.setItem("authToken", data.token);
    }

    return data;
  }

  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const data = await this.handleResponse(response);

    // Store token for future requests
    if (data.token) {
      localStorage.setItem("authToken", data.token);
    }

    return data;
  }

  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Balance APIs
  async getBalances() {
    const response = await fetch(`${API_BASE_URL}/balances`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getTransactions() {
    const response = await fetch(`${API_BASE_URL}/balances/transactions`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async deposit(asset: string, amount: number) {
    const response = await fetch(`${API_BASE_URL}/balances/deposit`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ asset, amount }),
    });
    return this.handleResponse(response);
  }

  async withdraw(asset: string, amount: number) {
    const response = await fetch(`${API_BASE_URL}/balances/withdraw`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ asset, amount }),
    });
    return this.handleResponse(response);
  }

  // Investment APIs
  async getInvestments() {
    const response = await fetch(`${API_BASE_URL}/investments`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async createInvestment(
    tier: string,
    amount: number,
    asset: string,
    period: number
  ) {
    const response = await fetch(`${API_BASE_URL}/investments`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ tier, amount, asset, period }),
    });
    return this.handleResponse(response);
  }

  async getInvestment(id: string) {
    const response = await fetch(`${API_BASE_URL}/investments/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Promo X2 APIs
  async getPromoX2Status() {
    const response = await fetch(`${API_BASE_URL}/promo/x2/status`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async activatePromoX2() {
    const response = await fetch(`${API_BASE_URL}/promo/x2/activate`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({}),
    });
    return this.handleResponse(response);
  }

  // Admin APIs
  async getAllUsers() {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getAllInvestments() {
    const response = await fetch(`${API_BASE_URL}/admin/investments`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateUserKYC(
    userId: string,
    status: "approved" | "rejected" | "pending"
  ) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/kyc`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return this.handleResponse(response);
  }

  async deleteUser(userId: string) {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ userId }),
    });
    return this.handleResponse(response);
  }

  async updateUserDisabled(userId: string, disabled: boolean) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ disabled }),
    });
    return this.handleResponse(response);
  }

  async getPlatformStats() {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Request Management APIs
  async submitKYC(kycData: any) {
    const response = await fetch(`${API_BASE_URL}/requests/kyc`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(kycData),
    });
    return this.handleResponse(response);
  }

  async submitDeposit(depositData: any) {
    const response = await fetch(`${API_BASE_URL}/requests/deposit`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(depositData),
    });
    return this.handleResponse(response);
  }

  async submitWithdrawal(withdrawalData: any) {
    const response = await fetch(`${API_BASE_URL}/requests/withdrawal`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(withdrawalData),
    });
    return this.handleResponse(response);
  }

  async getMyRequests() {
    const response = await fetch(`${API_BASE_URL}/requests/my-requests`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Admin Request Management APIs
  async getKYCRequests() {
    const response = await fetch(`${API_BASE_URL}/admin/kyc-requests`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getKYCRequestById(requestId: string) {
    const response = await fetch(
      `${API_BASE_URL}/admin/kyc-requests/${requestId}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return this.handleResponse(response);
  }

  async updateKYCRequest(
    requestId: string,
    status: string,
    rejectionReason?: string
  ) {
    const response = await fetch(
      `${API_BASE_URL}/admin/kyc-requests/${requestId}`,
      {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status, rejectionReason }),
      }
    );
    return this.handleResponse(response);
  }

  async getDepositRequests() {
    const response = await fetch(`${API_BASE_URL}/admin/deposit-requests`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateDepositRequest(
    requestId: string,
    status: string,
    rejectionReason?: string
  ) {
    const response = await fetch(
      `${API_BASE_URL}/admin/deposit-requests/${requestId}`,
      {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status, rejectionReason }),
      }
    );
    return this.handleResponse(response);
  }

  async getWithdrawalRequests() {
    const response = await fetch(`${API_BASE_URL}/admin/withdrawal-requests`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateWithdrawalRequest(
    requestId: string,
    status: string,
    rejectionReason?: string,
    transactionHash?: string
  ) {
    const response = await fetch(
      `${API_BASE_URL}/admin/withdrawal-requests/${requestId}`,
      {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status, rejectionReason, transactionHash }),
      }
    );
    return this.handleResponse(response);
  }

  // Utility method to clear auth token
  logout() {
    localStorage.removeItem("authToken");
  }
}

export const apiClient = new ApiClient();
