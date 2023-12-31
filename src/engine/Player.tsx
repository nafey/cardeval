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
	private zones: Record<string, Zone> = {}


	setZone = (zoneName: string, zone: Zone) => {
		this.zones[zoneName] = zone
	} 

	getZone = (zoneName: string) : Zone => {
		return this.zones[zoneName]
	}
}