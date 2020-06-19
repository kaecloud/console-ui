import axios from 'axios';

// axios请求带上cookie
axios.defaults.withCredentials = true;
// timeout 90s
axios.defaults.timeout = 90000;


export const Fetch = {
  accessToken: null,

  wrap(statusCode, data, flash='') {
    return { statusCode, data, flash };
  },

  handleError(error) {
    let dummycode = 1111;
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      let res = error.response;
      return Promise.reject(this.wrap(res.status, res.data));
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      console.error(error.request);
      let dd = {
        error: "doesn't get reseponse"
      };
      return Promise.reject(this.wrap(dummycode, dd));
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error', error.message);
      let dd = {
        error: "error when setup request"
      };
      return Promise.reject(this.wrap(dummycode, dd));
    }
  },

  getHeaders() {
    var headers = {
			'Content-Type': 'application/json',
    };
    if (this.accessToken) {
      headers['Authorization'] = 'Bearer ' + this.accessToken;
    }
    return headers;
  },

  get(url) {
    const headers = this.getHeaders();
    console.debug("+++++++++", url, headers);

    return axios.get(url, {headers: headers}).then(res => {
      return this.wrap(200, res.data);
    }).catch(err => {
      return this.handleError(err);
    });
  },

  post(url, data) {
    const headers = this.getHeaders();

    return axios({
      method: 'post',
      url: url,
      data: data,
      headers: headers,
      transformResponse: [function (data) {
        return data;
      }],
    }).then(res => {
      return this.wrap(200, res.data);
    }).catch(err => {
      return this.handleError(err);
    });
  },

  put(url, data) {
    const headers = this.getHeaders();

    return axios({
      method: 'put',
      url: url,
      data: data,
      headers: headers,
      transformResponse: [function (data) {
        return data;
      }],
    }).then(res => {
      return this.wrap(200, res.data);
    }).catch(err => {
      return this.handleError(err);
    });
  },

  delete(url, data) {
    const headers = this.getHeaders();

    return axios({
      method: 'delete',
      url: url,
      data: data,
      headers: headers,
      transformResponse: [function (data) {
        return data;
      }],
    }).then(res => {
      return this.wrap(200, res.data);
    }).catch(err => {
      return this.handleError(err);
    });
  },
};

export function apiCallback(statusCode, data, defaultErrMsg) {
  if (statusCode === 200 && data) {
    return Fetch.wrap(statusCode, data);
  }
  const rej = Fetch.wrap(statusCode, data.msg || defaultErrMsg);
  return Promise.reject(rej);
}

export function setAccessToken(token) {
  Fetch.accessToken = token;
}

export function getAccessToken() {
  return Fetch.accessToken;
}
