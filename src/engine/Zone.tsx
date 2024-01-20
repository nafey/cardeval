import Card from "./Card";
import { generateId, match } from "./Utils";

export default class Zone {
	zoneId : string = generateId();
	private cards: Card[] = [];
	private lookup: Record<string, number> = {};
	playerId? : string = ""; 
	limit : number = 0;
	haveLimit : boolean = false;

	at = (index: number) => this.cards[index];


	
	first = (): Card => this.cards[0];

	last = (): Card => this.cards[this.cards.length - 1];

	forEach = (fn : (c : Card) => any) => {
		this.cards.forEach(fn);	
	}

	reIndex = () => {
		this.lookup = {};
		for (let i = 0; i < this.cards.length; i++) {
			let c : Card = this.cards[i];	
			this.lookup[c.cardId] = i;	
		}	
	}

	getArr = () : Card[] => {
		return this.cards;
	}


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
		this.lookup[card.cardId] = this.cards.length;
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


	flip = (index: number)  => {
		this.cards[index].visible = !this.cards[index].visible;
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
		this.reIndex();

		return ret;
	}

	takeAt = (index: number) : Card => {
		if (this.count() > index) {
			return this.takeCards(index, 1)[0];

		}
		throw new Error("Index greater than size of Zone");
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
				c.update(updater);
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

	
	getById = (cardId: string) : Card => {
		let ret : Card = this.cards[this.lookup[cardId]];
		if (!ret) throw new Error("Not found cardId in zone");

		return ret;
	}

	getIndex = (cardId: string) : number => {
		return this.lookup[cardId];
	}


	removeById = (cardId: string) => {
		let index = this.getIndex(cardId);
		if (index >=0) {
			this.takeAt(index);
		}
	}
}