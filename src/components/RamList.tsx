import axios from 'axios';
import { useState, useEffect } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import RamCard from './RamCard';
import { Ram } from '@/types/Ram';

const API_URL = 'http://127.0.0.1:8000/api/ram/';
const API_KEY = '6b06b60b24a280f9a563194399293a714694f375592d3866d0f8415c88efb19b';

interface ServerResponse {
    success: boolean;
    id: number;
    server_uuid: string;
    ram: {
        max_ram: string;
    };
}

const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',
    headers: {
        'Authorization': `Api-Key ${API_KEY}`,
        'Content-Type': 'application/json',
    }
});

const RamList = () => {
    const [ramData, setRamData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getRamData = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get<ServerResponse>('ram/');
            // console.log('RAM data:', response.data.ram);
            setRamData(response.data.ram);
        } catch (err) {
            setError('Ошибка загрузки данных');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getRamData();
    }, []);

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Загрузка информации о RAM...</Text>
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

    if (!ramData) {
        return (
            <View style={styles.container}>
                <Text>Нет данных о RAM</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Информация о RAM</Text>
            <View style={styles.card}>
                <Text style={styles.label}>Максимальный объем RAM:</Text>
                <Text style={styles.value}>{ramData.max_ram}</Text>
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