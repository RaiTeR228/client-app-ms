import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Platform,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Типы данных
interface Server {
  id: string;
  name: string;
  hostname: string;
  ip: string;
  active: boolean;
  cpuBase: number;
  ramBase: number;
  tempBase: number;
  diskBase: number;
  totalDisk: number;
}

interface Metrics {
  cpu: number;
  ram: number;
  temp: number;
  disk: number;
  netDown: number;
  netUp: number;
  packets: number;
  uptime: string;
  totalDisk: number;
}

interface Process {
  name: string;
  icon: string;
  cpu: number;
}

// Данные серверов
const serversData: Server[] = [
  { id: "node01", name: "NODE-01", hostname: "node01", ip: "192.168.1.101", active: true, cpuBase: 24, ramBase: 43, tempBase: 52, diskBase: 128, totalDisk: 256 },
  { id: "node02", name: "PROXY-GW", hostname: "proxy-gw", ip: "192.168.1.205", active: false, cpuBase: 12, ramBase: 31, tempBase: 47, diskBase: 64, totalDisk: 128 },
  { id: "node03", name: "STORAGE", hostname: "storage", ip: "10.0.0.45", active: false, cpuBase: 8, ramBase: 62, tempBase: 39, diskBase: 340, totalDisk: 512 }
];

// Иконки для процессов (эмуляция)
const processIcons: { [key: string]: string } = {
  dockerd: '🐳',
  postgres: '🐘',
  node: '📦',
  nginx: '🌐',
};

// Получение метрик для сервера
const getMetricsForServer = (server: Server): Metrics => {
  let cpuVal = Math.min(94, Math.max(4, server.cpuBase + (Math.random() - 0.5) * 12));
  let ramVal = Math.min(88, Math.max(18, server.ramBase + (Math.random() - 0.5) * 8));
  let tempVal = Math.min(78, Math.max(32, server.tempBase + (Math.random() - 0.5) * 5 + (cpuVal * 0.2)));
  let diskUsed = server.diskBase + (Math.random() - 0.5) * 4;
  diskUsed = Math.min(server.totalDisk - 8, Math.max(12, diskUsed));
  diskUsed = Math.round(diskUsed);
  let netDownVal = 0.5 + Math.random() * 6.2;
  let netUpVal = 0.3 + Math.random() * 4.5;
  let pktVal = 8000 + Math.random() * 20000;
  let uptimeHours = 7 + Math.floor(Math.random() * 5);
  let uptimeDays = server.id === "node01" ? 14 : (server.id === "node02" ? 5 : 28);
  
  return {
    cpu: Math.round(cpuVal * 10) / 10,
    ram: Math.round(ramVal * 10) / 10,
    temp: Math.floor(tempVal),
    disk: diskUsed,
    netDown: Math.round(netDownVal * 10) / 10,
    netUp: Math.round(netUpVal * 10) / 10,
    packets: Math.floor(pktVal),
    uptime: `${uptimeDays}д ${uptimeHours}ч`,
    totalDisk: server.totalDisk
  };
};

// Получение списка процессов
const getProcesses = (): Process[] => {
  return [
    { name: "dockerd", icon: "🐳", cpu: Math.min(35, Math.max(2, 12 + (Math.random() - 0.5) * 4)) },
    { name: "postgres", icon: "🐘", cpu: Math.min(28, Math.max(2, 8 + (Math.random() - 0.5) * 3)) },
    { name: "node", icon: "📦", cpu: Math.min(22, Math.max(1, 5 + (Math.random() - 0.5) * 4)) },
    { name: "nginx", icon: "🌐", cpu: Math.min(15, Math.max(1, 3 + (Math.random() - 0.5) * 3)) }
  ].sort((a, b) => b.cpu - a.cpu);
};

// Компонент прогресс-бара
const ProgressBar = ({ progress, color, height = 8 }: { progress: number; color?: string; height?: number }) => (
  <View style={[styles.progressBg, { height }]}>
    <View style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: color || '#3b82f6' }]} />
  </View>
);

// Главный компонент приложения
export default function App() {
  const [activeTab, setActiveTab] = useState<'monitor' | 'servers' | 'settings' | 'console'>('monitor');
  const [currentServerId, setCurrentServerId] = useState('node01');
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>(["-- Терминал готов --"]);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const terminalInputRef = useRef<TextInput>(null);

  const currentServer = serversData.find(s => s.id === currentServerId)!;

  // Обновление метрик
  const refreshMetrics = () => {
    const newMetrics = getMetricsForServer(currentServer);
    setMetrics(newMetrics);
    setProcesses(getProcesses());
  };

  // Автообновление
  useEffect(() => {
    refreshMetrics();
    const interval = setInterval(refreshMetrics, 4200);
    return () => clearInterval(interval);
  }, [currentServerId]);

  // Команды терминала
  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    if (trimmed === "") return;

    const newLines = [...terminalLines];
    newLines.push(`<span style="color:#4cd964;">${currentServer.hostname}@server:~$</span> ${cmd}`);

    if (trimmed === "help") {
      newLines.push("Доступные команды:");
      newLines.push("  help          - показать эту справку");
      newLines.push("  status        - текущее состояние сервера");
      newLines.push("  metrics       - детальные метрики (CPU/RAM/Disk)");
      newLines.push("  services      - список основных служб");
      newLines.push("  reboot        - перезагрузка сервера");
      newLines.push("  clear         - очистить экран терминала");
      newLines.push("  uptime        - время работы сервера");
    } else if (trimmed === "status") {
      newLines.push(`Статус сервера ${currentServer.name} (${currentServer.ip}):`);
      newLines.push(`  ● Активен и работает`);
      newLines.push(`  ● CPU: ${metrics?.cpu}% | RAM: ${metrics?.ram}% | Темп: ${metrics?.temp}°C`);
    } else if (trimmed === "metrics") {
      newLines.push(`== Метрики сервера ${currentServer.name} ==`);
      newLines.push(`CPU:     ${metrics?.cpu}%`);
      newLines.push(`RAM:     ${metrics?.ram}%`);
      newLines.push(`Диск:    ${metrics?.disk} / ${metrics?.totalDisk} GB (${Math.round((metrics?.disk || 0) / (metrics?.totalDisk || 1) * 100)}%)`);
      newLines.push(`Темп.:   ${metrics?.temp}°C`);
      newLines.push(`Сеть ↓:  ${metrics?.netDown} MB/s  ↑: ${metrics?.netUp} MB/s`);
    } else if (trimmed === "services") {
      newLines.push("🔧 Активные службы:");
      newLines.push("  • docker (running)");
      newLines.push("  • postgresql (running)");
      newLines.push("  • nginx (running)");
      newLines.push("  • node_exporter (running)");
    } else if (trimmed === "uptime") {
      newLines.push(`Время работы: ${metrics?.uptime}`);
    } else if (trimmed === "reboot") {
      newLines.push("🔄 Перезагрузка сервера...");
      setTimeout(() => {
        setTerminalLines(prev => [...prev, "[OK] Сервер успешно перезагружен"]);
        refreshMetrics();
      }, 1500);
    } else if (trimmed === "clear") {
      setTerminalLines(["-- Терминал очищен --"]);
      return;
    } else {
      newLines.push(`bash: ${trimmed}: команда не найдена. Введите "help"`);
    }
    
    newLines.push("---");
    setTerminalLines(newLines);
    
    // Добавляем в историю
    if (cmd.trim() !== "") {
      setTerminalHistory(prev => [...prev, cmd]);
      setHistoryIndex(terminalHistory.length + 1);
    }
  };

  const handleTerminalSubmit = () => {
    if (terminalInput.trim()) {
      executeCommand(terminalInput);
      setTerminalInput('');
    }
  };

  const handleTerminalKeyPress = (e: any) => {
    if (e.nativeEvent.key === 'Enter') {
      handleTerminalSubmit();
    }
  };

  // Рендер вкладки мониторинга
  const renderMonitorTab = () => (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.tabContent}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingTitle}>Серверная панель</Text>
          <Text style={styles.greetingSub}>Локальный мониторинг • {currentServer.name}</Text>
        </View>
        <View style={styles.serverBadge}>
          <Text style={styles.serverBadgeText}>🖥️ {currentServer.name}</Text>
        </View>
      </View>

      <LinearGradient colors={['rgba(18,22,32,0.65)', 'rgba(18,22,32,0.65)']} style={styles.statsCard}>
        <View style={styles.uptimeRow}>
          <Text style={styles.uptimeLabel}>⏱️ Время работы</Text>
          <Text style={styles.uptimeValue}>{metrics?.uptime || '--'}</Text>
        </View>
        
        <View style={styles.mainMetrics}>
          <View style={styles.metricBlock}>
            <Text style={styles.metricLabel}>📊 CPU</Text>
            <Text style={styles.metricValue}>{Math.floor(metrics?.cpu || 0)}<Text style={styles.metricUnit}>%</Text></Text>
          </View>
          <View style={styles.metricBlock}>
            <Text style={styles.metricLabel}>💾 RAM</Text>
            <Text style={styles.metricValue}>{Math.floor(metrics?.ram || 0)}<Text style={styles.metricUnit}>%</Text></Text>
          </View>
          <View style={styles.metricBlock}>
            <Text style={styles.metricLabel}>🌡️ Темп.</Text>
            <Text style={[styles.metricValue, styles.tempValue]}>{metrics?.temp || 0}<Text style={styles.metricUnit}>°C</Text></Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressLabel}>
            <Text style={styles.progressLabelText}>CPU загрузка</Text>
            <Text style={styles.progressLabelText}>{metrics?.cpu || 0}%</Text>
          </View>
          <ProgressBar progress={metrics?.cpu || 0} />
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressLabel}>
            <Text style={styles.progressLabelText}>Оперативная память</Text>
            <Text style={styles.progressLabelText}>{metrics?.ram || 0}%</Text>
          </View>
          <ProgressBar progress={metrics?.ram || 0} color="#8b5cf6" />
        </View>
      </LinearGradient>

      <View style={styles.gridMetrics}>
        <LinearGradient colors={['rgba(12,15,24,0.7)', 'rgba(12,15,24,0.7)']} style={styles.infoCard}>
          <View style={styles.cardTitle}>
            <Text>💾</Text>
            <Text style={styles.cardTitleText}>Диск (SSD)</Text>
          </View>
          <Text style={styles.bigNumber}>{metrics?.disk || 0}<Text style={styles.metricUnit}> GB</Text></Text>
          <Text style={styles.sub}>из {metrics?.totalDisk || 0} GB • {Math.round(((metrics?.disk || 0) / (metrics?.totalDisk || 1)) * 100)}%</Text>
          <ProgressBar progress={((metrics?.disk || 0) / (metrics?.totalDisk || 1)) * 100} color="#10b981" height={6} />
        </LinearGradient>

        <LinearGradient colors={['rgba(12,15,24,0.7)', 'rgba(12,15,24,0.7)']} style={styles.infoCard}>
          <View style={styles.cardTitle}>
            <Text>🌐</Text>
            <Text style={styles.cardTitleText}>Сеть</Text>
          </View>
          <View style={styles.networkStats}>
            <Text style={styles.netItem}>↓ {metrics?.netDown || 0} MB/s</Text>
            <Text style={styles.netItem}>↑ {metrics?.netUp || 0} MB/s</Text>
          </View>
          <Text style={styles.sub}>Пакетов: {((metrics?.packets || 0) / 1000).toFixed(1)}k</Text>
        </LinearGradient>
      </View>

      <LinearGradient colors={['rgba(12,15,24,0.6)', 'rgba(12,15,24,0.6)']} style={styles.processCard}>
        <View style={styles.processHeader}>
          <Text style={styles.processHeaderText}>📈 Активные процессы</Text>
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>● LIVE</Text>
          </View>
        </View>
        {processes.map((proc, idx) => (
          <View key={idx} style={styles.processItem}>
            <Text style={styles.procName}>{proc.icon} {proc.name}</Text>
            <Text style={styles.procCpu}>{Math.round(proc.cpu)}%</Text>
          </View>
        ))}
      </LinearGradient>

      <TouchableOpacity style={styles.refreshBtn} onPress={refreshMetrics}>
        <Text style={styles.refreshBtnText}>🔄 Обновить метрики</Text>
      </TouchableOpacity>
      
      <Text style={styles.footerNote}>Локальный мониторинг • данные в реальном времени</Text>
    </ScrollView>
  );

  // Рендер вкладки серверов
  const renderServersTab = () => (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.tabContent}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingTitle}>Мои серверы</Text>
          <Text style={styles.greetingSub}>Выберите узел для мониторинга</Text>
        </View>
        <View style={styles.serverBadge}>
          <Text style={styles.serverBadgeText}>🖥️ Всего: {serversData.length}</Text>
        </View>
      </View>

      {serversData.map(server => (
        <TouchableOpacity
          key={server.id}
          style={[styles.serverItem, server.id === currentServerId && styles.activeServer]}
          onPress={() => {
            setCurrentServerId(server.id);
            setActiveTab('monitor');
          }}
        >
          <View>
            <Text style={styles.serverName}>{server.name}</Text>
            <Text style={styles.serverIp}>{server.ip}</Text>
          </View>
          <View style={styles.serverStatus} />
        </TouchableOpacity>
      ))}
      
      <Text style={[styles.footerNote, { marginTop: 24 }]}>Нажмите на сервер для переключения</Text>
    </ScrollView>
  );

  // Рендер вкладки настроек
  const renderSettingsTab = () => (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.tabContent}>
      <View style={styles.header}>
        <Text style={styles.greetingTitle}>Настройки</Text>
        <Text style={styles.greetingSub}>Параметры приложения</Text>
      </View>

      <LinearGradient colors={['rgba(18,22,32,0.6)', 'rgba(18,22,32,0.6)']} style={styles.settingsGroup}>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>🔔 Уведомления о пиках</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#1E293B', true: '#3b82f6' }}
            thumbColor="#ffffff"
          />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>📊 Автообновление (сек)</Text>
          <Text style={styles.settingValue}>4.2 сек</Text>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>🎨 Темная тема</Text>
          <Text style={styles.settingActive}>Активна</Text>
        </View>
      </LinearGradient>

      <Text style={styles.versionText}>Сервер монитор v1.4{'\n'}Управление через терминал</Text>
    </ScrollView>
  );

  // Рендер вкладки терминала
  const renderConsoleTab = () => (
    <View style={styles.terminalContainer}>
      <LinearGradient colors={['#0a0e17', '#0a0e17']} style={styles.terminalHeader}>
        <View style={styles.terminalTitle}>
          <Text style={styles.terminalTitleText}>💻 Активный хост: {currentServer.name}</Text>
        </View>
        <TouchableOpacity onPress={() => setTerminalLines(["-- Терминал очищен --"])}>
          <Text style={styles.terminalAction}>🗑️</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        ref={scrollViewRef}
        style={styles.terminalScreen}
        contentContainerStyle={styles.terminalScreenContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {terminalLines.map((line, idx) => (
          <Text key={idx} style={styles.terminalLine}>{line}</Text>
        ))}
      </ScrollView>

      <View style={styles.inputLine}>
        <Text style={styles.prompt}>{currentServer.hostname}@server:~$</Text>
        <TextInput
          ref={terminalInputRef}
          style={styles.terminalInput}
          value={terminalInput}
          onChangeText={setTerminalInput}
          onSubmitEditing={handleTerminalSubmit}
          placeholderTextColor="#6b7c93"
          placeholder="Введите команду..."
          autoCapitalize="none"
        />
      </View>

      <View style={styles.hotkeysBar}>
        <TouchableOpacity style={styles.hotkeyBtn} onPress={() => executeCommand("clear")}>
          <Text style={styles.hotkeyBtnText}>🧹 Очистить</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.hotkeyBtn} onPress={() => executeCommand("help")}>
          <Text style={styles.hotkeyBtnText}>❓ Help</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.hotkeyBtn} onPress={() => executeCommand("status")}>
          <Text style={styles.hotkeyBtnText}>📊 Status</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#07090e" />
      <LinearGradient colors={['#101217', '#07090e']} style={styles.appContainer}>
        
        {/* Статус бар (эмуляция) */}
        <View style={styles.statusBar}>
          <Text style={styles.statusBarText}>9:41</Text>
          <Text style={styles.statusBarText}>📶 🔋</Text>
        </View>

        {/* Основной контент */}
        <View style={styles.mainContent}>
          {activeTab === 'monitor' && renderMonitorTab()}
          {activeTab === 'servers' && renderServersTab()}
          {activeTab === 'settings' && renderSettingsTab()}
          {activeTab === 'console' && renderConsoleTab()}
        </View>

        {/* Нижняя панель навигации */}
        <View style={styles.dockBar}>
          <TouchableOpacity style={[styles.dockItem, activeTab === 'monitor' && styles.activeDockItem]} onPress={() => setActiveTab('monitor')}>
            <Text style={styles.dockIcon}>📊</Text>
            <Text style={[styles.dockLabel, activeTab === 'monitor' && styles.activeDockLabel]}>Мониторинг</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.dockItem, activeTab === 'servers' && styles.activeDockItem]} onPress={() => setActiveTab('servers')}>
            <Text style={styles.dockIcon}>🖥️</Text>
            <Text style={[styles.dockLabel, activeTab === 'servers' && styles.activeDockLabel]}>Серверы</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.dockItem, activeTab === 'settings' && styles.activeDockItem]} onPress={() => setActiveTab('settings')}>
            <Text style={styles.dockIcon}>⚙️</Text>
            <Text style={[styles.dockLabel, activeTab === 'settings' && styles.activeDockLabel]}>Настройки</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.dockItem, activeTab === 'console' && styles.activeDockItem]} onPress={() => setActiveTab('console')}>
            <Text style={styles.dockIcon}>💻</Text>
            <Text style={[styles.dockLabel, activeTab === 'console' && styles.activeDockLabel]}>Консоль</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#07090e',
  },
  appContainer: {
    flex: 1,
    borderRadius: 32,
    overflow: 'hidden',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 8 : 12,
    paddingBottom: 6,
  },
  statusBarText: {
    color: '#a1a9c0',
    fontSize: 14,
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tabContent: {
    flex: 1,
  },
  // Общие стили
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  greetingSub: {
    fontSize: 12,
    color: '#6F7A99',
    marginTop: 4,
  },
  serverBadge: {
    backgroundColor: 'rgba(33, 150, 243, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 40,
  },
  serverBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64B5F6',
  },
  statsCard: {
    borderRadius: 28,
    padding: 16,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(66, 153, 225, 0.25)',
  },
  uptimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  uptimeLabel: {
    fontSize: 12,
    color: '#8E99B3',
  },
  uptimeValue: {
    color: '#7CDA8B',
    fontWeight: '600',
    backgroundColor: 'rgba(124, 218, 139, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 20,
    fontSize: 12,
  },
  mainMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  metricBlock: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8E99B3',
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F0F3FF',
  },
  metricUnit: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6F7A99',
  },
  tempValue: {
    color: '#FFB74D',
  },
  progressSection: {
    marginVertical: 6,
  },
  progressLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabelText: {
    fontSize: 11,
    color: '#AAB3CC',
  },
  progressBg: {
    backgroundColor: '#1E2538',
    borderRadius: 20,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 20,
  },
  gridMetrics: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    borderRadius: 24,
    padding: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(48, 86, 130, 0.4)',
  },
  cardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  cardTitleText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#929dbb',
  },
  bigNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#EFF3FF',
  },
  sub: {
    fontSize: 10,
    color: '#6F7A99',
    marginTop: 4,
  },
  networkStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  netItem: {
    fontSize: 13,
    color: '#EFF3FF',
    fontWeight: '500',
  },
  processCard: {
    borderRadius: 28,
    padding: 16,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(72, 112, 160, 0.3)',
  },
  processHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  processHeaderText: {
    fontWeight: '600',
    color: '#B9C7F0',
    fontSize: 13,
  },
  liveBadge: {
    backgroundColor: '#10b98120',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 30,
  },
  liveBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#34d399',
  },
  processItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  procName: {
    color: '#BCC6E3',
    fontSize: 13,
  },
  procCpu: {
    color: '#82B1FF',
    fontWeight: '500',
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 30,
    fontSize: 11,
  },
  refreshBtn: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 0.5,
    borderColor: 'rgba(59, 130, 246, 0.5)',
    paddingVertical: 12,
    borderRadius: 60,
    alignItems: 'center',
    marginBottom: 16,
  },
  refreshBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#90CAF9',
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 10,
    color: '#4A5568',
    marginBottom: 20,
  },
  // Стили для списка серверов
  serverItem: {
    backgroundColor: 'rgba(18, 22, 32, 0.7)',
    borderRadius: 28,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(66, 153, 225, 0.2)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeServer: {
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  serverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EFF3FF',
  },
  serverIp: {
    fontSize: 11,
    color: '#8E99B3',
    marginTop: 4,
  },
  serverStatus: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: '#10b981',
  },
  // Стили настроек
  settingsGroup: {
    borderRadius: 28,
    padding: 16,
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  settingLabel: {
    fontWeight: '500',
    color: '#C0C9E8',
    fontSize: 14,
  },
  settingValue: {
    color: '#6F7A99',
    fontSize: 14,
  },
  settingActive: {
    color: '#3b82f6',
    fontSize: 14,
  },
  versionText: {
    fontSize: 11,
    color: '#5F6E8C',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
  // Стили терминала
  terminalContainer: {
    flex: 1,
    backgroundColor: '#03060c',
    borderRadius: 28,
    overflow: 'hidden',
    marginVertical: 8,
    marginBottom: 16,
  },
  terminalHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#1e2a3a',
  },
  terminalTitleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7aa2f7',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  terminalAction: {
    fontSize: 14,
    color: '#6b7c93',
  },
  terminalScreen: {
    flex: 1,
    backgroundColor: '#010409',
  },
  terminalScreenContent: {
    padding: 14,
  },
  terminalLine: {
    color: '#b9c7db',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 18,
  },
  inputLine: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#0a0f18',
    borderTopWidth: 0.5,
    borderTopColor: '#1a2533',
  },
  prompt: {
    color: '#4cd964',
    fontWeight: '600',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginRight: 8,
  },
  terminalInput: {
    flex: 1,
    color: '#e2e8f0',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    paddingVertical: 4,
  },
  hotkeysBar: {
    flexDirection: 'row',
    backgroundColor: '#0a0f18',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#1a2533',
    justifyContent: 'center',
  },
  hotkeyBtn: {
    backgroundColor: '#1a2538',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  hotkeyBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#90cdf4',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  // Нижняя панель
  dockBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(8, 10, 16, 0.95)',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(72, 120, 184, 0.4)',
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
  },
  dockItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 40,
  },
  activeDockItem: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  dockIcon: {
    fontSize: 20,
    color: '#6F7D9C',
    marginBottom: 2,
  },
  dockLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#6F7D9C',
  },
  activeDockLabel: {
    color: '#3b82f6',
  },
});