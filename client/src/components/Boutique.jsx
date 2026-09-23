import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import { api } from '../api.js';

export default function Boutique() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.categories().then(setCategories).catch(() => setCategories([]));
  }, []);

  return (
    <>
      <Navbar categories={categories} />
      <main>
        <Outlet context={{ categories }} />
      </main>
      <Footer />
    </>
  );
}
