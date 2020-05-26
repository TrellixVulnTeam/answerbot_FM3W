// import react
import React, {Component, useState, useContext, useEffect, useRef} from 'react';
import {userContext} from '../user-context/user-context';

// third party imports
import io from 'socket.io-client';
import {CSSTransition} from 'react-transition-group';
import $ from 'jquery';
import Sound from 'react-sound';

// import style file
import './_bob.scss';

// other cpns imports
import BobMenu from './menu';
import Ask from './ask';
import NewChat from './new-chat'
import HistoryBookmarks from './history-bookmarks';
import News from './news';
import AnswerInsights from './answer-insights';
import IncomingMsg from '../../sounds/incoming-msg.mp3';

const Options = [
    {
        icon: <img src={require('../../imgs/bob/chat.svg')}/>,
        cl: 'view-ask',
        view: (props) => <Ask {...props} />,
        name: 'chat'
    },
    {
        icon: <img src={require('../../imgs/bob/bookmark-history.svg')}/>,
        cl: 'view-bookmarks',
        view: (props) => <HistoryBookmarks {...props} />,
        name: 'history'
    },
    {
        icon: <img src={require('../../imgs/bob/feed.svg')}/>,
        cl: 'view-explore',
        view: (props) => <News {...props} />,
        name: 'explorer'
    },
]

export default class Bob extends Component {
    static contextType = userContext;
    state = {
        hints: [],
        chats: [],
        pins: [],
        tab: 0, 
        minimal: true,
        newResponseComing: false,
        insight: null,
        isTyping: false
    }
    socket = io({
        transports: ['websocket']
    })


    _setInsight = (cnt) => {
        if (cnt == null) 
            this.setState({insight: null});
        else if (cnt.type != 'answer')
            this.setState({insight: null});
        else if (cnt.answer == null) 
            this.setState({insight: null});
        else 
            this.setState({insight: cnt});
    }

    _scrollToBottom = () => {
        if ($(".old-chats").length > 0) {
            $(".old-chats").animate({
                scrollTop: $('.old-chats')[0].scrollHeight - $('.old-chats')[0].clientHeight + 50
            }, 500);
        }
    }

    componentDidMount () {
        console.log(document.referrer)
        this.socket.on('bob-msg', msg => {
            if (msg.conversationID == this.context.user.userid) {
                // update user chat history
                let chats_ = this.state.chats.slice();
                chats_.push(msg.chat);

                let dct = this.context.user;
                dct.history.push(msg.chat);
                this.context.updateUser(dct);
                // update state
                this.setState({
                    newResponseComing: true,
                    chats: chats_,
                    isTyping: false
                });
                this._scrollToBottom();
            }
        })
        this.socket.on('new-chat', msg => {
            if (msg.conversationID == this.context.user.userid) {
                let chats_ = this.state.chats.slice();
                chats_.push(msg.chat);
                this.setState({chats: chats_, hints: [], isTyping: true});
                this._scrollToBottom();
            }
        })
        this.socket.on('bob-hints', msg => {
            if (msg.conversationID == this.context.user.userid) {
                console.log('hints response time: ', new Date().getTime() - msg.timestamp)
                this.setState({hints: msg.hints})
            }
        })
    }

    componentWillUnmount () {
        this.socket.disconnect();
    }

    toggleMode = () => {
        if (this.state.minimal) {
            this.setState({minimal: false, newResponseComing: false});
        } else {
            this.setState({minimal: true, insight: null});
        }
    }

    changeTab = (id) => {
        this.setState({tab: id});
    }

    render() {
        let props = {
            socket: this.socket,
            chats: this.state.chats,
            hints: this.state.hints,
            setInsight: this._setInsight,
            insight: this.state.insight,
            isTyping: this.state.isTyping
        }
        let V = Options[this.state.tab]
        return <div className='bob-container'>
            {this.state.insight && <AnswerInsights 
                content={this.state.insight} 
                setContent={this._setInsight}
            />}
            {this.state.newResponseComing && <Sound 
                url={IncomingMsg} 
                playStatus='PLAYING' 
                onFinishedPlaying={_ => this.setState({newResponseComing: false})}
            />}
            <div className='bob-ava' >
                {this.state.newResponseComing && <span className='notif-res'></span>}
                
                <img src={require('../../imgs/bob/bob-transparent.svg')} onClick={this.toggleMode} />
            </div>
 
            <CSSTransition 
                in={!this.state.minimal} 
                unmountOnExit 
                classNames='bob' 
                timeout={350}
            >
                <div className='bob maximal'>
                    <BobMenu 
                        options={Options} 
                        activeTab={this.state.tab}
                        changeTab={this.changeTab} 
                        toggleMode={this.toggleMode}
                    />
                    {this.context.user.userid? <V.view {...props}/>: null}
                </div>
            </CSSTransition>
        </div>
    }
}