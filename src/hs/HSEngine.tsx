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

			p.vals.mana = 0;
			p.vals.maxMana = 0;	

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
		let p : Player = this.state.getPlayerById(playerId);
		p.vals.health -= val;
	}

	draw = (playerId : string) => {
		logParams("draw", ["playerId"], [playerId]);
		let p : Player = this.state.getPlayerById(playerId);
		if (p.zones.DECK.size() < 1) return;

		let c : Card = p.zones.DECK.takeLast();
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
		let p : Player = this.state.getPlayerById(playerId);

		let deadIds : string [] = [];
		p.zones.BF.forEach ((card) => {
			if (card.health <= 0) {
				deadIds.push(card.cardId);
			}
		});	

		deadIds.forEach((cardId : string) => {
			let c : Card = p.zones.BF.getById(cardId);

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

	onDamage = () => {

	}

	damageCard = (cardId: string, val: number) => {
		logParams("damageCard", ["cardId", "val"], [cardId, val]);
		let card : Card = this.state.findCard(cardId);

		card.health -= val;
		if (card?.on?.trigger === "SELF_DAMAGE") {

		}	
		if (card.health <= 0) {
			this.removeDead();
		}
	}

	damageTarget = (playerId: string, targetZoneName: string, targetIndex: number, val: number) => {
		logParams("damageTarget", ["playerId", "targetZoneName", "targetIndex", "val"], [playerId, targetZoneName, targetIndex, val]);
		let p : Player = this.state.getPlayerById(playerId); 
		let card : Card = p.zones[targetZoneName].at(targetIndex);

		this.damageCard(card.cardId, val);
	}

	turnStart = () => {
		logParams("turnStart", [], []);
		let p : Player = this.getActivePlayer();

		p.zones.BF.modifyCards({sick: true}, {sick: false});
	}

	summon = (playerId : string, card : Card) => {
		logParams("summon", ["playerId", "card"], [playerId, card]);
		let p : Player = this.state.getPlayerById(playerId);
		card.sick = true;
		p.zones.BF.addCard(card);
	}

	// triggerEffect = (effect: string, effectObj : any) => {
	// 	if (effect === "SUMMON") {
	// 		let code : string = effectObj.code;
	// 		this.summon(playerId, new HSCard(cardList[code]));	
	// 	}
	// 	else if (card.bcry.type === "DAMAGE") {
	// 		if (!targetZoneName || targetIndex! < 0) {
	// 			throw new Error("Missing target Information");
	// 		}
	// 		this.damageTarget(playerId, targetZoneName, targetIndex!, card.bcry.val);
	// 	}

	// }

	battleCry = (playerId: string, card: Card, targetZoneName?: string, targetIndex?: number)=> {
		logParams("battleCry", ["playerId", "card", "targetZoneName", "targetIndex"], [playerId, card, targetZoneName, targetIndex]);

		if (!card?.bcry) {
			throw new Error("No battleCry on card");
		}

		if (card.bcry.type === "SUMMON") {
			let code : string = card.bcry.code;
			this.summon(playerId, new HSCard(cardList[code]));	
		}
		else if (card.bcry.type === "DAMAGE") {
			if (!targetZoneName || targetIndex! < 0) {
				throw new Error("Missing target Information");
			}
			this.damageTarget(playerId, targetZoneName, targetIndex!, card.bcry.val);
		}
		else {

		}
	}

	play = (playerId: string, cardId : string, targetZoneName?: string, targetIndex?: number) => {
		logParams("play", ["playerId", "cardId", "targetZoneName", "targetIndex"], [playerId, cardId, targetZoneName, targetIndex]);

		let p : Player = this.state.getPlayerById(playerId);
		let hand: Zone = p.zones.HAND;
		let idx : number = hand.getIndex(cardId);

		let card : Card = hand.takeAt(idx);
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
		if (attacker.sick) {
			throw new Error("Can not attack with sick minions");
		}

		let defender : Card = o.zones.BF.at(toPos);

		if (!defender?.taunt) {
			console.debug("Not a taunt");
			if (o.zones.BF.selectCards({taunt : true}).length > 0) {
				throw new Error("Need to target taunt minions");	
			}
		} 

		this.damageCard(defender.cardId, attacker.attack);
		this.damageCard(attacker.cardId, defender.attack);

		this.removeDead();
	}

	endTurn = () => {
		logParams("endTurn", [], []);
		this.state.nextPlayerTurn();
		this.turnStart();	
	}
}

export default HSEngine;