import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from "react-native";
import { apiClient } from '../services/apiClient';

interface ProcessData {
    pid: number;
    name: string;
    cpu_usage: number;
    created_at: string;
}

interface ServerResponse {
    success: boolean;
    server_uuid: string;
    processes_count: number;
    processes: ProcessData[];
}

const HtopList = () => {
    const [htopData, setHtopData] = useState<ServerResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getHtopData = async () => {
        try {
            setLoading(true);
            const response = await apiClient.request('/api/htop/', { method: 'GET' });
            console.log('Получены данные:', response);
            setHtopData(response);
            setError(null);
        } catch (err: any) {
            console.error('Ошибка:', err.response?.data || err.message);
            setError(`Ошибка загрузки данных: ${err.response?.data?.error || err.message}`);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getHtopData();
        
        const interval = setInterval(() => {
            getHtopData();
        }, 5000);
        
        return () => clearInterval(interval);
    }, []);

    if (loading && !htopData) {
        return (
            <View style={styles.container}>
                <Text>Загрузка информации...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.error}>Ошибка: {error}</Text>
            </View>
        );
    }

    if (!htopData || !htopData.success) {
        return(
            <View style={styles.container}>
                <Text style={styles.error}>Нет данных</Text>
            </View>
        );
    }

    // Отображение списка процессов
    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Процессы сервера ({htopData.processes_count})
            </Text>
            <Text style={styles.uuid}>
                UUID: {htopData.server_uuid}
            </Text>
            
            <FlatList
                data={htopData.processes}
                keyExtractor={(item, index) => `${item.pid}-${index}`}
                renderItem={({item}) => (
                    <View style={styles.card}>
                        <Text style={styles.label}>
                            PID: {item.pid}
                        </Text>
                        <Text style={styles.label}>
                            Название процесса: {item.name}
                        </Text>
                        <Text style={styles.label}>
                            Использование CPU: {item.cpu_usage?.toFixed(1) ?? '0'}%
                        </Text>
                        <Text style={styles.timestamp}>
                            Время: {new Date(item.created_at).toLocaleTimeString()}
                        </Text>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={styles.error}>Нет процессов для отображения</Text>
                }
            />
        </View>
    );
}

export default HtopList;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    uuid: {
        fontSize: 12,
        color: '#999',
        marginBottom: 15,
    },
    card: {
        backgroundColor: '#f0f0f0',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    value: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    error: {
        color: 'red',
        textAlign: 'center',
    },
    timestamp: {
        fontSize: 10,
        color: '#999',
        marginTop: 10,
        fontStyle: 'italic',
    },
});