import { test, expect } from "vitest";
import SolitaireEngine from "./SolitaireEngine";
import { CardEngine } from "../engine/CardEngine";

let engine: CardEngine = SolitaireEngine();


test("Add Card", () => {
	engine.addCard("T1", { suit: "D", num : 1, visible: false })
	expect(engine.getZone("T1").size()).toEqual(1)
});

test("Move one", () => {
	engine.addCard("T1", { suit: "D", num : 1 })
	engine.pushAction([
		"MOVE",
		{
			fromZone: "T1",
			toZone: "T2"
		}
	]);
	expect(engine.getZone("T2").size()).toEqual(1)
});

test("Flip on move", () => {
	engine.addCard("T1", { suit: "D", num : 1, visible: false });
	engine.addCard("T1", { suit: "D", num : 6 });
})