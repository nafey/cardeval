
const generateId = () : string => {
	let characters = "0123456789abcdef"
	let str = characters[1 + Math.floor(Math.random() * 15)]
	for(let i = 0; i < 20; i++){
		str += characters[Math.floor(Math.random() * 16)]
	}

	return str;
}


function objEqual(obj1 : any, obj2 : any) {
    var a = JSON.stringify(obj1), b = JSON.stringify(obj2);
    if (!a) a = '';
    if (!b) b = '';
    return (a.split('').sort().join('') == b.split('').sort().join(''));
}



export default class Card {
	cardId: string = generateId();
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
		console.debug(selector);
		let keys : string[] = Object.keys(selector);

		for (let i = 0; i < keys.length; i++) {
			let k = keys[i];
			if (!(k in this)) return false;
			else {
				if (!objEqual(this[k],selector[k])) return false;
			}
		}	

		return true;
	}

	[key: string]: any;
}