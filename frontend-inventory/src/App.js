import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import AddInventories from "./components/addInventories";
import ReadInventories from "./components/readinventories";
import UpdateInventories from "./components/updateinventories";
import DeleteInventories from "./components/deleteinventories";
import InventoryReport from "./components/inventoryreports";
import RestockPage from "./components/restockPage";
import CheckInventoryQuality from "./components/checkinventories";
import SupplierManagement from "./components/SupplierManagement";

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    {/* Default route - redirect to inventory display */}
                    <Route path="/" element={<Navigate to="/display" />} />
                    
                    {/* Route for adding inventories */}
                    <Route path="/add" element={<AddInventories />} />

                    {/* Route for checking inventory quality */}
                    <Route path="/checkinventories" element={<CheckInventoryQuality />} />

                    {/* Route for reading/displaying inventories */}
                    <Route path="/display" element={<ReadInventories />} />

                    {/* Add an alias route for '/inventory' to match DeleteInventories redirect */}
                    <Route path="/inventory" element={<Navigate to="/display" />} />

                    {/* Route for updating inventories */}
                    <Route path="/update/:id" element={<UpdateInventories />} />

                    {/* Route for deleting inventories */}
                    <Route path="/delete/:id" element={<DeleteInventories />} />

                    {/* Route for restocking */}
                    <Route path="/restock/:id" element={<RestockPage />} />

                    <Route path="/report" element={<InventoryReport />} />

                    {/* Route for supplier management */}
                    <Route path="/supplier-management" element={<SupplierManagement />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;