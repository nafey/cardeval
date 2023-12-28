import Card from "./Card";
import { CardEngine } from "./CardEngine";
import { ActionHandler} from "./Interfaces";

const generateId = () : string => {
	let characters = "0123456789abcdef"
	let str = characters[1 + Math.floor(Math.random() * 15)]
	for(let i = 0; i < 20; i++){
		str += characters[Math.floor(Math.random() * 16)]
	}

	return str;
}

export default class Player {
	playerId: string = generateId();
	name: string = ""
	_e: CardEngine;
	actions: Record<string, ActionHandler> = {}

	constructor(n: string, engine: CardEngine) {
		this.name = n;
		this._e = engine;
	}

	getView = () : Record<string, string[]> => {
		let v : Record<string, string[]> = {}
		let keys : string[] = Object.keys(this._e.state.zones)

		for (let i = 0; i < keys.length; i++) {
			let k: string = keys[i];
			
			v[k] = this.getZone(k);
		}

		return v;
	}

	getZone = (zoneName: string = "") : string[] => {
		let viewCard = (c: Card) : string => {
			let ret: string = ""
			if (!c.visible) {
				return "****";
			}
			ret = c.toString();
			return ret;
		}


		let z: Card[] = this._e.getZone(zoneName).cards;
		let ret: string[] = [];

		z.forEach((c: Card) => {
			ret.push(viewCard(c));
		});

		return ret;
	}
	
}