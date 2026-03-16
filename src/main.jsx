import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { FavoritesProvider } from './context/FavoritesContext'
import { RecipesProvider } from './context/RecipesContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <RecipesProvider>
        <FavoritesProvider>
          <App />
        </FavoritesProvider>
      </RecipesProvider>
    </BrowserRouter>
  </StrictMode>,
)
