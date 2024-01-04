import { test, expect } from "vitest";
import  HSEngine, {HSCard} from "./HSEngine";
import HSCards from "./HSCards";

const cardsList : any = HSCards();


test ("Init", () => {
	let engine : HSEngine = new HSEngine(); 
	let p = engine.getActivePlayer();
	p.getZone("HAND").addCard(new HSCard(cardsList.LOOT))
	expect(p.getZone("HAND").size()).toEqual(1)
});

test ("Play One", () => {
	let engine : HSEngine = new HSEngine(); 
	let p = engine.getActivePlayer();
	p.getZone("HAND").addCard(new HSCard(cardsList.LOOT))
	engine.play(p.playerId, p.getZone("HAND").cards[0].cardId); 
	expect(p.getZone("BF").size()).toEqual(1)
});


test ("Attack", () => {
	let engine : HSEngine = new HSEngine(); 
	let p = engine.getActivePlayer();
	p.getZone("BF").addCard(new HSCard(cardsList.CROC));

	let o = engine.getOtherPlayer();
	o.getZone("BF").addCard(new HSCard(cardsList.MRDR));

	engine.attack(0, 0);
	expect(o.getZone("BF").size()).toEqual(0);
});

test ("Deathrattle", () => {
	let engine : HSEngine = new HSEngine(); 
	let p = engine.getActivePlayer();
	p.getZone("BF").addCard(new HSCard(cardsList.CROC));

	let o = engine.getOtherPlayer();
	o.getZone("BF").addCard(new HSCard(cardsList.LOOT));
	o.getZone("DECK").addCard(new HSCard(cardsList.RZRH));

	engine.attack(0, 0);
	expect(o.getZone("HAND").size()).toEqual(1);
});

test ("Battlecry", () => {
	let engine : HSEngine = new HSEngine(); 
	let p = engine.getActivePlayer();
	p.getZone("HAND").addCard(new HSCard(cardsList.IRON));

	let o = engine.getOtherPlayer();
	o.getZone("BF").addCard(new HSCard(cardsList.LOOT));
	o.getZone("DECK").addCard(new HSCard(cardsList.RZRH));

	engine.play(p.playerId, p.getZone("HAND").cards[0].cardId, {"targetType" : "MIN", "playerId" : engine.getOtherPlayer().playerId, "cardId" : o.getZone("BF").cards[0].cardId});
	expect(o.getZone("HAND").size()).toEqual(1)

});
