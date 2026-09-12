import api from '../../lib/axios';

// TODO: fill in the real reviews endpoints
const reviewsApi = {
  list: (params) => api.get('/reviews', { params }).then((res) => res.data),
  getById: (id) => api.get(`/reviews/${id}`).then((res) => res.data),
};

export default reviewsApi;
