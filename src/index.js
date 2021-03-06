import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import registerServiceWorker from './registerServiceWorker'
import reducers from './reducers'
import { createStore } from 'redux'
import { Provider } from 'react-redux'

const store = createStore(reducers)

ReactDOM.render(
  <Provider store={store}>
    <App store={store} />
  </Provider>,
  document.getElementById('root')
)
registerServiceWorker()
