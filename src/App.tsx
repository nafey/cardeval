import { Card, Context } from "./engine/Interfaces";
import { CardEngine } from './engine/CardEngine.js';
import './App.css'
import Zone from "./engine/Zone.js";
import ReactJson from 'react-json-view'
import { useState } from "react";


let engine: CardEngine = new CardEngine();

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


engine.addZones(["T1", "T2", "Z3"]);
engine.addCard("T1", { suit: "D", num : 6 });


engine.addCard("T2", { suit: "C", num: 11 });
engine.addCard("T2", { suit: "S", num: 5 });
engine.addCard("T2", { suit: "D", num: 4 });




function App() {
	let [command, setCommand] = useState<string>("");
	const commandInput = (event: React.ChangeEvent<HTMLInputElement>) => {
		setCommand(event.target.value);
	};


	


	let zarr : {[key: string]: Card[]} = {}

	let keys = Object.keys(engine.state.zones);
	keys.forEach((v) =>{
		zarr[v] = engine.state.zones[v].cards
	});

	

	return (
		<>
			<ReactJson src={zarr["T1"]} theme={"monokai"} enableClipboard={false} displayDataTypes={false} displayObjectSize={false}/>
			<div>
				<input 
					value={command}
					onChange={commandInput}
				>
				</input>
				<button
					onClick={() => alert("Hello")}
				>
					
				</button>
			</div>
		</>
	)
}

export default App
