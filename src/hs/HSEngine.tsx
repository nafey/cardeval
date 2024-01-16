import Card from "src/engine/Card";
import Player from "src/engine/Player";
import State from "src/engine/State";
import Zone from "src/engine/Zone";
import {
	Effect, TriggerType, TriggerConditions, EffectTargetType, DamageEffect, HSCardList, 
	EffectType, SummonEffect, CardType, HealEffect
} from "src/hs/HSCards"; 

const cardList : Record<string, any> = (new HSCardList()).getCodedList();

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

let logParams = (funcName: string, paramNames: string[] = [], vals: any[] = []) => {
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

interface Target {
	type : string,
	card? : Card 
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

		p1.name = "P1";
		p2.name = "P2";

		p1.players.OPP = p2;
		p2.players.OPP = p1;

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

	removeDeadForPlayer = (player : Player) => {
		logParams("removeDeadForPlayer");

		let deadIds : string [] = [];
		player.zones.BF.forEach ((card) => {
			if (card.health <= 0) {
				deadIds.push(card.cardId);
			}
		});	

		deadIds.forEach((cardId : string) => {
			let c : Card = player.zones.BF.getById(cardId);

			player.zones.BF.removeById(cardId);
			if (c?.death) {
				this.deathRattle(c);
			}
		});
	}

	removeDead = () => {
		logParams("removeDead");
		this.removeDeadForPlayer(this.getActivePlayer());
		this.removeDeadForPlayer(this.getOtherPlayer());
	}

	resolveEffect = (card: Card, effectObj : Effect, playerTarget?: Target) => {
		logParams("resolveEffect", ["name", "effect"], [card.name, effectObj.effect]);
		let playerId : string = card.playerId!;
		if (!playerId) throw new Error("No player Id for Card");	
		let player : Player = this.state.getPlayerById(playerId);	
		let effect : EffectType = effectObj.effect;

		if (!effect) throw new Error("Effect is missing");

		if (effect === EffectType.SUMMON) {
			let code : string = (effectObj as SummonEffect).code;
			this.summon(player, this.createCard(code));	
		}
		else if (effect === EffectType.DAMAGE) {
			this.doDamage(card, (effectObj as DamageEffect), playerTarget);
		}
		else if (effect === EffectType.DRAW) {
			this.draw(player);	
		}
		else if (effect === EffectType.HEAL) {
			this.doHeal(card, (effectObj as HealEffect), playerTarget);
		}

	}

	raiseTrigger = (raiser : Card, on : TriggerType) => {
		logParams("raiseTrigger", ["name", "on"], [raiser.name, on]);

		[this.getActivePlayer(), this.getOtherPlayer()].forEach((p : Player) => {
			let triggeredCards : Card[] = p.zones.BF.match({
				trigger : {
					on : on
				}
			});

			triggeredCards.forEach((triggered : Card) => {
				if (raiser?.if) {
					let condition : string = raiser?.if;
					if (condition === TriggerConditions.FRIENDLY) {
						if (!(raiser.samePlayer(triggered))) return;
					}	
				}

				this.resolveEffect(triggered, triggered.trigger.do);
			})
		});
	}

	draw = (player : Player) => {
		logParams("draw");
		if (player.zones.DECK.count() < 1) return;

		let c : Card = player.zones.DECK.takeLast();
		player.zones.HAND.addCard(c);
	}

	deathRattle = (card : Card) => {
		logParams("deathRattle", ["cardName"], [card.name]);
		if (!card.death) throw new Error("No death rattle on the card");

		let death : Effect = card.death;		
		this.resolveEffect(card, death);
	}

	healCard = (card : Card, val : number) => {
		logParams("healCard" , ["name", "val"], [card.name, val]);

		card.health = Math.min(card.health + val, card.maxHealth);
	}

	doHeal = (_card: Card, healEffect: HealEffect, playerTarget? : Target) => {
		if (healEffect.to === EffectTargetType.TARGET) {
			let type : string = playerTarget?.type!;

			if (type === "OPP_BF") {
				let card : Card = playerTarget?.card!;
				this.healCard(card, healEffect.val);
			}
		}
	}

	damageMinion = (card : Card, val : number) => {
		logParams("damageMinion", ["cardName", "val"], [card.name, val]);

	}


	damagePlayer = (player : Player, val : number) => {
		logParams("damagePlayer");
		player.vals.health -= val;
	}

	damageCard = (card: Card, val : number) => {
		logParams("damageCard", ["name", "val"], [card.name, val]);

		card.health -= val;
		if (card?.trigger?.on === TriggerType.SELF_DAMAGE) {
			this.resolveEffect(card, card.trigger.do)
		}	
		if (card.health <= 0) {
			this.removeDead();
		}
	}

	doDamage = (card: Card, damageEffect : DamageEffect, playerTarget? : Target) => {
		let p : Player = this.state.getPlayerById(card.playerId!);	
		let o : Player = p.players.OPP;

		if (damageEffect.to === EffectTargetType.RANDOM_ENEMY) {
			let mins : Card[] = o.zones.BF.match({health : {op : "gt", val : 0}});
			let targetIdx : number = Math.floor(Math.random() * (mins.length + 1));			

			if (targetIdx === mins.length) {
				this.damagePlayer(o, damageEffect.val!);
			}
			else {
				let c : Card = mins[targetIdx];
				this.damageCard(c, damageEffect.val!);
			}
		}
		else if (damageEffect.to === EffectTargetType.TARGET) {
			let type : string = playerTarget?.type!;

			if (type === "OPP_BF") {
				let card : Card = playerTarget?.card!;			
				this.damageCard(card, damageEffect.val!);
			}	
			else if (type === "OPP") {
				this.damagePlayer(o, damageEffect.val);
			}
			else {
				console.debug("Unimplemented target type");
			}
		}
	}

	turnStart = () => {
		logParams("turnStart", [], []);
		let p : Player = this.getActivePlayer();

		p.zones.BF.modifyCards({sick: true}, {sick: false});
	}

	summon = (player : Player, card : Card) => {
		logParams("summon", ["cardName"], [card.name]);
		card.sick = true;
		this.raiseTrigger(card, TriggerType.SUMMON);
		player.zones.BF.addCard(card);
	}

	createCard = (code : string) : Card => {
		logParams("createCard", ["code"], [code]);
		let c : Card = new Card(cardList[code]);
		if (c.type === CardType.MINION) {
			c.maxHealth = c.health;
		}

		if (!c) throw new Error("Missing code in Card List " + code);
		return c;
	}

	battleCry = (card: Card, playerTarget : Target)=> {
		logParams("battleCry", ["cardName"], [card.name]);

		if (!card?.bcry) {
			throw new Error("No battleCry on card");
		}

		this.resolveEffect(card, card.bcry, playerTarget);
	}

	play = (card : Card, playerTarget?: Target) => {
		logParams("play", ["CardName"], [card.name]);
		let playerId : string = card.playerId!;
		let p : Player = this.state.getPlayerById(playerId);
		if (playerId !== this.getActivePlayer().playerId) throw new Error ("Inactive player attempting to play card");
		let hand: Zone = p.zones.HAND;

		hand.take(card.cardId);
		this.summon(p, card);

		if (card?.bcry) {
			this.battleCry(card, playerTarget!);
		}
	}
	
	attackOpponent = (attacker : Card) => {
		logParams("attackPlayer", ["name"], [attacker.name]);
		let p : Player = this.getActivePlayer();
		if (attacker.playerId !== p.playerId) throw new Error("Only minions of active player can attack");
		if (attacker.zoneId !== p.zones.BF.zoneId) throw new Error("Only minions in Battlefield can attack");

		this.damagePlayer(this.getOtherPlayer(), attacker.attack);
	}
	
	attack = (attacker : Card, defender : Card) => {
		logParams("attack", ["attackerName", "defenderName"], [attacker.name, defender.name]);
		let p : Player = this.getActivePlayer();
		let o : Player = this.getOtherPlayer();

		if (attacker.playerId !== p.playerId) throw new Error("Only minions of active player can attack");
		if (attacker.zoneId !== p.zones.BF.zoneId) throw new Error("Only minions in Battlefield can attack");

		if (defender.playerId !== o.playerId) throw new Error("Only minions of inactive player can be attacked");
		if (defender.zoneId !== o.zones.BF.zoneId) throw new Error("Only minions in Battlefield can be attacked");

		if (attacker.sick) {
			throw new Error("Can not attack with sick minions");
		}

		if (!defender?.taunt) {
			if (o.zones.BF.selectCards({taunt : true}).length > 0) {
				throw new Error("Need to target taunt minions");	
			}
		} 

		this.damageCard(defender, attacker.attack);
		this.damageCard(attacker, defender.attack);

		this.removeDead();
	}

	cast = (spell : Card, playerTarget? : Target) => {
		let p : Player = this.getActivePlayer();
		
		if (spell.playerId !== p.playerId) throw new Error("Only active player can cast spells");	
		if (!p.zones.HAND.hasCard(spell)) throw new Error("Spells can only be cast from hand");

		p.zones.HAND.take(spell.cardId);
		this.resolveEffect(spell, spell.text, playerTarget);
	}

	endTurn = () => {
		logParams("endTurn", [], []);
		this.state.nextPlayerTurn();
		this.turnStart();	
	}
}

export default HSEngine;