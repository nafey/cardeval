import { State, Card, CardChoice, Context, MoveCheckRule } from "./Interfaces";
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

	getChosenCard = (cardChoice: CardChoice) : Card => {
		if (!cardChoice) return {};

        let by : string = cardChoice.by
        let z : string = cardChoice.zone
        let at : string | number = cardChoice.at

        let zone : Zone = this.getZone(z)
        if (!zone.size() ) throw Error ("Choosing Card in Empty Zone")

        if (by === "REL_POS"){
            if (at === "LAST") {
                return zone.last()
            }
            else if (at === "FIRST") {
                return zone.first()
            }
        }

        throw Error("No Chosen Card")
    }

	moveCard = (cardChoice: CardChoice, zoneChoice: string) => {
		let c: Card = this.getChosenCard(cardChoice)
		let moveRules : MoveCheckRule[] = this.getMoveCheckRules()
		let legal : boolean = true

		moveRules.forEach((mr : MoveCheckRule) => {
            let verdict : boolean = mr.rule(c, this.getZone(cardChoice.zone), this.getZone(zoneChoice), this.getContext())
            if (!verdict ) legal = false
        })

        if (!legal) {
			console.log("You cannot move that card to the chosen location")
			return;
		}


        let criteria : CardChoice = cardChoice;
        if (criteria.by === "REL_POS") {
            
            let zoneOfCardToMove : Zone = this.getZone(criteria.zone)
            let zoneToMoveTo: Zone = this.getZone(zoneChoice)
            if (criteria.at === "FIRST") {
                let cMove : Card = zoneOfCardToMove.takeLast() as Card
                zoneToMoveTo.add(cMove)
            }
        }
	}

	moveStack = (fromZone: string, atPos: number, toZone: string) => {
		let moveRules : MoveCheckRule[] = this.getMoveCheckRules()
		let c = this.getZone(fromZone).at(atPos)
		let legal : boolean = true

		moveRules.forEach((mr : MoveCheckRule) => {
            let verdict : boolean = mr.rule(c, this.getZone(fromZone), this.getZone(toZone), this.getContext())
            if (!verdict ) legal = false
        })

        if (!legal) {
			console.log("You cannot move that card to the chosen location")
			return;
		}

		let carr = this.getZone(fromZone).takeStackFrom(atPos)
		this.getZone(toZone).addMany(carr)
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

