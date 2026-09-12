import api from '../../lib/axios';

// TODO: fill in the real cart endpoints
const cartApi = {
  list: (params) => api.get('/cart', { params }).then((res) => res.data),
  getById: (id) => api.get(`/cart/${id}`).then((res) => res.data),
};

export default cartApi;
