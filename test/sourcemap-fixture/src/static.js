import { answer } from "./input";
import { native } from "./native-esm";
export const value = answer + Number(native);
export const important = 'from "./input"';
export const loadWithOptions = () =>
  import(/* chunk */ "./input" /* @vite-ignore */, {
    with: { type: "json" },
  });
export const loadPart = (part) => import("./input" + part);
