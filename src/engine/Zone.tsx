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
			else {
				console.debug("Card not add to zone " + card);
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
				throw new Error("TODO: Unimplemented add many use case");
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

	takeLast = (): Card => { 
		if (this.size() === 0) throw new Error("No Card in Zone");
		let card : Card = this.cards.pop()!;
		return card
	}

	takeFirst = (): Card => {
		if (this.size() === 0) throw new Error("No Card in Zone");
		return this.cards[0];
	}

	takeAt = (index: number) : Card => {
		if (this.size() > index) {
			return this.takeCards(index, 1)[0];
		}
		throw new Error("Index greater than size of Zone");
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

	findCard = (cardId: string): Card => {
		let i = this.getIndex(cardId);
		return this.cards[i];
	}

	selectCards = (selector : Record<string, any>) : Card[] => {
		let selected : Card[] = [];
		for (let i = 0; i < this.cards.length; i++) {
			let c : Card = this.cards[i];

			if (c.match(selector)) {
				selected.push(c);
			}
		}

		return selected;
	}

	modifyCards = (selector : Record<string, any>, updater : Record<string, any>) => {
		this.cards.forEach((c: Card) => {
			if (c.match(selector)) {
				c.modify(updater);
			}
		})		
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

	
	getById = (cardId: string) : Card => {
		for (let i = 0; i < this.cards.length; i++) {
			if (cardId === this.cards[i].cardId) {
				return this.cards[i];
			}
		}
		throw new Error("Not found cardId in zone");
	}

	getIndex = (cardId: string) : number => {
		for (let i = 0; i < this.cards.length; i++) {
			if (cardId === this.cards[i].cardId) {
				return i;
			}
		}
		throw new Error("Not found index for cardId in zone");
	}


	removeById = (cardId: string) => {
		let index = this.getIndex(cardId);
		if (index >=0) {
			this.takeAt(index);
		}
	}
}