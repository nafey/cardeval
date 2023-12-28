import GameState from "./GameState";


export type ActionHandler = (message:any, state: GameState) => void
export type Action = [string, any]