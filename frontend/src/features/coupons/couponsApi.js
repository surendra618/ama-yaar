import api from '../../lib/axios';

// TODO: fill in the real coupons endpoints
const couponsApi = {
  list: (params) => api.get('/coupons', { params }).then((res) => res.data),
  getById: (id) => api.get(`/coupons/${id}`).then((res) => res.data),
};

export default couponsApi;
