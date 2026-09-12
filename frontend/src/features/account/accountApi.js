import api from '../../lib/axios';

// TODO: fill in the real account endpoints
const accountApi = {
  list: (params) => api.get('/account', { params }).then((res) => res.data),
  getById: (id) => api.get(`/account/${id}`).then((res) => res.data),
};

export default accountApi;
