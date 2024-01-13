import { test, expect , beforeEach} from "vitest";
import  HSEngine, {} from "./HSEngine";
import Player from "src/engine/Player";
import Card from "src/engine/Card";

const consoleDebug : any = console.debug;
console.debug = () => {};

beforeEach((context: any) => {
	if (context.task.name === "Match Function") {
		console.debug = consoleDebug;
	}
	else {
		console.debug = () => {};
	}
});

test ("Init", () => {
	let engine : HSEngine = new HSEngine(); 
	let p: Player = engine.getActivePlayer();
	p.zones.HAND.addCard(engine.createCard("LOOT"));
	expect(p.zones.HAND.size()).toEqual(1)
});

test ("Play One", () => {
	let engine : HSEngine = new HSEngine(); 
	let p: Player = engine.getActivePlayer();
	let c: Card = p.zones.HAND.addCard(engine.createCard("LOOT"));

	engine.play(c)
	expect(p.zones.BF.size()).toEqual(1)
});


test ("Attack", () => {
	let engine : HSEngine = new HSEngine(); 
	let p : Player= engine.getActivePlayer();
	let croc : Card = p.zones.BF.addCard(engine.createCard("CROC"));

	let o = engine.getOtherPlayer();
	let mrdr : Card = o.zones.BF.addCard(engine.createCard("MRDR"));

	engine.attack(croc, mrdr);
	expect(o.zones.BF.size()).toEqual(0);
});

test ("Taunt", () => {
	let engine : HSEngine = new HSEngine(); 
	let p : Player = engine.getActivePlayer();
	let croc : Card = p.zones.BF.addCard(engine.createCard("CROC"));

	let o : Player = engine.getOtherPlayer();
	let mrdr = o.zones.BF.addCard(engine.createCard("MRDR"));
	o.zones.BF.addCard(engine.createCard("GLDF"));
	expect(() => engine.attack(croc, mrdr)).toThrowError("taunt");
});

test ("Deathrattle", () => {
	let engine : HSEngine = new HSEngine(); 
	let p = engine.getActivePlayer();
	let croc : Card = p.zones.BF.addCard(engine.createCard("CROC"));

	let o = engine.getOtherPlayer();
	let loot : Card = o.zones.BF.addCard(engine.createCard("LOOT"));
	o.zones.DECK.addCard(engine.createCard("RZRH"));

	engine.attack(croc, loot);
	expect(o.zones.HAND.size()).toEqual(1);
});

test ("Battlecry", () => {
	let engine : HSEngine = new HSEngine(); 
	let p = engine.getActivePlayer();
	let iron : Card = p.zones.HAND.addCard(engine.createCard("IRON"));

	let o = engine.getOtherPlayer();
	let loot : Card = o.zones.BF.addCard(engine.createCard("LOOT"));
	o.zones.DECK.addCard(engine.createCard("RZRH"));

	engine.play(iron, {type: "OPP_BF", card : loot});
	expect(o.zones.HAND.size()).toEqual(1)
});

test ("Attack Player", () => {
	let engine : HSEngine = new HSEngine(); 
	let p = engine.getActivePlayer();
	let croc : Card = p.zones.BF.addCard(engine.createCard("CROC"));

	engine.attackOpponent(croc);
	expect(engine.getOtherPlayer().vals.health).toEqual(28);
});

test ("Hand Limit", () => {
	let engine : HSEngine = new HSEngine(); 
	let p = engine.getActivePlayer();
	for (let i = 0; i < 11; i++) {
		p.zones.HAND.addCard(engine.createCard("CROC"));
	}

	expect(p.zones.HAND.size()).toEqual(10);
});

test ("End Turn", () => {
	let engine : HSEngine = new HSEngine(); 
	let p = engine.getActivePlayer();
	p.zones.BF.addCard(engine.createCard("CROC"));
	expect(engine.getActivePlayer().zones.BF.size()).toEqual(1);	

	engine.endTurn();
	expect(engine.getActivePlayer().zones.BF.size()).toEqual(0);
});

test ("Start Turn Effects", () => {
	let engine : HSEngine = new HSEngine(); 
	let p = engine.getActivePlayer();
	let croc : Card = p.zones.HAND.addCard(engine.createCard("CROC"));
	engine.play(croc);

	engine.endTurn();
	engine.endTurn();
	expect(p.zones.BF.first().sick).toBe(false);
});

test ("Summoning Sickness", () => {
	let engine : HSEngine = new HSEngine(); 
	let p : Player = engine.getActivePlayer();
	let croc : Card = p.zones.HAND.addCard(engine.createCard("CROC"));
	let rzrh : Card = p.zones.HAND.addCard(engine.createCard("RZRH"));

	let o = engine.getOtherPlayer();
	let mrdr : Card = o.zones.HAND.addCard(engine.createCard("MRDR"));

	engine.play(croc);
	engine.endTurn();
	engine.play(mrdr);
	engine.endTurn();
	engine.play(rzrh);

	expect(() => engine.attack(rzrh, mrdr)).toThrowError("sick");
	engine.attack(croc, mrdr);
	expect(o.zones.BF.size()).toBe(0);
});


// Implement: https://www.youtube.com/watch?v=Bd9A4RyGXW4
// Sequence: https://www.youtube.com/watch?v=Ln0BisR_SfY
test ("Imp Boss", () => {
	// console.debug = consoleDebug
	let engine : HSEngine = new HSEngine(); 
	let p = engine.getActivePlayer();
	let impb : Card = p.zones.BF.addCard(engine.createCard("IMPB"));

	let o = engine.getOtherPlayer();
	let iron : Card = o.zones.HAND.addCard(engine.createCard("IRON"));

	engine.endTurn();
	engine.play(iron, {type : "OPP_BF", card: impb});	
	expect(p.zones.BF.size()).toBe(2);
});

test ("Knife Juggler", () => {
	let engine : HSEngine = new HSEngine(); 
	let p: Player = engine.getActivePlayer();
	let knfj : Card = p.zones.HAND.addCard(engine.createCard("KNFJ"));
	let croc : Card = p.zones.HAND.addCard(engine.createCard("CROC"));

	p.zones.DECK.addCard(engine.createCard("LOOT"));
	engine.play(knfj);
	engine.play(croc);
	// expect(p.zones.HAND.size()).toBe(1);
});


test ("Match Function", () => {
	let match = (obj1 : any, obj2 : any) : boolean => {
		let keys : string[] = Object.keys(obj2);
		for (let i = 0; i < keys.length; i++) {
			let k : string = keys[i];
			if (!(k in obj1)) return false;	

			let val1 : any = obj1[k];	
			let val2 : any = obj2[k];	

			if (typeof val1 !== typeof val2) return false;

			if (typeof val1 === "string" || typeof val1 === "number" || typeof val1 === "boolean") return val1 === val2;	
			return match(obj1[k], obj2[k]);
		}
		return true;
	}

	expect(match({a : 1}, {a : 2})).toBe(false);
	expect(match({a : 1}, {a : 1})).toBe(true);
	expect(match({a : {b: 1, c: 2}}, {a : {b : 1}})).toBe(true);
	expect(match({a : {b: 1, c: 2}}, {a : {b : 2}})).toBe(false);
});