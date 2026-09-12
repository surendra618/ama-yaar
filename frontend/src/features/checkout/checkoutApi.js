import api from '../../lib/axios';

// TODO: fill in the real checkout endpoints
const checkoutApi = {
  list: (params) => api.get('/checkout', { params }).then((res) => res.data),
  getById: (id) => api.get(`/checkout/${id}`).then((res) => res.data),
};

export default checkoutApi;
