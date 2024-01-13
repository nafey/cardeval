const generateId = () : string => {
	let characters = "0123456789abcdef"
	let str = characters[1 + Math.floor(Math.random() * 15)]
	for(let i = 0; i < 20; i++){
		str += characters[Math.floor(Math.random() * 16)]
	}

	return str;
}

function match (obj1 : any, obj2 : any) : boolean {
	let keys : string[] = Object.keys(obj2);
	for (let i = 0; i < keys.length; i++) {
		let k : string = keys[i];
		if (!(k in obj1)) return false;	

		let val1 : any = obj1[k];	
		let val2 : any = obj2[k];	

		if (typeof val1 !== typeof val2) return false;

		if (typeof val1 === "string" || typeof val1 === "number" || typeof val1 === "boolean") return val1 === val2;	
		return match(obj1[k], obj2[k]);
	}
	return true;
}


function objEqual(obj1 : any, obj2 : any) {
    var a = JSON.stringify(obj1), b = JSON.stringify(obj2);
    if (!a) a = '';
    if (!b) b = '';
    return (a.split('').sort().join('') == b.split('').sort().join(''));
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

	// match = (selector : Record<string, any>) : boolean => {
	// 	let keys : string[] = Object.keys(selector);

	// 	for (let i = 0; i < keys.length; i++) {
	// 		let k = keys[i];
	// 		if (!(k in this)) return false;
	// 		else {
	// 			if (!objEqual(this[k],selector[k])) return false;
	// 		}
	// 	}	

	// 	return true;
	// }

	match = (selector : Record<string, any>) : boolean => {
		return match(this, selector);
	}

	modify = (updater : Record<string, any>) => {
		let keys : string[] = Object.keys(updater);

		for (let i = 0; i < keys.length; i++) {
			let k = keys[i];
			this[k] = updater[k]
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