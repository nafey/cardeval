import { State, Card, MoveCheckRule } from "./Interfaces";
import Player from "./Player";
import Zone from "./Zone";

export class CardEngine {
	state: State = {
		moveCheckRules : [],
		zones: {},
		players: {}
	}

	constructor (playerName: string = "DEFAULT") {
		this.state.players[playerName] = new Player(playerName, this);
	}
    
    addMoveCheckRule = (r: MoveCheckRule) => {
        this.state.moveCheckRules.push(r)
    }

	getMoveCheckRules = () : MoveCheckRule[] => {
		return this.state.moveCheckRules;
	}

	addPlayer = (name: string) => {
		this.state.players[name] = new Player(name, this);
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
        return this.state.zones[z] 
    }

    setZone = (z: string, zone : Zone) => {
        this.state.zones = {
            ...this.state.zones,
            [z]: zone
        }
    }



    addCard = (z : string, card: Card) => {
		if (!("visible" in card)){
			card.visible = true;
		}
        this.getZone(z).add(card)
    }

	addCards = (z: string, cards: Card[]) => {
		cards.forEach((c) => this.addCard(z, c));
	}

	moveCards = (fromZone: string, atPos: number, toZone: string, count: number = -1) => {
		let moveRules : MoveCheckRule[] = this.getMoveCheckRules()
		let c = this.getZone(fromZone).at(atPos)
		let legal : boolean = true

		moveRules.forEach((mr : MoveCheckRule) => {
            let verdict : boolean = mr.rule(c, this.getZone(fromZone), this.getZone(toZone))
            if (!verdict ) legal = false
        })

        if (!legal) {
			console.log("You cannot move that card to the chosen location")
			return;
		}

		let carr = this.getZone(fromZone).takeCards(atPos, count) // TODO: move to takeStackFrom(atPos, count)
		this.getZone(toZone).addMany(carr)
	}

	moveCard = (fromZone: string, atPos: number, toZone: string) => {
		return this.moveCards(fromZone, atPos, toZone, 1);
	}

	moveCardRel = (fromZone: string, relPos: string, toZone: string) => {
		if (relPos === "FIRST") {
			return this.moveCard(fromZone, 0, toZone);
		}
		else if (relPos === "LAST") {
			let size = this.getZone(fromZone).size();
			return this.moveCard(fromZone, size - 1, toZone);
		}
		else {
			console.log("Relative Position not recognized")
		}
	}
    
    print = (z = "") => {
        if (z) {
            console.log(this.getZone(z))
        }
        else{
            console.log(this.state)
        }
    }

	getPlayer = (playerName? : string) => {
		if (playerName) {
			return this.state.players[playerName]
		}
		else {
			return this.state.players[Object.keys(this.state.players)[0]]
		}
	}

}

