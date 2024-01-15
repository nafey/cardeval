import Card from "./Card";
import { generateId, match } from "./Utils";

export default class Zone {
	zoneId : string = generateId();
	private cards: Card[] = [];
	playerId? : string = ""; 
	limit : number = 0;
	haveLimit : boolean = false;

	count = (obj : any = null): number => {
		if (!obj) return this.cards.length;

		let count = 0;
		this.cards.forEach((c: Card) => {
			if (c.match(obj)) count++;
		});

		return count;
	}

	push = (card : Card) => {
		card.zoneId = this.zoneId;
		card.playerId = this.playerId;
		this.cards.push(card);
	}

	addCard = (card: Card) : Card => {
		if (this.haveLimit) {
			if (this.cards.length < this.limit) {
				this.push(card);
			}
			else {
				console.debug("Card not add to zone " + card);
			}
		}
		else {
			this.push(card); 
		}

		return card;
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
		if (this.count() === 0) throw new Error("No Card in Zone");
		return this.takeAt(this.cards.length - 1);
	}

	takeFirst = (): Card => {
		if (this.count() === 0) throw new Error("No Card in Zone");
		return this.takeAt(0); 
	}

	take = (cardId : string) : Card => {
		let idx = this.getIndex(cardId);
		return this.takeAt(idx);
	}

	takeAt = (index: number) : Card => {
		if (this.count() > index) {
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

		for (let i = 0; i < ret.length; i++) {
			ret[i].zoneId = "";		
		}

		this.cards = [...before, ...after];
		return ret;
	}

	findCardById = (cardId: string): Card => {
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

	hasCard = (c : Card) => {
		return this.getIndex(c.cardId) === -1 ? false : true;
	}

	match = (selector : any) : Card[] => {
		let matchedCards : Card[] = []
		this.cards.forEach((c: Card) => {
			if (match(c, selector)) matchedCards.push(c);
		})
		return matchedCards;
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
		return -1;
	}


	removeById = (cardId: string) => {
		let index = this.getIndex(cardId);
		if (index >=0) {
			this.takeAt(index);
		}
	}
}