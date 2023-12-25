import { CardEngine } from "./CardEngine";
import { View, Card} from "./Interfaces";

export default class Player {
	name: string = ""
	_e: CardEngine 

	constructor(n: string, engine: CardEngine) {
		this.name = n;
		this._e = engine;
	}

	getView = () : View => {
		let v : View = {}
		let keys : string[] = Object.keys(this._e.state.zones)

		for (let i = 0; i < keys.length; i++) {
			let k: string = keys[i];
			
			v[k] = this.getZone(k);
		}


		return v;
	}

	getZone = (zoneName: string = "") : Card[] => {
		let viewCard = (c: Card) : Card => {
			let ret: Card = {}
			if (!c.visible) {
				return ret;
			}
			ret = {...c}
			for (const key in ret) {	
				if (key === "visible") delete ret[key];
			}
	
			return ret
		}


		let z: Card[] = this._e.getZone(zoneName).cards;
		let ret: Card[] = [];

		z.forEach((c: Card) => {
			ret.push(viewCard(c));
		});

		return ret;
	}

	



	

	

}