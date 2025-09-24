import React, { useState } from 'react';
import { useAccidents, useDeleteAccident } from '../hooks/accidents.query';

const AdminDashboard = () => {
  const [searchName, setSearchName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('unfall_datum');
  const [sortDirection, setSortDirection] = useState('desc');

  // React Query statt useState/useEffect
  const { data, isLoading, isError, error } = useAccidents(currentPage, searchName);
  const deleteAccidentMutation = useDeleteAccident();

  const accidents = data?.accidents || [];
  const loading = isLoading;

  const handleSearchChange = (e) => {
    setSearchName(e.target.value);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  const formatTime = (timeString) => {
    return timeString ? timeString.slice(0, 5) : '';
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Unfall von ${name} wirklich löschen?`)) {
      return;
    }
    try {
      await deleteAccidentMutation.mutateAsync(id);
    } catch (err) {
      // Wird durch die Mutation gehandelt
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedAccidents = [...accidents].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (sortField === 'unfall_datum') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="dashboard-container">
      <div className="card">
        <div className="card__header card__header--center">
          <h1 className="card__title card__title--center">Verbandbuch-Einträge</h1>
          <p className="card__description">Übersicht aller gemeldeten Unfälle</p>
        </div>

        <div className="table-controls" style={{ marginBottom: '1.5rem' }}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              value={searchName}
              onChange={handleSearchChange}
              className="form-input"
              placeholder="Nach Name suchen..."
              style={{ maxWidth: '300px' }}
            />
          </div>
        </div>

        {isError && (
          <div className="alert alert--error">
            {error.message}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center" style={{ padding: '3rem' }}>
            <span className="spinner"></span>
            <span style={{ marginLeft: '1rem' }}>Lade Unfälle...</span>
          </div>
        ) : accidents.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Keine Unfälle gefunden.</p>
          </div>
        ) : (
          <>
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('name_verletzte_person')}>
                      Name {getSortIcon('name_verletzte_person')}
                    </th>
                    <th onClick={() => handleSort('unfall_datum')}>
                      Unfall-Datum {getSortIcon('unfall_datum')}
                    </th>
                    <th>Unfall-Zeit</th>
                    <th onClick={() => handleSort('ort')}>
                      Ort {getSortIcon('ort')}
                    </th>
                    <th>Hergang</th>
                    <th>Verletzung</th>
                    <th>Zeugen</th>
                    <th>Erste Hilfe</th>
                    <th>Ersthelfer</th>
                    <th className="col-actions">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAccidents.map((accident, index) => (
                    <tr 
                      key={accident.id} 
                      className={index % 2 === 0 ? 'row-even' : 'row-odd'}
                    >
                      <td>{accident.name_verletzte_person}</td>
                      <td>{formatDate(accident.unfall_datum)}</td>
                      <td>{formatTime(accident.unfall_uhrzeit)}</td>
                      <td>{accident.ort}</td>
                      <td>{accident.hergang}</td>
                      <td>{accident.art_der_verletzung}</td>
                      <td>{accident.zeugen}</td>
                      <td>
                        <div style={{ marginBottom: '0.25rem' }}>
                          <strong>{formatDate(accident.erstehilfe_datum)}</strong> {formatTime(accident.erstehilfe_uhrzeit)}
                        </div>
                        <div style={{ fontSize: '0.95rem', color: 'var(--gray-dark)' }}>
                          {accident.erstehilfe_massnahmen}
                        </div>
                      </td>
                      <td>{accident.ersthelfer_name}</td>
                      <td className="cell-sticky-right">
                        <button
                          onClick={() => handleDelete(accident.id, accident.name_verletzte_person)}
                          className="btn btn--secondary btn--small"
                          style={{
                            color: 'var(--error-color)',
                            border: '1px solid var(--error-color)',
                            fontSize: '0.7rem',
                            padding: '0.2rem 0.4rem'
                          }}
                          disabled={deleteAccidentMutation.isLoading}
                        >
                          {deleteAccidentMutation.isLoading && 
                           deleteAccidentMutation.variables === accident.id ? 
                            'Löscht...' : 'Löschen'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '2rem',
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '0.5rem'
            }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--gray-dark)' }}>
                {accidents.length} {accidents.length === 1 ? 'Unfall' : 'Unfälle'} gefunden
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage <= 1}
                  className="btn btn--secondary btn--small"
                  style={{ opacity: currentPage <= 1 ? 0.5 : 1 }}
                >
                  ← Zurück
                </button>
                <span style={{ padding: '0 1rem', fontSize: '0.875rem', color: 'var(--gray-dark)' }}>
                  Seite {currentPage}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={accidents.length < 10}
                  className="btn btn--secondary btn--small"
                  style={{ opacity: accidents.length < 10 ? 0.5 : 1 }}
                >
                  Weiter →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;