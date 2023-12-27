import { CardEngine } from "./CardEngine";
import Player from "./Player";
import Zone from "./Zone";

export interface State {
	zones: Record<string, Zone>,
	players: Record<string, Player>
}

export type ActionHandler = (message:any, engine: CardEngine) => void


export type Action = [string, any]