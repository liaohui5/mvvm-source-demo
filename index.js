"use strict";
import Vue from "./vue";

const vm = new Vue({
  el: document.querySelector("#app"),
  data: () => ({
    msg: "",
    name: "tom",
    time: {
      year: 2022,
      month: 12,
      date: 22,
    },
    items: [
      {
        id: 101,
        title: "文章标题101",
      },
      {
        id: 102,
        title: "文章标题102",
      },
    ],
  }),
  methods: {
    changeData() {
      this.msg = Math.random();
      this.time.year += 1;
      this.time.month += 1;
      this.time.date += 1;
      this.items.push({
        id: 103,
        title: "文章标题103",
      });
    },
  },
});
