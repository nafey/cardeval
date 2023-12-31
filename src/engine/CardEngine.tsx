// import State from "./State";
// import { ActionMessage, ActionHandler } from "./Interfaces";

// export class CardEngine2 {
	
// 	readonly actions : ActionMessage[] = [];
// 	readonly actionHandlers : Record<string, ActionHandler> = {};
	
// 	readonly state: State = new State();

// 	getState = () : State => this.state;

// 	addHandler = (actionName : string, handler: ActionHandler) => {
// 		this.actionHandlers[actionName] = handler;
// 	}

// 	pushAction = (action: ActionMessage) => {
// 		this.actions.push(action);
// 		this.nextAction();
// 	}

// 	nextAction = () => {
// 		if (this.actions.length === 0) return

// 		const a : ActionMessage = this.actions.pop()!;
// 		this.eval(a);
// 		this.nextAction();
// 	}

// 	eval = (action : ActionMessage) => {
// 		const actionName = action[0];
// 		const handler = this.actionHandlers[actionName];
// 		handler(action[1], this.state);
// 	}
// }

