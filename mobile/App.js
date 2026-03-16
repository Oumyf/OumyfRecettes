import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { RecipesProvider } from './src/context/RecipesContext'
import HomeScreen from './src/screens/HomeScreen'
import RecipeDetailScreen from './src/screens/RecipeDetailScreen'
import RecipeFormScreen from './src/screens/RecipeFormScreen'
import { useEffect, useRef } from 'react'
import {
  requestNotificationPermission,
  getFCMToken,
  subscribeToNewRecipesTopic,
  subscribeForegroundNotifications,
  subscribeBackgroundOpenedNotification,
  handleInitialNotification,
} from './src/services/notificationService'

// createNativeStackNavigator = équivalent de <Routes> + <Route> en React Router
const Stack = createNativeStackNavigator()

export default function App() {
  const navigationRef = useRef(null)

  function handleNotificationNavigation(remoteMessage) {
    const recipeId = remoteMessage?.data?.recipeId
    if (recipeId && navigationRef.current) {
      navigationRef.current.navigate('Detail', { id: recipeId })
    }
  }

  useEffect(() => {
    requestNotificationPermission().then(async (granted) => {
      if (granted) {
        await getFCMToken()
        await subscribeToNewRecipesTopic()
      }
    })

    const unsubForeground = subscribeForegroundNotifications()
    const unsubBackground = subscribeBackgroundOpenedNotification(
      handleNotificationNavigation
    )

    handleInitialNotification(handleNotificationNavigation)

    return () => {
      unsubForeground()
      unsubBackground()
    }
  }, [])

  return (
    // RecipesProvider enveloppe toute l'app — contexte accessible partout
    <RecipesProvider>
      {/* NavigationContainer = équivalent de BrowserRouter */}
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#fff' },
            headerTintColor: '#f97316',
            headerTitleStyle: { fontWeight: '800', color: '#111827' },
            contentStyle: { backgroundColor: '#f9fafb' },
          }}
        >
          {/* Chaque Stack.Screen = une <Route> */}
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}  // on a notre propre header
          />
          <Stack.Screen
            name="Detail"
            component={RecipeDetailScreen}
            options={{ title: 'Détail' }}
          />
          <Stack.Screen
            name="Form"
            component={RecipeFormScreen}
            options={({ route }) => ({
              title: route.params?.id ? 'Modifier' : 'Nouvelle recette',
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </RecipesProvider>
  )
}
