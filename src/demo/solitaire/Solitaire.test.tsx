import { test, expect, beforeEach } from "vitest";
import Engine from "src/engine/Engine";
import Zone from "src/engine/Zone";
import Card from "src/engine/Card";

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
	zones: 4,
	refs: {
		DECK: { type: "ZONE", index: 0 },
		PILE: { type: "ZONE", index: 1 },
		Z1: { type: "ZONE", index: 2 },
		Z2: { type: "ZONE", index: 3 },
		Z3: { type: "ZONE", index: 4 },
		Z4: { type: "ZONE", index: 5 },
		Z5: { type: "ZONE", index: 6 },
		Z6: { type: "ZONE", index: 7 },
		Z7: { type: "ZONE", index: 8 },
		ZS: { type: "ZONE", index: 9 },
		ZH: { type: "ZONE", index: 10 },
		ZC: { type: "ZONE", index: 11 },
		ZD: { type: "ZONE", index: 12 },
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
			event: "FIND_SOURCE",
			def: {
				event: "FIND",
				in: "@EVENT.in",
				key: "visible",
				set: "source",
				val: true
			}
		},


		{
			event: "FIND_TARGET",
			def: {
				event: "FIND",
				in: "@EVENT.in",
				dir: "DESC",
				key: "visible",
				set: "target",
				val: true
			}
		},

		{
			event: "FLIP",
			def: {
				event: "UPDATE",
				card: "@EVENT.card",
				op: "NOT",
				key: "visible",
			}
		},

		{
			event: "FLIP_LAST",
			events: [
				{
					event: "FIND",
					in: "@EVENT.in",		
					at: "LAST",
					set: "target"
				},
				{
					event: "FLIP",
					card: "@target"
				}
			]
		},

		{

			event: "CHECK_CARDS",
			events: [
				{
					event: "IF",
					type: "COMPARE",
					op: "DIFF",
					val1: "@EVENT.target.num",
					val2: "@EVENT.source.num",
					diff: 1,
					else: {
						event: "RAISE_ERROR",
						errorMsg: "The difference of Card values should be 1"
					}
				},

				{

					event: "IF",
					type: "COMPARE",
					op: "IN",
					val: "@EVENT.source.suit",
					array: ["H", "D"],
					then: {
						event: "IF",
						type: "COMPARE",
						op: "IN",
						val: "@EVENT.target.suit",
						array: ["H", "D"],
						then: {
							event: "RAISE_ERROR",
							errorMsg: "Source and Target cannot have same color suits",
						}	
					},
					else: {
						event: "IF",
						type: "COMPARE",
						op: "IN",
						val: "@EVENT.target.suit",
						array: ["S", "C"],
						then: {
							event: "RAISE_ERROR",
							errorMsg: "Source and Target cannot have same color suits",
						}	
					}

				},
			]

		},

		{
			event: "MOVE_CARD",
			events: [
				{
					event: "CHECK_MOVE",
					from: "@EVENT.from",
					to: "@EVENT.to"
				},
				{
					event: "MOVE",
					after: "@source",
					from: "@EVENT.from",
					to: "@EVENT.to"
				},
				{
					event: "IF",
					type: "IS_EMPTY",
					zone: "@EVENT.from",
					else: {
						event: "FLIP_LAST",
						in: "@EVENT.from"
					}
				}
			]
		},


		{
			event: "CHECK_MOVE",
			events: [
				{
					event: "IF",
					type: "IS_EMPTY",
					zone: "@EVENT.from",
					then: {
						event: "RAISE_ERROR",
						errorMsg: "No card to move"	
					}	
				},

				{
					event: "FIND_SOURCE",
					in: "@EVENT.from",
				},

				{
					event: "FIND_TARGET",
					in: "@EVENT.to"
				},

				{
					event: "IF",
					type: "ZONE_COUNT",
					zone: "@EVENT.to",
					val: 0,
					else: {
						event: "CHECK_CARDS",
						target: "@target",
						source: "@source"
					}
				},

			]
		},

		{
			event: "MOVE_UP",
			events: [
				{
					event: "IF",
					type: "IS_EMPTY",
					zone: "@EVENT.zone",
					then: {
						event: "RAISE_ERROR",
						errorMsg: "No card to move"
					}	
				},
				{
					event: "IF",
					type: "COMPARE",
					
				}
			]
		},

		{
			event: "SELECT_SUIT",
			def: {
				event: "SET",
				ref: "SUIT",
				val: "@EVENT.card.suit"
			}
		}	
	],

	cardList: [
		{
			visible: false,
			code: "HIDDEN",
			suit: "H",
			num: 1
		},
		{
			code: "H1",
			suit: "H",
			num: 1
		},
		{
			code: "H2",
			suit: "H",
			num: 2
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

test("Reset Pile", () => {
	let engine: Engine = new Engine();

	engine.loadGame(gameDef);

	let pile: Zone = engine.refs.PILE;
	let deck: Zone = engine.refs.DECK;

	pile.addCard(engine.createCardFromList("H3"));
	engine.eval({ event: "CLICK_DECK" });	
	expect(deck.cards[0].num).toBe(3);
});

test("Reverse Pile", () => {
	let engine: Engine = new Engine();

	engine.loadGame(gameDef);

	let pile: Zone = engine.refs.PILE;
	let deck: Zone = engine.refs.DECK;

	pile.addCard(engine.createCardFromList("H3"));
	pile.addCard(engine.createCardFromList("S2"));

	engine.eval({ event: "CLICK_DECK" });	
	expect(deck.cards[0].num).toBe(2);
});

test("Draw", () => {
	let engine: Engine = new Engine();	

	engine.loadGame(gameDef);

	let pile: Zone = engine.refs.PILE;
	let deck: Zone = engine.refs.DECK;

	deck.addCard(engine.createCardFromList("H3"));

	engine.eval({ event: "DRAW" });
	expect(pile.count()).toBe(1);
});


test("Multi Draw", () => {
	let engine: Engine = new Engine();	

	engine.loadGame(gameDef);

	let pile: Zone = engine.refs.PILE;
	let deck: Zone = engine.refs.DECK;

	deck.addCard(engine.createCardFromList("H3"));
	deck.addCard(engine.createCardFromList("S2"));

	expect(pile.count()).toBe(0);

	engine.eval({ event: "CLICK_DECK" });
	expect(pile.count()).toBe(1);

	engine.eval({ event: "CLICK_DECK" });
	expect(pile.count()).toBe(2);

	engine.eval({ event: "CLICK_DECK" });
	expect(pile.count()).toBe(0);

	engine.eval({ event: "CLICK_DECK" });
	expect(pile.count()).toBe(1);
});

test("Find Mover", () => {
	let engine: Engine = new Engine();	

	engine.loadGame(gameDef);

	let z1: Zone = engine.refs.Z1;
	z1.addCard(engine.createCardFromList("HIDDEN"));
	z1.addCard(engine.createCardFromList("H1"));

	engine.eval({
		event: "FIND_SOURCE",
		in: "@Z1"
	})

	let found: Card = engine.refs.source; 	
	expect(found.visible).toBe(true);
});

test("Find Target", () => {
	let engine: Engine = new Engine();	

	engine.loadGame(gameDef);

	let z1: Zone = engine.refs.Z1;
	z1.addCard(engine.createCardFromList("HIDDEN"));
	z1.addCard(engine.createCardFromList("H1"));
	z1.addCard(engine.createCardFromList("H2"));

	engine.eval({
		event: "FIND_TARGET",
		in: "@Z1"
	})

	let found: Card = engine.refs.target; 	
	expect(found.num).toBe(2);
});



test("Flip", () => {
	let engine: Engine = new Engine();	

	engine.loadGame(gameDef);

	let z1: Zone = engine.refs.Z1;
	z1.addCard(engine.createCardFromList("HIDDEN"));

	let card: Card = z1.cards[0];

	engine.eval({
		event: "FLIP",
		card: card
	})

	expect(card.visible).toBe(true);
});

test("Move Cards Fail", () => {
	let engine: Engine = new Engine();	

	engine.loadGame(gameDef);

	let z1: Zone = engine.refs.Z1;
	let z2: Zone = engine.refs.Z2;

	z1.addCard(engine.createCardFromList("H2"));
	z2.addCard(engine.createCardFromList("S2"));

	let testfn = () => engine.eval({
		event: "CHECK_MOVE",
		from: "@Z1",
		to: "@Z2"
	});

	expect(testfn).toThrowError("difference");
}) 


test("Suit Fail", () => {
	let engine: Engine = new Engine();	

	engine.loadGame(gameDef);

	let z1: Zone = engine.refs.Z1;
	let z2: Zone = engine.refs.Z2;

	z1.addCard(engine.createCardFromList("S1"));
	z2.addCard(engine.createCardFromList("S2"));

	let testfn = () => engine.eval({
		event: "CHECK_MOVE",
		from: "@Z1",
		to: "@Z2"
	});

	expect(testfn).toThrowError("color");
}); 

test("Move to Empty", () => {
	let engine: Engine = new Engine();	

	engine.loadGame(gameDef);

	let z1: Zone = engine.refs.Z1;
	let z2: Zone = engine.refs.Z2;

	z1.addCard(engine.createCardFromList("S1"));

	expect(z1.count()).toBe(1);

	engine.eval({
		event: "MOVE_CARD",
		from: "@Z1",
		to: "@Z2"
	});

	expect(z2.count()).toBe(1);
	expect(z1.count()).toBe(0);

});

test("Move to Card", () => {
	let engine: Engine = new Engine();	

	engine.loadGame(gameDef);

	let z1: Zone = engine.refs.Z1;
	let z2: Zone = engine.refs.Z2;

	z1.addCard(engine.createCardFromList("S1"));
	z2.addCard(engine.createCardFromList("H2"));
	
	expect(z1.count()).toBe(1);

	engine.eval({
		event: "MOVE_CARD",
		from: "@Z1",
		to: "@Z2"
	});

	expect(z2.count()).toBe(2);
	expect(z1.count()).toBe(0);
});

test("Flip Last", () => {
	let engine: Engine = new Engine();	

	engine.loadGame(gameDef);

	let z1: Zone = engine.refs.Z1;

	let hidden: Card = z1.addCard(engine.createCardFromList("HIDDEN"));
	z1.addCard(engine.createCardFromList("H2"));
	
	expect(hidden.visible).toBe(false);

	engine.eval({
		event: "MOVE_CARD",
		from: "@Z1",
		to: "@Z2"
	});

	expect(hidden.visible).toBe(true);
});

test("Move Stack", () => {
	let engine: Engine = new Engine();	

	engine.loadGame(gameDef);

	let z1: Zone = engine.refs.Z1;
	let z2: Zone = engine.refs.Z2;

	z1.addCard(engine.createCardFromList("H3"));
	z1.addCard(engine.createCardFromList("H2"));
	z1.addCard(engine.createCardFromList("S1"));

	z2.addCard(engine.createCardFromList("S3"));

	z1.cards[0].visible = false;
	

	engine.eval({
		event: "MOVE_CARD",
		from: "@Z1",
		to: "@Z2"
	});

	expect(z2.count()).toBe(3);
	expect(z1.count()).toBe(1);

	expect(z1.cards[0].visible).toBe(true);
});

test("Select suit", () => {
	let engine: Engine = new Engine();	

	engine.loadGame(gameDef);

	let z1: Zone = engine.refs.Z1;

	let card: Card = z1.addCard(engine.createCardFromList("S1"));

	engine.eval({
		event: "SELECT_SUIT",
		card: card,
	})

	expect(engine.refs.SUIT).toBe("S");

});

test("Select Suit Zone", () => {

	let engine: Engine = new Engine();	

	engine.loadGame(gameDef);

	let z1: Zone = engine.refs.Z1;
	let card: Card = z1.addCard(engine.createCardFromList("S1"));
})

test("Move up", () => {
	let engine: Engine = new Engine();	

	engine.loadGame(gameDef);

	let z1: Zone = engine.refs.Z1;
	let zS: Zone = engine.refs.ZS;

	z1.addCard(engine.createCardFromList("S1"));
	
	expect(zS.count()).toBe(0);

	engine.eval({
		event: "MOVE_UP",
		from: "@Z1"
	})	

	expect(zS.count()).toBe(1);
});




