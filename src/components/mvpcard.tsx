import moment, { Moment } from 'moment';
import React, { useEffect, useState } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Card } from 'semantic-ui-react'
import { IMvpEntry } from '../getinfo'
import './component.css'



export default function MvpCard(mobInfo?: IMvpEntry): JSX.Element {
    const [respawnTimer, setRespawnTimer] = useState<Moment | string>(moment())
    const [aliveChance, setAliveChance] = useState<number>()
    const [possibleFlag, setPossibleFlag] = useState<boolean>(false)
    function DeathTimer() {
        const deathTime = mobInfo?.deathTime.length > 10 ? mobInfo?.deathTime : "NULL"

        function refreshTimer() {
            if (deathTime === "NULL") { setRespawnTimer("Alive") }
            else {
                const startPossibleSpawn = moment(deathTime).add(mobInfo?.delay1, "millisecond")
                const diff = moment.duration(moment().diff(startPossibleSpawn))

                // Checking if MVP is possibly alive
                if (diff.asMilliseconds() > 0) {
                    const endPossibleSpawn = startPossibleSpawn.add(mobInfo?.delay2, "millisecond")
                    setPossibleFlag(true)
                    const nowDiff = moment.duration(moment().diff(endPossibleSpawn))
                    if (mobInfo?.delay2) {
                        setAliveChance(Math.floor(100 - ((endPossibleSpawn.diff(moment())) / mobInfo?.delay2) * 100))
                    }
                }
                else { setPossibleFlag(false) }

                const time = moment.utc(Math.abs(diff.asMilliseconds())).format("HH:mm:ss")
                setRespawnTimer(time)
            }
        }

        useEffect(() => {
            const timerIntervalId = setInterval(refreshTimer, 1000)
            return function cleanup() {
                clearInterval(timerIntervalId);
            }
        }, [])
        return (

            <div className = "timer_container">
                <span className={respawnTimer === "Alive" ? "alive" : `timer${possibleFlag ? " possibly_alive" : " dead"}`}>
                    {respawnTimer.toString()}
                </span>
                <span className='alive alivePercentage'>
                    {aliveChance ? `${aliveChance.toString()}%` : ""}
                </span>
            </div>
        )
    }


    return (
        <Card>
            <Card.Content>
                <Card.Header>{mobInfo === undefined ? "NULL" : mobInfo.mobName}</Card.Header>
                <Card.Meta>
                    <span className='date'>{mobInfo === undefined ? "NULL" : mobInfo.mobId}</span>
                </Card.Meta>
                <Card.Content extra>
                    <span className='map_name'>{mobInfo === undefined ? "NULL" : mobInfo.mapName}</span>
                </Card.Content>
                <Card.Description>
                    <DeathTimer />
                </Card.Description>
            </Card.Content>
        </Card>
    );
}
