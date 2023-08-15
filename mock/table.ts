import type { MockMethod } from "vite-plugin-mock"
import Mock from "mockjs"
export default [
  {
    url: "/api/v1/table",
    method: "post",
    response: () => {
      return {
        code: 0,
        data: {},
        message: "新增成功"
      }
    }
  },
  {
    url: "/api/v1/table/:id",
    method: "delete",
    response: () => {
      return {
        code: 0,
        data: {},
        message: "删除成功 "
      }
    }
  },
  {
    url: "/api/v1/table",
    method: "put",
    response: () => {
      return {
        code: 0,
        data: {},
        message: "修改成功"
      }
    }
  },
  {
    url: "/api/v1/table",
    method: "get",
    timeout: 200,
    response: ({ query, headers }) => {
      return {
        code: () => {
          return ["Bearer token-admin", "Bearer token-editor"].includes(headers.authorization) ? 0 : 401
        },
        data: {
          total: 100,
          list: () => {
            const res: any[] = []
            const username = query.username
            const phone = query.phone

            if (username || phone) {
              res.push(
                Mock.mock({
                  id: "@id",
                  username: username ? username : "@name",
                  phone: phone ? phone : /^1[3-9]\d{9}$/,
                  email: "@email",
                  "roles|1": ["admin", "editor"],
                  status: "@boolean",
                  createTime: "@datetime"
                })
              )
            } else {
              const length = Math.min(query.size, 100)
              for (let i = 0; i < length; i++) {
                res.push(
                  Mock.mock({
                    id: "@id",
                    username: "@name",
                    phone: /^1[3-9]\d{9}$/,
                    email: "@email",
                    "roles|1": ["admin", "editor"],
                    status: "@boolean",
                    createTime: "@datetime"
                  })
                )
              }
            }
            return res
          }
        },
        message: ["Bearer token-admin", "Bearer token-editor"].includes(headers.authorization)
          ? "获取表格数据成功"
          : "无效 Token"
      }
    }
  }
] as MockMethod[]
