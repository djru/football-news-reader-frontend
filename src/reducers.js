import { combineReducers } from 'redux'

export const ACTIONS = {
  TOGGLE_AUTO_REFRESH: 'toggle_auto_refresh',
  PUSH_NEW_TWEETS: 'push_tweets',
  SET_PAGE: 'set_page',
  SET_END: 'set_end',
  SET_LOADING: 'set_loading',
  SET_IDLE: 'set_idle',
  TOGGLE_DARK_MODE: 'toggle_dark_mode',
  RESET_TWEETS: 'reset_tweets',
}

const initialState = {
  tweetsData: {
    tweets: [],
    page: 1,
  },
  scrollState: {
    end: false,
    loading: false,
    idle: true,
  },
  settings: {
    // most browsers only store things as strings, so we need to check that
    darkMode: window.localStorage.getItem('darkMode') + '' === 'true' || false,
    autoRefresh:
      window.localStorage.getItem('autoRefresh') + '' === 'true' || false,
  },
}

function settings(state = initialState.settings, action) {
  switch (action.type) {
    case ACTIONS.TOGGLE_AUTO_REFRESH:
      return Object.assign({}, state, { autoRefresh: action.data })
    case ACTIONS.TOGGLE_DARK_MODE:
      return Object.assign({}, state, { darkMode: action.data })
    default:
      return state
  }
}

function scrollState(state = initialState.scrollState, action) {
  switch (action.type) {
    case ACTIONS.SET_END:
      return Object.assign({}, state, { end: action.data })
    case ACTIONS.SET_LOADING:
      return Object.assign({}, state, { loading: action.data })
    case ACTIONS.SET_IDLE:
      return Object.assign({}, state, { idle: action.data })
    default:
      return state
  }
}

function tweetsData(state = initialState.tweetsData, action) {
  switch (action.type) {
    case ACTIONS.SET_PAGE:
      return Object.assign({}, state, { page: action.data })
    case ACTIONS.PUSH_NEW_TWEETS:
      return Object.assign({}, state, {
        tweets: [...state.tweets, ...action.data],
      })
    case ACTIONS.RESET_TWEETS:
      return Object.assign({}, state, { tweets: action.data })
    default:
      return state
  }
}

export default combineReducers({ settings, scrollState, tweetsData })
