export interface Card {
    [key: string]: any;
}

export interface Rule {
    ruleType: string
    ruleCode: (...args: any[]) => boolean
}

export interface CardChoice {
    zone: string,
    by: string,
    at: string | number
}

export interface State {
	rules : Rule[],
	zones: {
		[key:string]: Card[]
	}
}

export interface Context {
	[key:string]: any
}
