import { Card } from "./Interfaces";

let compareCards = (a: Card, b: Card) => {
	return Object.entries(a).sort().toString() === Object.entries(b).sort().toString()
}

export default class Zone {
	name: string = ""
	cards: Card[] = []

	constructor(name: string) {
		this.name = name;
	}

	last = (): Card => this.cards[this.cards.length - 1]

	first = (): Card => this.cards[0]

	takeLast = (): Card => this.cards.pop()!

	takeFirst = (): Card => {
		let ret: Card
		ret = this.cards[0]!

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

	findCardIndex = (card: Card): number => {
		if (!this.hasCard(card)) return -1;

		let idx = 0;
		for (let i = 0; i < this.cards.length; i++) {
			let citem = this.cards[i];

			if (compareCards(citem, card)) {
				idx = i;
				break;
			}
		}

		return idx;
	}


}