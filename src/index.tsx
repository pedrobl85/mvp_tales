import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

interface Spawn {
    map: string
    qty: number
    delay1: number
    delay2: number
    bossType: number
}

interface MobInfo {
    mob_id: number
    name: string
    delay1: number
    delay2: number
    bossType: number
    spawns: Array<Spawn>
}

interface DeadMob {
    killer: string
    map_name: string
    mob_id: number
    death_time: string
    mob: Object
}

interface MvpEntry {
    mob_id: number
    mob_name: string
    death_time?: any
    map_name: string
    qty: number
    delay1: number
    delay2: number
    bossType: number
}


interface IDeadMvpInfo extends Array<DeadMob> { }
interface IMvpEntries extends Array<MvpEntry> { }

async function getDeadMvpInfo(): Promise<IDeadMvpInfo> {
    const mvpInfo = await fetch("https://api.ragnatales.com.br/mvp")
    return mvpInfo.json()
}

async function getMobInfo(mob_id: number): Promise<MobInfo> {
    const spawnInfo = await fetch(`https://api.ragnatales.com.br/database/mob?mob_id=${String(mob_id)}`)
    return spawnInfo.json()
}

function MvpInfo(mob: MobInfo, deadMob?: DeadMob): IMvpEntries {
    let listOfMvpInstances: IMvpEntries = []
    mob.spawns.forEach(item => {
        const mvp: MvpEntry = {
            mob_id: mob.mob_id,
            mob_name: mob.name,
            map_name: item.map,
            qty: item.qty,
            delay1: item.delay1,
            delay2: item.delay2,
            bossType: item.bossType,
            death_time: deadMob ? deadMob.death_time : undefined
        }

        listOfMvpInstances.push(mvp)
    })
    return listOfMvpInstances
}

async function generateMvpEntries(): Promise<IMvpEntries> {
    const deadMvps = await getDeadMvpInfo()
    console.log(deadMvps)
    let listAllMvpInstances: IMvpEntries = []
    var allMobInfos: { [index: number]: MobInfo } = {}
    for (const deadMob of deadMvps) {
        const mob = await getMobInfo(deadMob.mob_id)
        allMobInfos[mob.mob_id] = mob
        const individualMvpInstances = MvpInfo(mob, deadMob)
        listAllMvpInstances.push.apply(listAllMvpInstances, individualMvpInstances)
    }
    console.log(listAllMvpInstances)
    console.log(allMobInfos)
    return listAllMvpInstances
}

(async () => console.log(await generateMvpEntries()))()


// async function updateMvpEntries(currentList: IMvpEntries): Promise<IMvpEntries> {
//     const deadMvps = await getDeadMvpInfo
// }

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
