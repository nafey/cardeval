import { CardEngine } from "./CardEngine";
import Player from "./Player";
import Zone from "./Zone";

export interface Card {
	visible?: boolean,
    [key: string]: any;
}

export interface State {
	zones: Record<string, Zone>,
	players: Record<string, Player>
}


export interface Action {
	name: string,
	[key: string]: any;
}

export type ActionHandler = (m: Action, c: CardEngine) => void



