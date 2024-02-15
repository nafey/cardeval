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
		Z1: { type: "ZONE", index: 2 },
		Z2 : { type: "ZONE", index: 3}
	},
	eventDefs: [
		{
			event: "DRAW",
			def: {
				event: "MOVE",
				from: "@DECK",
				to: "@PILE",
				at: "TOP"		
			}	
		},

		{
			event: "CLICK_DECK",
			def: {
				event: "IF",
				zone: "@DECK",
				type: "ZONE_COUNT",
				val: 0,
				then: {
					event: "SEQUENCE",
					events: [
						{
							event: "REVERSE",
							zone: "@PILE"
						}
						, {
							event: "MOVE_ALL",
							from: "@PILE",
							to: "@DECK"
						}
					]
				},
				else: {
					event: "DRAW"
				}	
			}	
		},

		{
			event : "FIND_MOVER",
			def : {

			}
		}

	],

	cardList: [
		{
			code: "H1",
			suit: "H",
			num: 1
		},
		{
			code: "H2",
			suit: "H",
			num: 3
		},
		{
			code: "H3",
			suit: "H",
			num: 3
		},
		{
			code: "S1",
			suit: "S",
			num: 1
		},
		{
			code: "S2",
			suit: "S",
			num: 2
		},
		{
			code: "S3",
			suit: "S",
			num: 3,
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

test ("Reset Pile", () => {
	let engine: Engine = new Engine();

	engine.loadGame(gameDef);

	let pile : Zone = engine.refs.PILE;
	let deck : Zone = engine.refs.DECK;

	pile.addCard(engine.createCardFromList("H3"));
	engine.eval({event: "CLICK_DECK"});	
	expect(deck.cards[0].num).toBe(3);
});

test ("Reverse Pile", () => {
	let engine: Engine = new Engine();

	engine.loadGame(gameDef);

	let pile : Zone = engine.refs.PILE;
	let deck : Zone = engine.refs.DECK;

	pile.addCard(engine.createCardFromList("H3"));
	pile.addCard(engine.createCardFromList("S2"));

	engine.eval({event: "CLICK_DECK"});	
	expect(deck.cards[0].num).toBe(2);
});

test ("Draw", () => {
	let engine : Engine = new Engine();	

	engine.loadGame(gameDef);

	let pile : Zone = engine.refs.PILE;
	let deck : Zone = engine.refs.DECK;

	deck.addCard(engine.createCardFromList("H3"));

	engine.eval({event : "DRAW"});
	expect(pile.count()).toBe(1);
});


test ("Multi Draw", () => {
	let engine : Engine = new Engine();	

	engine.loadGame(gameDef);

	let pile : Zone = engine.refs.PILE;
	let deck : Zone = engine.refs.DECK;

	deck.addCard(engine.createCardFromList("H3"));
	deck.addCard(engine.createCardFromList("S2"));

	expect(pile.count()).toBe(0);

	engine.eval({event : "CLICK_DECK"});
	expect(pile.count()).toBe(1);

	engine.eval({event : "CLICK_DECK"});
	expect(pile.count()).toBe(2);

	engine.eval({event : "CLICK_DECK"});
	expect(pile.count()).toBe(0);

	engine.eval({event : "CLICK_DECK"});
	expect(pile.count()).toBe(1);
});

test ("Find Mover")


