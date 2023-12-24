import { Card, Context } from "./engine/Interfaces";
import { CardEngine } from './engine/CardEngine.js';
import './App.css'
import Zone from "./engine/Zone.js";
import ReactJson from 'react-json-view'


let engine: CardEngine = new CardEngine()

engine.addMoveCheckRule({
	rule: (card: Card, _fromZone: Zone, toZone: Zone, _context: Context) => {
		if (toZone.size() < 1) return true;

		let last = toZone.last()

		let redSuit = ["D", "H"]
		let blackSuit = ["S", "C"]

		if ((redSuit.includes(last.suit) && redSuit.includes(card.suit)) || (blackSuit.includes(last.suit) && blackSuit.includes(card.suit))) return false;
		else return true;
	}
});


engine.addZones(["Z1", "Z2", "Z3"]);
engine.addCard("Z1", { suit: "D", num : 6 })

engine.addCard("Z2", { suit: "C", num: 11 });
engine.addCard("Z2", { suit: "S", num: 5 });
engine.addCard("Z2", { suit: "D", num: 4 });


let zarr : {[key: string]: Card[]} = {}

let keys = Object.keys(engine.state.zones);
keys.forEach((v) =>{
	zarr[v] = engine.state.zones[v].cards
});

function App() {

	return (
		<>
			<ReactJson src={zarr} theme={"monokai"} enableClipboard={false} displayDataTypes={false} displayObjectSize={false}/>
		</>
	)
}

export default App
