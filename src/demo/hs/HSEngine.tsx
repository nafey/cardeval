import Card from "src/engine/Card";
import Player from "src/engine/Player";
import State from "src/engine/State";
import Zone from "src/engine/Zone";
import HSCards from "src/demo/hs/HSCards.tsx"	  ; 

const cardList : Record<string, any> = HSCards();

export class HSCard extends Card {
	toString = () : string => {
		if (!this.visible) return "****";

		return this.name + " " + this.attack + " " + this.health + " ";	
	}
} 

class HSEngine {
	private state : State = new State();
	active : number = 0;

	constructor() {
		let p1 : Player = this.state.newPlayer();
		let p2 : Player = this.state.newPlayer();

		this.state.getPlayers().forEach((p:Player) => {
			p.addZone("BF", this.state.newZone());
			p.addZone("HAND", this.state.newZone());
			p.addZone("DECK", this.state.newZone());
		});

		p1.zones.OPP_BF = p2.zones.BF; 
		p1.zones.OPP_HAND = p2.zones.HAND; 
		p1.zones.OPP_DECK = p2.zones.DECK; 

		p2.zones.OPP_BF = p1.zones.BF; 
		p2.zones.OPP_HAND = p1.zones.HAND; 
		p2.zones.OPP_DECK = p1.zones.DECK; 
	}

	getActivePlayer = () : Player => {
		return this.state.getPlayers()[this.active];
	}

	getOtherPlayer = () : Player => {
		return this.state.getPlayers()[1 - this.active];
	}

	getZoneView  = (zone : Zone) : string [] => {
		let viewCard = (c: Card) : string => {
			let ret: string = ""
			if (!c.visible) {
				return "****";
			}
			ret = c.toString();
			return ret;
		}

		let ret: string[] = [];

		zone.cards.forEach((c: Card) => {
			ret.push(viewCard(c));
		});

		return ret;
	}

	getView = () : Record<string, Record<string, string[]>> => {
		// return this.state.getView();

		let me : Record<string, string[]> = {}
		me["BF"] = this.getZoneView(this.getActivePlayer().zones.BF); 
		me["HAND"] = this.getZoneView(this.getActivePlayer().zones.HAND); 
		let you : Record<string, string[]> = {}
		you["BF"] = this.getZoneView(this.getOtherPlayer().zones.BF); 
		you["HAND"] = this.getZoneView(this.getOtherPlayer().zones.HAND); 

		let v : Record<string, Record<string, string[]>> = {}
		v["YOU"] = you;
		v["ME"] = me;

		return v;
	} 

	getBFCard = (playerId : string, cardId : string) : Card | undefined => {
		let p : Player = this.state.getPlayerById(playerId)!;
		if (!p) return;
		
		let c : Card = p.zones.BF.getById(cardId)!;
		if (!c) return;

		return c;
	}

	draw = (playerId : string) => {
		let p : Player = this.state.getPlayerById(playerId)!;
		if (!p) return;
		if (p.zones.DECK.size() < 1) return;

		let c : Card = p.zones.DECK.takeLast()!;
		if (!c) return;

		p.zones.HAND.addCard(c);
	}

	deathRattle = (playerId : string, death : any) => {
		if (death.type === "DRAW") {
			let val : number = death.val;
			for (let i = 0; i < val; i++) {
				this.draw(playerId);
			}			
		}
	}

	removeDeadForPlayer = (playerId : string) => {
		let p : Player = this.state.getPlayerById(playerId)!;
		if (!p) return;

		let deadIds : string [] = [];
		p.zones.BF.cards.forEach ((card) => {
			if (card.health <= 0) {
				deadIds.push(card.cardId);
			}
		});	

		deadIds.forEach((cardId : string) => {
			let c : Card = p.zones.BF.getById(cardId)!;
			if (!c) return;

			p.zones.BF.removeById(cardId);
			if (c?.death) {
				this.deathRattle(playerId, c.death);
			}
		});
	}

	removeDead = () => {
		this.removeDeadForPlayer(this.getActivePlayer().playerId);
		this.removeDeadForPlayer(this.getOtherPlayer().playerId);
	}

	damageCard = (cardId: string, val: number) => {
		let card : Card = this.state.findCard(cardId)!;
		if (!card) return;

		card.health -= val;
		this.removeDead();
	}

	damageTarget = (playerId: string, targetZoneName: string, targetIndex: number, val: number) => {
		let p : Player = this.state.getPlayerById(playerId)!; 
		let card : Card = p.zones[targetZoneName].cards[targetIndex];
		if (!card) return;

		this.damageCard(card.cardId, val);
	}

	summon = (playerId : string, card : Card) => {
		let p : Player = this.state.getPlayerById(playerId)!;
		if (!p) return;

		let bf : Zone = p.zones.BF;
		bf.addCard(card);
	}

	battleCry = (playerId: string, card: Card, targetZoneName?: string, targetIndex?: number)=> {
		if (!card?.bcry) return;

		if (card.bcry.type === "SUMMON") {
			let code : string = card.bcry.code;
			this.summon(playerId, new HSCard(cardList[code]));	
		}
		else if (card.bcry.type === "DAMAGE") {
			if (!targetZoneName || targetIndex! < 0) return;		
			this.damageTarget(playerId, targetZoneName!, targetIndex!, card.bcry.val);
		}
		else {

		}
	}

	play = (playerId: string, cardId : string, targetZoneName?: string, targetIndex?: number) => {
		let p : Player = this.state.getPlayerById(playerId)!;
		if (!p) {
			console.log("Play: Player not found") 
			return;
		}

		let hand: Zone = p.zones.HAND;

		let idx : number = hand.getIndex(cardId);
		if (idx < 0) {
			console.log("Card not found");
			return;
		}

		let card : Card = hand.takeAt(idx)!;
		this.summon(playerId, card);
		this.battleCry(playerId, card, targetZoneName, targetIndex);
	}
	
	
	attack = (fromPos: number, toPos: number) => {

		let p : Player = this.getActivePlayer();
		let o : Player = this.getOtherPlayer();

		let attacker : Card = p.zones.BF.cards[fromPos] 
		let defender : Card = o.zones.BF.cards[toPos];

		this.damageCard(defender.cardId, attacker.attack);
		this.damageCard(attacker.cardId, defender.attack);
		// attacker.health -= defender.attack;	

		this.removeDead();
	}

}

export default HSEngine;