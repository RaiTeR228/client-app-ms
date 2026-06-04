import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { apiClient } from '../services/apiClient';

interface ServerResponse {
    success: boolean;
    id: number;
    server_uuid: string;
    disk: {
        disk_name: string;
        max_swap: string;
        max_disk: string;
        free_disk: string;
        server_uuid: string;
        created_at: null;
        updated_at: null;
        usage_percent: number;
    };
}

const DiskList = () => {
    const [Data, setServerData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getServerData = async () => {
        try {
            setLoading(true);
            const response = await apiClient.request('/api/disk/', { method: 'GET' });
            setServerData(response.disk);
            setError(null);
        } catch (err) {
            setError('Ошибка загрузки данных');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const bytesToGB = (bytes: string): string => {
        const gb = parseFloat(bytes) / (1024 * 1024 * 1024);
        return `${gb.toFixed(2)} GB`;
    };

    useEffect(() => {
        getServerData();

        const interval = setInterval(() => {
            getServerData();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Загрузка информации о диске ...</Text>
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

    if (!Data) {
        return (
            <View style={styles.container}>
                <Text>Нет данных о диске</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Информация о диске</Text>
            <View style={styles.card}>
                <Text style={styles.value}>{Data.disk_name}</Text>
            </View>
            <View style={styles.card}>
                <Text style={styles.label}>Максимальный объем:</Text>
                {/* <Text style={styles.value}>{Data.max_disk}</Text> */}
                <Text>{bytesToGB(Data.max_disk)}</Text>
                <Text style={styles.label}>Свободный объем:</Text>
                <Text>{bytesToGB(Data.free_disk)}</Text>
                <Text style={styles.label}>Swap:</Text>
                <Text>{bytesToGB(Data.max_swap)}</Text>
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
    },
});

export default DiskList;