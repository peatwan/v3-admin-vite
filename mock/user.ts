import type { MockMethod } from "vite-plugin-mock"
export default [
  {
    url: "/api/getRoleById",
    method: "get",
    response: ({ query }) => {
      console.log("id>>>>>>>>", query.id)
      return {
        code: 0,
        message: "ok",
        data: {
          roleName: "admin",
          roleValue: "admin"
        }
      }
    }
  },
  {
    url: "/api/testRestful/:id",
    method: "get",
    response: ({ query }) => {
      console.log("id>>>>>>>>", query.id)
      return {
        code: 0,
        message: "ok",
        data: {
          roleName: "admin",
          roleValue: "admin"
        }
      }
    }
  },
  {
    url: "/api/v1/login/code",
    method: "get",
    response: () => {
      return {
        code: 0,
        data: "http://dummyimage.com/100x40/dcdfe6/000000.png&text=V3Admin",
        message: "获取验证码成功"
      }
    }
  },
  {
    url: "/api/v1/users/login",
    method: "post",
    response: () => {
      return { data: { token: "token-admin" }, code: 0, message: "登录成功" }
    }
  },
  {
    url: "/api/v1/users/info",
    method: "get",
    response: () => {
      return { data: { username: "admin1", roles: ["admin"] }, code: 0, message: "获取用户详情成功" }
    }
  }
] as MockMethod[]
