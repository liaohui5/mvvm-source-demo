import { getVMValue } from "./utils";

// 发布者
export class Dep {
  constructor() {
    this.watchers = [];
  }
  addWatcher(watcher) {
    this.watchers.push(watcher);
  }
  notify() {
    this.watchers.forEach((watcher) => watcher.update());
  }
}

// 订阅者
export class Watcher {
  constructor(vm, expr, updateCallback) {
    this.vm = vm;
    this.expr = expr;
    this.updateCallback = updateCallback;
    this.oldValue = this.getOldValue();
  }
  getOldValue() {
    Dep.target = this;
    const oldValue = getVMValue(this.vm, this.expr);
    Dep.target = null;
    return oldValue;
  }
  update() {
    const val = getVMValue(this.vm, this.expr);
    val !== this.oldValue && this.updateCallback(val, this.oldValue);
  }
}
