import {View, Text, StyleSheet} from "react-native";
import {Ethernet} from '../types/Ethernet';

type Props = {
    eth: Ethernet;
}

const EthernetCard = ({eth}:Props) => {
    if (!eth) {
        return (
            <View style={styles.container}>
                <Text style={styles.error}>Нет данных</Text>
            </View>
        );
    }
    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                {eth.Interface_name} {eth.Eth_Sent} Mbps / {eth.Eth_Recv} Mbps
            </Text>
            <Text style={styles.label}>
                Всего отправлено: {(eth.Bytes_total_Sent / (1024 * 1024)).toFixed(2)} MB, 
                Всего получено: {(eth.Bytes_total_Recv / (1024 * 1024)).toFixed(2)} MB
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        margin: 10,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    metricRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        color: '#666',
    },
    value: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    error: {
        color: 'red',
        textAlign: 'center',
        padding: 20,
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: '#e9ecef',
        borderRadius: 4,
        marginTop: 8,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
});
export default EthernetCard;