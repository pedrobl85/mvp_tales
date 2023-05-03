import React, { useEffect, useState } from 'react';
import './App.css';
import getInfo, { IMvpEntry } from './getinfo'
import 'semantic-ui-css/semantic.min.css'
import { Card, Icon, Image } from 'semantic-ui-react'
import MvpCard from './components/mvpcard'
import { getDeadMvpInfo } from './getinfo';

const initMob = {
    mapName: "abyss_04",
    mobName: "bone_detale",
    mobId: 20618,
    deathTime: "2023-05-03 13:11:50",
} as IMvpEntry


// TEST stuff
function App() {
    const [mobInfo, setMobInfo] = useState<IMvpEntry | undefined>(initMob)

    const getMobInfo = async () => {
        const mobInfo = await getDeadMvpInfo()
        const b = mobInfo.getDeadMob(1641, "lhz_dun03", "2023-05-03 16:09:56")
        console.log(b)
        setMobInfo(b)
    }
    useEffect(() => {
        getMobInfo()
        console.log("I TRIED SO HARD")
    }, [])

    return (
        <div>
            <MvpCard {...mobInfo === undefined ? initMob : mobInfo} />
        </div>
    )
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
