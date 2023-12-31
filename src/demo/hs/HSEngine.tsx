import Card from "src/engine/Card";
import Player from "src/engine/Player";
import State from "src/engine/State";
import Zone from "src/engine/Zone";

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
		v["ME"] = me;
		v["YOU"] = you;

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

	attack = (fromPos: number, toPos: number) => {

		let p : Player = this.getActivePlayer();
		let o : Player = this.getOtherPlayer();

		let attacker : Card = p.getZone("BF").cards[fromPos] 
		let defender : Card = o.getZone("BF").cards[toPos];

		defender.health -= attacker.attack;
		attacker.health -= defender.attack;	

		this.removeDead();
	}
}

export default HSEngine;