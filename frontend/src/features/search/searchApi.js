import api from '../../lib/axios';

// TODO: fill in the real search endpoints
const searchApi = {
  list: (params) => api.get('/search', { params }).then((res) => res.data),
  getById: (id) => api.get(`/search/${id}`).then((res) => res.data),
};

export default searchApi;
