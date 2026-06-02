// services/serverService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export interface Server {
  id: string;
  name: string;
  ip: string;
  port: string;
  tokenKey: string;
  createdAt: string;
}

const SERVERS_KEY = '@monitoring_servers';

// Генерация ID
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Получить все серверы
export const getServers = async (): Promise<Server[]> => {
  const data = await AsyncStorage.getItem(SERVERS_KEY);
  return data ? JSON.parse(data) : [];
};

// Сохранить серверы
const saveServers = async (servers: Server[]): Promise<void> => {
  await AsyncStorage.setItem(SERVERS_KEY, JSON.stringify(servers));
};

// Добавить сервер
export const addServer = async (
  name: string,
  ip: string,
  port: string,
  token: string
): Promise<Server> => {
  const servers = await getServers();
  const tokenKey = `token_${generateId()}`;
  
  // Сохраняем токен в SecureStore
  await SecureStore.setItemAsync(tokenKey, token);
  
  const newServer: Server = {
    id: generateId(),
    name,
    ip,
    port,
    tokenKey,
    createdAt: new Date().toISOString()
  };
  
  await saveServers([...servers, newServer]);
  return newServer;
};

// Обновить сервер
export const updateServer = async (
  id: string,
  updates: Partial<Omit<Server, 'id' | 'tokenKey' | 'createdAt'>>
): Promise<void> => {
  const servers = await getServers();
  const index = servers.findIndex(s => s.id === id);
  
  if (index === -1) throw new Error('Сервер не найден');
  
  servers[index] = { ...servers[index], ...updates };
  await saveServers(servers);
};

// Удалить сервер
export const deleteServer = async (id: string): Promise<void> => {
  const servers = await getServers();
  const serverToDelete = servers.find(s => s.id === id);
  
  if (serverToDelete) {
    await SecureStore.deleteItemAsync(serverToDelete.tokenKey);
  }
  
  await saveServers(servers.filter(s => s.id !== id));
};

// Получить токен сервера
export const getServerToken = async (serverId: string): Promise<string | null> => {
  const servers = await getServers();
  const server = servers.find(s => s.id === serverId);
  
  if (!server) return null;
  return await SecureStore.getItemAsync(server.tokenKey);
};

// Обновить токен сервера
export const updateServerToken = async (serverId: string, newToken: string): Promise<void> => {
  const servers = await getServers();
  const server = servers.find(s => s.id === serverId);
  
  if (!server) throw new Error('Сервер не найден');
  
  // Удаляем старый токен
  await SecureStore.deleteItemAsync(server.tokenKey);
  
  // Создаем новый
  const newTokenKey = `token_${generateId()}`;
  await SecureStore.setItemAsync(newTokenKey, newToken);
  
  // Обновляем ссылку
  server.tokenKey = newTokenKey;
  await saveServers(servers);
};

export const getServerByToken = async (token: string): Promise<Server | null> => {
  const servers = await getServers();
  for (const server of servers) {
    const serverToken = await getServerToken(server.id);
    if (serverToken === token) {
      return server;
    }
  }
  return null;
};

// Получить активный сервер (последний использованный)
export const getActiveServer = async (): Promise<Server | null> => {
  const activeServerId = await AsyncStorage.getItem('@active_server_id');
  if (!activeServerId) return null;
  
  const servers = await getServers();
  return servers.find(s => s.id === activeServerId) || null;
};

// Установить активный сервер
export const setActiveServer = async (serverId: string): Promise<void> => {
  await AsyncStorage.setItem('@active_server_id', serverId);
};