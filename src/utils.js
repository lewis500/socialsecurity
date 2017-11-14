// @flow
import moize from "moize";
export const translator = (x: number, y: number): string =>
  `translate(${x},${y})`;
let id = Math.random() + Math.random();
export const uniqueId = () => {
  id++;
  return "id-" + id.toString();
};
export const binder = moize((fn, ...args) => (...args2) =>
  fn(...args, ...args2)
);
