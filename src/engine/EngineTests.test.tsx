import { test, expect} from "vitest";
import { match } from "./Utils";
import Engine from "./Engine";
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

test ("Update Event", () => {
    let engine : Engine = new Engine();   
    let z : Zone = engine.newZone();
    let c : Card = new Card({a : 10});

    z.addCard(c);
    expect(c.a).toBe(10);

    engine.eval({event: "UPDATE", cardId : c.cardId, update : {a : {op : "sub", val : 1}}});
    expect(c.a).toBe(9);
});

test ("Create Card from List", () => {
    let engine : Engine = new Engine();   
    engine.addToList("A1", {a : 1});
    let c : Card = engine.createCardFromList("A1");

    expect(c).toBeTruthy();
});

test ("Create Event", () => {
    let engine : Engine = new Engine();   
    let zone : Zone = engine.newZone();
    engine.addToList("A1", {a : 1});

    engine.eval ({event : "CREATE", zoneId : zone.zoneId, code : "A1"});

    expect(zone.count()).toBe(1);
});

test ("Delete Event", () => {
    let engine : Engine = new Engine();   
    let zone : Zone = engine.newZone();
    let card : Card = new Card({a : 1});
    zone.addCard(card);

    engine.eval ({event : "DELETE", cardId : card.cardId});

    expect(zone.count()).toBe(0);
});

