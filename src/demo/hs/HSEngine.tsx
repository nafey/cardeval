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

export interface HSTarget {
	targetType? : string,
	playerId? : string,
	cardId? : string
}

class HSEngine {
	private state : State = new State();
	active : number = 0;

	constructor() {
		// state.addZones(["ME", "OPP", "HAND"]);		
		this.state.newPlayer();
		this.state.newPlayer();
		this.state.getPlayers().forEach((p:Player) => {
			p.setZone("BF", this.state.newZone());
			p.setZone("HAND", this.state.newZone());
		})

	}

	getActivePlayer = () : Player => {
		return this.state.getPlayers()[this.active];
	}

	getOtherPlayer = () : Player => {
		return this.state.getPlayers()[1 - this.active];
	}

	getView = () : Record<string, Record<string, string[]>> => {
		// return this.state.getView();

		let me : Record<string, string[]> = {}
		me["BF"] = this.getActivePlayer().getZone("BF").getView(); 
		me["HAND"] = this.getActivePlayer().getZone("HAND").getView(); 
		let you : Record<string, string[]> = {}
		you["BF"] = this.getOtherPlayer().getZone("BF").getView(); 
		you["HAND"] = this.getOtherPlayer().getZone("HAND").getView(); 

		let v : Record<string, Record<string, string[]>> = {}
		v["YOU"] = you;
		v["ME"] = me;

		return v;
	} 

	removeDead = () => {
		this.state.getZones().forEach((z: Zone) => {
			let deadIds :string[] = []	
			z.cards.forEach((card) => {
				if (card.health <= 0) {
					deadIds.push(card.cardId);
				}
			});

			deadIds.forEach((cardId: string) => {
				z.removeById(cardId);
			});
		})
	}

	damageCard = (playerId: string , cardId: string, val: number) => {
		let card : Card = this.state.getPlayerById(playerId)?.getZone("BF").getById(cardId)!;
		if (!card) return;

		card.health -= val;
		this.removeDead();
	}

	damageTarget = (target: HSTarget, val: number) => {
		if (target.targetType === "MIN") {
			if (!target.playerId) return;

			let playerId : string = target.playerId!;
			let cardId : string = target.cardId!;

			this.damageCard(playerId, cardId, val);
		}
	}

	summon = (playerId : string, card : Card) => {
		let p : Player = this.state.getPlayerById(playerId)!;
		if (!p) return;

		let bf : Zone = p.getZone("BF");
		bf.addCard(card);
	}

	battleCry = (playerId: string, card: Card, target : HSTarget = {})=> {
		if (!card?.bcry) return;

		if (card.bcry.type === "SUMMON") {
			let code : string = card.bcry.code;
			this.summon(playerId, new HSCard(true, cardList[code]));	
		}
		else if (card.bcry.type === "DAMAGE") {
			if (!target) return;		
			this.damageTarget(target, card.bcry.val);
		}
		else {

		}
	}

	play = (playerId: string, cardId : string, target: HSTarget) => {
		let p : Player = this.state.getPlayerById(playerId)!;
		if (!p) {
			console.log("Play: Player not found") 
			return;
		}

		let hand: Zone = p.getZone("HAND");

		let idx : number = hand.getIndex(cardId);
		if (idx < 0) {
			console.log("Card not found");
			return;
		}
		let card : Card = hand.takeAt(idx)!;

		this.summon(playerId, card);
		this.battleCry(playerId, card, target);
	}
	
	
	attack = (fromPos: number, toPos: number) => {

		let p : Player = this.getActivePlayer();
		let o : Player = this.getOtherPlayer();

		let attacker : Card = p.getZone("BF").cards[fromPos] 
		let defender : Card = o.getZone("BF").cards[toPos];

		this.damageCard(o.playerId, defender.cardId, attacker.attack);
		this.damageCard(p.playerId, attacker.cardId, defender.attack);
		// defender.health -= attacker.attack;
		// attacker.health -= defender.attack;	

		this.removeDead();
	}
}

export default HSEngine;