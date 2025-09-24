import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const accidentService = {
  getAll: (page = 1, limit = 10, searchName = '') => {
    const params = { page, limit };
    if (searchName.trim()) {
      params.search_name = searchName.trim();
    }
    
    return apiClient.get('/api/accidents', { params })
      .then(response => {
        return response;
      })
      .catch(error => {
        const errorMessage = error.response?.data?.error || 'Fehler beim Laden der Unfälle';
        throw new Error(errorMessage);
      });
  },
  
  create: (accidentData) => {
    return apiClient.post('/api/accidents', accidentData)
      .then(response => {
        return response;
      })
      .catch(error => {
        const errorMessage = error.response?.data?.error || 'Fehler beim Speichern';
        throw new Error(errorMessage);
      });
  },
  
  delete: (id) => {
    return apiClient.delete(`/api/accidents/${id}`)
      .then(response => {
        return response;
      })
      .catch(error => {
        const errorMessage = error.response?.data?.error || 'Fehler beim Löschen';
        throw new Error(errorMessage);
      });
  }
};

export default apiClient;