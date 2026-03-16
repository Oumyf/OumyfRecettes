import { createContext, useContext, useState, useEffect } from 'react'

// 1. Créer le contexte — c'est un "canal" global accessible partout dans l'app
const FavoritesContext = createContext()

// 2. Le Provider — il enveloppe l'app et fournit les données à tous ses enfants
export function FavoritesProvider({ children }) {
  // Initialisation depuis localStorage : si des favoris existent, on les recharge
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites')
    return saved ? JSON.parse(saved) : []
  })

  // useEffect : se déclenche à chaque fois que `favorites` change
  // → on sauvegarde automatiquement dans localStorage
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites))
  }, [favorites]) // [favorites] = "surveille favorites"

  // Ajoute ou retire un id des favoris (toggle)
  function toggleFavorite(id) {
    setFavorites(prev =>
      prev.includes(id)
        ? prev.filter(fid => fid !== id)  // retire si déjà présent
        : [...prev, id]                    // ajoute sinon
    )
  }

  function isFavorite(id) {
    return favorites.includes(id)
  }

  // On expose : la liste, la fonction toggle, et le helper isFavorite
  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}

// 3. Custom hook — évite d'importer useContext + FavoritesContext partout
export function useFavorites() {
  return useContext(FavoritesContext)
}
