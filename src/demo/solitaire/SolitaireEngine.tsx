import Card from "src/engine/Card";
import Player from "src/engine/Player";
import State from "src/engine/State";
import Zone from "src/engine/Zone";


export class SolitaireCard extends Card {
	toString = () : string => {
		return this.num + this.suit; 
	}
}


class SolitaireEngine  {

	private state : State = new State()

	constructor() {
		let p : Player = this.state.newPlayer();
		(["T1", "T2", "T3", "T4", "T5", "T6", "T7", "FH", "FD", "FC", "FS", "S", "W"]).forEach((s: string) => {
			let z = this.state.newZone() 
			p.setZone(s, z);
		})
	}

	getState = () => {
		return this.state;
	}

	getPlayer = () => {
		return this.state.getPlayers()[0];
	}

	flipHandler = (zoneName: string) => {		
		console.log("flipHandler")
		let p : Player = this.getPlayer();
		const zone : Zone = p.getZone(zoneName) ;
		if (zone.size() === 0) return;
		if (!zone.last().visible) zone.flip(zone.size() - 1);
	}


	moveHandler = (fromZoneName: string, toZoneName: string) => {	
		let p: Player = this.getPlayer();
		const validFroms : string[] = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "W"];
		const validTos: string[] = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "FH", "FD", "FC", "FS"];

		if (!validFroms.includes(fromZoneName)) return;
		if (!validTos.includes(toZoneName)) return;

		const fromZone = p.getZone(fromZoneName);
		const toZone = p.getZone(toZoneName);

		if (fromZone.size() === 0) {
			return;
		}

		let fromIndex : number = 0
		for (let i = 0; i < fromZone.size(); i++) {
			if (fromZone.cards[i].visible) {
				fromIndex = i
				break;
			}
		}

		let fromCard : Card = fromZone.cards[fromIndex];
		
		if (toZone.size() === 0) {
			this.state.moveCards(fromZone.zoneId, fromCard.cardId, toZone.zoneId);
		}
		else {		
			let toCard : Card = toZone.last();

			if ( fromCard.num + 1 != toCard.num) return;

			let redSuit = ["D", "H"]
			let blackSuit = ["S", "C"]

			if ((redSuit.includes(fromCard.suit) && redSuit.includes(toCard.suit)) || (blackSuit.includes(fromCard.suit) && blackSuit.includes(toCard.suit))) return;

			this.state.moveCards(fromZone.zoneId, fromCard.cardId, toZone.zoneId);
		}

		this.flipHandler(fromZoneName);
	}
}

export default SolitaireEngine;