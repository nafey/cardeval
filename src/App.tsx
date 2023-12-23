import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { CardEngine, Card, Context } from './CardEngine.js';
import './App.css'


let engine : CardEngine = new CardEngine()
engine.addZone("Z1")
engine.addZone("Z2")
engine.addCard("Z1",{suit: "D",num: 4})
engine.addCard("Z2",{suit: "S", num: 5})



// engine.message([
//     {
//         action: "ADD_RULE",
//         rule: {
//             ruleType: "MOVE_CHECK",
//             ruleCode: (card : Card, fromZone : string, toZone: string, context: Context) => {
//                 let top = context.getTopCard(toZone)
//                 let redSuit = ["D", "H"]
//                 let blackSuit = ["S", "C"]
//                 console.log(card)
//                 console.log(top)
//                 console.log("redSuit top " + redSuit.includes(top.suit))
//                 console.log("redSuit card " + redSuit.includes(card.suit))

//                 if ((redSuit.includes(top.suit) && redSuit.includes (card.suit)) || (blackSuit.includes(top.suit) && blackSuit.includes (card.suit))) return false;
//                 else return true;
//             }
//         }
        
//     },
//     {
//         action: "ADD_ZONE",
//         zone: "z1"
//     },
	
//     {
//         action: "ADD_ZONE",
//         zone: "z2"
//     },
//     {
//         action: "ADD_ZONE",
//         zone: "deck"
//     },
//     {
//         action: "ADD_CARD",
//         zone: "z1",
//         card: {
//             suit: "D",
//             num: 4
//         }
//     },
//     {
//         action: "ADD_CARD",
//         zone: "z2",
//         card: {
//             suit: "S",
//             num: 5
//         }
//     },
//     {
//         action: "CHOOSE_CARD",
//         criteria: {
//             zone: "z1",
//             by: "REL_POS",
//             at: "TOP"
//         }
//     },
//     {
//         action: "CHOOSE_ZONE",
//         zone: "z2"
//     },
// 	{
// 		action: "PRINT"
// 	},
//     {
//         action: "MOVE_CARD"
//     }
// ]);

function App() {
	const [count, setCount] = useState(0)

	return (
		<>
			<div>
				<a href="https://vitejs.dev" target="_blank">
					<img src={viteLogo} className="logo" alt="Vite logo" />
				</a>
				<a href="https://react.dev" target="_blank">
					<img src={reactLogo} className="logo react" alt="React logo" />
				</a>
			</div>
			<h1>Vite + React</h1>
			<div className="card">
				<button onClick={() => setCount((count) => count + 1)}>
					count is {count}
				</button>
				<p>
					Edit <code>src/App.tsx</code> and save to test HMR
				</p>
			</div>
			<p className="read-the-docs">
				Click on the Vite and React logos to learn more
			</p>
		</>
	)
}

export default App
