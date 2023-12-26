import { Action, Card } from "./engine/Interfaces";
import { CardEngine } from './engine/CardEngine.js';
import './App.css'
import Zone from "./engine/Zone.js";
import ReactJson from 'react-json-view'
import { useState } from "react";

let engine: CardEngine = new CardEngine();


engine.addZones(["T1", "T2", "T3", "T4", "T5", "T6", "T7", "FH", "FD", "FC", "FS", "S", "W"]);
engine.addCard("T1", { suit: "D", num : 1, visible: false });
engine.addCard("T1", { suit: "D", num : 6 });

engine.addCard("T2", { suit: "C", num: 11, visible: false });
engine.addCard("T2", { suit: "S", num: 5 });
engine.addCard("T2", { suit: "D", num: 4 });

engine.addCard("T3", {suit: "C", num: 7});


const flipHandler = (action: Action, e: CardEngine) => {
	if (!action?.zoneName) return;
	let zoneName = action.zoneName;
	
	const zone : Zone = e.getZone(zoneName);
	if (zone.size() === 0) return;
	if (!zone.last().visible) zone.flip(zone.size() - 1);
}

engine.addHandler("FLIP", flipHandler);

const moveHandler = (action: Action, e: CardEngine) => {
	const validFroms : string[] = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "W"];
	const validTos: string[] = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "FH", "FD", "FC", "FS"];

	const fromZoneName : string = action.fromZone as string;
	const toZoneName : string = action.toZone as string;

	if (!validFroms.includes(fromZoneName)) return;
	if (!validTos.includes(toZoneName)) return;

	const fromZone = e.getZone(fromZoneName);
	const toZone = e.getZone(toZoneName);

	if (fromZone.size() === 0) return;

	let fromIndex : number = 0;
	
	for (let i = 0; i < fromZone.size(); i++) {
		if (fromZone.cards[i].visible) {
			fromIndex = i
		}
	}

	let fromCard : Card = fromZone.cards[fromIndex];
	
	if (toZone.size() === 0) {
		e.moveCards(fromZoneName, fromIndex, toZoneName);
		return;
	}
	
	let toCard : Card = toZone.last();

	if (fromCard.num + 1 !== toCard.num) {
		return;
	}

	let redSuit = ["D", "H"]
	let blackSuit = ["S", "C"]

	if ((redSuit.includes(fromCard.suit) && redSuit.includes(toCard.suit)) || (blackSuit.includes(fromCard.suit) && blackSuit.includes(toCard.suit))) return;

	e.moveCards(fromZoneName, fromIndex, toZoneName);
	e.pushAction({name: "FLIP", zoneName : fromZoneName})
}

engine.addHandler("MOVE", moveHandler);

function App() {
	let [fromZoneName, setFromZoneName] = useState<string>("");
	let [toZoneName, setToZoneName] = useState<string>("");
	


	const fromZoneInput = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFromZoneName(event.target.value);
	};

	const toZoneInput = (event: React.ChangeEvent<HTMLInputElement>) => {
		setToZoneName(event.target.value);
	};

	let [view, setView] = useState<Record<string, Card[]>>(engine.getPlayer().getView())

	return (
		<>
			<ReactJson src={view} theme={"monokai"} enableClipboard={false} displayDataTypes={false} displayObjectSize={false}/>
			<div>
				<input 
					key={1}
					value={fromZoneName}
					onChange={fromZoneInput}
				>
				</input>
				<input
					key={2}
					value={toZoneName}
					onChange={toZoneInput}
				/>
				<button
					key="btn"
					onClick={() => {
						engine.pushAction({name: "MOVE", fromZone: fromZoneName, toZone: toZoneName});
						setView(engine.getPlayer().getView())
					}}
				>
					Submit
				</button>
			</div>
		</>
	)
}

export default App;
