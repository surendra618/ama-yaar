import api from '../../lib/axios';

// TODO: fill in the real productDetails endpoints
const productDetailsApi = {
  list: (params) => api.get('/productDetails', { params }).then((res) => res.data),
  getById: (id) => api.get(`/productDetails/${id}`).then((res) => res.data),
};

export default productDetailsApi;
