import { test, expect, beforeEach } from "vitest";
import { match } from "./Utils";
import Engine from "./Engine";
import Zone from "./Zone";
import Card from "./Card";

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
		

test("Match", () => {
	expect(match({ a: 1 }, { a: 2 })).toBe(false);
	expect(match({ a: 1 }, { a: 1 })).toBe(true);
	expect(match({ a: { b: 1, c: 2 } }, { a: { b: 1 } })).toBe(true);
	expect(match({ a: { b: 1, c: 2 } }, { a: { b: 2 } })).toBe(false);
});


test("Match Operator", () => {
	expect(match({ a: 10 }, { a: { op: "gt", val: 2 } })).toBe(true);
	expect(match({ a: 10 }, { a: { op: "lt", val: 20 } })).toBe(true);
});

test("Card Count", () => {
	let s: Engine = new Engine();
	let z: Zone = s.newZone();

	z.addCard(new Card({ a: 10 }));

	expect(z.count({ a: 10 })).toBe(1);
	expect(z.count({ a: { op: "gt", val: 9 } })).toBe(1);
	expect(z.count({ a: { op: "lt", val: 9 } })).toBe(0);
});

test("Update Event", () => {
	let engine: Engine = new Engine();   
	let z: Zone = engine.newZone();
	let c: Card = new Card({ a: 10 });

	z.addCard(c);
	expect(c.a).toBe(10);

	engine.eval({
		event: "UPDATE", 
		card : "@this",
		key : "a",
		val :  9,
	}, {this : c});

	expect(c.a).toBe(9);
});

test("Add Event", () => {
	let engine: Engine = new Engine();   
	let z: Zone = engine.newZone();
	let c: Card = new Card({ a: 10 });

	z.addCard(c);
	expect(c.a).toBe(10);

	engine.eval({
		event: "UPDATE", 
		card : "@this",
		key : "a",
		op : "ADD",
		val :  1,
	}, {this: c});

	expect(c.a).toBe(11);
});



test("Create Card from List", () => {
	let engine: Engine = new Engine();   
	engine.addToList("A1", { a: 1 });
	let c: Card = engine.createCardFromList("A1");

	expect(c).toBeTruthy();
});

test("Create Event", () => {
	let engine: Engine = new Engine(); 
	let zone: Zone = engine.newZone();

	let raiser: Card = new Card({
		b: 2,
	});

	let event = {
		event: "CREATE",
		zone: "@this.zone", 
		code: "A1"
	}

	zone.addCard(raiser);
	engine.addToList("A1", { a: 1 });
	engine.eval(event, {this: raiser});

	expect(zone.count()).toBe(2);
});

test("Delete Event", () => {
	let engine: Engine = new Engine();   
	let zone: Zone = engine.newZone();
	let card: Card = new Card({ a: 1 });
	zone.addCard(card);

	engine.eval({
		event: "DELETE", 
		card: "@this"
	}, {this: card});

	expect(zone.count()).toBe(0);
});

test("Trigger on Create", () => {
	let engine: Engine = new Engine();   
	let zone: Zone = engine.newZone();
	engine.refs.MAIN = zone;

	engine.addToList("A1", { name: "pahla", a: 1 });

	let b1 = {
		name: "dusra",
		a: 10,
		trigger: {
			on: "CREATE",
			in: "@MAIN", 
			do: {
				event: "UPDATE",
				card: "@this",
				op : "ADD",
				key: "a",
				val : 1,
			} 
		} 
	}

	let b1Card: Card = zone.addCard(new Card(b1));

	engine.eval({
		event: "CREATE",
		zone: "@MAIN",
		code: "A1"
	});

	expect(b1Card.a).toBe(11);
});


test("Dont Trigger on Self", () => {
	let engine: Engine = new Engine();   
	let zone: Zone = engine.newZone();
	engine.refs.MAIN = zone;


	let b1 = {
		name: "dusra",
		a: 10,
		trigger: {
			on: "CREATE",
			in: "@MAIN", 
			do: {
				event: "UPDATE",
				card: "@this",
				op : "ADD",
				key : "a",
				val : 1,
			} 
		} 
	}

	engine.addToList("B1", b1);

	engine.eval({
		event: "CREATE",
		zone: "@MAIN",
		code: "B1"
	});

	expect(zone.getArr()[0].a).toBe(10);
});

test ("For Each", () => {
	let engine: Engine = new Engine();   
	let zone: Zone = engine.newZone();

	engine.refs.MAIN = zone;

	let a1: Card = zone.addCard(new Card({ a: 1 }));
	let a2: Card = zone.addCard(new Card({ a: 2 }));

	engine.eval({
		event : "FOREACH",
		in : "@MAIN",
		do: {
			event : "UPDATE",
			card : "@each",
			op : "ADD",
			key : "a",
			val : 1,
		}
	})


	expect(a1.a).toBe(2);
	expect(a2.a).toBe(3);
})

test("On Receive", () => {
	let engine: Engine = new Engine();   
	let zone: Zone = engine.newZone();

	engine.refs.MAIN = zone;

	engine.addToList("A10",
		{
			a: 10,
			onReceive: {
				on: "CREATE",
				do: {
					event : "FOREACH",
					in : "@MAIN",
					do : {
						event : "UPDATE",
						card : "@each",
						op : "ADD",
						key : "a",
						val : 1
					}
				} 
			} 
		});

	let a1: Card = zone.addCard(new Card({ a: 1 }));
	let a2: Card = zone.addCard(new Card({ a: 2 }));

	engine.eval({ event: "CREATE", zone: "@MAIN", code: "A10" });
	expect(a1.a).toBe(2);
	expect(a2.a).toBe(3);
	expect(zone.getArr()[2].a).toBe(11);
});

test("On Receive This", () => {
	let engine: Engine = new Engine();   
	let zone: Zone = engine.newZone();

	engine.refs.MAIN = zone;

	engine.addToList("A10",
		{
			a: 10,
			onReceive: {
				on: "CREATE",
				do: {
					event : "FOREACH",
					in : "@MAIN",
					do : {
						event : "UPDATE",
						card : "@each",
						op : "ADD",
						key : "a",
						val : "@this.a"
					}
				} 
			} 
		});

	let a1: Card = zone.addCard(new Card({ a: 1 }));
	let a2: Card = zone.addCard(new Card({ a: 2 }));

	engine.eval({ event: "CREATE", zone: "@MAIN", code: "A10" });
	expect(a1.a).toBe(11);
	expect(a2.a).toBe(12);
	expect(zone.getArr()[2].a).toBe(20);
});

test("On Receive Each", () => {
	let engine: Engine = new Engine();   
	let zone: Zone = engine.newZone();

	engine.refs.MAIN = zone;

	engine.addToList("A10",
		{
			a: 10,
			onReceive: {
				on: "CREATE",
				do: {
					event : "FOREACH",
					in : "@MAIN",
					do : {
						event : "UPDATE",
						card : "@each",
						op : "ADD",
						key : "a",
						val : "@each.a"
					}
				} 
			} 
		});

	let a1: Card = zone.addCard(new Card({ a: 1 }));
	let a2: Card = zone.addCard(new Card({ a: 2 }));

	engine.eval({ event: "CREATE", zone: "@MAIN", code: "A10" });
	expect(a1.a).toBe(2);
	expect(a2.a).toBe(4);
	expect(zone.getArr()[2].a).toBe(20);
});

test ("Direct Ref", () => {
	let engine : Engine = new Engine();
	let zone : Zone = engine.newZone();

	engine.refs.MAIN = zone;

	let a1: Card = zone.addCard(new Card({ a: 1 }));

	engine.eval({
		event : "UPDATE",
		card : a1,
		op : "ADD",
		key : "a",
		val : 1
	});

	expect(a1.a).toBe(2);

})

test("Skip", () => {
	let engine: Engine = new Engine();   
	let zone: Zone = engine.newZone();

	engine.refs.MAIN = zone;

	let a1: Card = zone.addCard(new Card({ a: 1 }));
	let a2: Card = zone.addCard(new Card({ a: 2 }));

	// engine.eval({
	// 	event: "UPDATE",
	// 	skip: a2,
	// 	in: "@MAIN",
	// 	update: { a: { op: "add", val: 1 } }
	// }) 

	engine.eval({
		event : "FOREACH",
		skip : a2,
		in : "@MAIN",
		do : {
			event : "UPDATE",
			card : "@each",
			op : "ADD",
			key : "a",
			val : 1,
		}
	})

	expect(a1.a).toBe(2);
	expect(a2.a).toBe(2);
});

test("Skip On Self", () => {
	let engine: Engine = new Engine();   
	let zone: Zone = engine.newZone();

	engine.refs.MAIN = zone;

	let a1: Card = zone.addCard(new Card({ a: 1 }));
	let a2: Card = zone.addCard(new Card({ a: 2 }));

	engine.eval({
		event: "UPDATE",
		skip: "@this",
		in: "@MAIN",
		update: { a: { op: "add", val: 1 } }
	}, {this: a2}) 
	
	engine.eval({
		event : "FOREACH",
		skip : "@this",
		in : "@MAIN",
		do : {
			event : "UPDATE",
			card : "@each",
			op : "ADD",
			key : "a",
			val : 1,
		}
	}, {this : a2});


	expect(a1.a).toBe(2);
	expect(a2.a).toBe(2);
});

test("Move", () => {
	let engine: Engine = new Engine();   

	let area1: Zone = engine.newZone();
	engine.refs.AREA1 = area1;

	let area2: Zone = engine.newZone();
	engine.refs.AREA2 = area2;

	let card: Card = new Card({ a: 1 });
	area1.addCard(card);
	engine.eval({
		event: "MOVE",
		card: "@this", 
		from: "@AREA1",
		to: "@AREA2"
	}, 
		{this: card}
	);

	expect(area1.count()).toBe(0);
	expect(area2.count()).toBe(1);
});


test("Custom Events", () => {
	let engine: Engine = new Engine();   

	let area1: Zone = engine.newZone();
	engine.refs.AREA1 = area1;

	let area2: Zone = engine.newZone();
	engine.refs.AREA2 = area2;

	let card: Card = new Card({ a: 1 });
	area1.addCard(card);

	engine.defineEvent(
		"PLAY", 
		{
			event: "MOVE",
			card: "@EVENT.card",
			from: "@AREA1",
			to: "@AREA2"
		}
	);

	engine.eval({
		event: "PLAY",
		card: card
	})

	expect(area1.count()).toBe(0);
	expect(area2.count()).toBe(1);
});


test("Receive Custom Event", () => {
	let engine: Engine = new Engine();   

	let area1: Zone = engine.newZone();
	engine.refs.AREA1 = area1;

	let area2: Zone = engine.newZone();
	engine.refs.AREA2 = area2;

	engine.defineEvent(
		"PLAY", 
		{
			event: "MOVE",
			card: "@EVENT.card",
			from: "@AREA1",
			to: "@AREA2"
		}
	);

	let cardDef = {
		a: 1,
		onReceive: {
			on: "PLAY",
			do: {
				event: "UPDATE",
				card: "@this",
				op : "ADD",
				key : "a",
				val : 1
			}
		}
	}

	let card: Card = new Card(cardDef);
	area1.addCard(card);

	engine.eval({
		event: "PLAY",
		card: card
	})

	expect(area1.count()).toBe(0);
	expect(area2.count()).toBe(1);
	expect(card.a).toBe(2);

});



let gameDef = {
	zones: 2,
	refs: {
		AREA1: { type: "ZONE", index: 0 },
		AREA2: { type: "ZONE", index: 1 }
	},
	eventDefs: [
		{
			event: "MAKEA1",
			def: {
				event: "CREATE",
				code: "A1",
				zone: "@AREA1",
				set: "A1"
			} 
		},
		{
			event: "MAKEA2",
			def: {
				event: "CREATE",
				code: "A2",
				zone: "@AREA1",
				set: "A2"
			} 
		}
	],
	cardList: [
		{
			code: "A1",
			a: 1
		},
		{
			code: "B1",
			b: 1
		},
		{
			code: "A2",
			a: 2
		},
		{
			code: "B2",
			b: 2
		}
	]
}

test("Game Def", () => {
	let engine: Engine = new Engine(); 

	engine.loadGame(gameDef);

	engine.eval({
		event: "CREATE",
		code: "A1",
		zone: "@AREA1"
	});

	expect(engine.refs.AREA1.getArr().length).toBe(1);
});

test("Event Array", () => {
	let engine: Engine = new Engine(); 

	engine.loadGame(gameDef);

	engine.eval(
		{
			event: "SEQUENCE",
			events: [
				{
					event: "CREATE",
					code: "A1",
					zone: "@AREA1"
				},
				{
					event: "CREATE",
					code: "A1",
					zone: "@AREA1"
				}
			]
		});

	expect(engine.refs.AREA1.getArr().length).toBe(2);
});


test("Game Def", () => {
	let engine: Engine = new Engine(); 

	engine.loadGame(gameDef);

	engine.eval({
		event: "CREATE",
		code: "A1",
		zone: "@AREA1"
	});

	expect(engine.refs.AREA1.getArr().length).toBe(1);
});


test("If event", () => {
	let engine: Engine = new Engine();
	
	engine.loadGame(gameDef); 

	engine.eval({
		event: "IF",
		type: "ZONE_COUNT",
		zone: "@AREA1",
		val: 0,
		then: {
			event: "CREATE",
			code: "A1",
			zone: "@AREA1",
		},
		else: {
			event: "CREATE",
			code: "B1",
			zone: "@AREA1",
		}
	});

	expect(engine.refs.AREA1.cards[0].code).toBe("A1");
});


test("Else event", () => {
	let engine: Engine = new Engine();
	
	engine.loadGame(gameDef); 

	engine.eval({
		event: "IF",
		type: "ZONE_COUNT",
		zone: "@AREA1",
		val: 1,
		then: {
			event: "CREATE",
			code: "A1",
			zone: "@AREA1",
		},
		else: {
			event: "CREATE",
			code: "B1",
			zone: "@AREA1",
		}
	});

	expect(engine.refs.AREA1.cards[0].code).toBe("B1");
});

test("Event Def", () => {
	let engine: Engine = new Engine();
	
	engine.loadGame(gameDef); 

	let area1 : Zone = engine.refs.AREA1;
	expect(area1.count()).toBe(0);

	engine.eval({event: "MAKEA1"});
	expect(area1.count()).toBe(1);
})

test("Move all", () => {
	let engine: Engine = new Engine();
	
	engine.loadGame(gameDef); 

	let area1 : Zone = engine.refs.AREA1;
	let area2 : Zone = engine.refs.AREA2;

	engine.eval({event: "MAKEA1"});
	engine.eval({event: "MAKEA1"});
	expect(area1.count()).toBe(2);

	engine.eval({
		event : "MOVE_ALL",
		from: "@AREA1",
		to : "@AREA2"
	}); 

	expect(area2.count()).toBe(2);
});


test ("Set Ref", () => {
	let engine : Engine = new Engine();

	engine.eval({
		event : "SET",
		ref : "TESTVAL",
		val : 44
	});

	expect(engine.refs.TESTVAL).toBe(44);
});


test ("Validate", () => {
	let engine : Engine = new Engine(); 
	engine.loadGame(gameDef);

	engine.eval({event : "MAKEA1"})[0];

	engine.eval({
		event : "SET",
		ref: "TEST",
		val : 1
	})

	expect(() => engine.eval({
		event : "VALIDATE",
		type: "COMPARE_VALS",
		op : "EQ",
		val1 : "@TEST",
		val2 : 2,
		errorMsg : "Custom"
	})).toThrowError("Custom");
});

test("Validate Update", () => {
	let engine: Engine = new Engine();   

	let area1: Zone = engine.newZone();
	engine.refs.AREA1 = area1;

	let area2: Zone = engine.newZone();
	engine.refs.AREA2 = area2;

	let card: Card = new Card({ a: 1 });
	area1.addCard(card);
	
	let event = {
		event : "SEQUENCE",
		events : [
			{
				event : "VALIDATE",
				type : "COMPARE_VALS",
				op : "GT",
				va1 : "@this.a",
				val2 : 5,
				errorMsg: "a val should be greater than 5",
			},
			{
				event : "MOVE",
				card : "@this",
				from : "@AREA1",
				to : "@AREA2"
			}
		]
	}

	let testfn = () => engine.eval(event, {this:card});

	expect(testfn).toThrowError("5");
});


test("Validate Update Pass", () => {
	let engine: Engine = new Engine();   

	let area1: Zone = engine.newZone();
	engine.refs.AREA1 = area1;

	let area2: Zone = engine.newZone();
	engine.refs.AREA2 = area2;

	let card: Card = new Card({ a: 6});
	area1.addCard(card);
	
	let event = {
		event : "SEQUENCE",
		events : [
			{
				event : "VALIDATE",
				type : "COMPARE_VALS",
				op : "GT",
				val1 : "@this.a",
				val2 : 5,
				errorMsg: "a val should be greater than 5",
			},
			{
				event : "MOVE",
				card : "@this",
				from : "@AREA1",
				to : "@AREA2"
			}
		]
	}

	engine.eval(event, {this: card});

	expect(engine.refs.AREA2.count()).toBe(1);
});

test("Common Functions", () => {
	let engine: Engine = new Engine(); 

	engine.loadGame(gameDef);

	engine.eval({event: "MAKEA1"});
	engine.eval({event: "MAKEA2"});

	engine.eval({
		event: "VALIDATE",
		type: "COMPARE_VALS",
		op : "EQ",
		val1 : {op : "DIFF", val1 : "@A2.a", val2 : "@A1.a"},
		val2 : 1
	})	
});
