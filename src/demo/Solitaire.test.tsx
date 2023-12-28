import { test, expect } from "vitest";
import SolitaireEngine from "./SolitaireEngine";
import { CardEngine } from "../engine/CardEngine";
import Card from "../engine/Card";

let engine: CardEngine = SolitaireEngine();


// test("Add Card", () => {
// 	engine.addCard("T1", new Card(true, { suit: "D", num : 1, visible: false }))
// 	expect(engine.getZone("T1").size()).toEqual(1)
// });

test("Move one", () => {
	engine.getState().addCard("T1", new Card(true, { suit: "D", num : 1 }))
	engine.pushAction([
		"MOVE",
		{
			fromZone: "T1",
			toZone: "T2"
		}
	]);
	expect(engine.getState().getZone("T2").size()).toEqual(1)
});

test("Flip on move", () => {
	engine.getState().addCard("T1", new Card(true, { suit: "D", num : 1, visible: false }));
	engine.getState().addCard("T1", new Card(true, { suit: "D", num : 6 }));
})