import type {HtopProcess} from "@/types/Htop";
import {View, Text, StyleSheet} from "react-native";

type Props = {
    process: HtopProcess;
}

const HtopCard = ({process}: Props) => {
    if (!process) {
        return (
            <View style={styles.container}>
                <Text style={styles.error}>Нет данных</Text>
            </View>
        );
    }
    return (
    <View style={styles.container}>
        <Text style={styles.label}>
            {process.proccess_name} (PID: {process.pid}) - CPU: {process.cpu_usage.toFixed(1)}%
        </Text>
    </View>)
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

export default HtopCard;