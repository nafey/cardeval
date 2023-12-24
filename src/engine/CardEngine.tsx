import { State, Card, Rule, CardChoice, Context } from "./Interfaces";
import Zone from "./Zone";

export class CardEngine {
	state: State = {
		rules : [],
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

    addRule = (r: Rule) => {
        this.state.rules.push(r)
    }
    
    getApplicableRules = (ruleType: string) => {
        return this.state.rules.filter((rule: Rule) => rule.ruleType === ruleType)
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
		let moveRules : Rule[] = this.getApplicableRules("MOVE_CHECK")
		let clean : boolean = true

		moveRules.forEach((mr : Rule) => {
            let verdict : boolean = mr.ruleCode(c, cardChoice.zone, zoneChoice, this.getContext())
            if (!verdict ) clean = false
        })

        if (!clean) throw Error("You cannot move that card to the chosen location")


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
    
    print = (z = "") => {
        if (z) {
            console.log(this.getZone(z))
        }
        else{
            console.log(this.state)
        }
    }

}

