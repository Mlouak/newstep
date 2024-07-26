// src/TransferComponent.js
import React, { useState } from 'react';
import { Api, JsonRpc, RpcError } from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig'; // development only
import { TextEncoder, TextDecoder } from 'util'; // Node.js only

import { Container, Form, Button, Row, Col, Alert } from 'react-bootstrap';
const rpc = new JsonRpc('http://localhost:8888'); // Local EOSIO node
//5KjaoY7tALaNKbkkzz6vTjQQFpm9LaMJUPjc1jAxZEM7uyeLVub
const privateKeys = ['5KjaoY7tALaNKbkkzz6vTjQQFpm9LaMJUPjc1jAxZEM7uyeLVub']; // Replace with your private key
const signatureProvider = new JsSignatureProvider(privateKeys);

const api = new Api({
  rpc,
  signatureProvider,
});

const TransferComponent = () => {
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [quantity, setQuantity] = useState('');
    const [memo, setMemo] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
  
    const handleTransfer = async () => {
      setError(null);
      setSuccess(null);
      try {
        const result = await api.transact({
          actions: [{
            account: 'eosio.token',
            name: 'transfer',
            authorization: [{
              actor: from,
              permission: 'active',
            }],
            data: {
              from,
              to,
              quantity: `${parseFloat(quantity).toFixed(4)} SPACE`,
              memo,
            },
          }]
        }, {
          blocksBehind: 3,
          expireSeconds: 30,
        });
        console.log('Transaction success:', result);
        setSuccess('Transaction successful!');
      } catch (e) {
        console.error('Transaction failed:', e);
        setError('Transaction failed. Please check the console for details.');
      }
    };
  
    return (
      <Container>
        <h2 className="mt-4">EOSIO Token Transfer</h2>
        <Form>
          <Row className="mb-3">
            <Col>
              <Form.Group controlId="formFrom">
                <Form.Label>From</Form.Label>
                <Form.Control
                  type="text"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="formTo">
                <Form.Label>To</Form.Label>
                <Form.Control
                  type="text"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <Form.Group controlId="formQuantity">
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="text"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="formMemo">
                <Form.Label>Memo</Form.Label>
                <Form.Control
                  type="text"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
          <Button variant="primary" onClick={handleTransfer}>
            Transfer
          </Button>
        </Form>
        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        {success && <Alert variant="success" className="mt-3">{success}</Alert>}
      </Container>
    );
  };
export default TransferComponent;
