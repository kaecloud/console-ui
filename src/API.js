import axios from 'axios';

// axios请求带上cookie
axios.defaults.withCredentials = true;


// 测试地址
const testUrl = process.env.NODE_ENV === 'production' ? '' : 'http://192.168.1.17:5000'

// api 版本
const version = '/api/v1'

// 获取app列表
export const appList = params => {
    return axios.get(`${testUrl}${version}/app`, {
        params: params
    }).then(res => res.data)
    
}

// 获取detail
export const getDetail = params => {
    return axios.get(`${testUrl}${version}/app/${params}`, {
        params: params
    }).then(res => res.data)
    .catch(err => console.log(err))
}

// 获取releases
export const getReleases = params => {
    return axios.get(`${testUrl}${version}/app/${params}/releases`, {
        params: params
    }).then(res => res.data)
    .catch(err => console.log(err))
}

// 获取日志
export const getLogger = params => {
    return axios.get(`${testUrl}${version}/app/${params}/oplogs`, {
        params: params
    }).then(res => res.data)
    .catch(err => console.log(err))
}

