import Card from "src/engine/Card";
import State from "src/engine/State";
import Zone from "src/engine/Zone";

const HSEngine = () => {
	const state : State = new State();

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

	const attack = (fromPos: number, toPos: number) => {

		let attacker : Card = ME.cards[fromPos] 
		let defender : Card = OPP.cards[toPos];

		defender.health -= attacker.attack;
		attacker.health -= defender.attack;	

		removeDead();
	}
}

export default HSEngine;