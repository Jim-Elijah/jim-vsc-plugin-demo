import axios, { Method, AxiosRequestConfig } from "axios";
import { logger } from "./helper";
import { baseURL } from "./config";
import { ResponseData } from "../types/response";
import { isWin } from "./env";

axios.defaults.baseURL = baseURL;
axios.interceptors.request.use(
    config => {
        console.log("请求拦截：", config);
        return config;
    },
    error => {
        return Promise.reject(error);
    },
);

axios.interceptors.response.use(
    response => {
        console.log("响应拦截：", response);
        return response.data;
    },
    error => {
        console.log("网络错误");
        if (error.response) {
            console.log(error.response);
            if (error.response.status === 401) {
                console.log("401 无权限");
                return Promise.reject(error);
            }
            if (error.response.data) {
                console.log("网络错误1", error.response.data);
            }
            console.log("网络错误2", error.response.data);
        } else {
            return Promise.reject(error);
        }
    },
);

export default async function request<T>(method: Method, url: string, params: any): Promise<T> {
    const config: AxiosRequestConfig = {
        url,
        method,
    };
    const withData = ["POST", "PUT", "PATCH"];
    if (withData.includes(method.toUpperCase())) {
        config.data = params;
    } else {
        config.params = params;
    }

    return axios<ResponseData<T>>(config)
        .then(res => {
            logger(`${method} ${url} succeed with `, res);
            return res.data;
        })
        .catch(err => {
            logger(`${method} ${url} fail with `, err, "#f00");
            return err;
        });
}
