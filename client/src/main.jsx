import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThirdwebProvider } from '@thirdweb-dev/react';
import { Sepolia } from "@thirdweb-dev/chains";
import { StateContextProvider } from './context';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
   <ThirdwebProvider activeChain={Sepolia} clientId='35c88742c38dba6680cc483c42385e5e'>
      <Router>
         <StateContextProvider>
            <App />
         </StateContextProvider>
      </Router>
   </ThirdwebProvider>
)