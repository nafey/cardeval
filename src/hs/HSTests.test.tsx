import { test, expect } from "vitest";
import  HSEngine, {} from "./HSEngine";
import Player from "src/engine/Player";
import Card from "src/engine/Card";

// const consoleDebug : any = console.debug;
console.debug = () => {};

// console.log = () => {};

// const cardsList : ListCard[] = HSCards();

// let cardsList : Record<string, ListCard> = (new HSCardList()).getList();

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
	p.zones.BF.addCard(engine.createCard("CROC"));

	let o = engine.getOtherPlayer();
	o.zones.BF.addCard(engine.createCard("MRDR"));

	engine.attack(0, 0);
	expect(o.zones.BF.size()).toEqual(0);
});

test ("Taunt", () => {
	let engine : HSEngine = new HSEngine(); 
	let p : Player = engine.getActivePlayer();
	p.zones.BF.addCard(engine.createCard("CROC"));

	let o : Player = engine.getOtherPlayer();
	o.zones.BF.addCard(engine.createCard("MRDR"));
	o.zones.BF.addCard(engine.createCard("GLDF"));
	expect(() => engine.attack(0, 0)).toThrowError("taunt");
});

test ("Deathrattle", () => {
	let engine : HSEngine = new HSEngine(); 
	let p = engine.getActivePlayer();
	p.zones.BF.addCard(engine.createCard("CROC"));

	let o = engine.getOtherPlayer();
	o.zones.BF.addCard(engine.createCard("LOOT"));
	o.zones.DECK.addCard(engine.createCard("RZRH"));

	engine.attack(0, 0);
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
	p.zones.BF.addCard(engine.createCard("CROC"));

	engine.attackPlayer(0);
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

	expect(() => engine.attack(1, 0)).toThrowError("sick");
	engine.attack(0, 0);
	expect(o.zones.BF.size()).toBe(0);
});


// Implement: https://www.youtube.com/watch?v=Bd9A4RyGXW4
// Sequence: https://www.youtube.com/watch?v=Ln0BisR_SfY
test ("Imp Boss Test", () => {
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

// console.debug = consoleDebug;