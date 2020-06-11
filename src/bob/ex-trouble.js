import React, { useState, useEffect } from 'react';
import {postForData} from '../utils';

import Actions, {postActionMsg} from './actions'
import './_ex-trouble.scss'
import ErrIcon from '../../imgs/bob/err.svg'

const ErrMsg = ({msg}) => {
    if (msg) 
        return <span className='err-msg'>
            <ErrIcon />
            {msg}
        </span>
    return null
}

const ExTrouble = ({content}) => {
    const [errAvailable, setErrAvailable] = useState(false)
    const [msg, setMsg] = useState('')

    const _retrieveMsg = async () => {
        if (content.type == 'exercise-err-message')
            setMsg(await postActionMsg(Actions.SHOWHELP))
        else 
            setMsg(await postActionMsg(Actions.SHOWCOMMONERRORS))
    }

    useEffect(() => {
        _retrieveMsg()
    }, [])

    return <div className='ex-trouble'>
        <div className='chat'>
            <span className='text'>{msg}</span>
        </div>
        {content.type == 'exercise-err-message'? <div className='err-msgs'>
            <span 
                className='err-msg' 
            > 
                <ErrIcon/>
                {content.text}
            </span>
        </div>: <div className='err-msgs'>
            {content.answer.map((m, id) => <ErrMsg msg={m.error_code_message} key={id}/>
            )}
        </div>}
    </div>
}

export default ExTrouble