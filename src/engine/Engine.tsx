import Card from "./Card";
import Context from "./Context";
import Zone from "./Zone";
import { logParams } from "./Logger";
import Parser from "./Parser";

export interface Event {
	event: string,
	[key: string]: any
}

export interface Trigger {
	on: string,
	do: Event,
	[key: string]: any
}

export interface EventDef {
	event : string,
	def? : Event,
	events?: Event[]
}

export interface Func {
	op : string,
	val1 : any,
	val2 : any,
}


export type Dict = Record<string, any>;

export type Handler = (e: Event) => Event;

export default class Engine {
	
	private zones: Zone[] = []; 

	private players: Context[] = [];

	private activePlayer: number = 0;

	private cardList: Record<string, any> = {}; 

	private eventDefs: Record<string, Event> = {}

	refs: Record<string, any> = {};

	newPlayer = (): Context => {
		let p: Context = new Context();
		this.players.push(p);
		return p;
	}

	newZone = (): Zone => {
		let z: Zone = new Zone();
		this.zones.push(z);
		return z;		
	}

	getActivePlayer = (): Context => {
		return this.players[this.activePlayer];
	}

	getNextPlayer = (): Context => {
		return this.players[(this.activePlayer + 1) % this.players.length];
	}

	nextPlayerTurn = () => {
		this.activePlayer = (this.activePlayer + 1) % this.players.length;
	}

	getPlayers = (): Context[] => {
		return this.players;
	}

	getPlayerById = (playerId: string): Context => {
		let idx = -1;
		this.players.forEach((p: Context, i: number) => {
			if (p.playerId === playerId) { 
				idx = i 
			} 
		})

		if (idx > -1) {
			return this.players[idx]
		}

		throw new Error("Not found playerId in state");
	}

	getZones = () => {
		return this.zones;
	}

	loadGame = (gameDef: any) => {

		for (let i = 0; i < gameDef.zones; i++) {
			this.newZone();
		}


		let cardList = gameDef.cardList;

		cardList.forEach((item: Dict) => {
			if (item?.code) this.cardList[item.code] = item;
		})

		let refDefs = gameDef.refs;
		Object.keys(refDefs).forEach((refName: string) => {
			let refDef = refDefs[refName];

			if (refDef.type === "ZONE") {
				this.refs[refName] = this.zones[refDef.index];
			}

		});

		let eventDefs = gameDef.eventDefs;
		eventDefs.forEach((eventDef : EventDef) => {
			if (eventDef?.def) {

				this.eventDefs[eventDef.event] = eventDef.def;	
			}
			else {
				this.eventDefs[eventDef.event] = {
					event : "SEQUENCE",
					events : eventDef.events
				}
			}
		});
	}


	getZoneById = (zoneId: string): Zone => {
		let idx = -1;
		this.zones.forEach((z: Zone, i: number) => {
			if (z.zoneId === zoneId) { 
				idx = i 
			} 
		})

		if (idx >= 0) {
			return this.zones[idx]
		}

		throw new Error("Not found zoneId");
	}

	addCard = (zoneId: string, card: Card) => {
		let z: Zone = this.getZoneById(zoneId)!
		z.addCard(card);
	}

	addCards = (z: string, cards: Card[]) => {
		cards.forEach((c) => this.addCard(z, c));
	}

	addToList = (code: string, listCard: any) => {
		this.cardList[code] = listCard;
	}

	createCardFromList = (code: string): Card => {
		if (!this.cardList[code]) throw new Error("Invalid Code for card");
		return new Card(this.cardList[code]);
	}

	moveCards = (fromZoneId: string, cardId: string, toZoneId: string, count: number = -1): Card[] => {
		logParams("moveCards", ["fromZoneId", "cardId", "toZoneId"], [fromZoneId, cardId, toZoneId]);
		let from: Zone = this.getZoneById(fromZoneId);
		let to: Zone = this.getZoneById(toZoneId);

		let idx: number = from.getIndex(cardId); 
		if (idx === -1) return [];


		let carr: Card[] = from.takeCards(idx, count);
		return to.addMany(carr);
	}

	moveCard = (fromZone: string, cardId: string, toZone: string) => {
		return this.moveCards(fromZone, cardId, toZone, 1);
	}
	
	findCardZone = (cardId: string): Zone => {
		for (let i = 0; i < this.zones.length; i++) {
			let c: Card = this.zones[i].getById(cardId);
			if (c) {
				return this.zones[i];
			} 
		}

		throw new Error("Card Id not found");

	}

	findCard = (cardId: string): Card => {
		let z: Zone = this.findCardZone(cardId);
		if (z) return z.getById(cardId);

		throw new Error("Card Id is invalid");
	}

	triggerCard = (e: Event, target: Card, source?: Card) => {
		if (target === source) return;
		if (target?.trigger?.on !== e.event) return;	

		logParams("triggerCard", ["eventName"], [e.event]);
		let parser: Parser = new Parser(this.makeCardRefs(target));
		let trigger: Trigger = parser.parseTrigger(target.trigger);

		if (trigger?.match && source && !source!.match(trigger.match)) return;

		if (trigger?.ignore && trigger.ignore === target) return;

		if (trigger?.onSelf && source) {
			if (trigger.onSelf === "SKIP" && source === target) return;
		}

		this.eval(target.trigger.do, {this: target});
	}

	mergeRefs = (r1?: Dict, r2?: Dict): Dict => {
		// r1 overwrites r2
		// logParams("mergeRefs");
		let ret: Dict = {};
		r1 = r1 ? r1 : {};
		r2 = r2 ? r2 : {};	

		Object.keys(r2).forEach((k: string) => { if (typeof r2![k] !== "function") ret[k] = r2![k] });
		Object.keys(r1).forEach((k: string) => { if (typeof r1![k] !== "function") ret[k] = r1![k] });

		return ret;
	}

	makeZoneRefs = (z: Zone): Dict => {
		return this.mergeRefs(z.refs, this.refs);
	}

	makeCardRefs = (c: Card): Dict => {
		// logParams("makeCardRefs");

		let zRefs: Dict = c.zone ? this.makeZoneRefs(c.zone) : this.refs; 
		let ret: Dict = this.mergeRefs(c.refs, zRefs);
		ret.this = c;

		return ret;
	}

	makeEventRefs = (e: Event): Dict => {
		let ret: Dict = {};	
		ret["EVENT"] = {}
		Object.keys(e).forEach((k: string) => {
			ret["EVENT"][k] = e[k];
		});
		return ret;
	}


	onReceive = (e: Event, card: Card) => {
		logParams("onReceive", ["eventType"], [e.event]);

		if (!card?.onReceive) return;
		if (e.event !== card?.onReceive?.on) return;

		this.eval(card.onReceive.do, {"this" : card});
	}

	evalMoveAll = (e: Event) : Card[] => {
		logParams("evalMoveAll");	
		let ret : Card[] = [];

		let from : Zone = e.from;
		let to : Zone = e.to;

		from.cards.forEach(() => {
			let card = from.takeFirst();	
			ret.push(card);
			to.push(card);
		});

		return ret;
	}

	evalMove = (e: Event): Card[] => {
		logParams("evalMove");
		let from: Zone = e.from;	
		let to: Zone = e.to;	

		let card!: Card; 
		let moveCount : number = 1;

		if (e?.card) {
			card = e.card;
		}
		else if (e?.after) {
			card = e.after;
			let cardIndex : number = from.getIndex(card.cardId);
			let lastIndex : number = from.count() - 1;

			moveCount = lastIndex - cardIndex + 1;	

		}
		else if (e?.at) {
			if (typeof e.at === "string" && e.at === "TOP") {
				card = from.getArr()[from.getArr().length - 1];
			}
			else if (typeof e.at === "string" && e.at === "BOT") {
				card = from.getArr()[0];
			}
			else if (typeof e.at === "number") {
				card = from.getArr()[e.at];
			}
			else {
				throw new Error("Invalid position for Move");
			}
		}

		return this.moveCards(from.zoneId, card.cardId, to.zoneId, moveCount);
	}

	evalDelete = (e: Event): Card[] => {
		logParams("evalDelete");
		let card: Card = e.card;
		let zone: Zone = card.zone!;

		return [zone.take(card.cardId)];
	}

	evalCreate = (e: Event): Card[] => {
		logParams("evalCreate");
		let ret: Card[] = []
		let zone: Zone = e.zone;
		let card: Card = this.createCardFromList(e.code);

		if (e?.set) {
			let refName : string = e.set;
			this.refs[refName] = card;
		}

		ret.push(zone.addCard(card))
		return ret;
	}

	evalUpdate = (e: Event): Card[] => {
		logParams("evalUpdate");
		let ret: Card[] = [];

		let card: Card = e.card;

		let key : string = e.key;
		let val = e.val;

		if (e?.op === "ADD") {
			card[key] += e.val;
		}
		else if (e?.op === "SUB") {
			card[key] -= e.val;
		}
		else if (e?.op === "NOT") {
			card[key] = !e.val;
		}
		else {
			card[key] = val;
		}
		ret.push(card);

		return ret;
	}

	evalIf = (e: Event) : boolean => {
		logParams("evalIf");
		let isTrue : boolean = true;

		if (e.type === "ZONE_COUNT") {
			let zone : Zone = e.zone;	
			isTrue = (zone.count() === e.val);
		}		
		else if (e.type === "IS_EMPTY") {
			let zone : Zone = e.zone;
			isTrue = (zone.count() === 0);
		}
		else if (e.type === "COMPARE") {
			if (e.op === "EQ") {
				isTrue = (e.val1 === e.val2);
			}
			else if (e.op === "DIFF") {
				isTrue = (e.val1 - e.val2 === e.diff);
			}
			else if (e.op === "SUM") {
				isTrue = (e.val1 + e.val2 === e.sum);
			}
			else if (e.op === "GT") {
				isTrue = (e.val1 > e.val2);
			}
			else if (e.op === "GTE") {
				isTrue = (e.val1 >= e.val2);
			}
			else if (e.op === "LT") {
				isTrue = (e.val1 < e.val2);
			}
			else if (e.op === "LTE") {
				isTrue = (e.val1 <= e.val2);
			}
			else if (e.op === "IN") {
				console.debug(e);
				isTrue = (e.array.includes(e.val));
			}
			else if (e.op === "NOT_IN") {
				isTrue = !(e.array.includes(e.val));
			}
		}
		else {
			throw new Error ("Not implemented type");
		}

		return isTrue;

		// if (e?.then && isTrue) return this.eval(e.then) 
		// else if (e?.else && !isTrue) return this.eval(e.else);
		// else return [];
	}

	evalForEach = (e: Event, refs? : Dict) : Card[] => {
		logParams("evalForEach");	

		let zone : Zone = e.in;

		zone.cards.forEach((c : Card) => {
			if (e?.skip && c === e.skip) return;

			let nextEvent : Event = {...e.do};

			if (!refs) refs = {};

			refs["each"] = c;
			this.eval(nextEvent, refs);
		});

		return zone.cards;
	}

	evalSet = (e : Event) : Card[] => {
		logParams("evalSet");

		let refName : string = e.ref;
		let val : any = e.val;

		this.refs[refName] = val;

		return [];
	}


	evalCalc = (e : Event) => {
		if (e.op === "SUM") {
			this.refs.calc = e.val1 + e.val2;	
		}		
		else if (e.op === "DIFF") {
			this.refs.calc = e.val1 - e.val2;	
		}
	}

	evalFind = (e : Event) => {
		let zone : Zone = e.in;
		let key : string = e.key;
		let val = e.val;

		if (e?.at === "LAST") {
			this.refs[e.set] = zone.last()
			return;
		}
		else {
			let list : Card[] = [...zone.cards];

			if (e?.dir === "DESC") {
				list = list.reverse();
			}	

			for (let i = 0; i < list.length; i++) {
				let c : Card = list[i];

				if (c[key] === val) {
					if (e?.set) {
						this.refs[e.set] = c;
					}
					else {
						this.refs.found = c;
					}

					return;
				}
				
			}

		}

	}

	evalError = (e : Event) => {
		throw new Error(e.errorMsg);
	}

	eval = (e: Event, refs?: Dict): Card[] => {
		logParams("eval");

		let targets: Card[] = [];

		let parser: Parser = new Parser(this.mergeRefs(refs, this.refs));
		e = parser.parseEvent(e)
		e = e as Event;

		if (e.event === "UPDATE") {
			targets = this.evalUpdate(e);
		}
		else if (e.event === "CREATE") {
			targets = this.evalCreate(e);
		}
		else if (e.event === "DELETE") {
			targets = this.evalDelete(e);
		}
		else if (e.event === "MOVE") {
			targets = this.evalMove(e);
		}
		else if (e.event === "SEQUENCE") {
			logParams("evalSequence");

			let events = e.events;
			events.forEach((i : Event) => {
				targets = targets.concat(this.eval(i, refs));		
			});
		}
		else if (e.event === "SHUFFLE") {
			let zone : Zone = e.zone;	
			zone.shuffle();
		}
		else if (e.event === "REVERSE") {
			let zone : Zone = e.zone;
			zone.reverse();		
		}
		else if (e.event === "MOVE_ALL") {
			targets = this.evalMoveAll(e);
		}
		else if (e.event === "IF") {
			let ret : boolean = this.evalIf(e);
			if (ret) {
				if (e?.then) {
					targets = this.eval(e.then, refs);
				}
				else {
					targets = [];
				}
			}
			else {
				if (e?.else) {
					targets = this.eval(e.else, refs);
				}
				else {
					targets = [];
				}
			}
		}
		else if (e.event === "FOREACH") {
			targets = this.evalForEach(e, refs);	
		}
		else if (e.event === "SET") {
			targets = this.evalSet(e);
		}
		else if (e.event === "CALC") {
			this.evalCalc(e);
		}
		else if (e.event === "FIND") {
			this.evalFind(e);
		}
		else if (e.event === "RAISE_ERROR") {
			this.evalError(e);
		}
		else if (e.event in this.eventDefs) {
			let nextEvent: Event = this.eventDefs[e.event];
			targets = this.eval(nextEvent, this.mergeRefs(this.makeEventRefs(e), refs));
		}
		else {
			throw new Error("Event type not implemented");
		}

		targets.forEach((target: Card) => {
			if (target?.onReceive && target.onReceive.on === e.event) this.onReceive(e, target);
		})

		this.zones.forEach((z: Zone) => {
			z.getArr().forEach((target: Card) => {
				targets.forEach((source: Card) => {
					this.triggerCard(e, target, source);
				})
			})
		});

		return targets;
	}

	defineEvent = (eventName: string, e: Event) => {
		this.eventDefs[eventName] = e;
	} 
	
}