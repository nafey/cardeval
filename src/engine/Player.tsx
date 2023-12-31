import Zone from "./Zone";

const generateId = () : string => {
	let characters = "0123456789abcdef"
	let str = characters[1 + Math.floor(Math.random() * 15)]
	for(let i = 0; i < 20; i++){
		str += characters[Math.floor(Math.random() * 16)]
	}

	return str;
}

export default class Player {
	playerId: string = generateId();
	private name: string = "";
	private zones: Record<string, Zone> = {};

	constructor (n: string = "") {
		this.name = n;
	}

	getName = () : string => {
		return this.name;
	}

	setZone = (zoneName: string, zone: Zone) => {
		zone.playerId = this.playerId;
		this.zones[zoneName] = zone;
	} 

	getZone = (zoneName: string) : Zone => {
		return this.zones[zoneName]
	}

}