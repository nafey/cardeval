import { test, expect } from "vitest";
import  HSEngine, {HSCard} from "./HSEngine";
import HSCards from "./HSCards";

// const consoleDebug : any = console.debug;
console.debug = () => {};
// console.info = () => {};

const cardsList : any = HSCards();

test ("Init", () => {
	let engine : HSEngine = new HSEngine(); 
	let p = engine.getActivePlayer();
	p.zones.HAND.addCard(new HSCard(cardsList.LOOT))
	expect(p.zones.HAND.size()).toEqual(1)
});

test ("Play One", () => {
	let engine : HSEngine = new HSEngine(); 
	let p = engine.getActivePlayer();
	p.zones.HAND.addCard(new HSCard(cardsList.LOOT))
	engine.play(p.playerId, p.zones.HAND.first().cardId); 
	expect(p.zones.BF.size()).toEqual(1)
});


test ("Attack", () => {
	let engine : HSEngine = new HSEngine(); 
	let p = engine.getActivePlayer();
	p.zones.BF.addCard(new HSCard(cardsList.CROC));

	let o = engine.getOtherPlayer();
	o.zones.BF.addCard(new HSCard(cardsList.MRDR));

	engine.attack(0, 0);
	expect(o.zones.BF.size()).toEqual(0);
});

test ("Taunt", () => {
	let engine : HSEngine = new HSEngine(); 
	let p = engine.getActivePlayer();
	p.zones.BF.addCard(new HSCard(cardsList.CROC));

	let o = engine.getOtherPlayer();
	o.zones.BF.addCard(new HSCard(cardsList.MRDR));
	o.zones.BF.addCard(new HSCard(cardsList.GLDF));
	expect(() => engine.attack(0, 0)).toThrowError("taunt");
});

test ("Deathrattle", () => {
	let engine : HSEngine = new HSEngine(); 
	let p = engine.getActivePlayer();
	p.zones.BF.addCard(new HSCard(cardsList.CROC));

	let o = engine.getOtherPlayer();
	o.zones.BF.addCard(new HSCard(cardsList.LOOT));
	o.zones.DECK.addCard(new HSCard(cardsList.RZRH));

	engine.attack(0, 0);
	expect(o.zones.HAND.size()).toEqual(1);
});

test ("Battlecry", () => {
	let engine : HSEngine = new HSEngine(); 
	let p = engine.getActivePlayer();
	p.zones.HAND.addCard(new HSCard(cardsList.IRON));

	let o = engine.getOtherPlayer();
	o.zones.BF.addCard(new HSCard(cardsList.LOOT));
	o.zones.DECK.addCard(new HSCard(cardsList.RZRH));

	engine.play(p.playerId, p.zones.HAND.first().cardId, "OPP_BF", 0);
	expect(o.zones.HAND.size()).toEqual(1)
});

test ("Attack Player", () => {
	let engine : HSEngine = new HSEngine(); 
	let p = engine.getActivePlayer();
	p.zones.BF.addCard(new HSCard(cardsList.CROC));

	engine.attackPlayer(0);
	expect(engine.getOtherPlayer().vals.health).toEqual(28);
});

test ("Hand Limit", () => {
	let engine : HSEngine = new HSEngine(); 
	let p = engine.getActivePlayer();
	for (let i = 0; i < 11; i++) {
		p.zones.HAND.addCard(new HSCard(cardsList.CROC));
	}

	expect(p.zones.HAND.size()).toEqual(10);
});

test ("End Turn", () => {
	let engine : HSEngine = new HSEngine(); 
	let p = engine.getActivePlayer();
	p.zones.BF.addCard(new HSCard(cardsList.CROC));
	expect(engine.getActivePlayer().zones.BF.size()).toEqual(1);	

	engine.endTurn();
	expect(engine.getActivePlayer().zones.BF.size()).toEqual(0);
});

test ("Start Turn Effects", () => {
	let engine : HSEngine = new HSEngine(); 
	let p = engine.getActivePlayer();
	p.zones.HAND.addCard(new HSCard(cardsList.CROC));
	engine.play(p.playerId, p.zones.HAND.first().cardId);

	engine.endTurn();
	engine.endTurn();
	expect(p.zones.BF.first().sick).toBe(false);
});

test ("Summoning Sickness", () => {
	let engine : HSEngine = new HSEngine(); 
	let p = engine.getActivePlayer();
	p.zones.HAND.addCard(new HSCard(cardsList.CROC));
	p.zones.HAND.addCard(new HSCard(cardsList.RZRH));

	let o = engine.getOtherPlayer();
	o.zones.HAND.addCard(new HSCard(cardsList.MRDR));

	engine.play(p.playerId, p.zones.HAND.first().cardId);
	engine.endTurn();
	engine.play(o.playerId, o.zones.HAND.first().cardId);
	engine.endTurn();
	engine.play(p.playerId, p.zones.HAND.first().cardId);

	expect(() => engine.attack(1, 0)).toThrowError("sick");
	engine.attack(0, 0);
	expect(o.zones.BF.size()).toBe(0);
});


// Implement : https://www.youtube.com/watch?v=Bd9A4RyGXW4
test ("Event Test", () => {
	let engine : HSEngine = new HSEngine(); 
	let p = engine.getActivePlayer();
	p.zones.BF.addCard(new HSCard(cardsList.IMPB));

	let o = engine.getOtherPlayer();
	o.zones.HAND.addCard(new HSCard(cardsList.IRON));
	engine.play(o.playerId, o.zones.HAND.first().cardId, "OPP_BF", 0);	
	expect(p.zones.BF.size()).toBe(2);
});

// console.debug = consoleDebug;