import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

interface ISpawn {
    map: string
    qty: number
    delay1: number
    delay2: number
    bossType: number
}

interface IMobInfo {
    mob_id: number
    name: string
    bossType: number
    spawns: Array<ISpawn>
    ctr: number
}

interface IDeadMob {
    killer: string
    mapname: string
    mob_id: number
    death_time: string
    mob: Object
}

interface IMvpEntry {
    mob_id: number
    mob_name: string
    death_time?: any
    map_name: string
    delay1?: number
    delay2?: number
    bossType?: number
}


let allMobInfos: { [index: number]: IMobInfo } = {}


class MvpStorage {
    [index: number]: { [index: string]: IMvpEntry }
}

interface IDeadMvpInfo extends Array<IDeadMob> { }
interface IMvpEntries extends Array<IMvpEntry> { }

async function getDeadMvp(): Promise<IDeadMvpInfo> {
    const mvpInfo = await fetch("https://api.ragnatales.com.br/mvp")
    return mvpInfo.json()
}

async function getMobInfo(mob_id: number): Promise<IMobInfo> {
    const spawnInfo = await fetch(`https://api.ragnatales.com.br/database/mob?mob_id=${String(mob_id)}`)
    const mobInfo = await spawnInfo.json()
    let ctr = 0
    for (const spawn of mobInfo.spawns) {
        ctr = ctr + spawn.qty
    }
    mobInfo["ctr"] = ctr
    return mobInfo
}



async function getDeadMvpInfo(): Promise<any> {
    const deadMvps = await getDeadMvp()
    let MvpOcurrences = new MvpStorage()
    for (const mob of deadMvps) {
        if (!(mob.mob_id in allMobInfos))
            allMobInfos[mob.mob_id] = await getMobInfo(mob.mob_id)
        console.log(mob.mapname)
        const map = allMobInfos[mob.mob_id].spawns.find(el => el.map = mob.mapname)
        if (!MvpOcurrences[mob.mob_id]) { MvpOcurrences[mob.mob_id] = {} }
        MvpOcurrences[mob.mob_id][mob.death_time] = {
            mob_id: mob.mob_id,
            mob_name: allMobInfos[mob.mob_id].name,
            map_name: mob.mapname,
            delay1: map?.delay1,
            delay2: map?.delay2,
            bossType: map?.bossType
        }
    }
    return MvpOcurrences
}

(async () => console.log(await getDeadMvpInfo()))()



// async function generateMvpEntries(): Promise<any> {
//     const deadMvps = await getDeadMvpInfo()
//     console.log(deadMvps)
//     let listAllMvpInstances: {[index: number]: IMvpEntries} = {}
//     for (const deadMob of deadMvps) {
//         const mob = await getMobInfo(deadMob.mob_id)
//         allMobInfos[mob.mob_id] = mob
//         const individualMvpInstances = MvpInfo(mob, deadMob)
//         listAllMvpInstances[mob.mob_id].push(individualMvpInstances)
//     }
//     console.log(listAllMvpInstances)
//     console.log(allMobInfos)
//     return listAllMvpInstances
// }

// (async () => console.log(await generateMvpEntries()))()


// async function updateMvpEntries(currentList: IMvpEntries): Promise<IMvpEntries> {
//     const deadMvps = await getDeadMvpInfo()
//     for (const deadMob of deadMvps) {
//         if (deadMob.mob_id in allMobInfos)
//     }
// 
//     return
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
