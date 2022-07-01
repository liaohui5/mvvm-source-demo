"use strict";
import { isObject } from "./utils";
import { Dep } from "./Dep";

/**
 * 处理响应式数据
 */
class Observer {
  constructor(raw) {
    if (Array.isArray(raw)) {
      // 观察数组中的每一项
      this.observeArray(proxyArrayMethods(raw));
    } else {
      this.walk(raw);
    }
  }

  walk(raw) {
    Object.keys(raw).forEach((key) => {
      this.defineReactive(raw, key, raw[key]);
    });
  }

  // 观察数组
  observeArray(arr) {
    for (const item of arr) {
      observe(item);
    }
  }

  // 定义响应式数据
  defineReactive(obj, key, val) {
    // 第2步: 利用 Object.defineProperty 给数据添加 getter && setter
    // 获取值的时候收集依赖: dep.addWatcher(Dep.target)
    // 设置值的时候触发依赖对象的更新: dep.notify
    // 在编译模板的时候回获取值, 也就是说会添加 watcher
    // 在模板编译之后, 再修改值就会触发 dep.notify, 也就是说
    // 添加的 watcher 的 update 方法会执行

    observe(val);
    const dep = new Dep();
    Object.defineProperty(obj, key, {
      // 可枚举但是不可再次 define
      configurable: false,
      enumerable: true,
      get() {
        console.info("### getter:", val);
        // 获取值得是否添加 watcher
        Dep.target && dep.addWatcher(Dep.target);
        return val;
      },
      set(newValue) {
        console.info("### setter:", newValue);
        if (val === newValue) return;
        val = newValue;

        // 如果赋的值还是一个对象就继续观察
        observe(val);

        // 通知watcher 数据更新了
        dep.notify();
      },
    });
  }
}

// 代理数组方法: 因为这些方法会改变原数组,
// 而且无法被 Object.defineProperty 监听到
function proxyArrayMethods(arr) {
  const methods = ["pop", "push", "shift", "unshift", "splice", "sort", "reverse"];
  const arrayProto = Array.prototype;
  const middleman = Object.create(arrayProto);

  for (const m of methods) {
    const original = arrayProto[m];
    middleman[m] = function proxyMethod(...args) {
      // 执行原来的数组方法
      const result = original.apply(this, args);

      // 如果调用的新增元素的方法, 需要获取新增的值, 然后观察它
      // 让新增的这个元素也具备响应式的功能
      let insertedElements;
      switch (m) {
        case "push":
        case "unshift":
          insertedElements = args;
          break;
        case "splice":
          insertedElements = args.slice(2);
          break;
      }
      insertedElements && observe(insertedElements);
      return result;
    };
  }

  // 给数组设置原型
  Object.setPrototypeOf(arr, middleman);
  return arr;
}

/**
 * 观察数据
 */
export function observe(raw) {
  if (!isObject(raw)) {
    return;
  }
  return new Observer(raw);
}
