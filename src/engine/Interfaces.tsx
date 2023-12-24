import Zone from "./Zone";

export interface Card {
    [key: string]: any;
}

export interface MoveCheckRule {
	rule : (card: Card, fromZone: Zone, toZone: Zone, context : Context) => boolean
} 

// export interface CardChoice {
//     zone: string,
//     by: string,
//     at: string | number
// }

export interface State {
	moveCheckRules : MoveCheckRule[],
	zones: {
		[key:string]: Zone
	}
}

export interface Context {
	[key:string]: any
}
