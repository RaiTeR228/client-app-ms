import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { apiClient } from '../services/apiClient';

interface ServerResponse {
    success:boolean;
    Interface_name: string;
    Eth_Sent: number;
    Eth_Recv: number;
    Bytes_total_Sent: number;
    Bytes_total_Recv: number;
    created_at: string;
}

const EthernetList = () => {
    const [ethernetData, setEthernetData] = useState<ServerResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getEthernetData = async () =>{
        try {
            setLoading(true)
            const response = await apiClient.request('/api/speed-eth/', { method: 'GET' });
            setEthernetData(response);
            setError(null);
        } catch (err) {
            setError('Ошибка загрузки данных');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

        useEffect(() => {
            getEthernetData(); // Первая загрузка
            
            // Автообновление каждые 5 секунд
            const interval = setInterval(() => {
                getEthernetData();
            }, 5000);
            
            // Очистка интервала при размонтировании компонента
            return () => clearInterval(interval);
        }, []);

            if (loading && !ethernetData) {
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
        
            if (!ethernetData){
                return(
                    <View style={styles.container}>
                        <Text style={styles.error}>Нет данных</Text>
                    </View>
                )
            }

    return (
        <View style={styles.container}>
            
        </View>
    );
}

export default EthernetList;

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