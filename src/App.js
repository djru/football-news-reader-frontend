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
      darkMode: false,
      idle: true
    }

    // we want to turn this off so the page doesn't accidentally autoscroll to the end and then instantly load more tweets
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // don't have a great place to put this so I'm putting it here
    this.scrollDebouncer =  _.debounce(() => {console.log('entering idle'); this.setState({idle: true})}, 1000*60)
  }

  componentDidMount(){
    this.fetchNewTweetsAndClear()

    // handle auto updating
    window.addEventListener('scroll', this.handleScroll.bind(this))
    this.refreshInterval = setInterval(() => {
      if(this.state.idle){
        console.log('auto updating', this)
        this.fetchNewTweetsAndClear()
        window.scrollTo(0,0)
      }
    }, 1000*60*5)
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
   this.scrollDebouncer()
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
        // it takes some time for the tweets to fully render so we don't want to span new tweets while they load. Unfortunately because all the tweets load in iframes using twitter's custom js, it's tough to check whether the tweets are fully rendered, so instead we just set 1.5 seconds as the min interval between fetches
        setTimeout(() => {
          this.setState({loading: false})
        }, 1500)
      }
      else{this.setState({loading: false, end: true, page: pageToLoad})}
    })
  }
  fetchNewTweetsAndClear(){
    axios.get('https://api.fbnews.ml/tweets?size=3').then((res) => {
      this.setState({tweets: res.data, loading: false, page: 1})
    })
  }
  render() {
    return (<div className={'container' + (this.state.darkMode === true ? ' dark-mode' : '')}>
    <div className='dark-mode-block'>Dark Mode <input type='checkbox' onClick={(e) => {this.setState({darkMode: e.target.checked})}}></input></div>
    <div className='header-block'><h1>Football News Reader</h1><h2>Daily Tweets About Football</h2></div>
      <div className='tweet-container'>{this.state.tweets.map((t) => <TweetEmbed tId={t.tweet_id} key={t._id} dark={this.state.darkMode}/>)}</div>
      <div className='bottom-msg'>{this.state.end ? 'No More Tweets' : <span className="star spin">★</span>}</div> 
    </div>
      
    );
  }
}

class TweetEmbed extends Component{
  constructor(props){
    super(props)
    this.state = {dark: this.props.dark || false, tweet_id: props.tId}
  }
  render(){
    return (<div className='center-block tweet' id={this.props.tId}></div>)
  }
  componentWillReceiveProps(nextProps){
    // if dark mode is toggled, rerender everything
    if(this.props.dark !== nextProps.dark){
      this.setState({dark: nextProps.dark})
      this.clearAndReRenderTweet(this.state.tweet_id)
    }
  }
  clearAndReRenderTweet(id){
    document.getElementById(id).innerHTML = ''
    this.renderTweet(id)
  }
  renderTweet(id){
    window.twttr.ready(() => {
      window.twttr.widgets.createTweet(id,document.getElementById(id), {width: 500, theme: (this.state.dark ? 'dark' : 'light')})
    })
  }
  componentWillMount(){
    this.renderTweet(this.state.tweet_id)
  }

}

export default App;
