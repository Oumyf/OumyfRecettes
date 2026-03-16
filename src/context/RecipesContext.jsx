import { createContext, useContext, useState, useEffect } from 'react'

// L'URL de l'API vient du fichier .env (VITE_ = exposé côté navigateur)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337/api'

const RecipesContext = createContext()

function normalizeRecipe(recipe) {
  const normalizedCategory = typeof recipe?.category === 'string' && recipe.category.length
    ? recipe.category[0].toUpperCase() + recipe.category.slice(1).toLowerCase()
    : 'Riz'

  return {
    ...recipe,
    title: recipe?.title ?? 'Sans titre',
    category: normalizedCategory,
    duration: recipe?.duration ?? '-',
    difficulty: recipe?.difficulty ?? 'Facile',
    servings: recipe?.servings ?? 1,
    rating: recipe?.rating ?? 0,
    color: recipe?.color ?? '#F97316',
  }
}

export function RecipesProvider({ children }) {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchRecipes() {
    const res = await fetch(`${API_URL}/recipes`)
    if (!res.ok) throw new Error(`Erreur ${res.status}`)

    const json = await res.json()
    const nextRecipes = (json.data ?? []).map(normalizeRecipe)
    setRecipes(nextRecipes)
  }

  // Chargement au démarrage : GET /api/recipes
  useEffect(() => {
    fetchRecipes()
      .then(() => setLoading(false))
      .catch(err => {
        setError('Impossible de charger les recettes')
        setLoading(false)
      })
  }, [])

  // CREATE — POST /api/recipes, retourne le documentId (UUID Strapi)
  async function addRecipe(data) {
    const res = await fetch(`${API_URL}/recipes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),   // Strapi attend { data: {...} }
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(body || `Erreur ${res.status}`)
    }

    const json = await res.json()
    const createdRecipe = normalizeRecipe(json.data)
    setRecipes(prev => [createdRecipe, ...prev])
    await fetchRecipes()
    return createdRecipe.documentId        // documentId = identifiant stable pour les URLs
  }

  // UPDATE — PUT /api/recipes/:documentId
  async function updateRecipe(documentId, data) {
    const res = await fetch(`${API_URL}/recipes/${documentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(body || `Erreur ${res.status}`)
    }

    const json = await res.json()
    setRecipes(prev => prev.map(r => r.documentId === documentId ? normalizeRecipe(json.data) : r))
    await fetchRecipes()
  }

  // DELETE — DELETE /api/recipes/:documentId
  async function deleteRecipe(documentId) {
    const res = await fetch(`${API_URL}/recipes/${documentId}`, { method: 'DELETE' })
    if (!res.ok) {
      const body = await res.text()
      throw new Error(body || `Erreur ${res.status}`)
    }
    setRecipes(prev => prev.filter(r => r.documentId !== documentId))
    await fetchRecipes()
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
