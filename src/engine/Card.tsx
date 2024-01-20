import { generateId, match } from "./Utils";

export interface Modifier {
	key : string,
	op : "DEC" | "INC",
	val : number
}

export default class Card {
	cardId: string = generateId();
	zoneId?: string = "";
	playerId?: string = "";
	visible?: boolean = true;
	
	constructor(vals : Record<string, any> = {}, visible: boolean = true) {
		this.visible = visible;

		Object.keys(vals).forEach((k: string) => {
			if (k === "cardId" || k === "visible") return;
			this[k] = vals[k];

		});
	}

	toString = () : string => {
		let str = "";

		Object.keys(this).forEach((k: string) => {
			if (["toString", "visible", "cardId"].includes(k)) return ;
			str += k + ": " + this[k] + " | ";
		})

		return str;
	}

	match = (selector : Record<string, any>) : boolean => {
		return match(this, selector);
	}

	update = (updater : Record<string, any>) => {
		let keys : string[] = Object.keys(updater);

		for (let i = 0; i < keys.length; i++) {
			let k = keys[i];
			this[k] = updater[k];
		}
	}

	modify = (modifier : Modifier) => {
		let key : string = modifier.key;
		let op: string = modifier.op;
		let val : number = modifier.val;	

		if (op === "DEC") {
			this[key] -= val;	
		}
	}

	samePlayer = (c: Card) : boolean => {
		return (c.playerId === this.playerId);
	}

	sameZone = (c : Card) : boolean => {
		return (c.zoneId === this.zoneId);
	}


	[key: string]: any;
}