import Card from "./Card";
import Context from "./Context";
import Zone from "./Zone";
import { logParams } from "./Logger";
import Parser from "./Parser";

export interface Event {
	event : string,
	[key: string] : any
}

export interface Trigger {
	on : string,
	do : Event,
	[key: string] : any
}

export type Refs = Record<string, any>;

export type Handler = (e : Event) => Event;

export default class Engine  {
	
	private zones: Zone[] = []; 

	private players: Context[] = [];

	private activePlayer : number = 0;

	private cardList: Record<string, any> = {}; 

	private eventDefs: Record<string, Event> = {}

	refs: Record<string, any> = {};


	newPlayer = () : Context => {
		let p : Context = new Context();
		this.players.push(p);
		return p;
	}

    newZone = () : Zone => {
    	let z : Zone = new Zone();
    	this.zones.push(z);
    	return z;		
    }

    getActivePlayer = () : Context => {
    	return this.players[this.activePlayer];
    }

    getNextPlayer = () : Context => {
    	return this.players[(this.activePlayer + 1) % this.players.length];
    }

    nextPlayerTurn = () => {
    	this.activePlayer = (this.activePlayer + 1) % this.players.length;
    }

    getPlayers = () : Context[] => {
    	return this.players;
    }

	getPlayerById = (playerId: string) : Context => {
		let idx = -1;
		this.players.forEach((p:Context, i: number) => {
			if (p.playerId === playerId ) { 
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


	getZoneById = (zoneId: string) : Zone => {
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

    addCard = (zoneId : string, card: Card) => {
		let z : Zone = this.getZoneById(zoneId)!
        z.addCard(card);
    }

	addCards = (z: string, cards: Card[]) => {
		cards.forEach((c) => this.addCard(z, c));
	}

	addToList = (code: string, listCard : any) => {
		this.cardList[code] = listCard;
	}

	createCardFromList = (code : string) : Card => {
		if (!this.cardList[code]) throw new Error("Invalid Code for card");
		return new Card (this.cardList[code]);
	}

	moveCards = (fromZoneId: string, cardId: string, toZoneId: string, count: number = -1) : Card[]=> {
		logParams("moveCards", ["fromZoneId", "cardId", "toZoneId"], [fromZoneId, cardId, toZoneId]);
		let from : Zone = this.getZoneById(fromZoneId);
		let to : Zone = this.getZoneById(toZoneId);

		let idx : number = from.getIndex(cardId); 
		if (idx === -1) return [];


		let carr : Card[] = from.takeCards(idx, count);
		return to.addMany(carr);
	}

	moveCard = (fromZone: string, cardId: string, toZone: string) => {
		return this.moveCards(fromZone, cardId, toZone, 1);
	}
	
	findCardZone = (cardId : string) : Zone => {
		for (let i = 0; i < this.zones.length; i++) {
			let c : Card = this.zones[i].getById(cardId);
			if (c) {
				return this.zones[i];
			} 
		}

		throw new Error("Card Id not found");

	}

	findCard = (cardId : string) : Card => {
		let z : Zone = this.findCardZone(cardId);
		if (z) return z.getById(cardId);

		throw new Error("Card Id is invalid");
	}


	triggerCard = (e: Event, source : Card, target : Card) => {
		if (target?.trigger?.on !== e.event) return;	

		logParams("triggerCard", ["eventName"], [e.event]);
		let parser : Parser = new Parser(this.makeCardRefs(target));
		let trigger : Trigger = parser.parseTrigger(target.trigger);

		if (trigger?.match && !source!.match(trigger.match)) return;

		if (trigger?.onSelf) {
			if (trigger.onSelf === "SKIP" && source === target) return;
		}

		this.evalOnCard(target, target.trigger.do);
	}

	mergeRefs = (r1? : Refs, r2? : Refs) : Refs => {
		logParams("mergeRefs");
		let ret : Refs = {};
		r1 = r1 ? r1 : {};
		r2 = r2 ? r2 : {};	

		Object.keys(r2).forEach((k: string) => {if(typeof r2![k] !== "function") ret[k] = r2![k]});
		Object.keys(r1).forEach((k: string) => {if(typeof r1![k] !== "function") ret[k] = r1![k]});

		return ret;
	}

	makeZoneRefs = (z : Zone) : Refs => {
		return this.mergeRefs(z.refs, this.refs);
	}

	makeCardRefs = (c : Card) : Refs => {
		logParams("makeCardRefs");

		let zRefs : Refs = c.zone ? this.makeZoneRefs(c.zone) : this.refs; 
		let ret : Refs = this.mergeRefs(c.refs, zRefs);

		return ret;
	}
	// evalCustomEvent = (customEvent : Event) : Card[] => {
	// 	let eventName : string = customEvent.event;	

	// }

	evalMove = (e: Event) : Card[] => {
		logParams("evalMove");
		let from : Zone = e.from;	
		let to : Zone = e.to;	
		let card: Card = e.card;

		return this.moveCards(from.zoneId, card.cardId, to.zoneId);
	}

	evalDelete = (e: Event) : Card[] => {
		logParams("evalDelete");
		let card : Card = e.card;
		let zone : Zone = card.zone!;

		return [zone.take(card.cardId)];
	}

	evalCreate = (e: Event) : Card[] => {
		logParams("evalCreate");
		let ret: Card[] = []
		let zone : Zone = e.zone;
		let card : Card = this.createCardFromList(e.code);
		ret.push(zone.addCard(card))
		return ret;
	}

	evalUpdate = (e: Event) : Card[] => {
		logParams("evalUpdate");
		let ret: Card[] = [];

		if (e?.card) {
			let card : Card = e.card;
			card.update(e.update);

			ret.push(card);
		}
		else if (e?.in) {
			let zone : Zone = e.in;

			zone.getArr().forEach((target : Card) => {

				target.update(e.update);
				ret.push(target);
			})	

		}

		return ret;
	}

	eval = (e : Event, refs? : Refs) => {
		logParams("eval", ["eventType"], [e.event]);
		let targets : Card[] = [];

		let parser : Parser = new Parser(this.mergeRefs(refs, this.refs));
		e = parser.parseEvent(e)


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
		else {
			throw new Error("Event type not implemented");
		}

		this.zones.forEach((z : Zone) => {
			z.getArr().forEach((target : Card) => {
				targets.forEach((source: Card) => {
					if (source === target) return;

					this.triggerCard(e, source, target);
				})
			})
		});
	}

	evalOnCard = (c : Card, e : Event) => {
		let refs : Refs = this.makeCardRefs(c);	
		this.eval(e, refs);
	}

	defineEvent = (eventName: string, e : Event) => {
		this.eventDefs[eventName] = e;
	}
}