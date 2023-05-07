import { Card, Divider } from 'semantic-ui-react'
import './mvpcard'
import { MvpStorage, IMvpEntry } from '../getinfo'
import MvpCard from './mvpcard';


interface IComponentProp {
    mvpStorage: MvpStorage
}

const initMob = {
    mapName: "NULL",
    mobName: "NULL",
    mobId: 0,
    deathTime: "NULL",
} as IMvpEntry


export default function MvpCardGrid({ mvpStorage }: IComponentProp) {
    const bossArr = new Array<IMvpEntry | undefined>()
    const minibossArr = new Array<IMvpEntry | undefined>()
    console.log(mvpStorage)
    const b = mvpStorage.getObjects()
    for (const mobId in b) {
        for (const map in b[mobId]) {
            for (const mob in (b[mobId][map].objects)) {
                const temp = mvpStorage.getDeadMob(+mobId, map, mob)
                if (temp?.bossType === 2) {
                    bossArr.push(temp)
                }
                else {
                    minibossArr.push(temp)
                }
            }
        }
    }

    var mvpCards = bossArr.map(function(mob) {
        return (<MvpCard key={[mob?.mobId, mob?.deathTime, mob?.mapName].join()}{...mob === undefined ? initMob : mob} />)
    })
    var minibossCards = minibossArr.map(function(mob) {
        return (<MvpCard key={[mob?.mobId, mob?.deathTime, mob?.mapName].join()}{...mob === undefined ? initMob : mob} />)
    })

    return (
        <div className="container">
            <h1> MVP </h1>
            <Card.Group>
                {mvpCards}
            </Card.Group>
            <Divider />
            <h1> Mini-Boss</h1>
            <Card.Group>
                {minibossCards}
            </Card.Group>

        </div>



    )
}
