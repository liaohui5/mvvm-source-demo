"use strict";

/**
 * 判断数据是否是对象
 */
export function isObject(val) {
  return val !== null && typeof val === "object";
}

/**
 * 根据表达式获取值, vm: Vue 类的实例, exp: time.date 这种字符串
 */
export function getVMValue(vm, exp) {
  return exp
    .trim()
    .split(".")
    .reduce((prev, k) => prev[k], vm.$data);
}

/**
 * 根据表达式设置值 user.info.id = 1 -> vm.$data.info.id = 1
 */
export function setVMValue(vm, expr, val) {
  const keys = expr.trim().split(".");
  const key = keys.pop();
  if (keys.length === 0) {
    vm[key] = val;
  } else {
    const value = keys.reduce((prev, key) => prev[key], vm.$data);
    value[key] = val;
  }
}
