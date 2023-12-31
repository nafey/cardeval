import ReactJson from 'react-json-view'
import { useState } from "react";
import SolitaireEngine, {SolitaireCard} from "src/demo/solitaire/SolitaireEngine";
import Player from 'src/engine/Player';

let engine : SolitaireEngine = new SolitaireEngine();

let p : Player = engine.getPlayer()

p.getZone("T1").addCard(new SolitaireCard(false, { suit: "D", num : 1 }));
p.getZone("T1").addCard(new SolitaireCard(true, { suit: "D", num : 6 }));
p.getZone("T2").addCard(new SolitaireCard(false, { suit: "C", num : 11 }));
p.getZone("T2").addCard(new SolitaireCard(true, { suit: "S", num : 5 }));
p.getZone("T2").addCard(new SolitaireCard(true, { suit: "D", num : 4 }));
p.getZone("T3").addCard(new SolitaireCard(true, { suit: "D", num : 7 }));

function SolitaireView() {
	let [fromZoneName, setFromZoneName] = useState<string>("");
	let [toZoneName, setToZoneName] = useState<string>("");
	


	const fromZoneInput = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFromZoneName(event.target.value);
	};

	const toZoneInput = (event: React.ChangeEvent<HTMLInputElement>) => {
		setToZoneName(event.target.value);
	};

	let [view, setView] = useState<Record<string, string[]>>(engine.getState().getView())

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
						engine.moveHandler(fromZoneName, toZoneName);
						setView(engine.getState().getView())
					}}
				>
					Submit
				</button>
			</div>
		</>
	)
}

export default SolitaireView;
