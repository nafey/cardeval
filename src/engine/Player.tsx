import Card from "./Card";
import State from "./State";
import { ActionHandler} from "./Interfaces";
import Zone from "./Zone";

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
	private _g: State;
	private zones: Record<string, Zone> = {}

	constructor(n: string, state: State) {
		this.name = n;
		this._g = state;
	}

	setZone = (zoneName: string, zone: Zone) => {
		this.zones[zoneName] = zone
	} 

	getZone = (zoneName: string) : Zone => {
		return this.zones[zoneName]
	}

	getView = () : Record<string, string[]> => {
		let v : Record<string, string[]> = {}
		let keys : string[] = Object.keys(this._g.zones)

		for (let i = 0; i < keys.length; i++) {
			let k: string = keys[i];
			
			v[k] = this.getZoneView(k);
		}

		return v;
	}

	getZoneView = (zoneName: string = "") : string[] => {
		let viewCard = (c: Card) : string => {
			let ret: string = ""
			if (!c.visible) {
				return "****";
			}
			ret = c.toString();
			return ret;
		}


		let z: Card[] = this._g.getZone(zoneName).cards;
		let ret: string[] = [];

		z.forEach((c: Card) => {
			ret.push(viewCard(c));
		});

		return ret;
	}
	
}