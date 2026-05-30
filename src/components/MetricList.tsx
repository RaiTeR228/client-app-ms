import type {Metric} from "@/types/Metric";
import axios from "axios";
import React, {useEffect, useState} from "react";
import {View, Text, StyleSheet} from "react-native";

const API_URL_METRIC = "http://127.0.0.1:8000/api/post-stats/";
const API_KEY = "6b06b60b24a280f9a563194399293a714694f375592d3866d0f8415c88efb19b";


interface ServerResponse {
    success: boolean;
    id: number;
    server_id: number;
    Use_Cpu: number;
    Use_Ram: number;
    Use_Swap: number;
    created_at?: string;
}

const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',
    headers:{
        "Authorization": `Api-Key ${API_KEY}`,
        "Content-Type": "application/json"
    }
});
    
const MetricList = () => {
    const [metricData, setMetricData] = useState<Metric | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getMetricData = async () => {
        try {
            setLoading(true)
            const response = await apiClient.get<ServerResponse>('post-stats/');
            setMetricData(response.data);
            setError(null);
        } catch (err) {
            setError('Ошибка загрузки данных');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getMetricData(); // Первая загрузка
        
        // Автообновление каждые 5 секунд
        const interval = setInterval(() => {
            getMetricData();
        }, 5000);
        
        // Очистка интервала при размонтировании компонента
        return () => clearInterval(interval);
    }, []);

    // Функция форматирования байтов в читаемый вид
    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        if (!bytes) return 'Нет данных';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        // Ограничиваем размер массива
        const sizeIndex = Math.min(i, sizes.length - 1);
        const value = bytes / Math.pow(k, sizeIndex);
        
        return `${value.toFixed(1)} ${sizes[sizeIndex]}`;
    };

    if (loading && !metricData) {
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

    if (!metricData){
        return(
            <View style={styles.container}>
                <Text style={styles.error}>Нет данных</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Метрики сервера</Text>
            <Text style={styles.label}>
                Использование CPU: {metricData.Use_Cpu?.toFixed(1) ?? '0'}%
            </Text>
            <Text style={styles.label}>
                Использование RAM: {formatBytes(metricData.Use_Ram)}
            </Text>
            <Text style={styles.label}>
                Использование Swap: {formatBytes(metricData.Use_Swap)}
            </Text>
            <Text style={styles.timestamp}>
                Обновлено: {new Date().toLocaleTimeString()}
            </Text>
        </View>
    );
};

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
    timestamp: {
        fontSize: 10,
        color: '#999',
        marginTop: 10,
        fontStyle: 'italic',
    },
});

export default MetricList;