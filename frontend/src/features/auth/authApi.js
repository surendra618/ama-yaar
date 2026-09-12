import api from '../../lib/axios';

// TODO: fill in the real auth endpoints
const authApi = {
  list: (params) => api.get('/auth', { params }).then((res) => res.data),
  getById: (id) => api.get(`/auth/${id}`).then((res) => res.data),
};

export default authApi;
