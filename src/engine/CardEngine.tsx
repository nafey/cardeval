import { State, Card, Context, MoveCheckRule } from "./Interfaces";
import Zone from "./Zone";

export class CardEngine {
	state: State = {
		moveCheckRules : [],
		zones: {}
	}
    
    getContext = (): Context => {
        let c = {
            getLastCard : (z:string): Card => {
                let zone = this.getZone(z);
                let card = zone.last()
                
                return card;
            }
        }
                 
        return c;
    }

    addMoveCheckRule = (r: MoveCheckRule) => {
        this.state.moveCheckRules.push(r)
    }

	getMoveCheckRules = () : MoveCheckRule[] => {
		return this.state.moveCheckRules;
	}

    addZone = (z: string) => {
        let newZone : Zone = new Zone(z)
        this.setZone(z, newZone)
    }

	addZones = (zones : string[]) => {
		zones.forEach((z) => this.addZone(z))
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
        this.getZone(z).add(card)
    }

	addCards = (z: string, cards: Card[]) => {
		cards.forEach((c) => this.addCard(z, c));
	}

	moveCards = (fromZone: string, atPos: number, toZone: string, count: number = -1) => {
		let moveRules : MoveCheckRule[] = this.getMoveCheckRules()
		let c = this.getZone(fromZone).at(atPos)
		console.log(">>>>>>>>>> Here")
		console.log(c)
		let legal : boolean = true

		moveRules.forEach((mr : MoveCheckRule) => {
            let verdict : boolean = mr.rule(c, this.getZone(fromZone), this.getZone(toZone), this.getContext())
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

}

