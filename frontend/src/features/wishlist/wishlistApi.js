import api from '../../lib/axios';

// TODO: fill in the real wishlist endpoints
const wishlistApi = {
  list: (params) => api.get('/wishlist', { params }).then((res) => res.data),
  getById: (id) => api.get(`/wishlist/${id}`).then((res) => res.data),
};

export default wishlistApi;
