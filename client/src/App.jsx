import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Boutique from './components/Boutique.jsx';
import Accueil from './pages/Accueil.jsx';
import Produits from './pages/Produits.jsx';
import DetailProduit from './pages/DetailProduit.jsx';
import Introuvable from './pages/Introuvable.jsx';

import Tableau from './pages/admin/Tableau.jsx';
import AdminCommandes from './pages/admin/Commandes.jsx';
import AdminProduits from './pages/admin/Produits.jsx';
import AdminCategories from './pages/admin/Categories.jsx';
import FormulaireProduit from './pages/admin/FormulaireProduit.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Boutique />}>
          <Route path="/" element={<Accueil />} />
          <Route path="/produits" element={<Produits />} />
          <Route path="/produit/:slug" element={<DetailProduit />} />
          <Route path="*" element={<Introuvable />} />
        </Route>

        <Route path="/admin" element={<Tableau />}>
          <Route index element={<AdminCommandes />} />
          <Route path="produits" element={<AdminProduits />} />
          <Route path="produits/nouveau" element={<FormulaireProduit />} />
          <Route path="produits/:id" element={<FormulaireProduit />} />
          <Route path="categories" element={<AdminCategories />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
