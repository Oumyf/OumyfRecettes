import { createContext, useContext, useState, useEffect } from 'react'
import { Platform } from 'react-native'

// ─────────────────────────────────────────────────────────────────
// CONFIGURATION STRAPI
// ─────────────────────────────────────────────────────────────────
// Expo Go tourne sur le téléphone : "localhost" pointe vers le téléphone lui-même,
// pas vers ton PC. Il faut donc utiliser l'IP locale du PC sur le réseau Wi-Fi.
//
// Pour trouver ton IP : dans PowerShell → ipconfig | findstr "IPv4"
// Assure-toi que le téléphone et le PC sont sur le même réseau Wi-Fi.
const DEFAULT_STRAPI_URL = Platform.select({
  android: 'http://10.0.2.2:1337',
  ios: 'http://localhost:1337',
  default: 'http://localhost:1337',
})

const STRAPI_URL = (process.env.EXPO_PUBLIC_STRAPI_URL || DEFAULT_STRAPI_URL).replace(/\/$/, '')

// Nom de la collection dans Strapi (en minuscules, au pluriel)
// Dans Strapi Admin → Content-Type Builder → tu dois avoir créé une collection "recipe"
const COLLECTION = 'recipes'

// ─────────────────────────────────────────────────────────────────
// HELPERS : transformer les données Strapi ↔ format de l'app
// ─────────────────────────────────────────────────────────────────
// Strapi v4 enveloppe les données dans { data: { id, attributes: {...} } }
// Cette fonction aplatit cette structure pour avoir { id, title, ... }
function normalizeStrapi(item) {
  if (!item) return null

  if (item.attributes) {
    return {
      id: String(item.id),
      strapiId: item.id,
      ...item.attributes,
    }
  }

  return {
    ...item,
    id: item.documentId ?? String(item.id),
    strapiId: item.id,
  }
}

// Inverse : prépare les données pour l'envoi à Strapi (enlève l'id)
function toStrapiBody(data) {
  const { id, strapiId, documentId, ...attributes } = data
  return { data: attributes }
}

const RecipesContext = createContext()

export function RecipesProvider({ children }) {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ─────────────────────────────────────────────────────────
  // CHARGEMENT — GET /api/recipes
  // ─────────────────────────────────────────────────────────
  // fetch() fonctionne pareil qu'en React web.
  // Strapi v4 retourne : { data: [ { id, attributes: {...} }, ... ], meta: {...} }
  useEffect(() => {
    async function loadRecipes() {
      try {
        const res = await fetch(`${STRAPI_URL}/api/${COLLECTION}`)
        if (!res.ok) throw new Error(`Strapi erreur ${res.status}`)
        const json = await res.json()
        // json.data = tableau d'objets Strapi → on normalise chacun
        setRecipes((json.data ?? []).map(normalizeStrapi).filter(Boolean))
        console.log('[Strapi] Chargé:', json.data.length, 'recettes')
      } catch (e) {
        console.error('[Strapi] Erreur chargement:', e.message)
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    loadRecipes()
  }, [])

  // ─────────────────────────────────────────────────────────
  // AJOUT — POST /api/recipes
  // ─────────────────────────────────────────────────────────
  // Strapi attend le corps : { data: { title, category, ... } }
  // Il retourne la recette créée avec son id généré par Strapi
  async function addRecipe(data) {
    try {
      const res = await fetch(`${STRAPI_URL}/api/${COLLECTION}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toStrapiBody(data)),
      })
      if (!res.ok) throw new Error(`Strapi erreur ${res.status}`)
      const json = await res.json()
      const newRecipe = normalizeStrapi(json.data)
      // On ajoute en tête de liste localement (pas besoin de recharger tout)
      setRecipes(prev => [newRecipe, ...prev])
      return newRecipe.id
    } catch (e) {
      console.error('[Strapi] Erreur ajout:', e.message)
    }
  }

  // ─────────────────────────────────────────────────────────
  // MODIFICATION — PUT /api/recipes/:id
  // ─────────────────────────────────────────────────────────
  async function updateRecipe(id, data) {
    try {
      const res = await fetch(`${STRAPI_URL}/api/${COLLECTION}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toStrapiBody(data)),
      })
      if (!res.ok) throw new Error(`Strapi erreur ${res.status}`)
      const json = await res.json()
      const updated = normalizeStrapi(json.data)
      setRecipes(prev => prev.map(r => r.id === id ? updated : r))
    } catch (e) {
      console.error('[Strapi] Erreur modification:', e.message)
    }
  }

  // ─────────────────────────────────────────────────────────
  // SUPPRESSION — DELETE /api/recipes/:id
  // ─────────────────────────────────────────────────────────
  async function deleteRecipe(id) {
    try {
      const res = await fetch(`${STRAPI_URL}/api/${COLLECTION}/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error(`Strapi erreur ${res.status}`)
      setRecipes(prev => prev.filter(r => r.id !== id))
    } catch (e) {
      console.error('[Strapi] Erreur suppression:', e.message)
    }
  }

  return (
    <RecipesContext.Provider value={{ recipes, loading, error, addRecipe, updateRecipe, deleteRecipe }}>
      {children}
    </RecipesContext.Provider>
  )
}

export function useRecipes() {
  return useContext(RecipesContext)
}
