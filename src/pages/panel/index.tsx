import '@pages/panel/index.css'
import Panel from '@pages/panel/Panel'
import { createRoot } from 'react-dom/client'
import refreshOnUpdate from 'virtual:reload-on-update-in-view'

refreshOnUpdate('pages/panel')

function init() {
  const appContainer = document.querySelector('#app-container')
  if (!appContainer) {
    throw new Error('Can not find AppContainer')
  }
  const root = createRoot(appContainer)
  root.render(<Panel />)
}

init()
