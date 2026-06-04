import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { apiClient } from '../services/apiClient';

interface ServerResponse {
    success: boolean;
    id: number;
    server_uuid: string;
    cpu: {
        name: string;
        max_cores: string;
        max_threads: string;
    };
}


const ServerList = () => {
    const [serverData, setServerData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getServerData = async () => {
        try {
            setLoading(true);
            const response = await apiClient.request('/api/cpu/', { method: 'GET' });
            setServerData(response.cpu);
            setError(null);
        } catch (err) {
            setError('Ошибка загрузки данных');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getServerData();

        const interval = setInterval(() => {
            getServerData();
        }, 5000);
        
        // Очистка интервала при размонтировании компонента
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Загрузка информации о CPU ...</Text>
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

    if (!serverData) {
        return (
            <View style={styles.container}>
                <Text>Нет данных о CPU</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Информация о CPU</Text>
            <View style={styles.card}>
                <Text style={styles.value}>{serverData.name}</Text>
            </View>
            <View style={styles.card}>
                <Text style={styles.label}>Количество ядер:</Text>
                <Text style={styles.value}>{serverData.max_cores}</Text>
                <Text style={styles.label}>Количество потоков:</Text>
                <Text style={styles.value}>{serverData.max_threads}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 15,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    card: {
        backgroundColor: '#cecece',
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
    },
});

export default ServerList;