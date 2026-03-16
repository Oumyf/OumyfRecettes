import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useRecipes } from '../context/RecipesContext'

export default function RecipeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { recipes, deleteRecipe } = useRecipes()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const recipe = recipes.find(r => r.documentId === id)

  if (!recipe) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Recette introuvable.</p>
        <Link to="/">← Retour</Link>
      </div>
    )
  }

  async function handleDelete() {
    await deleteRecipe(id)
    navigate('/')
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>

      <Link to="/" style={{ color: '#f97316', textDecoration: 'none', fontWeight: 'bold' }}>
        ← Retour aux recettes
      </Link>

      <div style={{
        borderTop: `6px solid ${recipe.color}`,
        borderRadius: '16px',
        padding: '2rem',
        marginTop: '1.5rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        background: 'white',
      }}>
        {/* Titre + actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{recipe.title}</h1>
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            <Link to={`/recette/${recipe.documentId}/modifier`} style={{
              padding: '0.4rem 1rem', borderRadius: '8px', border: '1.5px solid #e5e7eb',
              fontWeight: '600', fontSize: '0.9rem', background: 'white', color: '#111',
              textDecoration: 'none',
            }}>
              Modifier
            </Link>
            {confirmDelete ? (
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#DC2626', fontWeight: '600' }}>Confirmer ?</span>
                <button onClick={handleDelete} style={{
                  padding: '0.4rem 0.75rem', borderRadius: '8px', border: 'none',
                  background: '#DC2626', color: 'white', fontWeight: '600',
                  fontSize: '0.85rem', cursor: 'pointer',
                }}>Oui</button>
                <button onClick={() => setConfirmDelete(false)} style={{
                  padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1.5px solid #e5e7eb',
                  background: 'white', color: '#111', fontWeight: '600',
                  fontSize: '0.85rem', cursor: 'pointer',
                }}>Non</button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)} style={{
                padding: '0.4rem 1rem', borderRadius: '8px', border: 'none',
                background: '#FEE2E2', color: '#DC2626', fontWeight: '600',
                fontSize: '0.9rem', cursor: 'pointer',
              }}>
                Supprimer
              </button>
            )}
          </div>
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
          {[
            { label: 'Durée',      value: recipe.duration },
            { label: 'Difficulté', value: recipe.difficulty },
            { label: 'Portions',   value: `${recipe.servings} pers.` },
            { label: 'Note',       value: `★ ${recipe.rating}` },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: '#f3f4f6', borderRadius: '8px',
              padding: '0.5rem 1rem', fontSize: '0.9rem',
            }}>
              <strong>{label}</strong><br />{value}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
