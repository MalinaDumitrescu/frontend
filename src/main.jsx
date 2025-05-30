import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ChatProvider } from './components/ChatContext'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <ChatProvider>
                <App />
            </ChatProvider>
        </BrowserRouter>
    </React.StrictMode>
)
