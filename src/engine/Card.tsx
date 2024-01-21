import { generateId, match } from "./Utils";

export interface Modifier {
	op : "add" | "sub",
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

	hydrate = (obj : Record<string, any>) : Record<string, any> => {
		let keys : string[] = Object.keys(obj);		
		let ret : Record<string, any> = {};
		keys.forEach((key : string) => {
			let val : any = obj[key];	
			if (typeof val === "object") {
				ret[key] = this.hydrate(val);
			}	
			else if (typeof val === "string" && val.startsWith("@")) {
				ret[key] = this.eval(val.substring(1));
			}
			else {
				ret[key] = val;
			}
		})	

		return ret;
	}

	eval = (expr: string) => {
		return eval(expr);
	}

	[key: string]: any;
}