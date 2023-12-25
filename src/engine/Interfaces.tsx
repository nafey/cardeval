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


export interface ActionMessage {
	action: string,
	[key: string]: any;
}

export type Action = (m: ActionMessage, c: CardEngine, p: Player) => ActionResponse

export interface ActionResponse {
	valid: boolean,
	error?: string,
	[key:string]: any;
}


