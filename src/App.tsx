import { useEffect, useState } from 'react';
import './App.css';
import { getInfo, MvpStorage } from './getinfo'
import 'semantic-ui-css/semantic.min.css'
import MvpCardGrid from './components/grid'




// TEST stuff
function App() {
    const [mvpInfo, setMvpInfo] = useState<MvpStorage>()

    useEffect(() => {
        let first = true
        async function getMobInfo(): Promise<void> {
            const mobInfo = await getInfo()
            console.log(mobInfo)
            setMvpInfo(mobInfo)
        }
        if (first) {
            getMobInfo()
        }
        setInterval(getMobInfo, 120000)
    }, [])
    if (mvpInfo) {
        return (
            <div>
                <MvpCardGrid mvpStorage={mvpInfo} />
            </div>
        )
    }
    else { return null }
}

export default App;


//end test
//
//
//
//
// function App() {
//     return (
//         <div>
//             <MvpCard />
//         </div>
//     );
// }
// 
// export default App;
