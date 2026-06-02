// services/apiClient.ts
import { getActiveServer, getServerToken, Server } from './serverService';

class ApiClient {
  private currentServer: Server | null = null;
  private currentToken: string | null = null;

  async init() {
    this.currentServer = await getActiveServer();
    if (this.currentServer) {
      this.currentToken = await getServerToken(this.currentServer.id);
    }
  }

  async switchServer(serverId: string) {
    const servers = await import('./serverService').then(m => m.getServers());
    this.currentServer = servers.find(s => s.id === serverId) || null;
    if (this.currentServer) {
      this.currentToken = await getServerToken(this.currentServer.id);
      await import('./serverService').then(m => m.setActiveServer(serverId));
    }
  }

  async request(endpoint: string, options: RequestInit = {}) {
    if (!this.currentServer || !this.currentToken) {
      await this.init();
    }
    
    if (!this.currentServer || !this.currentToken) {
      throw new Error('Нет активного сервера');
    }
    
    const url = `http://${this.currentServer.ip}:${this.currentServer.port}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Api-Key ${this.currentToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }

  getCurrentServer() {
    return this.currentServer;
  }
}

export const apiClient = new ApiClient();