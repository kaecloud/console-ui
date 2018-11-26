import axios from 'axios';

// axios请求带上cookie
axios.defaults.withCredentials = true;

const Fetch = {

  wrap(statusCode, data, flash='') {
    return { statusCode, data, flash };
  },

  get(url) {
    return axios.get(url).then(res => {
      this.wrap(200, res.data);
    }).catch(err => {
      return Promise.reject(this.wrap(code, `Server got hacked, ${err}`));
    });
  },

  post(url, data) {
    return axios({
      method: 'post',
      url: url,
      data: data,
      headers: {
			  'Content-Type': 'application/json'
      },
      transformResponse: [function (data) {
        return data;
      }],
    }).then(res => {
      this.wrap(200, res.data);
    }).catch(err => {
      let res = err.response;
      return Promise.reject(this.wrap(res.status, res.data));
    });
  },

  put(url, data) {
    return axios({
      method: 'put',
      url: url,
      data: data,
      headers: {
			  'Content-Type': 'application/json'
      },
      transformResponse: [function (data) {
        return data;
      }],
    }).then(res => {
      this.wrap(200, res.data);
    }).catch(err => {
      return Promise.reject(this.wrap(code, `Server got hacked, ${err}`));
    });
  },

  delete(url, data) {
    return axios({
      method: 'delete',
      url: url,
      data: data,
      headers: {
			  'Content-Type': 'application/json'
      },
      transformResponse: [function (data) {
        return data;
      }],
    }).then(res => {
      this.wrap(res.data);
    }).catch(err => {
      return Promise.reject(this.wrap(code, `Server got hacked, ${err}`));
    });
  },
};

export default Fetch;
