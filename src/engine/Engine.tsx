import Card from "./Card";
import Context from "./Context";
import Zone from "./Zone";

export interface Event {
	event : string,
	[key: string] : any
}

export interface Trigger {
	on : string,
	match : any,
	do : Event,
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


	// triggerListeners = (e : Event, raiser?: Card) => {
	// 	logParams("triggerListeners", ["eventType"], [e.event]);
	// 	this.zones.forEach((z : Zone) => {
	// 		z.triggerListenersInZone(e, raiser, this.eval);
	// 	})	
	// }

	// triggerListeners = ()

	evalZone = () => {

	}

	evalCardId = () => {

	}


	hydrate = (card : Card, obj : Record<string, any>) : Record<string, any> => {
		console.debug(">>>>>>>>>> 5");
		let keys : string[] = Object.keys(obj);		
		let ret : Record<string, any> = {};
		keys.forEach((key : string) => {
			if (key === "zone") {
				console.debug("Zone parsing");	
			}
			let val : any = obj[key];	
			if (typeof val === "object") {
				ret[key] = this.hydrate(card, val);
			}	
			else if (typeof val === "string" && val.startsWith("@")) {
				ret[key] = card.eval(val.substring(1));
			}
			else {
				ret[key] = val;
			}
		})	

		return ret;
	}

	triggerCard = (source : Card, target : Card, e : Event) => {
		if (target?.trigger?.on !== e.event) return; 		

		let trigger : Trigger = this.hydrate(target, target.trigger) as Trigger;

		if (trigger?.match && !source!.match(trigger.match)) return;

		console.debug(">>>>>>>>>>> 4");
		this.eval(trigger.do, target);	
	}

	eval = (e : Event, raiser? : Card) => {
		logParams("eval", ["eventType"], [e.event]);
		console.debug(">>>>>>>>>>>> 1");
		let evalVals = (val : string) => {
			if (val.length < 1) throw new Error("Val string is empty");
			if (val.charAt(0) === "@") {
				if (!raiser) throw new Error("Event initiator is not provided");
				if (val.startsWith("@this")) {
					return raiser.eval(val.substring(1));
				}
				else {
					console.debug("Other vals not implemented");
				}
			}

			return val;
		}

		let eventTarget : Card;

		console.debug(">>>>>>>>>> 2");

		if (e.event === "UPDATE") {
			let cardId : string = evalVals(e.cardId);
			let card : Card = this.findCard(cardId);	
			card.update(e.update);
			eventTarget = card;
		}
		else if (e.event === "CREATE") {
			let card : Card = this.createCardFromList(e.code);	
			let zoneId : string = evalVals(e.zoneId);
			let zone : Zone = this.getZoneById(zoneId);

			eventTarget = zone.addCard(card);
		}
		else if (e.event === "DELETE") {
			let cardId : string = evalVals(e.cardId);
			let zone : Zone = this.findCardZone(cardId);

			eventTarget = zone.take(cardId);
		}

		this.zones.forEach((z : Zone) => {
			z.getArr().forEach((c : Card) => {
				this.triggerCard(eventTarget, c, e);
			})
		});
	}
}