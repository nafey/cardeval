import Card from "./Card";
import Context from "./Context";
import Zone from "./Zone";

export interface Event {
	event : string,
	[key: string] : any
}

export interface Trigger {
	on : string,
	do : Event,
	[key: string] : any
}

let log = (msg: string) => {
	console.debug(msg);
}

let logAll = (args : string[]) => {
	let sep = " ";
	let msg = "";
	for (let i = 0; i < args.length; i++) {
		msg = msg + sep + args[i];
	}
	log(msg);
} 

let logParams = (funcName: string, paramNames: string[] = [], vals: any[] = []) => {
	let args : any[] = [];
	args.push(funcName + "():");

	if (paramNames.length !== vals.length) {
		console.error("Mismatched args size");
	}

	for (let i = 0; i < paramNames.length; i++) {
		args.push(paramNames[i]);
		args.push("-");
		args.push(vals[i]);
		args.push("|");
	}

	logAll(args);

}

export type Handler = (e : Event) => Event;

export default class Engine  {
	
	private zones: Zone[] = []; 

	private players: Context[] = [];

	private activePlayer : number = 0;

	private cardList: Record<string, any> = {}; 

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

	moveCards = (fromZoneId: string, cardId: string, toZoneId: string, count: number = -1) => {
		let from : Zone = this.getZoneById(fromZoneId);
		let to : Zone = this.getZoneById(toZoneId);

		let idx : number = from.getIndex(cardId); 
		if (idx === -1) return;

		let carr : Card[] = from.takeCards(idx, count);
		to.addMany(carr);
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

	evalZone = () => {

	}

	evalCardId = () => {

	}

	readRefs = (lookup : string, refs : Record<string, any>) : any => {
		if (!lookup.startsWith("@")) throw new Error("Invalid lookup string for refs");

		if (lookup === "@this.zone") return refs["this"].zone;
		return refs[lookup.substring(1)];
	}

	parseCard = (obj : any, refs: Record<string, any>) : Card => {

	}

	hydrateEvent = (event : Event, refs : Record<string, any>) : Event => {
		logParams("hydrateEvent", ["event"], [event.event]);
		if (!event?.event) throw new Error("Missing event name on Event obj");
		let ret : Event = {
			event : event.event
		}		

		if (event?.card) {
			ret.card = this.readRefs(event.card, refs) as Card;
		}

		if (event?.zone) {
			ret.zone = this.readRefs(event.zone, refs) as Zone;
		}

		if (event?.update) {
			ret.update = event.update;
		}

		if (event?.code) {
			ret.code = event.code;
		}

		return ret;
	}

	hydrateTrigger = (trigger : Trigger, refs : Record<string, any>) : Trigger => {
		logParams("hydrateTrigger", ["trigger"], [trigger.on]);
		if (!trigger?.on) throw new Error("Missing event trigger name");
		if (!trigger?.do) throw new Error("Missing do event trigger");

		let doEvent : Event = this.hydrateEvent(trigger.do, refs);		

		let ret : Trigger = {
			on : trigger.on,
			do : doEvent
		}

		if (trigger?.zone) {
			ret.zone = this.readRefs(trigger.zone, refs) as Zone;
		}		

		if (trigger?.onSelf) ret.onSelf = trigger.onSelf;

		return ret;
	}
	
	getRefs = (card?: Card) : Record<string, any> => {

		let ret : Record<string, any> = {};
		let crefs : Record<string, any> = card ? card.refs : {};
		let zrefs : Record<string, any> = card?.zone?.refs ? card.zone.refs : {};
		let grefs : Record<string, any> = this.refs;
		Object.keys(grefs).forEach((k : string) => {
			ret[k] = grefs[k];
		});

		Object.keys(zrefs).forEach((k : string) => {
			ret[k] = zrefs[k];
		});

		Object.keys(crefs).forEach((k : string) => {
			ret[k] = crefs[k];
		});

		return ret;
	}


	triggerCard = (source : Card, target : Card, e : Event) => {
		if (target?.trigger?.on !== e.event) return;	

		logParams("triggerCard", ["eventName"], [e.event]);

		let trigger : Trigger = this.hydrateTrigger(target.trigger, this.getRefs(target)); 

		if (trigger?.match && !source!.match(trigger.match)) return;

		if (trigger?.onSelf) {
			if (trigger.onSelf === "SKIP" && source === target) return;
		}

		this.eval(target?.trigger?.do, target);	
	}

	eval = (e : Event, raiser? : Card) => {
		logParams("eval", ["eventType"], [e.event]);

		let eventTarget : Card;

		let refs : Record<string, any> = this.getRefs(raiser!);
		e = this.hydrateEvent(e, refs);

		if (e.event === "UPDATE") {
			let card : Card = e.card;
			card.update(e.update);

			eventTarget = card;
		}
		else if (e.event === "CREATE") {
			let zone : Zone = e.zone;
			let card : Card = this.createCardFromList(e.code);

			eventTarget = zone.addCard(card);
		}
		else if (e.event === "DELETE") {
			let card : Card = e.card;
			let zone : Zone = card.zone!;

			eventTarget = zone.take(card.cardId);
		}

		this.zones.forEach((z : Zone) => {
			z.getArr().forEach((c : Card) => {
				this.triggerCard(eventTarget, c, e);
			})
		});
	}
}