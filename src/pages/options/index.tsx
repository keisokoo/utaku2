import '@pages/options/index.css'
import Options from '@pages/options/Options'
import { createRoot } from 'react-dom/client'
import refreshOnUpdate from 'virtual:reload-on-update-in-view'

refreshOnUpdate('pages/options')

function init() {
  const appContainer = document.querySelector('#app-container')
  if (!appContainer) {
    throw new Error('Can not find AppContainer')
  }
  const root = createRoot(appContainer)
  root.render(<Options />)
}

init()
