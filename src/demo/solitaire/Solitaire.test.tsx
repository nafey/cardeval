import { test, expect } from "vitest";
import SolitaireEngine from "src/demo/solitaire/SolitaireEngine";
import Card from "src/engine/Card";
import Player from "src/engine/Player";

let engine: SolitaireEngine = new SolitaireEngine();


// test("Add Card", () => {
// 	engine.addCard("T1", new Card(true, { suit: "D", num : 1, visible: false }))
// 	expect(engine.getZone("T1").size()).toEqual(1)
// });

test("Move one", () => {
	let p : Player = engine.getPlayer();
	// engine.getState().addCard("T1", new Card(true, { suit: "D", num : 1 }))
	p.getZone("T1").addCard(new Card(true, {suit: "D", num: 1} ))
	// engine.pushAction([
	// 	"MOVE",
	// 	{
	// 		fromZone: "T1",
	// 		toZone: "T2"
	// 	}
	// ]);
	engine.moveHandler("T1", "T2")
	expect(p.getZone("T2").size()).toEqual(1)
	
});

