/*
  Order Entry React Demo for EOSIO Training & Certification: AD101
  
  Several blocks have been commented out, as they will only
  function as intended when the UAL (Universal Authenticator Library)
  wrapper is implemented in App.js – at which point props will
  contain the ual object. Uncomment (or replace) these lines as
  appropriate.
*/

import { JsonRpc } from 'eosjs'
import * as React from 'react'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';
import './orderentry.css';

const rpc = new JsonRpc('http://localhost:8888'); // Change to your EOSIO node URL

const defaultState = {
  activeUser: null, //to store user object from UAL
  accountName: '', //to store account name of logged in wallet user
  orderItems: '0',
  orders: [],
  currentPage: 1,
  ordersPerPage: 10
}

class OrderEntryApp extends React.Component {
  static displayName = 'OrderEntryApp'

  constructor(props) {
    super(props)
    this.state = {
      ...defaultState,
    }
    /*
    this.updateAccountName = this.updateAccountName.bind(this)
    */
    this.renderOrderButton = this.renderOrderButton.bind(this)
    this.placeorder = this.placeorder.bind(this)
    this.renderModalButton = this.renderModalButton.bind(this)
    this.handleOrderUpdate = this.handleOrderUpdate.bind(this)
    this.renderOrderForm = this.renderOrderForm.bind(this)

    this.fetchOrders = this.fetchOrders.bind(this);

    this.renderPagination = this.renderPagination.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
  }
  
  componentDidMount() {
    this.fetchOrders();
  }

  async fetchOrders() {
    try {
      const result = await rpc.get_table_rows({
        json: true,
        code: 'mm', // Replace with your contract's account name
        scope: 'ordercontrct', // Replace with your contract's account name
        table: 'orders',
        limit: 100, // Adjust as necessary
      });
      console.log("Orders fetched:", result);
      this.setState({ orders: result.rows });
      console.log(result.rows);
      console.log("mohamed");
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  }

  // implement code to transact, using the order details, here
  async placeorder() {
    const { accountName, activeUser, orderItems } = this.state;
    if (!activeUser) {
      console.error("User not logged in");
    }else {
      console.log(activeUser);
      console.log("++++++++++++++++++++")
      console.log(accountName)

      try {
        const transaction = {
          actions: [{
            account: 'mm', // Replace with your contract's account name
            name: 'addorder',
            authorization: [{
              actor: accountName,
              permission: 'active',
            }],
            data: {
              userid: 1, // Replace with your method of getting user id
              items: orderItems.split(',').map(item => parseInt(item.trim())),
              status: 'pending',
            },
          }]
        };
    
        const result = await activeUser.signTransaction(transaction, {
          broadcast: true
        });
    
        console.log('Transaction result:', result);
        this.fetchOrders(); // Refresh the orders after placing the order
      } catch (error) {
        console.error('Error placing order:', error);
      }
    }
    console.log("With UAL implemented, this submits an order for items " + orderItems);
  }

  handlePageChange(pageNumber) {
    this.setState({ currentPage: pageNumber });
  }

  renderOrderButton() {
    return (
      <p className='ual-btn-wrapper'>
        <Button variant="outline-warning" onClick={this.placeorder}>
          {'Place Order'}
        </Button>
      </p>
    )
  }


  // once the UAL wrapper is implemented, the code below will function
  
  
  componentDidUpdate() {
    const { ual: { activeUser } } = this.props
    if (activeUser && !this.state.activeUser) {
      this.setState({ activeUser }, this.updateAccountName)
    } else if (!activeUser && this.state.activeUser) {
      this.setState(defaultState)
    }
  }
  
  async updateAccountName()   {
    try {
      const accountName = await this.state.activeUser.getAccountName()
      this.setState({ accountName }, this.updateAccountBalance)
    } catch (e) {
      console.warn(e)
    }
  }

  renderLogoutBtn = () => {
    const { ual: { activeUser, activeAuthenticator, logout } } = this.props
    if (!!activeUser && !!activeAuthenticator) {
      return (
        <p className='ual-btn-wrapper'>
          <Button variant='outline-danger' onClick={logout}>
            {'Logout'}
          </Button>
        </p>
      )
    }
  }

  

  renderModalButton() {
    return (
      <p className='ual-btn-wrapper'>
        <Button variant='outline-primary'
          /* Uncomment once UAL wrapper is implemented */
          onClick={this.props.ual.showModal}
          
          className='ual-generic-button'>Connect to Wallet</Button>
      </p>
    )
  }


  handleOrderUpdate = (event) => {
    this.setState({orderItems: event.target.value});
  }

  renderOrderForm = () => {
    const { orderItems } = this.state
    return(
      <div style={{marginLeft: 'auto', marginRight:'auto', width:'25%', marginTop:'40px', marginBottom:'10px'}}>
        <Form>
          <Form.Group controlId="orderItems">
            <Form.Label>Items to order (comma separated):</Form.Label>
            <Form.Control
                  type="text"
                  name="orderItems"
                  value={orderItems}
                  onChange={this.handleOrderUpdate}
                />
          </Form.Group>
        </Form>
      </div>
    )
  }
  renderOrders() {
    //this.fetchOrders();
    const { orders, currentPage, ordersPerPage } = this.state;
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
    //console.log("aggggggggggggg");
    //console.log(orders);
    return (
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>User</th>
            <th>Items</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentOrders.map((order, index) => (
            <tr key={index}>
              <td>{order.user}</td>
              <td>{order.items.join(', ')}</td>
              <td>
                <Button variant="outline-primary" onClick={() => this.repeatOrder(order)}>
                  Repeat Order
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  }

  renderPagination() {
    const { orders, currentPage, ordersPerPage } = this.state;
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(orders.length / ordersPerPage); i++) {
      pageNumbers.push(i);
    }
    return (
      <nav>
        <ul className="pagination">
          {pageNumbers.map(number => (
            <li key={number} className={`page-item ${number === currentPage ? 'active' : ''}`}>
              <a onClick={() => this.handlePageChange(number)} className="page-link">
                {number}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    );
  }


  render() {
    let modalButton = this.renderModalButton()
    let loggedIn = ''
    let logoutBtn = null
    const orderBtn = this.renderOrderButton()

    // Once UAL wrapper is implemented, uncomment below lines
    
    const { ual: { activeUser } } = this.props
    const { accountName } = this.state
    modalButton = !activeUser && this.renderModalButton()
    logoutBtn = this.renderLogoutBtn()
    loggedIn = accountName ? `Logged in as ${accountName}` : ''
    

    return (
      <div style={{ textAlign: 'center', paddingTop: '50px' }}>
        <h2>Order Entry React Demo</h2>
        <span>EOSIO Training & Certification, AD101</span>
        <div style={{marginBottom: '20px'}}></div>
        {modalButton}
        <h3 className='ual-subtitle'>{loggedIn}</h3>
        {this.renderOrderForm()}
        {orderBtn}
        {this.renderOrders()}
        {this.renderPagination()}
        {logoutBtn}
      </div>
    )
  }
}

export default OrderEntryApp;