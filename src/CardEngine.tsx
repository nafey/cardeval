

export interface Card {
    [key: string]: any;
}

interface Rule {
    ruleType: string
    ruleCode: (...args: any[]) => boolean
}

interface CardChoice {
    zone: string,
    by: string,
    at: string | number
}

interface State {
	rules : Rule[],
	cardChoice: CardChoice,
	zoneChoice: string,
	zones: {
		[key:string]: Card[]
	}
}

interface Message {
	

    action : string,
    [key: string]: any;
}

export interface Context {
	[key:string]: any
}

export class CardEngine {
	state: State = {
		rules : [],
		cardChoice: {
			zone: "",
			by: "",
			at: 0
		},
		zoneChoice: "",
		zones: {}
	}
    

    getContext = (): Context => {
        let c = {
            getTopCard : (z:string): Card => {
                let zone = this.getZone(z);
                let card = zone[zone.length - 1]
                
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
        let newZone : Card[] = []
        this.setZone(z, newZone)
    }

    getZone = (z: string) : Card[] => {
        return this.state.zones[z] 
    }

    setZone = (z: string, zone : Card[]) => {
        this.state.zones = {
            ...this.state.zones,
            [z]: zone
        }
    }

    addCard = (z : string, card: Card) => {
        this.setZone(z, [...this.getZone(z), card])
    }

    setCardChoice = (c: CardChoice) => {
        this.state.cardChoice = c;
    }

    chooseZone = (z: string) => {
        this.state.zoneChoice = z;
    }

    getChosenCard = () : Card => {
		if (!this.state.cardChoice) return {};

        let by : string = this.state.cardChoice.by
        let z : string = this.state.cardChoice.zone
        let at : string | number  = this.state.cardChoice.at

        let zone : Card[] = this.getZone(z)
        if (!zone.length ) throw Error ("Choosing Card in Empty Zone")

        if (by === "REL_POS"){
            if (at === "LAST") {
                return zone[zone.length - 1]
            }
            else if (at === "FIRST") {
                return zone[0]
            }
        }

        throw Error("No Chosen Card")
    }

    moveCard = () => {
        let c : Card = this.getChosenCard()
        let moveRules : Rule[] = this.getApplicableRules("MOVE_CHECK")
        let clean : boolean = true

        moveRules.forEach((mr : Rule) => {
            let verdict : boolean = mr.ruleCode(c, this.state.cardChoice.zone, this.state.zoneChoice, this.getContext())
            if (!verdict ) clean = false
        })

        if (!clean) throw Error("You cannot move that card to the chosen location")


        let criteria : CardChoice = this.state.cardChoice;
        if (criteria.by === "REL_POS") {
            
            let zoneOfCardToMove : Card[] = this.getZone(criteria.zone)
            let zoneToMoveTo: Card[] = this.getZone(this.state.zoneChoice)
            if (criteria.at === "TOP") {
                let cMove : Card = zoneOfCardToMove.pop() as Card
                zoneToMoveTo.push(cMove)
            }
        }
    }
    
    message = (msg: Message) => {
        if (Array.isArray(msg)) {
            msg.forEach(m => {
                this.message(m)
            });
            return;
        }

        if (msg.action === "ADD_ZONE") {
            this.addZone(msg.zone)   
        }
        else if (msg.action === "ADD_RULE") {
            this.addRule(msg.rule)
        }
        else if (msg.action === "ADD_CARD") {
            this.addCard(msg.zone, msg.card)
        }
        else if (msg.action === "CHOOSE_CARD") {
            this.setCardChoice(msg.criteria)
        }
        else if (msg.action === "CHOOSE_ZONE") {
            this.chooseZone(msg.zone)
        }
        else if (msg.action === "MOVE_CARD") {
            this.moveCard()
        }
		else if (msg.action === "PRINT") {
			this.print()
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

