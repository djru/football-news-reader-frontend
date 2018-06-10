import React, { Component } from 'react'
import {ACTIONS} from './reducers'
import axios from 'axios'
import _ from 'lodash'
import './App.css'
import TweetEmbed from './TweetEmbed'
import { connect } from 'react-redux';

const minute = 1000*60


class App extends Component {
  constructor(props){
    super(props)
    // we want to turn this off so the page doesn't accidentally autoscroll to the end and then instantly load more tweets
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // don't have a great place to put this so I'm putting it here
    this.idleDebouncer =  _.debounce(() => {this.props.store.dispatch({type: ACTIONS.SET_IDLE, data: true})}, minute)
  }
  componentDidMount(){
    this.fetchNewTweetsAndClear()

    // handle auto updating
    window.addEventListener('scroll', this.handleScroll.bind(this))
    this.refreshInterval = setInterval(() => {
      if(this.props.scrollState.idle && this.props.settings.autoRefresh){
        console.log('auto updating', this)
        this.fetchNewTweetsAndClear()
        window.scrollTo(0,0)
      }
    }, 5 * minute)
  }
  handleScroll(){
    // if we are at the bottom of the page, load more tweets
    if(this.shouldLoadMore()){
      console.log('at bottom, loading more tweets')
      this.fetchNextPageOfTweets(this.props.tweetsData.page + 1)
    }
    // set idle to false because they scrolled
    if(this.props.scrollState.idle){
      this.props.store.dispatch({type: ACTIONS.SET_IDLE, data: false})
    }
    // if they don't scroll for a minute, enter idle
   this.idleDebouncer()
  }

  // helper function to determine if the window at the bottom of the screen
  shouldLoadMore(){
    return !this.props.scrollState.loading && !this.props.scrollState.end && window.innerHeight + window.scrollY >= document.body.offsetHeight
  }
  fetchNextPageOfTweets(pageToLoad){
    this.props.store.dispatch({type: ACTIONS.SET_LOADING, data: true})
    axios.get('https://api.fbnews.ml/tweets?size=3&page='+pageToLoad).then((res) => {
      if(res.data.length){
        this.props.store.dispatch({type: ACTIONS.PUSH_NEW_TWEETS, data: res.data})
        this.props.store.dispatch({type: ACTIONS.SET_PAGE, data: pageToLoad})
        // it takes some time for the tweets to fully render so we don't want to spam new tweets while they load. Unfortunately because all the tweets load in iframes using twitter's custom js, it's tough to check whether the tweets are fully rendered, so instead we just set .5 seconds as the min interval between fetches
        setTimeout(() => {
          this.props.store.dispatch({type: ACTIONS.SET_LOADING, data: false})
        }, 500)
      }
      else{
        this.props.store.dispatch({type: ACTIONS.SET_END, data: true})
      }
    })
  }
  fetchNewTweetsAndClear(){
    axios.get('https://api.fbnews.ml/tweets?size=3').then((res) => {
      this.props.store.dispatch({type: ACTIONS.RESET_TWEETS, data: res.data})
      this.props.store.dispatch({type: ACTIONS.SET_PAGE, data: 1})
      this.props.store.dispatch({type: ACTIONS.SET_LOADING, data: false})
    })
  }

  updateSettings(field, val){
    window.localStorage.setItem(field, val)

    // if the mode changes, refresh with tweets in the updated color scheme
    if(field === 'darkMode'){
      this.props.store.dispatch({type: ACTIONS.TOGGLE_DARK_MODE, data: val})
    }
    else if(field === 'autoRefresh'){
      this.props.store.dispatch({type: ACTIONS.TOGGLE_AUTO_REFRESH, data: val})
    }
  }

  render() {
    return (<div className={'container' + (this.props.settings.darkMode === true ? ' dark-mode' : '')}>
    <div className='dark-mode-block'>
      <div>Dark Mode <input type='checkbox' checked={this.props.settings.darkMode} onChange={(e) => {this.updateSettings('darkMode', e.target.checked)}}></input></div>
      <div>Auto Refresh <input type='checkbox' checked={this.props.settings.autoRefresh} onChange={(e) => {this.updateSettings('autoRefresh', e.target.checked)}}></input></div>
    </div>
    <div className='header-block'><h1>Football News Reader</h1><h2>Tweets About Football</h2></div>
      <div className='tweet-container'>{this.props.tweetsData.tweets.map((t) => <TweetEmbed tId={t.tweet_id} key={t._id + this.props.settings.darkMode} />)}</div>
      <div className='bottom-msg'>{this.props.scrollState.end ? 'No More Tweets' : <span className="star spin">★</span>}</div> 
    </div>
      
    );
  }
}


// this is not ideal but there's only really one component and it needs all the state
const mapStateToProps = (state) => {
  return {...state}
}

export default connect(mapStateToProps)(App);
