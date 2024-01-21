import { test, expect } from "vitest";
import SolitaireEngine from "src/demo/solitaire/SolitaireEngine";
import Card from "src/engine/Card";
import Zone from "src/engine/Zone";

let engine: SolitaireEngine = new SolitaireEngine();


test("Move one", () => {
	let zoneRefs : Record<string, Zone> = engine.getActivePlayerZoneRefs();
	zoneRefs.T1.addCard(new Card({suit : "D", num: 1}));
	engine.move("T1", "T2")
	expect(zoneRefs.T2.count()).toEqual(1)
});

