export default [
  { dataField: "username", caption: "用户名", alignment: "center" },
  { dataField: "roles", caption: "角色", alignment: "center", cellTemplate: "role-cell" },
  { dataField: "phone", caption: "手机号", alignment: "center" },
  { dataField: "email", caption: "邮箱", alignment: "center" },
  { dataField: "status", caption: "状态", alignment: "center", cellTemplate: "status-cell" },
  { dataField: "createTime", caption: "创建时间", alignment: "center" },
  { dataField: "action", caption: "操作", alignment: "center", cellTemplate: "action-cell" }
]
