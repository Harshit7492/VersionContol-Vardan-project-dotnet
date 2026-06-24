// import axios from 'axios'

// const apiClient = axios.create({
//   baseURL: 'http://103.67.16.135:5000/',
//   withCredentials: true,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// })

// export default apiClient



import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://103.67.16.135:5000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error);

    if (error.response?.status === 401) {
      window.location.href = '/sign-in';
    }

    return Promise.reject(error);
  }
);

export default apiClient;