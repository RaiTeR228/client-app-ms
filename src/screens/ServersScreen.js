// screens/ServersScreen.js
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Alert,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import {
  getServers,
  addServer,
  updateServer,
  deleteServer,
  apiRequest
} from '../services/serverService';

export const ServersScreen = () => {
  const [servers, setServers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingServer, setEditingServer] = useState(null);
  
  // Форма добавления/редактирования
  const [formName, setFormName] = useState('');
  const [formIp, setFormIp] = useState('');
  const [formToken, setFormToken] = useState('');
  
  // Загрузка списка серверов
  const loadServers = async () => {
    const serverList = await getServers();
    setServers(serverList);
  };
  
  useEffect(() => {
    loadServers();
  }, []);
  
  // Добавление сервера
  const handleAddServer = async () => {
    if (!formName || !formIp || !formToken) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }
    
    try {
      // Проверка подключения перед добавлением
      const testConnection = await fetch(`http://${formIp}/health`, {
        headers: { 'Authorization': `Bearer ${formToken}` }
      });
      
      if (!testConnection.ok) throw new Error('Не удалось подключиться');
      
      await addServer(formName, formIp, formToken);
      await loadServers();
      
      // Сброс формы
      setFormName('');
      setFormIp('');
      setFormToken('');
      setShowAddForm(false);
      
      Alert.alert('Успех', 'Сервер добавлен');
    } catch (error) {
      Alert.alert('Ошибка', `Не удалось подключиться к серверу: ${error.message}`);
    }
  };
  
  // Удаление сервера
  const handleDeleteServer = (server) => {
    Alert.alert(
      'Удаление сервера',
      `Удалить сервер "${server.name}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            await deleteServer(server.id);
            await loadServers();
            Alert.alert('Успех', 'Сервер удален');
          }
        }
      ]
    );
  };
  
  // Проверка статуса сервера
  const checkServerStatus = async (server) => {
    try {
      const status = await apiRequest(server.id, '/status');
      Alert.alert('Статус', `Сервер работает: ${JSON.stringify(status)}`);
    } catch (error) {
      Alert.alert('Ошибка', 'Сервер недоступен');
    }
  };
  
  const renderServerItem = ({ item }) => (
    <View style={styles.serverCard}>
      <View style={styles.serverInfo}>
        <Text style={styles.serverName}>{item.name}</Text>
        <Text style={styles.serverIp}>{item.ip}</Text>
        <Text style={styles.serverDate}>
          Добавлен: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      
      <View style={styles.serverActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.checkButton]}
          onPress={() => checkServerStatus(item)}
        >
          <Text style={styles.actionText}>Проверить</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteServer(item)}
        >
          <Text style={styles.actionText}>Удалить</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Серверы мониторинга</Text>
        <Button
          title={showAddForm ? "Отмена" : "+ Добавить сервер"}
          onPress={() => setShowAddForm(!showAddForm)}
        />
      </View>
      
      {showAddForm && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Название сервера"
            value={formName}
            onChangeText={setFormName}
          />
          <TextInput
            style={styles.input}
            placeholder="IP:Порт (например 192.168.1.100:8080)"
            value={formIp}
            onChangeText={setFormIp}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="API токен"
            value={formToken}
            onChangeText={setFormToken}
            secureTextEntry
          />
          <Button title="Добавить сервер" onPress={handleAddServer} />
        </View>
      )}
      
      <FlatList
        data={servers}
        keyExtractor={(item) => item.id}
        renderItem={renderServerItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Нет добавленных серверов. Нажмите "+ Добавить сервер"
          </Text>
        }
      />
    </View>
  );
};

export const ServersScreen = () => {
  const navigation = useNavigation();
  
  // Добавить в header
  <View style={styles.header}>
    <Text style={styles.title}>Серверы мониторинга</Text>
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <TouchableOpacity 
        style={styles.scanButton}
        onPress={() => navigation.navigate('ScanQR')}
      >
        <Text style={styles.scanButtonText}>📷 QR</Text>
      </TouchableOpacity>
      <Button
        title={showAddForm ? "Отмена" : "+ Добавить"}
        onPress={() => setShowAddForm(!showAddForm)}
      />
    </View>
  </View>
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  form: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16
  },
  serverCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2
  },
  serverInfo: {
    flex: 1
  },
  serverName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4
  },
  serverIp: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  serverDate: {
    fontSize: 12,
    color: '#999'
  },
  serverActions: {
    flexDirection: 'row'
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8
  },
  checkButton: {
    backgroundColor: '#4CAF50'
  },
  deleteButton: {
    backgroundColor: '#f44336'
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600'
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 32
  },

  scanButton: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  scanButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});