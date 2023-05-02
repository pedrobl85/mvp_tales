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
    mobId: number
    mobName: string
    deathTime?: any
    mapName: string
    delay1?: number
    delay2?: number
    bossType?: number
}



let allMobInfos: { [index: number]: IMobInfo } = {}

interface ObjectData {
    [deathTime: string]: IMvpEntry;
}

interface MapData {
    [mapName: string]: {
        objects: ObjectData
        deadCtr: number
    }
    ;
}

interface MultiKeyData {
    [id: number]: MapData;
}

class MvpStorage {
    private objects: MultiKeyData = {};

    public addObject(id: number, mapName: string, deathTime: string, object: IMvpEntry, deadFlag = true): void {
        if (!this.objects[id]) {
            this.objects[id] = {};
        }
        if (!this.objects[id][mapName]) {
            this.objects[id][mapName] = {
                objects: {},
                deadCtr: 0
            };
        }
        this.objects[id][mapName].objects[deathTime] = object;
        if (deadFlag) { this.objects[id][mapName].deadCtr++ }
    }

    public getDeadMobInfo(id: number, mapName: string, deathTime: string): object | undefined {
        return this.objects[id]?.[mapName]?.objects[deathTime];
    }

    public getMapInfo(id: number, mapName: string): object[] {
        return Object.values(this.objects[id]?.[mapName]?.objects ?? {});
    }
    public getMapDeadCtr(id: number, mapName: string): number {
        return this.objects[id]?.[mapName]?.deadCtr
    }
}


interface IDeadMvpInfo extends Array<IDeadMob> { }

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



async function getDeadMvpInfo(): Promise<MvpStorage> {
    const deadMvps = await getDeadMvp()
    let MvpOcurrences = new MvpStorage()
    for (const mob of deadMvps) {
        if (!(mob.mob_id in allMobInfos))
            allMobInfos[mob.mob_id] = await getMobInfo(mob.mob_id)
        const map = allMobInfos[mob.mob_id].spawns.find(el => el.map = mob.mapname)
        const temp = {
            mobId: mob.mob_id,
            deathTime: mob.death_time,
            mobName: allMobInfos[mob.mob_id].name,
            mapName: mob.mapname,
            delay1: map?.delay1,
            delay2: map?.delay2,
            bossType: map?.bossType,
        } as IMvpEntry
        MvpOcurrences.addObject(mob.mob_id, mob.mapname, mob.death_time, temp)
        console.log(MvpOcurrences.getDeadMobInfo(mob.mob_id, mob.mapname, mob.death_time))
    }
    return MvpOcurrences
}

function generateAliveMvpInfo(MvpOcurrences: MvpStorage, allMobInfos: { [index: number]: IMobInfo }): void {
    for (const mobId in allMobInfos) {
        // generate Alive MvpInfo for known MVPs that have no dead ocurrence
        if (!(mobId in MvpOcurrences)) {
            populateWithAliveInfo(allMobInfos[mobId], MvpOcurrences)
        }
        adjustAliveInfo(allMobInfos[mobId], MvpOcurrences)
        // generate Alive MvpInfo for known MVPs that already have dead ocurrences
    }
}

function populateWithAliveInfo(mobInfo: IMobInfo, MvpOcurrences: MvpStorage): void {
    let i = 1
    let temp = {
        mobId: mobInfo.mob_id,
        mobName: mobInfo.name
    } as IMvpEntry
    for (const spawn of mobInfo["spawns"]) {
        temp.deathTime = i.toString()
        temp.mapName = spawn.map
        temp.delay1 = spawn.delay1
        temp.delay2 = spawn.delay2
        temp.bossType = spawn.bossType
        MvpOcurrences.addObject(mobInfo.mob_id, spawn.map, `alive+${i.toString()}`, temp, false)
        i++
    }
}

function adjustAliveInfo(mobInfo: IMobInfo, MvpOcurrences: MvpStorage): void {
    let i = 1
    let temp = {
        mobId: mobInfo.mob_id,
        mobName: mobInfo.name
    } as IMvpEntry
    for (const spawn of mobInfo["spawns"]) {
        const totalSpawns = spawn.qty
        const deadCtr = MvpOcurrences.getMapDeadCtr(mobInfo.mob_id, spawn.map)
        if (totalSpawns !== deadCtr) {
            for (let k = totalSpawns - deadCtr; k > 0; k--) {
                temp.deathTime = i.toString()
                temp.mapName = spawn.map
                temp.delay1 = spawn.delay1
                temp.delay2 = spawn.delay2
                temp.bossType = spawn.bossType
                MvpOcurrences.addObject(mobInfo.mob_id, spawn.map, `alive+${i.toString()}`, temp, false)
                i++
            }
        }
    }
}

async function getInfo(): Promise<MvpStorage> {
    var startTime = performance.now()
    const deadInfo = await getDeadMvpInfo()
    var endTime = performance.now()
    console.log(`Call to getDeadMvpInfo took ${endTime - startTime} milliseconds`)
    startTime = performance.now()
    generateAliveMvpInfo(deadInfo, allMobInfos)
    endTime = performance.now()
    console.log(`Call to generateAliveMvpInfo took ${endTime - startTime} milliseconds`)
    console.log(deadInfo)
    return deadInfo
}

// TESTING AREA
let intervalID = window.setInterval(getInfo, 60000);


//END TESTING


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
