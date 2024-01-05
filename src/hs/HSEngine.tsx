import Card from "src/engine/Card";
import Player from "src/engine/Player";
import State from "src/engine/State";
import Zone from "src/engine/Zone";
import HSCards from "src/hs/HSCards"; 

const cardList : Record<string, any> = HSCards();

export class HSCard extends Card {
	toString = () : string => {
		if (!this.visible) return "****";

		return this.name + " " + this.attack + " " + this.health + " ";	
	}
}

let log = (msg: string) => {
	console.debug(msg);
}

let logAll = (args : string[]) => {
	let sep = " ";
	let msg = "";
	for (let i = 0; i < args.length; i++) {
		msg = msg + sep + args[i];
	}
	log(msg);
} 

let logParams = (funcName: string, paramNames: string[], vals: any[]) => {
	let args : any[] = [];
	args.push(funcName + "():");

	if (paramNames.length !== vals.length) {
		console.error("Mismatched args size");
	}

	for (let i = 0; i < paramNames.length; i++) {
		args.push(paramNames[i]);
		args.push("-");
		args.push(vals[i]);
		args.push("|");
	}

	logAll(args);
}

class HSEngine {
	private state : State = new State();

	constructor () {
		let p1 : Player = this.state.newPlayer();
		let p2 : Player = this.state.newPlayer();

		this.state.getPlayers().forEach((p:Player) => {
			p.addZone("BF", this.state.newZone());
			p.addZone("HAND", this.state.newZone());
			p.addZone("DECK", this.state.newZone());

			p.vals.health = 30;
			p.vals.maxHealth = 30;	

			p.zones.BF.setLimit(7);
			p.zones.HAND.setLimit(10);
		});

		p1.zones.OPP_BF = p2.zones.BF; 
		p1.zones.OPP_HAND = p2.zones.HAND; 
		p1.zones.OPP_DECK = p2.zones.DECK; 

		p2.zones.OPP_BF = p1.zones.BF; 
		p2.zones.OPP_HAND = p1.zones.HAND; 
		p2.zones.OPP_DECK = p1.zones.DECK; 
	}

	getActivePlayer = () : Player => {
		return this.state.getActivePlayer();
	}

	getOtherPlayer = () : Player => {
		return this.state.getNextPlayer();
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

		zone.forEach((c: Card) => {
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

	damagePlayer = (playerId: string, val : number) => {
		logParams("damagePlayer", ["playerId", "val"], [playerId, val]);
		let p : Player = this.state.getPlayerById(playerId)!;
		if (!p) return;

		p.vals.health -= val;
	}

	// getBFCard = (playerId : string, cardId : string) : Card | undefined => {
	// 	let p : Player = this.state.getPlayerById(playerId)!;
	// 	if (!p) return;
		
	// 	let c : Card = p.zones.BF.getById(cardId)!;
	// 	if (!c) return;

	// 	return c;
	// }

	draw = (playerId : string) => {
		logParams("draw", ["playerId"], [playerId]);
		let p : Player = this.state.getPlayerById(playerId)!;
		if (!p) return;
		if (p.zones.DECK.size() < 1) return;

		let c : Card = p.zones.DECK.takeLast()!;
		if (!c) return;

		p.zones.HAND.addCard(c);
	}

	deathRattle = (playerId : string, death : any) => {
		logParams("deathRattle", ["playerId", "death"], [playerId, JSON.stringify(death)]);
		if (death.type === "DRAW") {
			let val : number = death.val;
			for (let i = 0; i < val; i++) {
				this.draw(playerId);
			}			
		}
	}

	removeDeadForPlayer = (playerId : string) => {
		logParams("removeDeadForPlayer", ["playerId"], [playerId]);
		let p : Player = this.state.getPlayerById(playerId)!;
		if (!p) return;

		let deadIds : string [] = [];
		p.zones.BF.forEach ((card) => {
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
		logParams("removeDead", [], []);
		this.removeDeadForPlayer(this.getActivePlayer().playerId);
		this.removeDeadForPlayer(this.getOtherPlayer().playerId);
	}

	damageCard = (cardId: string, val: number) => {
		logParams("damageCard", ["cardId", "val"], [cardId, val]);
		let card : Card = this.state.findCard(cardId)!;
		if (!card) return;

		card.health -= val;
		if (card.health <= 0) {
			this.removeDead();
		}
	}

	damageTarget = (playerId: string, targetZoneName: string, targetIndex: number, val: number) => {
		logParams("damageTarget", ["playerId", "targetZoneName", "targetIndex", "val"], [playerId, targetZoneName, targetIndex, val]);
		let p : Player = this.state.getPlayerById(playerId)!; 
		let card : Card = p.zones[targetZoneName].at(targetIndex);
		if (!card) return;

		this.damageCard(card.cardId, val);
	}

	summon = (playerId : string, card : Card) => {
		logParams("summon", ["playerId", "card"], [playerId, card]);
		let p : Player = this.state.getPlayerById(playerId)!;
		if (!p) {
			console.debug("summon(): Invalid Player Id");
			return;
		}

		let bf : Zone = p.zones.BF;
		bf.addCard(card);
	}

	battleCry = (playerId: string, card: Card, targetZoneName?: string, targetIndex?: number)=> {
		logParams("battleCry", ["playerId", "card", "targetZoneName", "targetIndex"], [playerId, card, targetZoneName, targetIndex]);

		if (!card?.bcry) {
			console.error("battleCry(): Card missing BattleCry");
			return;
		}

		if (card.bcry.type === "SUMMON") {
			let code : string = card.bcry.code;
			this.summon(playerId, new HSCard(cardList[code]));	
		}
		else if (card.bcry.type === "DAMAGE") {
			if (!targetZoneName || targetIndex! < 0) {
				console.error("battleCry(): Missing Target Information");
				return;
			}
			this.damageTarget(playerId, targetZoneName!, targetIndex!, card.bcry.val);
		}
		else {

		}
	}

	play = (playerId: string, cardId : string, targetZoneName?: string, targetIndex?: number) => {
		logParams("play", ["playerId", "cardId", "targetZoneName", "targetIndex"], [playerId, cardId, targetZoneName, targetIndex]);

		let p : Player = this.state.getPlayerById(playerId)!;
		if (!p) {
			console.error("Play: Player not found") 
			return;
		}

		let hand: Zone = p.zones.HAND;

		let idx : number = hand.getIndex(cardId);
		if (idx < 0) {
			console.error("Card not found");
			return;
		}

		let card : Card = hand.takeAt(idx)!;
		this.summon(playerId, card);

		if (card?.bcry) {
			this.battleCry(playerId, card, targetZoneName, targetIndex);
		}
	}
	
	attackPlayer = (fromPos: number) => {
		logParams("attackPlayer", ["fromPos"], [fromPos]);
		let p : Player = this.getActivePlayer();
		let o : Player = this.getOtherPlayer();	

		let attacker : Card = p.zones.BF.at(fromPos); 
		this.damagePlayer(o.playerId, attacker.attack);
	}
	
	attack = (fromPos: number, toPos: number) => {
		logParams("attack", ["fromPos", "toPos"], [fromPos, toPos]);
		let p : Player = this.getActivePlayer();
		let o : Player = this.getOtherPlayer();

		let attacker : Card = p.zones.BF.at(fromPos); 
		let defender : Card = o.zones.BF.at(toPos);

		this.damageCard(defender.cardId, attacker.attack);
		this.damageCard(attacker.cardId, defender.attack);

		this.removeDead();
	}

	endTurn = () => {
		logParams("endTurn", [], []);
		this.state.nextPlayerTurn();
	}
}

export default HSEngine;