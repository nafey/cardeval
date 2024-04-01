import Engine, {Event, Dict} from "./Engine";
import { generateId } from "./Utils";
import Zone from "./Zone";


export default class Player {

	playerId: string = generateId();
	private engine: Engine;
	name: string = "";
	zones: Record<string, Zone> = {};
	players : Record<string, Player> = {};
	allowedEvents : Set<string>;

	refs: Dict = {}

	constructor (engine : Engine) {
		this.engine = engine;
		this.allowedEvents = new Set<string>()
	}

	addZone = (zoneName: string) => {
		let zone : Zone = new Zone();
		zone.playerId = this.playerId;

		this.zones[zoneName] = zone;
		
		this.refs[zoneName] = zone; 

		return zone;
	} 
	
	eval = (event: Event) => {
		if (!this.allowedEvents.has(event.event)) throw Error("This action is not allowed")
					
		this.engine.eval(event, this.refs)
	}


}
