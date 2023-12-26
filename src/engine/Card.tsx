
const generateId = () : string => {
	let characters = "0123456789abcdef"
	let str = characters[1 + Math.floor(Math.random() * 15)]
	for(let i = 0; i < 20; i++){
		str += characters[Math.floor(Math.random() * 16)]
	}

	return str;
}


export default class Card {
	cardId: string = generateId()
	visible: boolean = true;
	vals: Record<string, any> = {}

	get = (k: string) : any => this.vals[k];
	set = (k: string, v: any) : any => this.vals[k] = v;

	constructor(visible: boolean = true, vals : Record<string, any> = {}) {
		this.visible = visible;

		Object.keys(vals).forEach((k: string) => {
			if (k === "cardId" || k === "visible") return;
			
			this.vals[k] = vals[k];
		})

	}

	toString = () : string => {
		let str = "";

		Object.keys(this.vals).forEach((k: string) => {
			str += k + ": " + this.vals[k] + " | ";
		})

		return str;
	}
	
	
}