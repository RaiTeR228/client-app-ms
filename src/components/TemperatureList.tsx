import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { apiClient } from '../services/apiClient';

interface ServerResponse {
    id: number;
    server_uuid: string;
    temperature:{
        current_temp: number;
        status_critical: boolean;
    }
}

const TemperatureList = () => {
    const [temperatureData, setTemperatureData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getTemperatureData = async () => {
        try {
            setLoading(true);
            const response = await apiClient.request('/api/temp/', { method: 'GET' });
            setTemperatureData(response.temperature);
            setError(null);
        } catch (err) {
            setError('Ошибка загрузки данных');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getTemperatureData();
        const interval = setInterval(() => {
            getTemperatureData();
        }, 5000);
        
        // Очистка интервала при размонтировании компонента
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <View>
                {/* <Text>Загрузка информации о температуре...</Text> */}
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

    if (!temperatureData) {
        return (
            <View style={styles.container}>
                <Text>Нет данных о температуре</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* <Text style={styles.title}>Информация о температуре</Text> */}
            <View>
                {/* <Text style={styles.label}>Текущая температура:</Text> */}
                <Text style={{ color: '#ffffff' }}>{temperatureData.current_temp}</Text>
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

export default TemperatureList;