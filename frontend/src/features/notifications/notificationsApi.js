import api from '../../lib/axios';

// TODO: fill in the real notifications endpoints
const notificationsApi = {
  list: (params) => api.get('/notifications', { params }).then((res) => res.data),
  getById: (id) => api.get(`/notifications/${id}`).then((res) => res.data),
};

export default notificationsApi;
