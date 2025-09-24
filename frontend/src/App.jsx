import React from 'react';
import AdminDashboard from './components/AdminDashboard';
import './styles/global.css';

const AdminApp = () => {
  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <div className="app-header__content">
            <div>
              <h1 className="app-header__title">Admin - Digitales Verbandbuch</h1>
              <p className="app-header__subtitle">Gesundheitsamt Frankfurt am Main - Verwaltung</p>
            </div>
          </div>
        </div>
      </header>

      <main style={{ minHeight: 'calc(100vh - 80px)', paddingTop: '2rem', paddingBottom: '2rem' }}>
        <AdminDashboard />
      </main>
    </div>
  );
};

export default AdminApp;