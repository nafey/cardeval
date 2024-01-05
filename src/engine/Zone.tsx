import Card from "./Card";

const generateId = () : string => {
	let characters = "0123456789abcdef"
	let str = characters[1 + Math.floor(Math.random() * 15)]
	for(let i = 0; i < 20; i++){
		str += characters[Math.floor(Math.random() * 16)]
	}

	return str;
}


let compareCards = (a: Card, b: Card) => {
	return Object.entries(a).sort().toString() === Object.entries(b).sort().toString()
}

export default class Zone {
	zoneId : string = generateId();
	private cards: Card[] = [];
	playerId : string | undefined; 
	limit : number = 0;
	haveLimit : boolean = false;

	size = () : number => this.cards.length;

	addCard = (card: Card) => {
		if (this.haveLimit) {
			if (this.cards.length < this.limit) {
				this.cards.push(card);
			}
		}
		else {
			this.cards.push(card); 
		}
	}

	addMany = (cards : Card[]) => {
		if (this.haveLimit) {
			if (this.cards.length + cards.length <= this.limit) {
				cards.forEach((c : Card) => {
					this.addCard(c);
				});
			} 
			else {
				console.error("TODO: Unimplemented case");
				// cards.slice(0,	 )	
			}
		}
		else {
			cards.forEach((c : Card) => {
				this.addCard(c);
			});
		}

	}

	setLimit = (l : number) => {
		if (!this.haveLimit) this.haveLimit = true;
		this.limit = l;
	}

	at = (index: number) => this.cards[index];
	
	first = (): Card => this.cards[0];

	last = (): Card => this.cards[this.cards.length - 1];

	forEach = (fn : (c : Card) => any) => {
		this.cards.forEach(fn);	
	}

	flip = (index: number)  => {
		this.cards[index].visible = !this.cards[index].visible;
	}

	takeLast = (): Card | undefined => this.cards.pop()

	takeFirst = (): Card | undefined => {
		let ret: Card;
		ret = this.cards[0]!;

		return ret;
	}

	takeAt = (index: number) : Card | undefined => {
		if (this.size() > index) {
			return this.takeCards(index, 1)[0];
		}
		return undefined;
	}

	takeCards = (from: number, _count: number): Card[] => {
		let to = 0
		if (_count === -1) {
			to = this.cards.length;
		}
		else {
			to = (from + _count);
		}

		let ret: Card[] = this.cards.slice(from, to);		
		let before: Card[] = this.cards.slice(0, from);
		let after: Card[] = this.cards.slice(to);

		this.cards = [...before, ...after];
		return ret;
	}

	hasCard = (card: Card): boolean => {
		let found: boolean = false;
		for (const citem of this.cards) {
			if (compareCards(card, citem)) {
				found = true;
				break;
			}
		}

		return found;
	}

	findCard = (cardId: string): Card | undefined => {
		for (let i = 0; i < this.cards.length; i++) {
			let citem : Card = this.cards[i];
			if (citem.cardId === cardId) return citem;
		}
	}

	getView  = () : string [] => {
		let viewCard = (c: Card) : string => {
			let ret: string = ""
			if (!c.visible) {
				return "****";
			}
			ret = c.toString();
			return ret;
		}

		let ret: string[] = [];

		this.cards.forEach((c: Card) => {
			ret.push(viewCard(c));
		});

		return ret;
	}

	
	getById = (cardId: string) : Card | undefined => {
		for (let i = 0; i < this.cards.length; i++) {
			if (cardId === this.cards[i].cardId) {
				return this.cards[i];
			}
		}
		return undefined;
	}

	getIndex = (cardId: string) : number => {
		for (let i = 0; i < this.cards.length; i++) {
			if (cardId === this.cards[i].cardId) {
				return i;
			}
		}
		return -1;
	}

	removeById = (cardId: string) => {
		let index = this.getIndex(cardId);
		if (index >=0) {
			this.takeAt(index);
		}
	}
}