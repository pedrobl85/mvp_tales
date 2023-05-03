import moment from 'moment';
import React, { useEffect, useState } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Card, Icon, Image } from 'semantic-ui-react'
import { IMvpEntry } from '../getinfo'



export default function MvpCard(mobInfo: IMvpEntry): JSX.Element {
    function Timer() {
        const [date, setDate] = useState(moment())

        function refreshTimer() {
            setDate(moment())
        }
        useEffect(() => {
            const timerIntervalId = setInterval(refreshTimer, 1000)
            return function cleanup() {
                clearInterval(timerIntervalId);
            }
        }, [])
        return (
            <span>
                {date.toLocaleString()}
            </span>
        )
    }

    return (
        <Card>
            <Card.Content>
                <Card.Header>{mobInfo.mobName}</Card.Header>
                <Card.Meta>
                    <span className='date'>{mobInfo.mobId}</span>
                </Card.Meta>
                <Card.Description>
                    <Timer />
                </Card.Description>
            </Card.Content>
            <Card.Content extra>
                <a>
                    <Icon name='user' />
                    22 Friends
                </a>
            </Card.Content>
        </Card>
    );
}
