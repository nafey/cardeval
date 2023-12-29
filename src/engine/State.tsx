import Card from "./Card";
import Player from "./Player";
import Zone from "./Zone";

export default class State  {
	
	zones: Record<string, Zone> = {}

	players: Player[] = []

	addPlayer = (name: string = "") => {

		let p = new Player(name, this);
		this.players.push(p) 
	}

    addZone = (z: string, playerId?: string) => {
        let newZone : Zone = new Zone(z)
		if (playerId) {
			newZone.playerId = playerId;
		}

        this.setZone(z, newZone)
    }

	addZones = (zones : string[]) => {
		zones.forEach((z) => this.addZone(z));
	}

	getPlayerById = (playerId: string) : Player | undefined => {
		let ret;
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
    getZone = (z: string) : Zone => {
        return this.zones[z] 
    }

	getZoneArray = () : Zone[] => {
		let ret: Zone[] = [];	
		let zoneNames : string[] = Object.keys(this.zones);

		zoneNames.forEach((k: string) => {
			ret.push(this.getZone(k));
		});

		return ret;
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

}