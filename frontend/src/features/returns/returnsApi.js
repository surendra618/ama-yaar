import api from '../../lib/axios';

// TODO: fill in the real returns endpoints
const returnsApi = {
  list: (params) => api.get('/returns', { params }).then((res) => res.data),
  getById: (id) => api.get(`/returns/${id}`).then((res) => res.data),
};

export default returnsApi;
