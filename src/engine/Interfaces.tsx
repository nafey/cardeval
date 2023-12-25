import Player from "./Player";
import Zone from "./Zone";

export interface Card {
	visible?: boolean,
    [key: string]: any;
}

export interface MoveCheckRule {
	rule : (card: Card, fromZone: Zone, toZone: Zone) => boolean
} 

export interface State {
	moveCheckRules : MoveCheckRule[],
	zones: {
		[key:string]: Zone
	},
	players: {
		[key:string]: Player
	}
}

export interface View {
	[key:string]: Card[]

}


