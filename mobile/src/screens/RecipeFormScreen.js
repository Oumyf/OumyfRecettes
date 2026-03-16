import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, SafeAreaView, Alert,
} from 'react-native'
import { useRecipes } from '../context/RecipesContext'
import { CATEGORIES } from '../data/recipes'

const COLORS = ['#F97316', '#EAB308', '#DC2626', '#16A34A', '#0EA5E9', '#8B5CF6', '#92400E']
const DIFFICULTIES = ['Facile', 'Moyen', 'Difficile']
const EMPTY = { title: '', category: CATEGORIES[1], duration: '', difficulty: 'Facile', servings: '4', rating: '', color: '#F97316' }

export default function RecipeFormScreen({ route, navigation }) {
  const { id } = route.params ?? {}
  const { recipes, addRecipe, updateRecipe } = useRecipes()

  const isEdit = Boolean(id)
  const existing = isEdit ? recipes.find(r => r.id === id) : null

  const [form, setForm] = useState(
    existing ? { ...existing, servings: String(existing.servings), rating: String(existing.rating) } : EMPTY
  )
  const [errors, setErrors] = useState({})

  function set(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.title.trim())    e.title    = 'Requis'
    if (!form.duration.trim()) e.duration = 'Requis'
    const r = parseFloat(form.rating)
    if (isNaN(r) || r < 0 || r > 5) e.rating = 'Entre 0 et 5'
    return e
  }

  async function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    const data = { ...form, servings: Number(form.servings), rating: Number(form.rating) }

    if (isEdit) {
      await updateRecipe(id, data)
      navigation.navigate('Detail', { id })
    } else {
      const newId = await addRecipe(data)
      if (newId) {
        navigation.navigate('Detail', { id: newId })
      } else {
        Alert.alert('Erreur', 'Impossible de créer la recette pour le moment.')
      }
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.pageTitle}>
          {isEdit ? 'Modifier la recette' : 'Nouvelle recette'}
        </Text>

        {/* Nom */}
        <Field label="Nom" error={errors.title}>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            value={form.title}
            onChangeText={v => set('title', v)}
            placeholder="ex: Thiébou Djeun"
            placeholderTextColor="#9ca3af"
          />
        </Field>

        {/* Durée */}
        <Field label="Durée" error={errors.duration}>
          <TextInput
            style={[styles.input, errors.duration && styles.inputError]}
            value={form.duration}
            onChangeText={v => set('duration', v)}
            placeholder="ex: 45 min"
            placeholderTextColor="#9ca3af"
          />
        </Field>

        {/* Deux colonnes : Portions + Note */}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label="Portions">
              <TextInput
                style={styles.input}
                value={form.servings}
                onChangeText={v => set('servings', v)}
                keyboardType="numeric"
                placeholderTextColor="#9ca3af"
              />
            </Field>
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <Field label="Note (0-5)" error={errors.rating}>
              <TextInput
                style={[styles.input, errors.rating && styles.inputError]}
                value={form.rating}
                onChangeText={v => set('rating', v)}
                keyboardType="decimal-pad"
                placeholder="4.8"
                placeholderTextColor="#9ca3af"
              />
            </Field>
          </View>
        </View>

        {/* Catégorie */}
        <Text style={styles.label}>Catégorie</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={styles.chipRow}>
            {CATEGORIES.filter(c => c !== 'Tout').map(cat => (
              <TouchableOpacity
                key={cat}
                onPress={() => set('category', cat)}
                style={[styles.chip, form.category === cat && styles.chipActive]}
              >
                <Text style={[styles.chipText, form.category === cat && styles.chipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Difficulté */}
        <Text style={styles.label}>Difficulté</Text>
        <View style={[styles.chipRow, { marginBottom: 16 }]}>
          {DIFFICULTIES.map(d => (
            <TouchableOpacity
              key={d}
              onPress={() => set('difficulty', d)}
              style={[styles.chip, form.difficulty === d && styles.chipActive]}
            >
              <Text style={[styles.chipText, form.difficulty === d && styles.chipTextActive]}>
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Couleur */}
        <Text style={styles.label}>Couleur de la carte</Text>
        <View style={[styles.chipRow, { marginBottom: 24 }]}>
          {COLORS.map(c => (
            <TouchableOpacity
              key={c}
              onPress={() => set('color', c)}
              style={[
                styles.colorDot,
                { backgroundColor: c },
                form.color === c && styles.colorDotActive,
              ]}
            />
          ))}
        </View>

        {/* Bouton submit */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>
            {isEdit ? 'Enregistrer' : 'Ajouter la recette'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

// Composant utilitaire Field — évite la répétition label + error
function Field({ label, error, children }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  container: { padding: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
  },
  inputError: { borderColor: '#DC2626' },
  errorText: { color: '#DC2626', fontSize: 12, marginTop: 4 },
  row: { flexDirection: 'row' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  chipActive: { backgroundColor: '#f97316', borderColor: '#f97316' },
  chipText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  colorDot: {
    width: 30, height: 30, borderRadius: 15,
    borderWidth: 2.5, borderColor: 'transparent',
  },
  colorDotActive: { borderColor: '#111827' },
  submitBtn: {
    backgroundColor: '#f97316',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontWeight: '800', fontSize: 16 },
})
