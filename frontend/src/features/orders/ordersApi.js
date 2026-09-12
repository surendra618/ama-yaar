import api from '../../lib/axios';

// TODO: fill in the real orders endpoints
const ordersApi = {
  list: (params) => api.get('/orders', { params }).then((res) => res.data),
  getById: (id) => api.get(`/orders/${id}`).then((res) => res.data),
};

export default ordersApi;
