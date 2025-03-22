// App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom'; // Remove BrowserRouter import
import Dashboard from './components/Pages/Dashboard.jsx';

const App = () => (
  <Routes>
    <Route path="/dashboard/*" element={<Dashboard />} />
  </Routes>
);

export default App;