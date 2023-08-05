import type { MockMethod } from "vite-plugin-mock"
export default [
  {
    url: "/api/v1/users/login",
    method: "post",
    response: ({ body }) => {
      return {
        code: () => {
          return ["admin", "editor"].includes(body.username) ? 0 : 1
        },
        data: {
          token: () => {
            return ["admin", "editor"].includes(body.username) ? "token-" + body.username : ""
          },
          message: () => {
            return ["admin", "editor"].includes(body.username) ? "登录成功" : "账号不存在"
          }
        }
      }
    }
  },
  {
    url: "/api/v1/users/info",
    method: "get",
    response: ({ headers }) => {
      return {
        code: () => {
          return ["Bearer token-admin", "Bearer token-editor"].includes(headers.authorization) ? 0 : 401
        },
        data: {
          username: () => {
            return headers.authorization.split("-")[1]
          },
          roles: () => {
            return [headers.authorization.split("-")[1]]
          }
        },
        message: ["Bearer token-admin", "Bearer token-editor"].includes(headers.authorization)
          ? "获取用户详情成功"
          : "无效 Token"
      }
    }
  }
] as MockMethod[]
