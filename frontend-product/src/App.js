import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProductManagement from './components/ProductManagement';
import Cart from './components/Cart';
import Delivery from './components/Delivery';

function App() {
  return (
    <Router>
      <Navbar />
      <Switch>
        <Route exact path="/" component={ProductManagement} />
        <Route path="/cart" component={Cart} />
        <Route path="/delivery" component={Delivery} />
      </Switch>
    </Router>
  );
}

export default App;