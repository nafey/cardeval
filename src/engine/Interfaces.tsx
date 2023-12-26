import { CardEngine } from "./CardEngine";
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
	zones: Record<string, Zone>,
	players: Record<string, Player>
}


export interface Action {
	name: string,
	[key: string]: any;
}

export type ActionHandler = (m: Action, c: CardEngine) => void

