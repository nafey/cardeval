import { test, expect} from "vitest";
import { match } from "./Utils";


test ("Match Function", () => {
    expect(match({a : 1}, {a : 2})).toBe(false);
    expect(match({a : 1}, {a : 1})).toBe(true);
    expect(match({a : {b: 1, c: 2}}, {a : {b : 1}})).toBe(true);
    expect(match({a : {b: 1, c: 2}}, {a : {b : 2}})).toBe(false);
});