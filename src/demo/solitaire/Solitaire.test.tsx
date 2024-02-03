import { test, expect } from "vitest";
import Card from "src/engine/Card";
import Engine from "src/engine/Engine";

let gameDef = {
	zones : 3,
	refs : {
		DECK : {type : "ZONE", index : 0},
		PILE : {type : "ZONE", index : 1},
		Z1 : {type : "ZONE", index : 2}
	},
	eventDef : {

	},
	cardList : [
		{
			code : "H3",
			suit : "H",
			num : 3
		},
		{
			code : "S2",
			suit : "S",
			num : 2,
		},
	]

}

test ("Init", () => {
	let engine : Engine = new Engine();	

	expect(() => engine.loadGame(gameDef));
});