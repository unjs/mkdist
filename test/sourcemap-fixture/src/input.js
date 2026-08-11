export const load = () => import("./input").then((module) => module.answer);
export const answer = 42;
export default answer;
export const requireText = 'require("./input")';
