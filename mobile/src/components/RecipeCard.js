import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

// TouchableOpacity = équivalent du onClick sur mobile (gère le retour visuel au tap)
export default function RecipeCard({ recipe, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card} activeOpacity={0.85}>
      {/* La barre de couleur en haut de la carte — borderTopColor dynamique */}
      <View style={[styles.colorBar, { backgroundColor: recipe.color }]} />

      <View style={styles.content}>
        <Text style={styles.title}>{recipe.title}</Text>
        <Text style={styles.meta}>
          {recipe.category} · {recipe.duration} · ★ {recipe.rating}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

// StyleSheet.create — équivalent du CSS, mais en objet JS
// Les propriétés sont en camelCase : font-size → fontSize, border-radius → borderRadius
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    // Ombre — sur iOS et Android, syntaxe différente
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3, // Android uniquement
    overflow: 'hidden',
  },
  colorBar: {
    height: 4,
  },
  content: {
    padding: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    color: '#6b7280',
  },
})
