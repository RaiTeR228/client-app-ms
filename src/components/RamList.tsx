import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { apiClient } from '../services/apiClient';

interface ServerResponse {
    success: boolean;
    id: number;
    server_uuid: string;
    ram: {
        max_ram: string;
    };
}

const RamList = () => {
    const [ramData, setRamData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getRamData = async () => {
        try {
            setLoading(true);
            const response = await apiClient.request('/api/ram/', { method: 'GET' });
            setRamData(response.ram);
            setError(null);
        } catch (err) {
            setError('Ошибка загрузки данных');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getRamData();
        const interval = setInterval(() => {
            getRamData();
        }, 5000);
        
        // Очистка интервала при размонтировании компонента
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <View>
                {/* <Text>Загрузка информации о RAM...</Text> */}
            </View>
        );
    }

    if (error) {
        return (
            <View>
                <Text>Ошибка: {error}</Text>
            </View>
        );
    }

    if (!ramData) {
        return (
            <View>
                <Text>Нет данных о RAM</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* <Text style={styles.title}>Информация о RAM</Text> */}
            <View>
                {/* <Text style={styles.label}>Максимальный объем RAM:</Text> */}
                <Text style={{ color: '#ffffff' }}>{ramData.max_ram}</Text>
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

export default RamList;