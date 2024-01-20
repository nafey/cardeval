import Card, { Modifier } from "./Card";
import Player from "./Player";
import Zone from "./Zone";



export interface Event {
	event : string,
	cardId?: string,
	modifier?: Modifier,
	[key: string] : any
}

export type Handler = (e : Event) => Event;

export default class Engine  {
	
	private zones: Zone[] = []; 

	private players: Player[] = [];

	private activePlayer : number = 0;

	private handlers: Handler[] = [];

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
	

	findCard = (cardId : string) : Card => {
		for (let i = 0; i < this.zones.length; i++) {
			let c : Card = this.zones[i].findCardById(cardId);
			if (c) return c;
		}

		throw new Error("Card Id is invalid");
	}

	eval = (e : Event) => {
		if (e.event === "MODIFY") {

			let card : Card = this.findCard(e.cardId!);	

			card.modify(e.modifier!);

		}
	}
}