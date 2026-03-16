import { useState, useMemo, useCallback } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { CATEGORIES } from './data/recipes'
import { useRecipes } from './context/RecipesContext'
import RecipeCard from './components/RecipeCard'
import RecipeDetail from './pages/RecipeDetail'
import RecipeForm from './pages/RecipeForm'
import { useFavorites } from './context/FavoritesContext'
import './App.css'

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState('Tout')
  const [searchText, setSearchText] = useState('')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  const { favorites } = useFavorites()
  const { recipes, loading, error } = useRecipes()

  // useCallback : mémorise la fonction — même référence entre les re-rendus
  // Sans ça, une nouvelle fonction est créée à chaque rendu, inutilement
  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category)
  }, []) // [] = ne dépend de rien, créé une seule fois

  const handleSearchChange = useCallback((e) => {
    setSearchText(e.target.value)
  }, [])

  const handleToggleFavorites = useCallback(() => {
    setShowFavoritesOnly(prev => !prev)
  }, [])

  // useMemo : mémorise le résultat du calcul
  // Ne recalcule QUE si une des dépendances change (selectedCategory, searchText, etc.)
  // Sans ça, les 3 .filter() tournent à chaque re-rendu, même si rien n'a changé
  const filteredRecipes = useMemo(() => {
    return recipes
      .filter(recipe => selectedCategory === 'Tout' || recipe.category === selectedCategory)
      .filter(recipe => recipe.title.toLowerCase().includes(searchText.toLowerCase()))
      .filter(recipe => !showFavoritesOnly || favorites.includes(recipe.documentId))
  }, [recipes, selectedCategory, searchText, showFavoritesOnly, favorites])
  // ↑ tableau de dépendances : recalcule uniquement quand ces valeurs changent

  return (
    <Routes>
      {/* Route vers la page de détail — :id est un paramètre dynamique */}
      <Route path="/recette/:id" element={<RecipeDetail />} />
      <Route path="/recette/:id/modifier" element={<RecipeForm />} />
      <Route path="/nouvelle-recette" element={<RecipeForm />} />

      {/* Route principale — affiche la liste */}
      <Route path="/" element={
    <div className="app">
      <h1>OumyfRecettes</h1>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
        <input
          type="text"
          placeholder="Rechercher une recette..."
          value={searchText}
          onChange={handleSearchChange}
          className="search-input"
          style={{ marginBottom: 0, flex: 1 }}
        />
        <button
          onClick={handleToggleFavorites}
          className={showFavoritesOnly ? 'active' : ''}
          style={{ borderRadius: '999px', padding: '0.4rem 1rem', border: '2px solid #e5e7eb', cursor: 'pointer', background: showFavoritesOnly ? '#f97316' : 'white', color: showFavoritesOnly ? 'white' : 'inherit', fontWeight: showFavoritesOnly ? 'bold' : 'normal' }}
        >
          ♥ Favoris {favorites.length > 0 && `(${favorites.length})`}
        </button>
        </div>
        <Link to="/nouvelle-recette" style={{
          marginLeft: '0.75rem', padding: '0.5rem 1.1rem', borderRadius: '8px',
          background: '#f97316', color: 'white', fontWeight: '700',
          textDecoration: 'none', fontSize: '0.95rem', whiteSpace: 'nowrap',
        }}>
          + Nouvelle recette
        </Link>
      </div>

      {/* Boutons de filtre — chaque clic met à jour selectedCategory */}
      <div className="categories">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => handleCategorySelect(category)}
            className={selectedCategory === category ? 'active' : ''}
          >
            {category}
          </button>
        ))}
      </div>

      {/* On affiche les recettes filtrées */}
      <div className="recipes-grid">
        {loading && <p style={{ color: '#6b7280', textAlign: 'center' }}>Chargement des recettes...</p>}
        {error && <p style={{ color: '#DC2626', textAlign: 'center' }}>{error}</p>}
        {filteredRecipes.map(recipe => (
          <RecipeCard key={recipe.documentId} recipe={recipe} />
        ))}
      </div>

      {/* Message si aucun résultat */}
      {filteredRecipes.length === 0 && (
        <p className="empty">Aucune recette dans cette catégorie.</p>
      )}
    </div>
      } />
    </Routes>
  )
}