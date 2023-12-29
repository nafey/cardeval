import Card from "src/engine/Card";
import { CardEngine } from "src/engine/CardEngine"
import GameState from "src/engine/GameState";
import Zone from "src/engine/Zone";

interface AttackAction {
	fromPos: number,
	toPos: number
}

const HSEngine =  (): CardEngine => {
	const engine : CardEngine = new CardEngine();
	const state : GameState = engine.getState()

	state.addZones(["ME", "OPP", "HAND"]);		

	const ME: Zone = state.getZone("ME");
	const OPP: Zone = state.getZone("OPP");
	const HAND: Zone = state.getZone("HAND");

	const removeDead = () => {

		state.getZoneArray().forEach((z: Zone) => {
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

	const attackHandler = (action: AttackAction, _state: GameState) => {

		const fromPos: number = action.fromPos;
		const toPos: number = action.toPos; 


		let attacker : Card = ME.cards[fromPos] 
		let defender : Card = OPP.cards[toPos];

		defender.health -= attacker.attack;
		attacker.health -= defender.attack;	

		removeDead();
	}
	engine.addHandler("ATTACK", attackHandler);
	return engine;
}

export default HSEngine;