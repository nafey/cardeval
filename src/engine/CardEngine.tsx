import GameState from "./GameState";
import { Action, ActionHandler } from "./Interfaces";
import Player from "./Player";

export class CardEngine {
	
	actions : Action[] = [];
	actionHandlers : Record<string, ActionHandler> = {};
	
	state: GameState = new GameState();

	getState = () : GameState => this.state;

	addHandler = (actionName : string, handler: ActionHandler) => {
		this.actionHandlers[actionName] = handler;
	}

	pushAction = (action: Action) => {
		this.actions.push(action);
		this.nextAction();
	}

	nextAction = () => {
		if (this.actions.length === 0) return

		const a : Action = this.actions.pop()!;
		this.eval(a);
		this.nextAction();
	}

	eval = (action : Action) => {
		const actionName = action[0];
		const handler = this.actionHandlers[actionName];
		handler(action[1], this.state);
	}
}

