// API utility for backend communication
const API_BASE_URL = import.meta.env.PROD
  ? "https://crypto-invest-ip9u.vercel.app/api" // Your Vercel app URL + /api
  : "http://localhost:5000/api";

class ApiClient {
  private getAuthHeaders() {
    const token = localStorage.getItem("authToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
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
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getPlatformStats() {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Utility method to clear auth token
  logout() {
    localStorage.removeItem("authToken");
  }
}

export const apiClient = new ApiClient();
