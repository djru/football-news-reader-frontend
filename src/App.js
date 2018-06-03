import React, { Component } from 'react'
import axios from 'axios'
import _ from 'lodash'
import './App.css'
class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      tweets: [],
      users: {},
      end: false,
      loading: false,
      page: 1,
      // certain browsers only store localstorage as strings, so we have to check this
      darkMode:  window.localStorage.getItem('darkMode') === 'true' || false,
      idle: true,
      autoRefresh: window.localStorage.getItem('autoRefresh') === 'true' || false
    }

    // we want to turn this off so the page doesn't accidentally autoscroll to the end and then instantly load more tweets
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // don't have a great place to put this so I'm putting it here
    this.idleDebouncer =  _.debounce(() => {console.log('entering idle'); this.setState({idle: true})}, 1000*6)
  }
  componentDidMount(){
    this.fetchNewTweetsAndClear()

    // handle auto updating
    window.addEventListener('scroll', this.handleScroll.bind(this))
    this.refreshInterval = setInterval(() => {
      if(this.state.idle && this.state.autoRefresh){
        console.log('auto updating', this)
        this.fetchNewTweetsAndClear()
        window.scrollTo(0,0)
      }
    }, 1000*20)
  }
  handleScroll(){
    // if we are at the bottom of the page, load more tweets
    if(this.shouldLoadMore()){
      console.log('at bottom, loading more tweets')
      this.fetchNextPageOfTweets(this.state.page + 1)
    }
    // set idle to false because they scrolled
    if(this.state.idle){
      console.log('no longer idle')
      this.setState({idle: false})
    }
    // if they don't scroll for a minute, enter idle
   this.idleDebouncer()
  }

  // helper function to determine if the window at the bottom of the screen
  shouldLoadMore(){
    return !this.state.loading && !this.state.end && window.innerHeight + window.scrollY >= document.body.offsetHeight
  }
  fetchNextPageOfTweets(pageToLoad){
    this.setState({loading: true})
    axios.get('https://api.fbnews.ml/tweets?size=3&page='+pageToLoad).then((res) => {
      if(res.data.length){
        this.setState({tweets: this.state.tweets.concat(res.data), page: pageToLoad})
        // it takes some time for the tweets to fully render so we don't want to spam new tweets while they load. Unfortunately because all the tweets load in iframes using twitter's custom js, it's tough to check whether the tweets are fully rendered, so instead we just set .5 seconds as the min interval between fetches
        setTimeout(() => {
          this.setState({loading: false})
        }, 500)
      }
      else{this.setState({loading: false, end: true, page: pageToLoad})}
    })
  }
  fetchNewTweetsAndClear(){
    axios.get('https://api.fbnews.ml/tweets?size=3').then((res) => {
      this.setState({tweets: res.data, loading: false, page: 1})
    })
  }

  updateSettings(field, val){
    this.setState({[field]: val})
    window.localStorage.setItem(field, val)

    // if the mode changes, refresh with tweets in the updated color scheme
    if(field === 'darkMode'){
      this.fetchNewTweetsAndClear()
    }
  }

  render() {
    return (<div className={'container' + (this.state.darkMode === true ? ' dark-mode' : '')}>
    <div className='dark-mode-block'>
      <div>Dark Mode <input type='checkbox' checked={this.state.darkMode} onChange={(e) => {this.updateSettings('darkMode', e.target.checked)}}></input></div>
      <div>Auto Refresh <input type='checkbox' checked={this.state.autoRefresh} onChange={(e) => {this.updateSettings('autoRefresh', e.target.checked)}}></input></div>
    </div>
    <div className='header-block'><h1>Football News Reader</h1><h2>Tweets About Football</h2></div>
      <div className='tweet-container'>{this.state.tweets.map((t) => <TweetEmbed tId={t.tweet_id} key={t._id + this.state.darkMode} darkMode={this.state.darkMode}/>)}</div>
      <div className='bottom-msg'>{this.state.end ? 'No More Tweets' : <span className="star spin">★</span>}</div> 
    </div>
      
    );
  }
}

class TweetEmbed extends Component{
  render(){
    return (<div className='center-block tweet' id={this.props.tId}></div>)
  }
  renderTweet(id){
    window.twttr.ready(() => {
      window.twttr.widgets.createTweet(this.props.tId,document.getElementById(this.props.tId), {width: 500, theme: (this.props.darkMode ? 'dark' : 'light')})
    })
  }
  componentDidMount(){
    this.renderTweet(this.props.tId)
  }

}

export default App;
