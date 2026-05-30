import type {Metric} from "@/types/Metric";
import React from "react";
import {View, Text, StyleSheet} from "react-native";

type Props = {
    metric: Metric;
}

const getColorByUsage = (value: number): string => {
    if (value >= 80) return '#dc3545'; // красный
    if (value >= 50) return '#ffc107'; // желтый
    return '#28a745'; // зеленый
};

const MetricCard = ({metric}: Props) => {
    if (!metric) {
        return (
            <View style={styles.container}>
                <Text style={styles.error}>Нет данных</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>📊 Метрики сервера</Text>
            
            <View style={styles.metricRow}>
                <Text style={styles.label}>🖥️ CPU:</Text>
                <Text style={[
                    styles.value, 
                    {color: getColorByUsage(metric.Use_Cpu)}
                ]}>
                    {metric.Use_Cpu?.toFixed(1) ?? '0'}%
                </Text>
            </View>
            
            <View style={styles.metricRow}>
                <Text style={styles.label}>💾 RAM:</Text>
                <Text style={[
                    styles.value, 
                    {color: getColorByUsage(metric.Use_Ram)}
                ]}>
                    {metric.Use_Ram?.toFixed(1) ?? '0'}%
                </Text>
            </View>
            
            <View style={styles.metricRow}>
                <Text style={styles.label}>🔄 Swap:</Text>
                <Text style={[
                    styles.value, 
                    {color: getColorByUsage(metric.Use_Swap)}
                ]}>
                    {metric.Use_Swap?.toFixed(1) ?? '0'}%
                </Text>
            </View>

            {/* Прогресс-бары */}
            <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, {width: `${Math.min(metric.Use_Cpu, 100)}%`, backgroundColor: getColorByUsage(metric.Use_Cpu)}]} />
            </View>
        </View>
    );
};

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

export default MetricCard;