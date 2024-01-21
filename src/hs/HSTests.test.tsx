import { test, expect, beforeEach } from "vitest";
import HSEngine, {} from "./HSEngine";
import Refs from "src/engine/Refs";
import Card from "src/engine/Card";
// import { EventType } from "./HSCards";

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

test("Init", () => {
	let engine: HSEngine = new HSEngine(); 
	let p: Refs = engine.getActivePlayer();
	p.zones.HAND.addCard(engine.createCard("LOOT"));
	expect(p.zones.HAND.count()).toEqual(1)
});

test("Play One", () => {
	let engine: HSEngine = new HSEngine(); 
	let p: Refs = engine.getActivePlayer();
	let c: Card = p.zones.HAND.addCard(engine.createCard("LOOT"));

	engine.play(c)
	expect(p.zones.BF.count()).toEqual(1)
});


test("Attack", () => {
	let engine: HSEngine = new HSEngine(); 
	let p: Refs = engine.getActivePlayer();
	let croc: Card = p.zones.BF.addCard(engine.createCard("CROC"));

	let o = engine.getOtherPlayer();
	let mrdr: Card = o.zones.BF.addCard(engine.createCard("MRDR"));

	engine.attack(croc, mrdr);
	expect(o.zones.BF.count()).toEqual(0);
});

test("Taunt", () => {
	let engine: HSEngine = new HSEngine(); 
	let p: Refs = engine.getActivePlayer();
	let croc: Card = p.zones.BF.addCard(engine.createCard("CROC"));

	let o: Refs = engine.getOtherPlayer();
	let mrdr = o.zones.BF.addCard(engine.createCard("MRDR"));
	o.zones.BF.addCard(engine.createCard("GLDF"));
	expect(() => engine.attack(croc, mrdr)).toThrowError("taunt");
});

test("Deathrattle", () => {
	let engine: HSEngine = new HSEngine(); 
	let p = engine.getActivePlayer();
	let croc: Card = p.zones.BF.addCard(engine.createCard("CROC"));

	let o = engine.getOtherPlayer();
	let loot: Card = o.zones.BF.addCard(engine.createCard("LOOT"));
	o.zones.DECK.addCard(engine.createCard("RZRH"));

	engine.attack(croc, loot);
	expect(o.zones.HAND.count()).toEqual(1);
});

test("Battlecry", () => {
	let engine: HSEngine = new HSEngine(); 
	let p = engine.getActivePlayer();
	let iron: Card = p.zones.HAND.addCard(engine.createCard("IRON"));

	let o = engine.getOtherPlayer();
	let loot: Card = o.zones.BF.addCard(engine.createCard("LOOT"));
	o.zones.DECK.addCard(engine.createCard("RZRH"));

	engine.play(iron, { type: "OPP_BF", card: loot });
	expect(o.zones.HAND.count()).toEqual(1)
});

test("Attack Player", () => {
	let engine: HSEngine = new HSEngine(); 
	let p = engine.getActivePlayer();
	let croc: Card = p.zones.BF.addCard(engine.createCard("CROC"));

	engine.attackOpponent(croc);
	expect(engine.getOtherPlayer().refs.self.health).toEqual(28);
});

test("Hand Limit", () => {
	let engine: HSEngine = new HSEngine(); 
	let p = engine.getActivePlayer();
	for (let i = 0; i < 11; i++) {
		p.zones.HAND.addCard(engine.createCard("CROC"));
	}

	expect(p.zones.HAND.count()).toEqual(10);
});

test("End Turn", () => {
	let engine: HSEngine = new HSEngine(); 
	let p = engine.getActivePlayer();
	p.zones.BF.addCard(engine.createCard("CROC"));
	expect(engine.getActivePlayer().zones.BF.count()).toEqual(1);	

	engine.endTurn();
	expect(engine.getActivePlayer().zones.BF.count()).toEqual(0);
});

test("Start Turn Events", () => {
	let engine: HSEngine = new HSEngine(); 
	let p = engine.getActivePlayer();
	let croc: Card = p.zones.HAND.addCard(engine.createCard("CROC"));
	engine.play(croc);

	engine.endTurn();
	engine.endTurn();
	expect(p.zones.BF.first().sick).toBe(false);
});

test("Summoning Sickness", () => {
	let engine: HSEngine = new HSEngine(); 
	let p: Refs = engine.getActivePlayer();
	let croc: Card = p.zones.HAND.addCard(engine.createCard("CROC"));
	let rzrh: Card = p.zones.HAND.addCard(engine.createCard("RZRH"));

	let o = engine.getOtherPlayer();
	let mrdr: Card = o.zones.HAND.addCard(engine.createCard("MRDR"));

	engine.play(croc);
	engine.endTurn();
	engine.play(mrdr);
	engine.endTurn();
	engine.play(rzrh);

	expect(() => engine.attack(rzrh, mrdr)).toThrowError("sick");
	engine.attack(croc, mrdr);
	expect(o.zones.BF.count()).toBe(0);
});


// Implement: https://www.youtube.com/watch?v=Bd9A4RyGXW4
// Sequence: https://www.youtube.com/watch?v=Ln0BisR_SfY
test("Imp Boss", () => {
	// console.debug = consoleDebug
	let engine: HSEngine = new HSEngine(); 
	let p = engine.getActivePlayer();
	let impb: Card = p.zones.BF.addCard(engine.createCard("IMPB"));

	let o = engine.getOtherPlayer();
	let iron: Card = o.zones.HAND.addCard(engine.createCard("IRON"));

	engine.endTurn();
	engine.play(iron, { type: "OPP_BF", card: impb });	
	expect(p.zones.BF.count()).toBe(2);
});

test("Knife Juggler", () => {
	let engine: HSEngine = new HSEngine(); 
	let p: Refs = engine.getActivePlayer();
	let o: Refs = engine.getOtherPlayer();
	let knfj: Card = p.zones.HAND.addCard(engine.createCard("KNFJ"));
	let croc: Card = p.zones.HAND.addCard(engine.createCard("CROC"));

	engine.play(knfj);
	engine.play(croc);
	expect(o.refs.self.health).toBe(29);
});

test("Knife Juggler 2", () => {
	let engine: HSEngine = new HSEngine(); 
	let p: Refs = engine.getActivePlayer();
	let knfj: Card = p.zones.HAND.addCard(engine.createCard("KNFJ"));
	let croc: Card = p.zones.HAND.addCard(engine.createCard("CROC"));

	engine.play(knfj);
	engine.play(croc);
	expect(p.refs.self.health).toBe(30);
});

test("Imp Boss and Knife Juggler", () => {
	let engine: HSEngine = new HSEngine(); 
	let p: Refs = engine.getActivePlayer();
	p.zones.BF.addCard(engine.createCard("KNFJ"));
	let impb: Card = p.zones.BF.addCard(engine.createCard("IMPB"));

	let o: Refs = engine.getOtherPlayer();
	let mrdr: Card = o.zones.BF.addCard(engine.createCard("MRDR"));

	engine.endTurn();
	engine.attack(mrdr, impb);


	expect(o.refs.self.health).toBe(29);
});

test ("Cast Spell", () => {
	let engine : HSEngine = new HSEngine();	
	let p: Refs = engine.getActivePlayer();
	let o: Refs = engine.getOtherPlayer();
	let arcn : Card = p.zones.HAND.addCard(engine.createCard("ARCN"));

	engine.cast(arcn, {type: "OPP"});
	expect(o.refs.self.health).toBe(28);
});

test ("Heal", () => {
	let engine : HSEngine = new HSEngine();
	let p : Refs = engine.getActivePlayer();
	let o : Refs = engine.getOtherPlayer();

	let arcn : Card = p.zones.HAND.addCard(engine.createCard("ARCN"));
	let vood : Card = p.zones.HAND.addCard(engine.createCard("VOOD"));


	let croc : Card = o.zones.BF.addCard(engine.createCard("CROC"));

	engine.cast(arcn, {type: "OPP_BF", card: croc});
	expect(croc.health).toBe(1);

	engine.play(vood, {type: "OPP_BF", card: croc});
	expect(croc.health).toBe(3);
})

test ("Heal Limit", () => {
	let engine : HSEngine = new HSEngine();
	let p : Refs = engine.getActivePlayer();
	let o : Refs = engine.getOtherPlayer();

	let vood : Card = p.zones.HAND.addCard(engine.createCard("VOOD"));
	let croc : Card = o.zones.BF.addCard(engine.createCard("CROC"));

	engine.play(vood, {type: "OPP_BF", card: croc});
	expect(croc.health).toBe(3);
})

// If you cast LegacyHoly Nova while your opponent has an Blackrock MountainImp Gang Boss  
// and a LegacyKnife Juggler, because the Damage Events are Created and Resolved before the Healing 
// Events are Created and Resolved, the extra damage caused by the knife from the 
// summoned Imp may be healed by the second step of Holy Nova.


test ("Damage All", () => {
	let engine : HSEngine = new HSEngine();
	let p : Refs = engine.getActivePlayer();
	let o : Refs = engine.getOtherPlayer();	

	let hell : Card = p.zones.HAND.addCard(engine.createCard("HELL"));

	o.zones.BF.addCard(engine.createCard("CROC"));
	o.zones.BF.addCard(engine.createCard("MRDR"));

	engine.cast(hell);	
	expect(o.zones.BF.count()).toBe(0);
});


test ("Damage All with Trigger", () => {
	let engine : HSEngine = new HSEngine();
	let p : Refs = engine.getActivePlayer();
	let o : Refs = engine.getOtherPlayer();	

	let hell : Card = p.zones.HAND.addCard(engine.createCard("HELL"));

	o.zones.BF.addCard(engine.createCard("CROC"));
	o.zones.BF.addCard(engine.createCard("MRDR"));
	o.zones.BF.addCard(engine.createCard("IMPB"));

	engine.cast(hell);	
	expect(o.zones.BF.count()).toBe(2);
});

test ("Damage Self with Spell", () => {
	let engine : HSEngine = new HSEngine();	
	let p: Refs = engine.getActivePlayer();
	let arcn : Card = p.zones.HAND.addCard(engine.createCard("ARCN"));

	engine.cast(arcn, {type: "SELF"});
	expect(p.refs.self.health).toBe(28);
});


test ("Multi Event spells", () => {
	let engine : HSEngine = new HSEngine();	
	let p: Refs = engine.getActivePlayer();
	let o: Refs = engine.getOtherPlayer();

	let arcn : Card = p.zones.HAND.addCard(engine.createCard("ARCN"));
	o.zones.BF.addCard(engine.createCard("MRDR"));
	o.zones.BF.addCard(engine.createCard("MRDR"));

	engine.cast(arcn, {type: "SELF"});
	expect(p.refs.self.health).toBe(28);
	expect(o.zones.BF.count()).toBe(2);

	let holy : Card = p.zones.HAND.addCard(engine.createCard("HOLY"));
	engine.cast(holy);	
	expect(p.refs.self.health).toBe(30);
	expect(o.zones.BF.count()).toBe(0);
});

test("Post Death Events", () => {

	let engine : HSEngine = new HSEngine();	
	let p: Refs = engine.getActivePlayer();
	let o: Refs = engine.getOtherPlayer();

	let holy : Card = p.zones.HAND.addCard(engine.createCard("HOLY"));
	let arcn1 : Card = p.zones.HAND.addCard(engine.createCard("ARCN"));
	let arcn2 : Card = p.zones.HAND.addCard(engine.createCard("ARCN"));

	o.zones.BF.addCard(engine.createCard("IMPB"));
	o.zones.BF.addCard(engine.createCard("KNFJ"));

	engine.cast(arcn1, {type: "SELF"});
	engine.cast(arcn2, {type: "SELF"});

	expect(p.refs.self.health).toBe(26);

	engine.cast(holy);

	expect(p.refs.self.health).toBe(27);
})