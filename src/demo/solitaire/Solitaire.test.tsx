import { test, expect } from "vitest";
import SolitaireEngine from "src/demo/solitaire/SolitaireEngine";
import Card from "src/engine/Card";
import Player from "src/engine/Player";

let engine: SolitaireEngine = new SolitaireEngine();


test("Move one", () => {
	let p : Player = engine.getPlayer();
	p.zones.T1.addCard(new Card({suit: "D", num: 1} ))
	engine.moveHandler("T1", "T2")
	expect(p.zones.T2.count()).toEqual(1)
	
});

