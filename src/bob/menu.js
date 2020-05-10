import React, { useState, useContext } from 'react'

import './_menu.scss';

import Button from '@material-ui/core/Button';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

import Auth from '../user-auth/user-auth';
import { userContext } from '../user-context/user-context';

const BobMenu = ({options, activeTab, changeTab}) => {
    const [viewUserInfo, setViewUserInfo] = useState(false);

    const toggleViewUserInfo = () => {
        setViewUserInfo(!viewUserInfo);
    }

    const Us = useContext(userContext);
    return <div className='bob-menu'>
        <Button 
            className='user' 
            startIcon={<AccountCircleIcon />}
            onClick={toggleViewUserInfo}
        >
            {Us.user.username}
        </Button>
        {options.map((o, id) => <Button 
            key={id}
            className={o.cl + (id == activeTab ? ' focus': '')}
            onClick={_ => changeTab(id)}
        >
            {o.icon}
        </Button>)}
        {viewUserInfo? <div className='user-info'>
            <Auth />
        </div>: null}
    </div>
}

export default BobMenu;