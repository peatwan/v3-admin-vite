module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // type 类型定义，表示 git 提交的 type 必须在以下类型范围内
    "type-enum": [
      2,
      "always",
      [
        "feat", // 增加新的业务功能
        "fix", //  修复业务问题/BUG
        "perf", // 优化性能
        "style", // 更改代码风格, 不影响运行结果
        "refactor", // 重构代码
        "revert", // 撤销更改
        "test", // 增加测试
        "docs", // 文档变更
        "chore", // 更新依赖/修改脚手架配置等琐事
        "workflow", // 工作流改进
        "ci", // 持续集成相关
        "types", // 类型定义文件更改
        "wip" // 开发中
      ]
    ],
    // subject 大小写不做校验
    "subject-case": [0]
  }
}
