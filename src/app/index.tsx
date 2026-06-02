
// app/index.tsx
import ServerList from "@/components/ServerList";
import RamList from "@/components/RamList";
import DiskList from "@/components/DiskList";
import TemperatureList from "@/components/TemperatureList";
import MetricList from "@/components/MetricList";
import {MetricListRam} from "@/components/MetricList";
import {router} from "expo-router";
import { Button,View, ScrollView, Text, StyleSheet } from "react-native";

export default function HomeScreen() {
  return (

    // <View>
    //   <Text>Главная страница</Text>
    //   <Button title="About" onPress={() => router.push("./info/About")}/>
    //   <Button title="Contacts" onPress={() => router.push("./info/Contacts")}/>
    // </View> 
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        {/* отображение cpu */}
        <ServerList />
      </View>
      
      <View style={styles.section}>
        <RamList />
      </View>
      
      <View style={styles.section}>
        <DiskList />
      </View>
      
      <View style={styles.section}>
        <TemperatureList />
      </View>

      <View>
        <MetricList/>
        <MetricListRam />
      </View>
    
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    marginBottom: 20,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
});