import Card from "./Card";
import Player from "./Player";
import Zone from "./Zone";

export default class State  {
	
	private zones: Zone[] = [] 

	private players: Player[] = []


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

    getPlayers = () : Player[] => {
    	return this.players;
    }

	getPlayerById = (playerId: string) : Player | undefined => {
		let ret : Player | undefined;
		let idx = -1;
		this.players.forEach((p:Player, i: number) => {
			if (p.playerId === playerId ) { 
				idx = i 
			} 
		})

		if (idx) {
			return this.players[idx]
		}
		return ret; 

	}

	getZones = () => {
		return this.zones;
	}


	getZoneById = (zoneId: string) : Zone | undefined => {

		let ret : Zone | undefined;
		let idx = -1;
		this.zones.forEach((z: Zone, i: number) => {
			if (z.zoneId === zoneId) { 
				idx = i 
			} 
		})

		if (idx >= 0) {
			return this.zones[idx]
		}
		return ret; 
	}

    addCard = (zoneId : string, card: Card) => {
		let z : Zone = this.getZoneById(zoneId)!
        z.addCard(card);
    }

	addCards = (z: string, cards: Card[]) => {
		cards.forEach((c) => this.addCard(z, c));
	}

	moveCards = (fromZoneId: string, cardId: string, toZoneId: string, count: number = -1) => {
		let from : Zone = this.getZoneById(fromZoneId)!;
		let to : Zone = this.getZoneById(toZoneId)!;

		let idx : number = from.getIndex(cardId); 
		if (idx === -1) return;

		let carr : Card[] = from.takeCards(idx, count);
		to.addMany(carr);
	}

	moveCard = (fromZone: string, cardId: string, toZone: string) => {
		return this.moveCards(fromZone, cardId, toZone, 1);
	}


	getView = () : Record<string, string[]> => {
		let v : Record<string, string[]> = {}

		for (let i = 0; i < this.zones.length; i++) {
			let zone: Zone = this.zones[i];
			
			v[zone.zoneId] = zone.getZoneView();
		}

		return v;
	}
 }