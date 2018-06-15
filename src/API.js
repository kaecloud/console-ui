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
    return axios.get(`${testUrl}${version}/app/${params}/deployment`, {
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

// 获取用户ID
export const getUserId = params => {
    return axios.get(`${testUrl}/user/me`, {
        params: params
    }).then(res => res.data)
    .catch(err => console.log(err))
}

// 获取副本
export const getPods = params => {
    return axios.get(`${testUrl}${version}/app/${params}/pods`, {
        params: params
    }).then(res => res.data)
    .catch(err => console.log(err))
}

// app_build
export const appBuild = params => {
    return axios({
        method: 'put',
        url: `${testUrl}${version}/app/${params.name}/build`,
        data: {
            'tag': params.tag,
        },
        headers: {
			'Content-Type': 'application/json'
        },
        transformResponse: [function (data) {
            return data;
        }],
    }).then(res => res.data)
}

// app_deploy
export const appDeploy = params => {
    return axios({
        method: 'put',
        url: `${testUrl}${version}/app/${params.name}/deploy`,
        data: {
            'tag': params.tag,
        },
        headers: {
			'Content-Type': 'application/json'
        },
        transformResponse: [function (data) {
            return data;
        }],
    }).then(res => res.data)
}

// app_scale
export const appScale = params => {
    return axios({
        method: 'put',
        url: `${testUrl}${version}/app/${params.name}/scale`,
        data: {
            'replicas': params.replicas,
        },
        headers: {
			'Content-Type': 'application/json'
        },
        transformResponse: [function (data) {
            return data;
        }],
    }).then(res => res.data)
}

// app_renew
export const appRenew = params => {
    return axios({
        method: 'put',
        url: `${testUrl}${version}/app/${params.name}/renew`,
        headers: {
			'Content-Type': 'application/json'
        },
        transformResponse: [function (data) {
            return data;
        }],
    }).then(res => res.data)
}

// app_rollback
export const appRollback = params => {
    return axios({
        method: 'put',
        url: `${testUrl}${version}/app/${params.name}/rollback`,
        headers: {
			'Content-Type': 'application/json'
        },
        transformResponse: [function (data) {
            return data;
        }],
    }).then(res => res.data)
}

// 获取job列表
export const jobList = params => {
    return axios.get(`${testUrl}${version}/job`, {
        params: params
    }).then(res => res.data)
}

// create_job
export const createJob = params => {
    return axios({
        method: 'post',
        url: `${testUrl}${version}/job`,
        data: params,
        headers: {
			'Content-Type': 'application/json'
        },
        transformResponse: [function (data) {
            return data;
        }],
    }).then(res => res.data)
}

// job_restart
export const restartJob = params => {
    return axios({
        method: 'put',
        url: `${testUrl}${version}/job/${params.name}/restart`,
        headers: {
			'Content-Type': 'application/json'
        },
        transformResponse: [function (data) {
            return data;
        }],
    }).then(res => res.data)
}

// job_delete
export const deleteJob = params => {
    return axios.delete(`${testUrl}${version}/job/${params.name}`).then(res => res.data)
}


