"use strict";

import { Watcher } from "./Dep";
import { getVMValue, setVMValue } from "./utils";

/**
 * 更新模板工具对象
 */
export const CompileUtils = {
  // 解析 {{msg}} 语法
  mustache(vm, template, node, expr, newValue) {
    const reg = /\{\{(.+?)\}\}/g;
    node.textContent = template.replace(reg, (_, exp) => {
      return exp === expr ? newValue : getVMValue(vm, exp);
    });
  },

  // v-text
  text(node, value) {
    node.textContent = typeof value == undefined ? "" : value;
  },

  // v-html
  html(node, value) {
    node.innerHTML = typeof value == undefined ? "" : value;
  },

  // v-model
  model(node, value) {
    node.value = typeof value == undefined ? "" : value;
  },
};

/**
 * 编译模板: 将所有的dom操作都放到 fragment 中(内存中)
 * 操作完之后在重新添加到 elementFragment
 */
export default class Compiler {
  constructor(vm) {
    this.vm = vm;
    this.$fragment = this.node2fragment(vm.$el);
    this.compileTemplate(this.$fragment);
    vm.$el.append(this.$fragment);
  }

  // 将 html -> 放到内存中变成 fragment
  // 在内存中操作完之后在append到 vm.$el 中
  node2fragment(el) {
    const fragment = document.createDocumentFragment();
    let firstChild;
    while ((firstChild = el.firstChild)) {
      fragment.append(firstChild);
    }
    return fragment;
  }

  // 编译模板
  compileTemplate(node) {
    Array.from(node.childNodes).forEach((item) => {
      if (this.vm.isElement(item)) {
        // 元素节点: 处理指令
        this.compileElement(item);
      } else {
        // 文本节点: 处理 {{}} 表达式
        this.compileText(item);
      }

      // 判断是否有子元素
      if (item.childNodes && item.childNodes.length) {
        this.compileTemplate(item);
      }
    });
  }

  // 编译文本节点: 添加 watcher, 观察{{msg}}语法的值
  compileText(node) {
    const reg = /\{\{(.+?)\}\}/g;
    // 保存模板字符串,下次数据更新的时候,使用模板去匹配
    const rawContent = node.textContent;
    node.textContent = node.textContent.replace(reg, (_, expr) => {
      const watcher = new Watcher(this.vm, expr, (newValue) => {
        CompileUtils["mustache"](this.vm, rawContent, node, expr, newValue);
      });
      return watcher.oldValue;
    });
  }

  // 判断属性名是否是一个指令 :是 v-bind 指令, @是 v-on 指令
  isDirective(attr) {
    return attr.startsWith("v-") || attr.startsWith("@") || attr.startsWith(":");
  }

  // 获取指令信息: 处理语法糖
  // :data-a @click => [on, on:click] [bind, bind:data-a]
  // [指令类型, 指令表达式]
  getDirective(dir) {
    if (dir.startsWith("@")) {
      return ["on", "on:" + dir.split("@").pop()];
    }
    if (dir.startsWith(":")) {
      return ["bind", "bind:" + dir.split(":").pop()];
    }
    if (dir.startsWith("v-")) {
      const directive = dir.split("-").pop();
      const type = directive.split(":").shift();
      return [type, directive];
    }
  }

  // 编译 HTML 元素节点: 处理指令表达式
  compileElement(node) {
    // 判断表达式是 指令还是 插值表达式
    for (let { name, value } of node.attributes) {
      if (this.isDirective(name)) {
        const [type, fullDir] = this.getDirective(name);
        this[type](node, value, fullDir);
        // node.removeAttribute(name);
      }
    }
  }

  // v-on:click=xxx @click=xxx => node.addEventListener(click, this.vm[xxx])
  on(node, expr, fullDir) {
    const event = fullDir.split(":").pop();
    const handler = this.vm[expr];
    if (typeof handler === "function") {
      node.addEventListener(event, handler.bind(this.vm));
    } else {
      throw new ReferenceError(`${expr} is not a function`);
    }
  }

  // v-bind
  bind(node, expr, fullDir) {
    // TODO: v-bind 处理
  }

  // v-html
  html(node, expr) {
    this.update("html", node, expr);
  }

  // v-text
  text(node, expr) {
    this.update("text", node, expr);
  }

  // v-model
  model(node, expr) {
    this.update("model", node, expr);
    node.addEventListener("input", (e) => {
      setVMValue(this.vm, expr, e.target.value);
    });
  }

  // 添加 watcher && 跟新视图
  update(type, node, expr) {
    // v-html/v-text
    const watcher = new Watcher(this.vm, expr, (newVal) => {
      CompileUtils[type](node, newVal, this.vm);
    });
    CompileUtils[type](node, watcher.oldValue, this.vm);
  }
}

