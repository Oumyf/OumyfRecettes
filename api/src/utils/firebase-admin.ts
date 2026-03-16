import fs from 'node:fs';
import path from 'node:path';

import admin from 'firebase-admin';

const NEW_RECIPES_TOPIC = 'new-recipes';

function getServiceAccount() {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (serviceAccountPath) {
    const resolvedPath = path.isAbsolute(serviceAccountPath)
      ? serviceAccountPath
      : path.resolve(process.cwd(), serviceAccountPath);

    if (!fs.existsSync(resolvedPath)) {
      console.warn(`[FCM] Fichier service account introuvable: ${resolvedPath}`);
    } else {
      return JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
    }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return {
    projectId,
    clientEmail,
    privateKey,
  };
}

function getFirebaseApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccount = getServiceAccount();

  if (!serviceAccount) {
    console.warn('[FCM] Firebase Admin non configuré. Aucune notification push ne sera envoyée.');
    return null;
  }

  try {
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  } catch (error) {
    console.error('[FCM] Initialisation Firebase Admin échouée:', error);
    return null;
  }
}

export async function sendNewRecipeNotification(recipe: Record<string, unknown>) {
  const app = getFirebaseApp();

  if (!app) {
    return;
  }

  const recipeId = String(recipe.id ?? '');
  const title = String(recipe.title ?? 'Nouvelle recette');

  try {
    await admin.messaging(app).send({
      topic: NEW_RECIPES_TOPIC,
      notification: {
        title: 'Nouvelle recette disponible',
        body: `${title} vient d'être ajoutée.`,
      },
      data: {
        recipeId,
        type: 'new-recipe',
      },
      android: {
        priority: 'high',
      },
    });

    console.log(`[FCM] Notification envoyée pour la recette ${recipeId}`);
  } catch (error) {
    console.error('[FCM] Échec envoi notification:', error);
  }
}