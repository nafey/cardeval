import { Card } from "./engine/Interfaces";
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

engine.addZones(["T1", "T2", "T3", "T4", "T5", "T6", "T7", "FH", "FD", "FC", "FS", "S", "W"]);
engine.addCard("T1", { suit: "D", num : 6 });

engine.addCard("T2", { suit: "C", num: 11, visible: false });
engine.addCard("T2", { suit: "S", num: 5 });
engine.addCard("T2", { suit: "D", num: 4 });

// let moveValidator = (m: ActionMessage) => {
// 	let actionName = m.action;
// 	let ret = {
// 		valid: false,
// 	}

// 	let validFroms : string[] = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "W"];
// 	let validTos: string[] = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "FH", "FD", "FC", "FS"];

// 	let fromZone : string = m.fromZone as string;
// 	let toZone : string = m.toZone as string;

// 	if (!validFroms.includes(fromZone)) return {...ret, error: "Invalid From Zone"};
// 	if (!validTos.includes(toZone)) return {...ret, error: "Invalid To Zone"};


// 	return ret;

// }


function App() {
	let [command, setCommand] = useState<string>("");
	const commandInput = (event: React.ChangeEvent<HTMLInputElement>) => {
		setCommand(event.target.value);
	};

	let [view, setView] = useState<Record<string, Card[]>>(engine.getPlayer().getView())

	return (
		<>
			<ReactJson
				src={view} theme={"monokai"} enableClipboard={false} displayDataTypes={false} displayObjectSize={false}
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
						setView(engine.getPlayer().getView())
					}}
				>
					Submit
				</button>
			</div>
		</>
	)
}

export default App
