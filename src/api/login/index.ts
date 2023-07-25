import { request } from "@/utils/service"
import type * as Login from "./types/login"

/** 获取登录验证码 */
export function getLoginCodeApi() {
  return request<Login.LoginCodeResponseData>({
    url: "login/code",
    method: "get"
  })
}

/** 登录并返回 Token */
export function loginApi(data: Login.LoginRequestData) {
  return request<Login.LoginResponseData>({
    url: "users/login",
    method: "post",
    data
  })
  // return {
  //   coede: 0,
  //   data: { token: "xxx" },
  //   message: "登录成功"
  // }
}

/** 获取用户详情 */
export function getUserInfoApi() {
  return request<Login.UserInfoResponseData>({
    url: "users/info",
    method: "get"
  })
  // return {
  //   code: 0,
  //   data: {
  //     username: "xxx",
  //     roles: []
  //   },
  //   message: "获取用户详情成功"
  // }
}
