import { generateId, match } from "./Utils";
import Zone from "./Zone";

export interface Modifier {
	op : "add" | "sub",
	val : number
}

export default class Card {
	cardId: string = generateId();
	zoneId?: string = "";
	zone?: Zone;
	playerId?: string = "";
	visible?: boolean = true;
	refs: Record<string, any> = {};
	
	constructor(vals : Record<string, any> = {}) {
		Object.keys(vals).forEach((k: string) => {
			if (k === "cardId") return;
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
			let rhs = updater[k];

			if (typeof rhs === "object") {
				this.modify(k, rhs as Modifier);
			}
			else {
				this[k] = rhs;
			}
		}
	}

	modify = (key: string, modifier : Modifier) => {

		let op: string = modifier.op;
		let val : number = modifier.val;	

		if (op === "sub") {
			this[key] -= val;	
		}
		else if (op === "add") {
			this[key] += val;
		}
	}

	samePlayer = (c: Card) : boolean => {
		return (c.playerId === this.playerId);
	}

	sameZone = (c : Card) : boolean => {
		return (c.zoneId === this.zoneId);
	}

	eval = (expr: string) => {
		return eval(expr);
	}

	[key: string]: any;
}