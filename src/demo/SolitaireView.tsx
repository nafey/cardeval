
import { CardEngine } from '../engine/CardEngine.js';
import ReactJson from 'react-json-view'
import { useState } from "react";
import SolitaireEngine from "./SolitaireEngine.js";

let engine: CardEngine = SolitaireEngine();

engine.addCard("T1", { suit: "D", num : 1, visible: false });
engine.addCard("T1", { suit: "D", num : 6 });

engine.addCard("T2", { suit: "C", num: 11, visible: false });
engine.addCard("T2", { suit: "S", num: 5 });
engine.addCard("T2", { suit: "D", num: 4 });

engine.addCard("T3", {suit: "C", num: 7});



function SolitaireView() {
	let [fromZoneName, setFromZoneName] = useState<string>("");
	let [toZoneName, setToZoneName] = useState<string>("");
	


	const fromZoneInput = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFromZoneName(event.target.value);
	};

	const toZoneInput = (event: React.ChangeEvent<HTMLInputElement>) => {
		setToZoneName(event.target.value);
	};

	let [view, setView] = useState<Record<string, string[]>>(engine.getPlayer().getView())

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
						engine.pushAction(["MOVE", {fromZone: fromZoneName, toZone: toZoneName}]);
						setView(engine.getPlayer().getView())
					}}
				>
					Submit
				</button>
			</div>
		</>
	)
}

export default SolitaireView;
