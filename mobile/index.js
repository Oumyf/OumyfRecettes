import { registerRootComponent } from 'expo';
import App from './App';
import { registerBackgroundHandler } from './src/services/notificationService';

/**
 * registerBackgroundHandler() DOIT être appelé ici, avant que React Native
 * monte le moindre composant. C'est une contrainte Firebase :
 * le handler background doit être enregistré le plus tôt possible
 * dans le cycle de vie de l'application.
 *
 * Si tu le mets dans App.js (dans un useEffect), il sera trop tard —
 * Firebase aura peut-être déjà ignoré les messages entrants.
 */
registerBackgroundHandler();

registerRootComponent(App);
