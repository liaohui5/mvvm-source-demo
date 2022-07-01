## 模仿 Vue 实现一个简单的 MVVM 类

1. 和 Vue 源码不同的是, 这个 MVVM 不是直接分析字符串, 而是直接去遍历操作 DOM 对象

2. 实现这些功能只是为了深刻的理解 Vue 响应式原理 `Object.defineProperry + 发布订阅` 实现数据驱动视图

## 完成功能

- [x] v-html
- [x] v-text
- [x] {{msg}} 插值表达式语法
- [x] v-model
- [x] 绑定事件 v-bind:click/@click 两种语法都可以
- [ ] computed

## 原理 & 参考

这个仓库的代码给了我很多灵感 https://github.com/DMQ/mvvm

![source](https://raw.githubusercontent.com/DMQ/mvvm/master/img/2.png)

## 目录结构

```
├── README.md
├── index.html               # 引入 index.js/提供模板
├── index.js                 # 引入 mvvm/index.js 使用其API
├── package-lock.json
├── package.json
└── vue
    ├── Dep.js               # 发布订阅, 管理依赖
    ├── compiler.js          # 编译模板
    ├── index.js             # 核心控制类
    ├── reactive.js          # 定义响应式数据
    └── utils.js             # 工具函数
```

## 测试

1. 环境准备

```sh
git clone https://github.com/liaohui5/mvvm-source-demo
cd mvvm-source-demo
npm i
npm run dev
```

2. 打开浏览器测试

```
http://localhost:9988
```
