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


interface DeadMvpInfo extends Array<DeadMob> { }
interface MvpEntries extends Array<MvpEntry> { }

async function getDeadMvpInfo(): Promise<DeadMvpInfo> {
    const mvpInfo = await fetch("https://api.ragnatales.com.br/mvp")
    return mvpInfo.json()
}

async function getMobInfo(mob_id: number): Promise<MobInfo> {
    const spawnInfo = await fetch(`https://api.ragnatales.com.br/database/mob?mob_id=${String(mob_id)}`)
    return spawnInfo.json()
}

function MvpInfo(mob: MobInfo, deadMob?: DeadMob): MvpEntries {
    let listOfMvpInstances: MvpEntries = []
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

async function generateMvpEntries(): Promise<MvpEntries> {
    const deadMvps = await getDeadMvpInfo()
    console.log(deadMvps)
    var listAllMvpInstances: MvpEntries = []
    deadMvps.forEach(async deadMob => {
        const mob = await getMobInfo(deadMob.mob_id)
        const individualMvpInstances = MvpInfo(mob, deadMob)
        listAllMvpInstances = listAllMvpInstances.concat(individualMvpInstances)
        console.log(listAllMvpInstances)
    })
    return listAllMvpInstances
}

async function updateMvpEntries(currentList: MvpEntries): Promise<MvpEntries> {

}

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
