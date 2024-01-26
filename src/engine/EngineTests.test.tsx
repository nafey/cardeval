import { test, expect, beforeEach } from "vitest";
import { match } from "./Utils";
import Engine from "./Engine";
import Zone from "./Zone";
import Card from "./Card";

const consoleDebug: any = console.debug;
console.debug = () => {};

beforeEach((context: any) => {
    if (context.task.name === "") {
        console.debug = consoleDebug;
    }
    else {
        console.debug = () => {};
    }
});
        

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

    engine.eval({
        event: "UPDATE", 
        card : "@this", 
        update : {
            a : {
                op : "sub", 
                val : 1
            }
        }
   }, c);

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

    let raiser : Card = new Card({
        b : 2,
    });

    let event = {
        event : "CREATE",
        zone : "@this.zone", 
        code : "A1"
    }

    zone.addCard(raiser);

    engine.addToList("A1", {a : 1});

    engine.eval(event, raiser);

    expect(zone.count()).toBe(2);
});

test ("Delete Event", () => {
    let engine : Engine = new Engine();   
    let zone : Zone = engine.newZone();
    let card : Card = new Card({a : 1});
    zone.addCard(card);

    engine.eval ({
        event : "DELETE", 
        card : "@this"
    }, card);

    expect(zone.count()).toBe(0);
});

test ("Trigger on Create", () => {
    let engine : Engine = new Engine();   
    let zone : Zone = engine.newZone();
    engine.refs.MAIN = zone;

    engine.addToList("A1", {name : "pahla", a : 1});

    let b1 = {
        name: "dusra",
        hp : 10,
        trigger : {
            on : "CREATE",
            onSelf: "SKIP",
            zone : "@this.zone",
            do : {
               event : "UPDATE",
               card: "@this",
               update : {hp : {op : "add", val : 1}}
            } 
        } 
    }

    let b1Card : Card = zone.addCard(new Card(b1));
    engine.eval({
        event : "CREATE", 
        zone : "@MAIN", 
        code : "A1"
    });

    expect(b1Card.hp).toBe(11);
});

test ("Zone reference", () => {

    let engine : Engine = new Engine();   
    let zone : Zone = engine.newZone();

    engine.refs.MAIN = zone;
    // let context : Context = new Context();
    // context.zones.MAIN = zone;

    engine.addToList("A10" ,
    {
        a : 10,
        trigger : {
            on : "CREATE",
            in : "@MAIN",
            match : {card: "@this", zone : "@MAIN"},
            do : {
               event : "UPDATE",
               in : "@MAIN",
               onSelf : "SKIP",
               update : {a : {op : "add", val : 1}}
            } 
        } 
    });


    let a1 : Card = zone.addCard(new Card({a : 1}));
    let a2 : Card = zone.addCard(new Card({a : 2}));

    engine.eval({event : "CREATE", zone: "@MAIN", code : "A10"});

    expect(a1.a).toBe(2);
    expect(a2.a).toBe(3);
    expect(zone.getArr()[2].a).toBe(10);
});
