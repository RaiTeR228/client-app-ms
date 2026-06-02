// App.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Типы данных
interface Server {
  id: string;
  name: string;
  ip: string;
  port: string;
  tokenKey: string;
  createdAt: string;
}

const App = () => {
  // Состояния
  const [servers, setServers] = useState<Server[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingServer, setEditingServer] = useState<Server | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Поля формы
  const [formName, setFormName] = useState('');
  const [formIp, setFormIp] = useState('');
  const [formPort, setFormPort] = useState('');
  const [formToken, setFormToken] = useState('');

  // Константы для ключей хранилища
  const SERVERS_KEY = '@monitoring_servers';

  // ========== ОСНОВНЫЕ ФУНКЦИИ ==========

  // Генерация уникального ID
  const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Загрузка списка серверов при старте
  useEffect(() => {
    loadServers();
  }, []);

  // Загрузка всех серверов
  const loadServers = async () => {
    try {
      setLoading(true);
      const serversJson = await AsyncStorage.getItem(SERVERS_KEY);
      const loadedServers = serversJson ? JSON.parse(serversJson) : [];
      setServers(loadedServers);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить список серверов');
    } finally {
      setLoading(false);
    }
  };

  // Сохранение списка серверов
  const saveServers = async (updatedServers: Server[]) => {
    await AsyncStorage.setItem(SERVERS_KEY, JSON.stringify(updatedServers));
    setServers(updatedServers);
  };

  // Добавление сервера
  const addServer = async () => {
    // Валидация
    if (!formName.trim()) {
      Alert.alert('Ошибка', 'Введите название сервера');
      return;
    }
    if (!formIp.trim()) {
      Alert.alert('Ошибка', 'Введите IP адрес');
      return;
    }
    if (!formPort.trim()) {
      Alert.alert('Ошибка', 'Введите порт');
      return;
    }
    if (!formToken.trim()) {
      Alert.alert('Ошибка', 'Введите API токен');
      return;
    }

    try {
      setLoading(true);
      
      // Проверка подключения к серверу
      const fullAddress = `http://${formIp}:${formPort}`;
      const testResponse = await fetch(`${fullAddress}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${formToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!testResponse.ok) {
        throw new Error(`Сервер вернул ошибку: ${testResponse.status}`);
      }

      // Генерируем уникальный ключ для токена
      const tokenKey = `token_${generateId()}`;
      
      // Сохраняем токен в защищенное хранилище
      await SecureStore.setItemAsync(tokenKey, formToken);
      
      // Создаем объект сервера
      const newServer = {
        id: generateId(),
        name: formName.trim(),
        ip: formIp.trim(),
        port: formPort.trim(),
        tokenKey: tokenKey,
        createdAt: new Date().toISOString()
      };
      
      // Сохраняем в список
      const updatedServers = [...servers, newServer];
      await saveServers(updatedServers);
      
      // Очищаем форму
      resetForm();
      setModalVisible(false);
      
      Alert.alert('Успех', 'Сервер успешно добавлен');
      
    } catch (error) {
      // ✅ Исправленный блок catch
      console.error('Ошибка добавления:', error);
      
      let errorMessage = 'Неизвестная ошибка';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      Alert.alert(
        'Ошибка добавления',
        `Не удалось подключиться к серверу: ${errorMessage}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Удаление сервера
  const deleteServer = async (server: Server) => {
    Alert.alert(
      'Удаление сервера',
      `Вы уверены, что хотите удалить сервер "${server.name}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              // Удаляем токен из защищенного хранилища
              await SecureStore.deleteItemAsync(server.tokenKey);
              
              // Удаляем сервер из списка
              const updatedServers = servers.filter(s => s.id !== server.id);
              await saveServers(updatedServers);
              
              Alert.alert('Успех', 'Сервер удален');
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось удалить сервер');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Редактирование сервера
  const editServer = (server: Server) => {
    setEditingServer(server);
    setFormName(server.name);
    setFormIp(server.ip);
    setFormPort(server.port);
    setFormToken(''); // Токен не показываем, нужно ввести заново
    setModalVisible(true);
  };

  // Обновление сервера
  const updateServer = async () => {
    if (!editingServer) return;
    
    try {
      setLoading(true);
      
      let updatedServers = [...servers];
      const index = updatedServers.findIndex(s => s.id === editingServer.id);
      
      if (index !== -1) {
        // Обновляем данные сервера
        updatedServers[index] = {
          ...updatedServers[index],
          name: formName.trim(),
          ip: formIp.trim(),
          port: formPort.trim()
        };
        
        // Если введен новый токен, обновляем его
        if (formToken.trim()) {
          // Удаляем старый токен
          await SecureStore.deleteItemAsync(updatedServers[index].tokenKey);
          
          // Создаем новый ключ и сохраняем токен
          const newTokenKey = `token_${generateId()}`;
          await SecureStore.setItemAsync(newTokenKey, formToken.trim());
          updatedServers[index].tokenKey = newTokenKey;
        }
        
        await saveServers(updatedServers);
      }
      
      resetForm();
      setModalVisible(false);
      Alert.alert('Успех', 'Сервер обновлен');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось обновить сервер');
    } finally {
      setLoading(false);
    }
  };

  // Сброс формы
  const resetForm = () => {
    setFormName('');
    setFormIp('');
    setFormPort('');
    setFormToken('');
    setEditingServer(null);
  };

  // Получение токена для запросов
  const getServerToken = async (serverId: string): Promise<string | null> => {
    const server = servers.find(s => s.id === serverId);
    if (!server) return null;
    return await SecureStore.getItemAsync(server.tokenKey);
  };

  // Тестовый запрос к серверу
  const testServerConnection = async (server: Server) => {
    try {
      setLoading(true);
      const token = await getServerToken(server.id);
      if (!token) {
        Alert.alert('Ошибка', 'Токен не найден');
        return;
      }
      
      const response = await fetch(`http://${server.ip}:${server.port}/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        Alert.alert(
          'Сервер онлайн',
          `Статус: ${JSON.stringify(data, null, 2)}`
        );
      } else {
        Alert.alert('Ошибка', `Сервер вернул ошибку: ${response.status}`);
      }
    } catch (error: any) {
      Alert.alert('Ошибка подключения', error.message);
    } finally {
      setLoading(false);
    }
  };

  // ========== UI КОМПОНЕНТЫ ==========

  // Карточка сервера
  const ServerCard = ({ server }: { server: Server }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.serverName}>{server.name}</Text>
        <Text style={styles.serverDate}>
          {new Date(server.createdAt).toLocaleDateString()}
        </Text>
      </View>
      
      <Text style={styles.serverAddress}>
        {server.ip}:{server.port}
      </Text>
      
      <View style={styles.cardButtons}>
        <TouchableOpacity
          style={[styles.button, styles.testButton]}
          onPress={() => testServerConnection(server)}
        >
          <Text style={styles.buttonText}>Проверить</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => editServer(server)}
        >
          <Text style={styles.buttonText}>Редактировать</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => deleteServer(server)}
        >
          <Text style={styles.buttonText}>Удалить</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Заголовок */}
      <View style={styles.header}>
        <Text style={styles.title}>Мониторинг серверов</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Text style={styles.addButtonText}>+ Добавить сервер</Text>
        </TouchableOpacity>
      </View>

      {/* Список серверов */}
      {loading && servers.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={servers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ServerCard server={item} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Нет добавленных серверов
              </Text>
              <Text style={styles.emptySubtext}>
                Нажмите кнопку "+ Добавить сервер" чтобы начать
              </Text>
            </View>
          }
        />
      )}

      {/* Модальное окно добавления/редактирования */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingServer ? 'Редактировать сервер' : 'Добавить сервер'}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Название сервера *"
              value={formName}
              onChangeText={setFormName}
              editable={!loading}
            />
            
            <TextInput
              style={styles.input}
              placeholder="IP адрес * (например: 192.168.1.100)"
              value={formIp}
              onChangeText={setFormIp}
              autoCapitalize="none"
              editable={!loading}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Порт * (например: 8080)"
              value={formPort}
              onChangeText={setFormPort}
              keyboardType="numeric"
              editable={!loading}
            />
            
            <TextInput
              style={styles.input}
              placeholder={editingServer ? "API токен (оставьте пустым, если не меняется)" : "API токен *"}
              value={formToken}
              onChangeText={setFormToken}
              secureTextEntry
              editable={!loading}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveModalButton]}
                onPress={editingServer ? updateServer : addServer}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {editingServer ? 'Сохранить' : 'Добавить'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ========== СТИЛИ ==========
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'white',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  serverDate: {
    fontSize: 12,
    color: '#999',
  },
  serverAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  cardButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: '#4CAF50',
  },
  editButton: {
    backgroundColor: '#FF9800',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelModalButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveModalButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default App;