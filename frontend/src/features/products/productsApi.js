import api from '../../lib/axios';

// TODO: fill in the real products endpoints
const productsApi = {
  list: (params) => api.get('/products', { params }).then((res) => res.data),
  getById: (id) => api.get(`/products/${id}`).then((res) => res.data),
};

export default productsApi;
