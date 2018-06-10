import connect from "react-redux/lib/connect/connect";
import React, { Component } from 'react'

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
        document.getElementById(this.props.tId).innerHTML = ''
        this.renderTweet(this.props.tId)
    }
  
  }

const mapStateToProps = (state) => {
    return {darkMode: state.settings.darkMode}
}

export default connect(mapStateToProps)(TweetEmbed)