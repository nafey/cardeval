import { Card, State } from "./engine/Interfaces";
import { CardEngine } from './engine/CardEngine.js';
import './App.css'
import Zone from "./engine/Zone.js";
import ReactJson from 'react-json-view'
import { useState } from "react";


let engine: CardEngine = new CardEngine();

engine.addMoveCheckRule({
	rule: (card: Card, _fromZone: Zone, toZone: Zone) => {
		if (toZone.size() < 1) return true;

		let last = toZone.last()

		let redSuit = ["D", "H"]
		let blackSuit = ["S", "C"]

		if ((redSuit.includes(last.suit) && redSuit.includes(card.suit)) || (blackSuit.includes(last.suit) && blackSuit.includes(card.suit))) return false;
		else return true;
	}
});


engine.addZones(["T1", "T2", "T3"]);
engine.addCard("T1", { suit: "D", num : 6 });


engine.addCard("T2", { suit: "C", num: 11, visible: false });
engine.addCard("T2", { suit: "S", num: 5 });
engine.addCard("T2", { suit: "D", num: 4 });

console.log(engine.getPlayer().getView())


function App() {
	let [command, setCommand] = useState<string>("");
	const commandInput = (event: React.ChangeEvent<HTMLInputElement>) => {
		setCommand(event.target.value);
	};

	let [gameState, setGameState] = useState<State>(engine.state)




	let zarr : {[key: string]: Card[]} = {}

	let keys = Object.keys(gameState.zones);
	keys.forEach((v) =>{
		zarr[v] = gameState.zones[v].cards
	});

	

	return (
		<>
			<ReactJson
				src={gameState?.zones} theme={"monokai"} enableClipboard={false} displayDataTypes={false} displayObjectSize={false}
			/>

			<div>
				<input 
					value={command}
					onChange={commandInput}
				>
				</input>
				<button
					key="btn"
					onClick={() => {
						engine.moveCardRel("T1", "FIRST", "T3");
						setGameState({...engine.state})
					}}
				>
					Submit
				</button>
			</div>
		</>
	)
}

export default App
