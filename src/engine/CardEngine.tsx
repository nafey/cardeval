import { State, Card, Action, ActionHandler } from "./Interfaces";
import Player from "./Player";
import Zone from "./Zone";

export class CardEngine {
	
	actions : Action[] = [];
	actionHandlers : Record<string, ActionHandler> = {};
	
	state: State = {
		zones: {},
		players: {}
	}

	constructor (playerName: string = "DEFAULT") {
		this.state.players[playerName] = new Player(playerName, this);
	}

	pushAction = (action: Action) => {
		this.actions.push(action);
		this.nextAction();
	}

	nextAction = () => {
		if (this.actions.length === 0) return

		const a : Action = this.actions.pop()!;
		this.eval(a);
		this.nextAction();
	}

	eval = (action : Action) => {
		const actionName = action[0];
		const handler = this.actionHandlers[actionName];
		handler(action[1], this);
	}

	addHandler = (actionName : string, handler: ActionHandler) => {
		this.actionHandlers[actionName] = handler;
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
			return this.state.players[playerName]
		}
		else {
			return this.state.players[Object.keys(this.state.players)[0]]
		}
	}

}

