"use strict";

import Compiler from "./compiler";
import { observe } from "./reactive";

export default class Vue {
  constructor(options) {
    // 获得原始数据和 el元素节点
    this.$options = options || {};
    this.$data = options.data.call(this);
    this.$el = options.el;
    if (!this.isElement(this.$el)) {
      throw new TypeError("options.el must be a Element");
    }
    this.init();
  }

  // 判断参数是否是一个 Element 元素对象
  isElement(node) {
    return node && typeof node === "object" && node.nodeType === Node.ELEMENT_NODE;
  }

  // 初始化
  init() {
    // 第1步: 观察数据, 添加 getter && setter 收集依赖
    observe(this.$data);

    // 第3步: 将 methods 和 data 代理到vm实例上
    this.proxyData();
    this.proxyMethods(this.$options.methods || {});

    // 第4步: 编译模板
    // vue源码需要分析字符串, 但这个不是这节的重点,
    // 为了方便我就直接操作dom节点
    new Compiler(this);
  }

  // 将数据代理到 vm 实例上, 这样就可以直接 this.xxx 访问了
  proxyData() {
    Object.keys(this.$data).forEach((key) => {
      Object.defineProperty(this, key, {
        get() {
          return this.$data[key];
        },
        set(newValue) {
          this.$data[key] = newValue;
        },
      });
    });
  }

  // 将方法代理到 vm 实例上, 然后就可以直接 this.xxx()
  proxyMethods(methods) {
    Object.keys(methods).forEach((key) => {
      const handler = methods[key];
      if (typeof handler === "function") {
        Object.defineProperty(this, key, {
          value: handler.bind(this),
        });
      }
    });
  }
}
