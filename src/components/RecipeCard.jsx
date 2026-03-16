import { Link } from 'react-router-dom'
import { memo } from 'react'
import { useFavorites } from '../context/FavoritesContext'

const RecipeCard = memo(function RecipeCard({ recipe }) {
  const { isFavorite, toggleFavorite } = useFavorites()
  return (
    <Link to={`/recette/${recipe.documentId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{
        borderTop: `4px solid ${recipe.color}`,
        borderRadius: '12px',
        padding: '1rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        background: 'white',
        cursor: 'pointer',
        transition: 'transform 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h2 style={{ margin: '0 0 0.25rem', fontSize: '1rem' }}>{recipe.title}</h2>
          <button
            onClick={(e) => { e.preventDefault(); toggleFavorite(recipe.documentId) }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '1.2rem', lineHeight: 1, flexShrink: 0, marginLeft: '0.5rem',
            }}
            title={isFavorite(recipe.documentId) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            {isFavorite(recipe.documentId) ? '♥' : '♡'}
          </button>
        </div>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem' }}>
          {recipe.category} · {recipe.duration} · ★ {recipe.rating}
        </p>
      </div>
    </Link>
  )
})

export default RecipeCard