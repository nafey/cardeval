import { test, expect, beforeEach } from "vitest";
import Engine from "src/engine/Engine";
import Zone from "src/engine/Zone";

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
        

let gameDef = {
	zones: 3,
	refs: {
		DECK: { type: "ZONE", index: 0 },
		PILE: { type: "ZONE", index: 1 },
		Z1: { type: "ZONE", index: 2 }
	},
	eventDefs: [
		{
			event: "DRAW",
			def: {
				event: "MOVE",
				from: "@DECK",
				to: "@PILE",
				at: "BOT"		
			}	
		}
	],
	cardList: [
		{
			code: "H3",
			suit: "H",
			num: 3
		},
		{
			code: "S2",
			suit: "S",
			num: 2,
		},
	]

}

test("Init", () => {
	let engine: Engine = new Engine();	

	expect(() => engine.loadGame(gameDef));
});


test("Draw", () => {
	let engine: Engine = new Engine();

	engine.loadGame(gameDef);

	engine.eval({
		event: "CREATE",
		code: "H3",
		zone: "@DECK"
	});

	engine.eval({
		event: "DRAW"
	});

	let pile: Zone = engine.refs.PILE;
	expect(pile.count()).toBe(1);
});


