import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ListaJogosScreen from './src/screens/ListaJogosScreen';
import FromJogoScreen from './src/screens/FormJogoScreen';
import { colors } from './src/theme';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="ListaJogos"
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen 
          name="ListaJogos"
          component={ListaJogosScreen}
          options={{ title: 'Lista de Jogos' }}
        />
        <Stack.Screen 
          name="FormJogo"
          component={FromJogoScreen}
          options={{ title: 'Jogo' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}