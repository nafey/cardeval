import Card from "./Card";
import Player from "./Player";
import Zone from "./Zone";

export default class GameState  {
	
	constructor () {
		this.players["DEFAULT"] = new Player("DEFAULT", this);
	}

	zones: Record<string, Zone> = {}

	players: Record<string, Player> = {}

	addPlayer = (name: string) => {
		this.players[name] = new Player(name, this);
	}

    addZone = (z: string, playerName? : string) => {
        let newZone : Zone = new Zone(z)
		if (playerName) {
			newZone.owner = playerName;
		}
		else {
			newZone.owner = this.getPlayer().name;
		}

        this.setZone(z, newZone)
    }

	addZones = (zones : string[]) => {
		zones.forEach((z) => this.addZone(z));
	}

    getZone = (z: string) : Zone => {
        return this.zones[z] 
    }

    setZone = (z: string, zone : Zone) => {
        this.zones = {
            ...this.zones,
            [z]: zone
        }
    }

    addCard = (z : string, card: Card) => {
        this.getZone(z).add(card);
    }

	addCards = (z: string, cards: Card[]) => {
		cards.forEach((c) => this.addCard(z, c));
	}

	moveCards = (fromZone: string, atPos: number, toZone: string, count: number = -1) => {
		let carr = this.getZone(fromZone).takeCards(atPos, count);
		this.getZone(toZone).addMany(carr);
	}

	moveCard = (fromZone: string, atPos: number, toZone: string) => {
		return this.moveCards(fromZone, atPos, toZone, 1);
	}

	getPlayer = (playerName? : string) => {
		if (playerName) {
			return this.players[playerName]
		}
		else {
			return this.players[Object.keys(this.players)[0]]
		}
	}

}