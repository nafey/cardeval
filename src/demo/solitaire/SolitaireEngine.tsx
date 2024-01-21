import Card from "src/engine/Card";
import Engine from "src/engine/Engine";
import Zone from "src/engine/Zone";


export class SolitaireCard extends Card {
	toString = () : string => {
		return this.num + this.suit; 
	}
}


class SolitaireEngine  {

	private engine : Engine = new Engine()

	constructor() {
		let refs : Record<string, Zone> = this.engine.getActivePlayerZoneRef();
		(["T1", "T2", "T3", "T4", "T5", "T6", "T7", "FH", "FD", "FC", "FS", "S", "W"]).forEach((s: string) => {
			let z = this.engine.newZone() 
			refs[s] = z;	
			z.refs = refs;
		})
	}

	getState = () : Engine => {
		return this.engine;
	}

	flip = (zone: Zone) => {		
		if (zone.count() === 0) return;
		if (!zone.last().visible) zone.flip(zone.count() - 1);
	}

	getActivePlayerZoneRefs = () : Record<string, Zone> => {
		return this.engine.getActivePlayerZoneRef();
	}

	move = (fromZoneName: string, toZoneName: string) => {	
		let refs : Record<string, any> = this.engine.getActivePlayerZoneRef();

		const validFroms : string[] = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "W"];
		const validTos: string[] = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "FH", "FD", "FC", "FS"];

		if (!validFroms.includes(fromZoneName)) return;
		if (!validTos.includes(toZoneName)) return;
		const fromZone : Zone = refs[fromZoneName]; 
		const toZone : Zone = refs[toZoneName];

		if (fromZone.count() === 0) {
			return;
		}

		let fromIndex : number = 0
		for (let i = 0; i < fromZone.count(); i++) {
			if (fromZone.at(i).visible) {
				fromIndex = i
				break;
			}
		}

		let fromCard : Card = fromZone.at(fromIndex);
		
		if (toZone.count() === 0) {
			this.engine.moveCards(fromZone.zoneId, fromCard.cardId, toZone.zoneId);
		}
		else {		
			let toCard : Card = toZone.last();

			if ( fromCard.num + 1 != toCard.num) return;

			let redSuit = ["D", "H"]
			let blackSuit = ["S", "C"]

			if ((redSuit.includes(fromCard.suit) && redSuit.includes(toCard.suit)) || (blackSuit.includes(fromCard.suit) && blackSuit.includes(toCard.suit))) return;

			this.engine.moveCards(fromZone.zoneId, fromCard.cardId, toZone.zoneId);
		}

		this.flip(fromZone);
	}
}

export default SolitaireEngine;