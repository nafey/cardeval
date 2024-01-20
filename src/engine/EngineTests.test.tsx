import { test, expect} from "vitest";
import { match } from "./Utils";
import Engine from "./State";
import Zone from "./Zone";
import Card from "./Card";


test ("Match", () => {
    expect(match({a : 1}, {a : 2})).toBe(false);
    expect(match({a : 1}, {a : 1})).toBe(true);
    expect(match({a : {b: 1, c: 2}}, {a : {b : 1}})).toBe(true);
    expect(match({a : {b: 1, c: 2}}, {a : {b : 2}})).toBe(false);
});


test ("Match Operator", () => {
    expect(match({a : 10}, {a : {op : "gt", val : 2}})).toBe(true);
    expect(match({a : 10}, {a : {op : "lt", val : 20}})).toBe(true);
});

test ("Card Count", () => {
    let s : Engine = new Engine();
    let z : Zone = s.newZone();

    z.addCard(new Card({a : 10}));

    expect(z.count({a : 10})).toBe(1);
    expect(z.count({a : {op : "gt", val : 9}})).toBe(1);
    expect(z.count({a : {op : "lt", val : 9}})).toBe(0);
});


