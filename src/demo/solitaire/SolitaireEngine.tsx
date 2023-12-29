import Card from "src/engine/Card";
import { CardEngine } from "src/engine/CardEngine";
import State from "src/engine/State";
import Zone from "src/engine/Zone";

interface FlipAction {
	zoneName: string,
}

interface MoveAction {
	fromZone: string,
	toZone: string
}

export class SolitaireCard extends Card {
	toString = () : string => {
		return this.num + this.suit; 
	}
}


const SolitaireEngine = () : CardEngine => {

	let engine : CardEngine = new CardEngine();
	engine.getState().addZones(["T1", "T2", "T3", "T4", "T5", "T6", "T7", "FH", "FD", "FC", "FS", "S", "W"]);

	const flipHandler = (action: FlipAction, state: State) => {
		if (!action?.zoneName) return;
		let zoneName = action.zoneName;
		
		const zone : Zone = state.getZone(zoneName) ;
		if (zone.size() === 0) return;
		if (!zone.last().visible) zone.flip(zone.size() - 1);
	}

	engine.addHandler("FLIP", flipHandler);

	const moveHandler = (action: MoveAction , state: State) => {	
		const validFroms : string[] = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "W"];
		const validTos: string[] = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "FH", "FD", "FC", "FS"];

		const fromZoneName : string = action.fromZone as string;
		const toZoneName : string = action.toZone as string;

		if (!validFroms.includes(fromZoneName)) return;
		if (!validTos.includes(toZoneName)) return;

		const fromZone = state.getZone(fromZoneName);
		const toZone = state.getZone(toZoneName);

		if (fromZone.size() === 0) {
			return;
		}


		let fromIndex : number = 0;
		
		for (let i = 0; i < fromZone.size(); i++) {
			if (fromZone.cards[i].visible) {
				fromIndex = i
				break;
			}
		}

		let fromCard : Card = fromZone.cards[fromIndex];
		
		if (toZone.size() === 0) {
			state.moveCards(fromZoneName, fromIndex, toZoneName);
			return;
		}
		
		let toCard : Card = toZone.last();

		if ( fromCard.num + 1 != toCard.num) return;

		let redSuit = ["D", "H"]
		let blackSuit = ["S", "C"]

		if ((redSuit.includes(fromCard.suit) && redSuit.includes(toCard.suit)) || (blackSuit.includes(fromCard.suit) && blackSuit.includes(toCard.suit))) return;

		state.moveCards(fromZoneName, fromIndex, toZoneName);
		engine.pushAction(["FLIP", {zoneName : fromZoneName}])
	}

	engine.addHandler("MOVE", moveHandler);

	return engine;

}

export default SolitaireEngine;