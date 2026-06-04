
// app/index.tsx
import ServerList from "@/components/ServerList";
import RamList from "@/components/RamList";
import DiskList from "@/components/DiskList";
import TemperatureList from "@/components/TemperatureList";
import MetricList from "@/components/MetricList";
import {MetricListRam} from "@/components/MetricList";
import UptimeList from "@/components/UptimeList";
import EthernetList from "@/components/EthernetList";
import HtopList from "@/components/HtopList";

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
        <Text>metric</Text>
        <MetricList/>
        <MetricListRam />
      </View>

      <View>
        <UptimeList/>
      </View>

      <View>
        <EthernetList/>
      </View>

      <View>
        <HtopList/>
      </View>
    
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#716d6d',
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