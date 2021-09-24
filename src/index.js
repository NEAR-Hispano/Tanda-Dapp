import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { initContract } from './utils'
import Counter from './components/Counter';

window.nearInitPromise = initContract()
  .then(() => {
    ReactDOM.render(
      <App />,
      //<Counter />,
      document.querySelector('#root')
    )
  })
  .catch(console.error)
