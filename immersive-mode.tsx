// import { useEffect } from 'react';
// import { Platform } from 'react-native';
// import * as NavigationBar from 'expo-navigation-bar';
// import { setStatusBarHidden } from 'expo-status-bar';

// export function ImmersiveMode() {
//   useEffect(() => {
//     if (Platform.OS === 'android') {
//       // Полный иммерсивный режим
//       NavigationBar.setBehaviorAsync('overlay-swipe');
//       NavigationBar.setVisibilityAsync('hidden');
//       setStatusBarHidden(true, 'none');
//     }
//   }, []);

//   return null;
// }