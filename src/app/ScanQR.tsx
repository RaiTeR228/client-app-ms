import { Camera, CameraView } from 'expo-camera';
import { useRouter } from "expo-router";
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { addServer } from '../services/serverService';

// ✅ Изменено: теперь default export, а не named export
export default function ScanQR() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned || loading) return;
    
    setScanned(true);
    setLoading(true);
    
    try {
      let serverConfig;
      try {
        serverConfig = JSON.parse(data);
      } catch (parseError) {
        Alert.alert(
          'Неверный формат',
          'QR-код должен содержать JSON с данными сервера',
          [{ text: 'OK', onPress: () => setScanned(false) }]
        );
        setLoading(false);
        return;
      }
      
      // Поддержка нового компактного формата {v:1, t:"sc", s:{...}}
      let server;
      if (serverConfig.v === 1 && serverConfig.t === 'sc') {
        // Новый формат
        server = {
          name: serverConfig.s.n,
          ip: serverConfig.s.i,
          port: serverConfig.s.p,
          api_token: serverConfig.s.k,
          protocol: serverConfig.s.r || 'http',
          system_pc: serverConfig.s.sys,
          local_name_pc: serverConfig.s.local,
          uuid: serverConfig.s.u
        };
      } else if (serverConfig.type === 'server_config' && serverConfig.server) {
        // Старый формат
        server = serverConfig.server;
      } else {
        Alert.alert(
          'Неверный формат',
          'Этот QR-код не является конфигурацией сервера',
          [{ text: 'OK', onPress: () => setScanned(false) }]
        );
        setLoading(false);
        return;
      }
      
      if (!server.name || !server.ip || !server.port || !server.api_token) {
        Alert.alert(
          'Неполные данные',
          'QR-код содержит не все необходимые данные сервера',
          [{ text: 'OK', onPress: () => setScanned(false) }]
        );
        setLoading(false);
        return;
      }
      
      setScannedData(server);
      setShowConfirmModal(true);
      
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось обработать QR-код');
      setScanned(false);
    } finally {
      setLoading(false);
    }
  };

  const confirmAddServer = async () => {
    if (!scannedData) return;
    
    setLoading(true);
    
    try {
      await addServer(
        scannedData.name,
        scannedData.ip,
        scannedData.port.toString(),
        scannedData.api_token
      );
      
      setShowConfirmModal(false);
      setScanned(false);
      Alert.alert(
        'Успех',
        `Сервер "${scannedData.name}" успешно добавлен`,
        [{ text: 'OK', onPress: () => router.replace('/') }]
      );
    } catch (error) {
      console.error('ScanQR addServer error:', error);
      Alert.alert('Ошибка', 'Не удалось добавить сервер');
      setShowConfirmModal(false);
      setScanned(false);
    } finally {
      setLoading(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.centerContainer}>
        <Text>Запрос разрешения на использование камеры...</Text>
      </View>
    );
  }
  
  if (hasPermission === false) {
    return (
      <View style={styles.centerContainer}>
        <Text>Нет доступа к камере</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
          }}
        >
          <Text style={styles.buttonText}>Разрешить доступ</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
          <Text style={styles.scanText}>
            Наведите камеру на QR-код сервера
          </Text>
          {scanned && !showConfirmModal && (
            <TouchableOpacity
              style={styles.scanAgainButton}
              onPress={() => setScanned(false)}
            >
              <Text style={styles.scanAgainText}>Сканировать снова</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showConfirmModal}
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Добавить сервер?</Text>
            
            {scannedData && (
              <View style={styles.serverInfo}>
                <Text style={styles.serverInfoLabel}>Название:</Text>
                <Text style={styles.serverInfoValue}>{scannedData.name}</Text>
                
                <Text style={styles.serverInfoLabel}>Адрес:</Text>
                <Text style={styles.serverInfoValue}>
                  {scannedData.protocol || 'http'}://{scannedData.ip}:{scannedData.port}
                </Text>
              </View>
            )}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowConfirmModal(false);
                  setScanned(false);
                }}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmAddServer}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.confirmButtonText}>Добавить</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
  },
  scanText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  scanAgainButton: {
    marginTop: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  scanAgainText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  button: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  serverInfo: { marginBottom: 20 },
  serverInfoLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  serverInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  confirmButton: { backgroundColor: '#007AFF' },
  cancelButtonText: { color: '#666', fontWeight: '600' },
  confirmButtonText: { color: '#fff', fontWeight: '600' },
});