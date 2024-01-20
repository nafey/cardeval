import Card, { Modifier } from "./Card";
import Player from "./Player";
import Zone from "./Zone";


// export interface CreateEvent {
// 	event : "CREATE",
// 	zoneId : string,
// 	code : string,
// 	[key: string] : any
// }

// export interface UpdateEvent {
// 	event : "UPDATE",
// 	cardId?: string,
// 	modifier?: Modifier,
// 	[key: string] : any
// }

export interface Event {
	event : string,
	[key: string] : any
}

// export type Event = UpdateEvent | CreateEvent;

export type Handler = (e : Event) => Event;

export default class Engine  {
	
	private zones: Zone[] = []; 

	private players: Player[] = [];

	private activePlayer : number = 0;

	private cardList: Record<string, any> = {}; 

	newPlayer = () : Player => {
		let p : Player = new Player();
		this.players.push(p);
		return p;
	}

    newZone = () : Zone => {
    	let z : Zone = new Zone();
    	this.zones.push(z);
    	return z;		
    }

    getActivePlayer = () : Player => {
    	return this.players[this.activePlayer];
    }

    getNextPlayer = () : Player => {
    	return this.players[(this.activePlayer + 1) % this.players.length];
    }

    nextPlayerTurn = () => {
    	this.activePlayer = (this.activePlayer + 1) % this.players.length;
    }

    getPlayers = () : Player[] => {
    	return this.players;
    }

	getPlayerById = (playerId: string) : Player => {
		let idx = -1;
		this.players.forEach((p:Player, i: number) => {
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
			let c : Card = this.zones[i].findCardById(cardId);
			if (c) {
				return this.zones[i];
			} 
		}

		throw new Error("Card Id not found");

	}

	findCard = (cardId : string) : Card => {
		for (let i = 0; i < this.zones.length; i++) {
			let c : Card = this.zones[i].findCardById(cardId);
			if (c) return c;
		}

		throw new Error("Card Id is invalid");
	}

	eval = (e : Event) => {
		if (e.event === "UPDATE") {
			// e as UpdateEvent;
			let card : Card = this.findCard(e.cardId!);	
			card.update(e.update);
		}
		else if (e.event === "CREATE") {
			let card : Card = this.createCardFromList(e.code);	
			let zone : Zone = this.getZoneById(e.zoneId);

			zone.addCard(card);
		}

	}
}