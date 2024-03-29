import Card from "./Card";
import Engine, {Event} from "./Engine";
import { generateId } from "./Utils";
import Zone from "./Zone";


export default class Player {

	playerId: string = generateId();
	private engine: Engine;
	name: string = "";
	zones: Record<string, Zone> = {};
	players : Record<string, Player> = {};
	allowedEvents : Set<string>;

	refs: Record<string, Card> = {}

	constructor (engine : Engine) {
		this.engine = engine;
		this.allowedEvents = new Set<string>()
	}

	addZone = (zoneName: string, zone: Zone) => {
		zone.playerId = this.playerId;
		this.zones[zoneName] = zone;
	} 
	
	eval = (event: Event) => {
		if (this.allowedEvents.has(event.event))
		this.engine.eval(event, this.refs)
	}


}
