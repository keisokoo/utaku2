import App from '@src/pages/content/components/App/app'
import { createRoot } from 'react-dom/client'
import refreshOnUpdate from 'virtual:reload-on-update-in-view'

refreshOnUpdate('pages/content/components/App')

const root = document.createElement('div')
root.id = 'utaku1209'
document.body.append(root)

createRoot(root).render(<App />)
