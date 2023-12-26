import { CardEngine } from "./CardEngine";
import { Card, ActionHandler} from "./Interfaces";



export default class Player {
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
			let ret: Card = {}
			if (!c.visible) {
				return "{ ... }";
			}
			ret = {...c}
			for (const key in ret) {	
				if (key === "visible") delete ret[key];
			}
	
			return JSON.stringify(ret)
		}


		let z: Card[] = this._e.getZone(zoneName).cards;
		let ret: string[] = [];

		z.forEach((c: Card) => {
			ret.push(viewCard(c));
		});

		return ret;
	}
	
}