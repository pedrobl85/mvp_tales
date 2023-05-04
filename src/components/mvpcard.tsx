import moment from 'moment';
import React, { useEffect, useState } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Card, Icon, Image } from 'semantic-ui-react'
import { IMvpEntry } from '../getinfo'
import './component.css'



export default function MvpCard(mobInfo?: IMvpEntry): JSX.Element {
    function DeathTimer() {
        const [respawnTimer, setRespawnTimer] = useState<any>(moment())
        const deathTime = mobInfo?.deathTime.length > 4 ? mobInfo?.deathTime : "NULL"
        const [possibleFlag, setPossibleFlag] = useState<boolean>(false)

        function refreshTimer() {
            if (deathTime === "NULL") { setRespawnTimer("Alive") }
            else {
                const startPossibleSpawn = moment(deathTime).add(mobInfo?.delay1, "milliseconds")
                const endPossibleSpawn = startPossibleSpawn.add(mobInfo?.delay2, "milliseconds")
                const diff = moment.duration(moment().diff(startPossibleSpawn))

                // Checking if MVP is possibly alive
                if (diff.asMilliseconds() > 0) {setPossibleFlag(true)}
                else{setPossibleFlag(false)}

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
            <span className={`timer${possibleFlag ? " possibly_alive": " dead"}`}>
                {respawnTimer.toString()}
            </span>
        )
    }


    return (
        <Card>
            <Card.Content>
                <Card.Header>{mobInfo === undefined ? "NULL" : mobInfo.mobName}</Card.Header>
                <Card.Meta>
                    <span className='date'>{mobInfo === undefined ? "NULL" : mobInfo.mobId}</span>
                </Card.Meta>
                <Card.Description>
                    <DeathTimer />
                </Card.Description>
            </Card.Content>
            <Card.Content extra>

            </Card.Content>
        </Card>
    );
}
