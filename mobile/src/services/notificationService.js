/**
 * notificationService.js
 * ======================
 * Centralise toute la logique Firebase Cloud Messaging (FCM).
 *
 * VOCABULAIRE :
 *  - FCM Token   : identifiant unique de l'appareil sur Firebase.
 *                  C'est ce token que tu envoies à ton backend pour cibler cet appareil.
 *  - Foreground  : l'app est OUVERTE et visible par l'utilisateur.
 *  - Background  : l'app est ouverte mais en arrière-plan (minimisée).
 *  - Quit state  : l'app est complètement fermée.
 *
 * FLUX GÉNÉRAL :
 *  1. On demande la permission à l'utilisateur (iOS uniquement, mais bonne pratique partout)
 *  2. On récupère le FCM Token de l'appareil
 *  3. On écoute les notifications selon le contexte (foreground / background / quit)
 */

import messaging from '@react-native-firebase/messaging'
import { Alert } from 'react-native'

const NEW_RECIPES_TOPIC = 'new-recipes'

// ─────────────────────────────────────────────────────────────────
// 1. DEMANDE DE PERMISSION
// ─────────────────────────────────────────────────────────────────
/**
 * Sur iOS : affiche le pop-up système "Autoriser les notifications".
 * Sur Android 13+ : même comportement, requis depuis API 33.
 * Sur les versions antérieures d'Android : permission accordée automatiquement.
 *
 * messaging.AuthorizationStatus :
 *   - NOT_DETERMINED : jamais demandé
 *   - DENIED         : refusé par l'utilisateur → on ne peut plus afficher de pop-up
 *   - AUTHORIZED     : autorisé pleinement
 *   - PROVISIONAL    : iOS seulement — notifications silencieuses autorisées
 */
export async function requestNotificationPermission() {
  await messaging().registerDeviceForRemoteMessages()
  const authStatus = await messaging().requestPermission()

  const isGranted =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL

  if (isGranted) {
    console.log('[FCM] Permission accordée, statut :', authStatus)
  } else {
    console.warn('[FCM] Permission refusée par l\'utilisateur')
  }

  return isGranted
}

// ─────────────────────────────────────────────────────────────────
// 2. RÉCUPÉRATION DU TOKEN FCM
// ─────────────────────────────────────────────────────────────────
/**
 * Chaque appareil possède un token FCM unique.
 * C'est l'adresse que Firebase utilise pour envoyer un message à CET appareil.
 *
 * En production, tu enverrais ce token à ton serveur pour le stocker
 * en base de données (associé à l'utilisateur connecté).
 *
 * Exemple d'appel serveur (à adapter) :
 *   await fetch('https://ton-api.com/save-token', {
 *     method: 'POST',
 *     body: JSON.stringify({ userId: '123', token }),
 *   })
 */
export async function getFCMToken() {
  try {
    await messaging().registerDeviceForRemoteMessages()

    const previousToken = await messaging().getToken()
    if (previousToken) {
      await messaging().deleteToken()
      console.log('[FCM] Ancien token supprimé')
    }

    const token = await messaging().getToken()
    console.log('[FCM] Token de l\'appareil :', token)
    // TODO: envoyer ce token à ton backend ici
    return token
  } catch (error) {
    console.error('[FCM] Impossible de récupérer le token :', error)
    return null
  }
}

export async function subscribeToNewRecipesTopic() {
  try {
    await messaging().subscribeToTopic(NEW_RECIPES_TOPIC)
    console.log('[FCM] Abonné au topic :', NEW_RECIPES_TOPIC)
  } catch (error) {
    console.error('[FCM] Impossible de s\'abonner au topic :', error)
  }
}

// ─────────────────────────────────────────────────────────────────
// 3. NOTIFICATION EN FOREGROUND
// ─────────────────────────────────────────────────────────────────
/**
 * Quand l'app est OUVERTE, Firebase ne déclenche PAS automatiquement
 * une notification visible. C'est à TOI de l'afficher.
 *
 * onMessage() retourne une fonction "unsubscribe" — très important de
 * l'appeler dans le cleanup du useEffect pour éviter les fuites mémoire.
 *
 * La structure d'un message Firebase :
 *  remoteMessage = {
 *    notification: { title, body },  ← le texte affiché
 *    data: { ... },                  ← données custom (ex: recipeId)
 *    messageId: '...',
 *  }
 */
export function subscribeForegroundNotifications(onReceived) {
  // onMessage retourne directement la fonction unsubscribe
  const unsubscribe = messaging().onMessage(async (remoteMessage) => {
    console.log('[FCM] Notification reçue en foreground :', remoteMessage)

    // Par défaut on affiche une Alert — remplace par ton propre composant UI
    Alert.alert(
      remoteMessage.notification?.title ?? 'Nouvelle notification',
      remoteMessage.notification?.body ?? '',
    )

    // Appelle le callback optionnel si tu veux faire autre chose (ex: badge)
    onReceived?.(remoteMessage)
  })

  return unsubscribe // à appeler dans le cleanup useEffect !
}

// ─────────────────────────────────────────────────────────────────
// 4. NOTIFICATION OUVERTE DEPUIS LE BACKGROUND
// ─────────────────────────────────────────────────────────────────
/**
 * L'utilisateur appuie sur une notification alors que l'app est en arrière-plan.
 * Firebase gère l'affichage seul, mais tu peux réagir au tap ici.
 *
 * Utilité typique : naviguer vers un écran précis selon remoteMessage.data
 * Exemple :
 *   if (remoteMessage.data?.recipeId) {
 *     navigation.navigate('Detail', { id: remoteMessage.data.recipeId })
 *   }
 */
export function subscribeBackgroundOpenedNotification(onOpened) {
  const unsubscribe = messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log('[FCM] App ouverte depuis notif background :', remoteMessage)
    onOpened?.(remoteMessage)
  })

  return unsubscribe
}

// ─────────────────────────────────────────────────────────────────
// 5. APP LANCÉE DEPUIS UNE NOTIFICATION (QUIT STATE)
// ─────────────────────────────────────────────────────────────────
/**
 * L'utilisateur a tapé une notification alors que l'app était FERMÉE.
 * Cette vérification est faite UNE SEULE FOIS au démarrage.
 *
 * Contrairement aux listeners ci-dessus, getInitialNotification() est un
 * appel asynchrone ponctuel (pas un abonnement), donc pas d'unsubscribe.
 */
export async function handleInitialNotification(onOpened) {
  const remoteMessage = await messaging().getInitialNotification()

  if (remoteMessage) {
    console.log('[FCM] App démarrée depuis notif (quit state) :', remoteMessage)
    onOpened?.(remoteMessage)
  }
}

// ─────────────────────────────────────────────────────────────────
// 6. HANDLER BACKGROUND (doit être enregistré hors du composant React)
// ─────────────────────────────────────────────────────────────────
/**
 * OBLIGATOIRE pour que les notifications arrivent quand l'app est fermée/background.
 * Ce handler DOIT être appelé avant que React Native monte les composants,
 * c'est pourquoi il est appelé dans index.js et non dans App.js.
 *
 * Il doit retourner une Promise résolue, sinon Firebase considère le message
 * comme non traité et peut ne pas afficher la notification.
 */
export function registerBackgroundHandler() {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('[FCM] Message reçu en background :', remoteMessage)
    // Tu peux stocker dans AsyncStorage ici pour traiter au prochain démarrage
  })
}
