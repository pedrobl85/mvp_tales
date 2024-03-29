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

export interface IMvpEntry {
    mobId: number
    mobName: string
    deathTime?: any
    mapName: string
    delay1?: number
    delay2?: number
    bossType?: number
    killer?: string
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

export class MvpStorage {
    public objects: MultiKeyData = {};

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

    public getDeadMob(id: number, mapName: string, deathTime: string): IMvpEntry | undefined {
        return this.objects[id]?.[mapName]?.objects[deathTime];
    }

    public getMaps(id: number): object {
        return this.objects[id]
    }

    public getObjects() {
        return this.objects
    }

    public getMapInfo(id: number, mapName: string): object[] {
        return Object.values(this.objects[id]?.[mapName]?.objects ?? {});
    }
    public getMapDeadCtr(id: number, mapName: string): number {
        return this.objects[id]?.[mapName]?.deadCtr === undefined ? 0 : this.objects[id]?.[mapName]?.deadCtr
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
    console.log(`Adding ${mobInfo.mob_id} information!`)
    return mobInfo
}



export async function getDeadMvpInfo(): Promise<MvpStorage> {
    const deadMvps = await getDeadMvp()
    let MvpOcurrences = new MvpStorage()
    for (const mob of deadMvps) {
        if (!(mob.mob_id in allMobInfos))
            allMobInfos[mob.mob_id] = await getMobInfo(mob.mob_id)
        const map = allMobInfos[mob.mob_id].spawns.reverse().find(el => el.map === mob.mapname) // reversing because there are bugged entries that come first for some mobs(1087,12)
        const temp = {
            mobId: mob.mob_id,
            deathTime: mob.death_time,
            mobName: allMobInfos[mob.mob_id].name,
            mapName: mob.mapname,
            delay1: map?.delay1,
            delay2: map?.delay2,
            bossType: map?.bossType,
            killer: mob.killer
        } as IMvpEntry
        MvpOcurrences.addObject(mob.mob_id, mob.mapname, mob.death_time, temp)
    }
    return MvpOcurrences
}

function generateAliveMvpInfo(MvpOcurrences: MvpStorage, allMobInfos: { [index: number]: IMobInfo }): void {
    for (const mobId in allMobInfos) {
        // generate Alive MvpInfo for known MVPs that have no dead ocurrence
        if (!(mobId in MvpOcurrences.getObjects())) {
            console.log(`mobId ${mobId} in mobInfos but not MvpOcurrences`)
            console.log(allMobInfos)
            console.log(MvpOcurrences)
            populateWithAliveInfo(allMobInfos[mobId], MvpOcurrences)
        }
        else {
            adjustAliveInfo(allMobInfos[mobId], MvpOcurrences)
        }
        // generate Alive MvpInfo for known MVPs that already have dead ocurrences
    }
}

function populateWithAliveInfo(mobInfo: IMobInfo, MvpOcurrences: MvpStorage): void {
    for (const spawn of mobInfo["spawns"]) {
        for (let i = spawn.qty; i > 0; i--) {
            let temp = {
                deathTime: `alive-${i.toString()}`,
                mapName: spawn.map,
                delay1: spawn.delay1,
                delay2: spawn.delay2,
                bossType: spawn.bossType,
                mobId: mobInfo.mob_id,
                mobName: mobInfo.name
            } as IMvpEntry
            MvpOcurrences.addObject(mobInfo.mob_id, spawn.map, `alive-${i.toString()}`, temp, false)
        }
    }
}

function adjustAliveInfo(mobInfo: IMobInfo, MvpOcurrences: MvpStorage): void {
    for (const spawn of mobInfo["spawns"]) {
        const totalSpawns = spawn.qty
        const deadCtr = MvpOcurrences.getMapDeadCtr(mobInfo.mob_id, spawn.map)
        console.log(mobInfo.mob_id, spawn.map, deadCtr)
        if (totalSpawns !== deadCtr) {
            for (let k = totalSpawns - deadCtr; k > 0; k--) {
                let temp = {
                    deathTime: `alive+${k.toString()}`,
                    mapName: spawn.map,
                    delay1: spawn.delay1,
                    delay2: spawn.delay2,
                    bossType: spawn.bossType,
                    mobId: mobInfo.mob_id,
                    mobName: mobInfo.name,
                    
                } as IMvpEntry
                MvpOcurrences.addObject(mobInfo.mob_id, spawn.map, `alive+${k.toString()}`, temp, false)
            }
        }
    }
}

async function getKnownInfo(): Promise<void> {
    for (const mobId of [1038, 1039, 1046, 1059, 1086, 1087, 1089, 1090, 1091, 1092, 1093, 1096, 1112, 1115, 1120, 1147, 1150, 1157, 1159, 1190, 1203, 1204, 1205, 1251, 1252, 1259, 1262, 1272, 1283, 1289, 1302, 1307, 1312, 1373, 1388, 1389, 1418, 1492, 1511, 1582, 1583, 1623, 1630, 1658, 1681, 1685, 1688, 1719, 1720, 1734, 1751, 1765, 1768, 1785, 1832, 1871, 1885, 1917, 2068, 3658, 3659, 3747, 3748, 3749, 20618, 20940, 21163, 21301])
        if (!(mobId in allMobInfos))
            allMobInfos[mobId] = await getMobInfo(mobId)
}

export async function getInfo(): Promise<MvpStorage> {
    var startTime = performance.now()
    getKnownInfo()
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

