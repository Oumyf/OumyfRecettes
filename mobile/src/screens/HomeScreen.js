import { useState, useMemo, useCallback } from 'react'
import {
  View, Text, TextInput, FlatList,
  TouchableOpacity, ScrollView, StyleSheet, SafeAreaView,
} from 'react-native'
import { useRecipes } from '../context/RecipesContext'
import { CATEGORIES } from '../data/recipes'
import RecipeCard from '../components/RecipeCard'

export default function HomeScreen({ navigation }) {
  const { recipes } = useRecipes()
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Tout')

  // useMemo fonctionne exactement comme sur le web
  const filteredRecipes = useMemo(() => {
    return recipes
      .filter(r => selectedCategory === 'Tout' || r.category === selectedCategory)
      .filter(r => r.title.toLowerCase().includes(searchText.toLowerCase()))
  }, [recipes, selectedCategory, searchText])

  const handlePress = useCallback((recipe) => {
    // navigation.navigate = équivalent de <Link to="/recette/:id">
    navigation.navigate('Detail', { id: recipe.id })
  }, [navigation])

  return (
    // SafeAreaView = évite que le contenu passe sous la barre de statut iOS
    <SafeAreaView style={styles.safe}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>OumyfRecettes</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('Form', {})}
        >
          <Text style={styles.addButtonText}>+ Nouveau</Text>
        </TouchableOpacity>
      </View>

      {/* TextInput = équivalent de <input type="text"> */}
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher une recette..."
        placeholderTextColor="#9ca3af"
        value={searchText}
        onChangeText={setSearchText}  // pas de e.target.value — la valeur est passée directement
      />

      {/* ScrollView horizontal pour les catégories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categories}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            style={[
              styles.categoryBtn,
              selectedCategory === cat && styles.categoryBtnActive,
            ]}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === cat && styles.categoryTextActive,
            ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* FlatList = équivalent de .map() — optimisé pour les longues listes (virtualisé) */}
      <FlatList
        data={filteredRecipes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <RecipeCard recipe={item} onPress={() => handlePress(item)} />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Aucune recette trouvée.</Text>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',              // équivalent de display:flex + flex-direction:row
    justifyContent: 'space-between',   // space-between
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#f97316',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  searchInput: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
  },
  categoriesScroll: {
    flexGrow: 0,
    height: 48,
  },
  categories: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 4,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  categoryBtnActive: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },
  categoryText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  empty: {
    textAlign: 'center',
    color: '#9ca3af',
    marginTop: 40,
    fontSize: 15,
  },
})
