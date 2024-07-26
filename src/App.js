/*
  Order Entry React Demo for EOSIO Training & Certification: AD101

  Import and implement UAL plugins, consumer, and wrapper in this file
*/

import React from 'react';
import logo from './logo.svg';
import OrderEntryApp from './components/orderentry';
import { UALProvider, withUAL } from 'ual-reactjs-renderer';
import { Anchor } from 'ual-anchor';
import { Api, JsonRpc} from 'eosjs';
import 'bootstrap/dist/css/bootstrap.min.css';

import TransferComponent from './components/TransferComponent';
import { Scatter } from 'ual-scatter'
import { Lynx } from 'ual-lynx';
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig'); // development only


const privateKeys = ['5KSMEWYUaWVjqjwT9heUcBcEeYepEf3r4j6ptfmPP11pCtZFEo6'];
const rpc = new JsonRpc('http://localhost:8888');
const signatureProvider = new JsSignatureProvider(privateKeys);

const api = new Api({ rpc, signatureProvider });
//407b101aa63d8390dda6f21f37576044634bd352363ca4666622223282d7b99a
//cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f
const appName = 'OrderEntryApp';

const ourNetwork = {
  
  chainId : "cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f",
  rpcEndpoints : [
    {
      protocol: "http",
      host: "localhost",
      port: 8888
    }
  ]
}

async function placeOrder() {
  try {
    const result = await api.transact({
      actions: [{
        account: 'mm',
        name: 'addorder',
        authorization: [{
          actor: 'ordercontrct',
          permission: 'active',
        }],
        data: {
          userid: 1001,
          items: [1, 2, 3],
          status: 'pending',
        },
      }]
    }, {
      blocksBehind: 3,
      expireSeconds: 30,
    });
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}
placeOrder();

const anchor = new Anchor([ourNetwork], {
  appName,
  rpc: new JsonRpc('http://localhost:8888'),
  service: 'https://cb.anchor.link',
  disableGreymassFuel: false,
  requestStatus: false,
});
const scatter = new Scatter([ourNetwork], { appName: 'Example App' });
const lynx = new Lynx([ourNetwork]);

const ualProviders = [anchor,lynx];

const UALOrderEntryApp = withUAL(OrderEntryApp);


function App() {
  
  return (
    <UALProvider chains={[ourNetwork]} authenticators={ualProviders} appName={appName}>
      <UALOrderEntryApp />
      <TransferComponent/>
    </UALProvider>
  );
}

export default App;
//H8&d!3Zx7@R#vKq5
