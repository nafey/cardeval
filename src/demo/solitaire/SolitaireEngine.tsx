import Card from "src/engine/Card";
import Context from "src/engine/Refs";
import Engine from "src/engine/Engine";
import Zone from "src/engine/Zone";


export class SolitaireCard extends Card {
	toString = () : string => {
		return this.num + this.suit; 
	}
}


class SolitaireEngine  {

	private state : Engine = new Engine()

	constructor() {
		let p : Context = this.state.newPlayer();
		(["T1", "T2", "T3", "T4", "T5", "T6", "T7", "FH", "FD", "FC", "FS", "S", "W"]).forEach((s: string) => {
			let z = this.state.newZone() 
			p.addZone(s, z);
		})
	}

	getState = () : Engine => {
		return this.state;
	}

	getPlayer = () : Context => {
		return this.state.getPlayers()[0];
	}

	getView = ()  : Record<string, string[]> => {
		let v : Record<string, string[]> = {};

		(["T1", "T2", "T3", "T4", "T5", "T6", "T7", "FH", "FD", "FC", "FS", "S", "W"]).forEach((z: string) => {
			v[z] = this.getPlayer().zones[z].getView();
		});

		return v;
	}

	flipHandler = (zoneName: string) => {		
		let p : Context = this.getPlayer();
		const zone : Zone = p.zones[zoneName] ;
		if (zone.count() === 0) return;
		if (!zone.last().visible) zone.flip(zone.count() - 1);
	}


	moveHandler = (fromZoneName: string, toZoneName: string) => {	
		let p: Context = this.getPlayer();
		const validFroms : string[] = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "W"];
		const validTos: string[] = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "FH", "FD", "FC", "FS"];

		if (!validFroms.includes(fromZoneName)) return;
		if (!validTos.includes(toZoneName)) return;
		const fromZone = p.zones[fromZoneName];
		const toZone = p.zones[toZoneName];

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