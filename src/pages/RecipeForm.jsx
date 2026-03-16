import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useRecipes } from '../context/RecipesContext'
import { CATEGORIES } from '../data/recipes'

// Couleurs proposées pour la carte
const COLORS = [
  { label: 'Orange',  value: '#F97316' },
  { label: 'Jaune',   value: '#EAB308' },
  { label: 'Rouge',   value: '#DC2626' },
  { label: 'Vert',    value: '#16A34A' },
  { label: 'Bleu',    value: '#0EA5E9' },
  { label: 'Violet',  value: '#8B5CF6' },
  { label: 'Marron',  value: '#92400E' },
]

const EMPTY_FORM = {
  title: '', category: CATEGORIES[1], duration: '',
  difficulty: 'Facile', servings: 2, rating: '', color: '#F97316',
}

export default function RecipeForm() {
  const { id } = useParams()          // défini si /recette/:id/modifier
  const navigate = useNavigate()
  const { recipes, addRecipe, updateRecipe } = useRecipes()

  const isEdit = Boolean(id)
  const existing = isEdit ? recipes.find(r => r.documentId === id) : null

  // Pré-remplit le formulaire si c'est une édition
  const [form, setForm] = useState(existing ?? EMPTY_FORM)
  const [errors, setErrors] = useState({})

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.title.trim())    e.title    = 'Le nom est requis'
    if (!form.duration.trim()) e.duration = 'La durée est requise'
    if (!form.rating || isNaN(form.rating) || form.rating < 0 || form.rating > 5)
      e.rating = 'Note entre 0 et 5'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }

    const data = { ...form, servings: Number(form.servings), rating: Number(form.rating) }

    if (isEdit) {
      await updateRecipe(id, data)
      navigate(`/recette/${id}`)
    } else {
      const newId = await addRecipe(data)
      navigate(`/recette/${newId}`)
    }
  }

  const fieldStyle = {
    width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px',
    border: '1.5px solid #e5e7eb', fontSize: '1rem', fontFamily: 'inherit',
    outline: 'none', boxSizing: 'border-box',
  }
  const errorStyle = { color: '#DC2626', fontSize: '0.8rem', marginTop: '0.2rem' }
  const labelStyle = { fontWeight: '600', fontSize: '0.9rem', display: 'block', marginBottom: '0.3rem' }

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      <Link to={isEdit ? `/recette/${id}` : '/'} style={{ color: '#f97316', fontWeight: 'bold', textDecoration: 'none' }}>
        ← Retour
      </Link>

      <h1 style={{ margin: '1.5rem 0 1.5rem', fontSize: '1.5rem' }}>
        {isEdit ? 'Modifier la recette' : 'Nouvelle recette'}
      </h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

        {/* Nom */}
        <div>
          <label style={labelStyle}>Nom de la recette</label>
          <input name="title" value={form.title} onChange={handleChange}
            placeholder="ex: Thiébou Djeun" style={fieldStyle} />
          {errors.title && <p style={errorStyle}>{errors.title}</p>}
        </div>

        {/* Catégorie + Difficulté */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Catégorie</label>
            <select name="category" value={form.category} onChange={handleChange} style={fieldStyle}>
              {CATEGORIES.filter(c => c !== 'Tout').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Difficulté</label>
            <select name="difficulty" value={form.difficulty} onChange={handleChange} style={fieldStyle}>
              {['Facile', 'Moyen', 'Difficile'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Durée + Portions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Durée</label>
            <input name="duration" value={form.duration} onChange={handleChange}
              placeholder="ex: 45 min" style={fieldStyle} />
            {errors.duration && <p style={errorStyle}>{errors.duration}</p>}
          </div>
          <div>
            <label style={labelStyle}>Portions</label>
            <input name="servings" type="number" min="1" value={form.servings}
              onChange={handleChange} style={fieldStyle} />
          </div>
        </div>

        {/* Note */}
        <div>
          <label style={labelStyle}>Note (0 – 5)</label>
          <input name="rating" type="number" step="0.1" min="0" max="5"
            value={form.rating} onChange={handleChange}
            placeholder="ex: 4.8" style={fieldStyle} />
          {errors.rating && <p style={errorStyle}>{errors.rating}</p>}
        </div>

        {/* Couleur de la carte */}
        <div>
          <label style={labelStyle}>Couleur de la carte</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {COLORS.map(c => (
              <button key={c.value} type="button"
                onClick={() => setForm(prev => ({ ...prev, color: c.value }))}
                style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: c.value, border: form.color === c.value ? '3px solid #111' : '3px solid transparent',
                  cursor: 'pointer',
                }}
                title={c.label}
              />
            ))}
          </div>
        </div>

        {/* Bouton submit */}
        <button type="submit" style={{
          padding: '0.75rem', borderRadius: '8px', border: 'none',
          background: '#f97316', color: 'white', fontSize: '1rem',
          fontWeight: '700', cursor: 'pointer',
        }}>
          {isEdit ? 'Enregistrer les modifications' : 'Ajouter la recette'}
        </button>

      </form>
    </div>
  )
}
