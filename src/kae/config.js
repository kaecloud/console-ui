export const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';
export const baseApiUrl = `${baseUrl}/api/v1`;
export const baseLoginUrl = `${baseUrl}/user/login`;


let prodSchema = "ws:";
if (window.location.protocol === "https:") {
  prodSchema = "wss:";
}
export const baseWsUrl = process.env.NODE_ENV === 'production' ? prodSchema + '//'+window.location.host : 'ws://localhost:5000';
