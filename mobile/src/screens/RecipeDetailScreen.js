import {
  View, Text, TouchableOpacity,
  ScrollView, StyleSheet, SafeAreaView, Alert,
} from 'react-native'
import { useRecipes } from '../context/RecipesContext'

export default function RecipeDetailScreen({ route, navigation }) {
  // route.params = équivalent de useParams() sur le web
  const { id } = route.params
  const { recipes, deleteRecipe } = useRecipes()

  const recipe = recipes.find(r => r.id === id)

  if (!recipe) {
    return (
      <View style={styles.center}>
        <Text>Recette introuvable.</Text>
      </View>
    )
  }

  function handleDelete() {
    // Alert.alert = équivalent de window.confirm sur mobile
    Alert.alert(
      'Supprimer la recette',
      `Supprimer « ${recipe.title} » ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer', style: 'destructive',
          onPress: () => { deleteRecipe(id); navigation.goBack() },
        },
      ]
    )
  }

  const badges = [
    { label: 'Durée',      value: recipe.duration },
    { label: 'Difficulté', value: recipe.difficulty },
    { label: 'Portions',   value: `${recipe.servings} pers.` },
    { label: 'Note',       value: `★ ${recipe.rating}` },
  ]

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* Carte principale */}
        <View style={[styles.card, { borderTopColor: recipe.color }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.title}>{recipe.title}</Text>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => navigation.push('Form', { id })}
              >
                <Text style={styles.editBtnText}>Modifier</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                <Text style={styles.deleteBtnText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Badges */}
          <View style={styles.badges}>
            {badges.map(({ label, value }) => (
              <View key={label} style={styles.badge}>
                <Text style={styles.badgeLabel}>{label}</Text>
                <Text style={styles.badgeValue}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderTopWidth: 6,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editBtnText: {
    fontWeight: '600',
    fontSize: 13,
    color: '#111827',
  },
  deleteBtn: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteBtnText: {
    fontWeight: '600',
    fontSize: 13,
    color: '#DC2626',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  badge: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  badgeLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  badgeValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
})
