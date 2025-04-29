import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Table, Container, Typography, Paper } from '@mui/material';

const SupplierManagement = () => {
    const [suppliers, setSuppliers] = useState([]);
    const navigate = useNavigate();

    // Fetch suppliers
    const fetchSuppliers = async () => {
        try {
            const response = await axios.get('http://localhost:8070/api/suppliers');
            const uniqueSuppliers = response.data.reduce((acc, current) => {
                const exists = acc.find(item => 
                    item.name === current.name && 
                    item.address === current.address
                );
                if (!exists) {
                    acc.push(current);
                }
                return acc;
            }, []);
            setSuppliers(uniqueSuppliers);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
        }
    };

    // Initialize suppliers and set up polling
    useEffect(() => {
        const initializeSupplier = async () => {
            try {
                const response = await axios.get('http://localhost:8070/api/suppliers');
                if (!response.data || response.data.length === 0) {
                    const defaultSupplier = {
                        name: "Global Raw Materials Pvt Ltd",
                        address: "No. 45, Industrial Zone, Biyagama, Gampaha, Sri Lanka",
                        email: "ales@globalrawmaterials.com",
                        approvalStatus: 'pending'
                    };
                    await axios.post('http://localhost:8070/api/suppliers', defaultSupplier);
                    await fetchSuppliers();
                }
            } catch (error) {
                console.error('Error initializing supplier:', error);
            }
        };

        initializeSupplier();
        const interval = setInterval(fetchSuppliers, 2000);
        return () => clearInterval(interval);
    }, []);

    // Handle restock confirmation
    const handleRestockConfirm = async (supplierId) => {
        try {
            console.log('Starting restock confirmation for supplier:', supplierId);

            // Update supplier status to approved
            console.log('Updating supplier status to approved');
            await axios.patch(`http://localhost:8070/api/suppliers/${supplierId}`, {
                approvalStatus: 'approved'
            });

            // Update inventory restock status
            console.log('Updating inventory restock status');
            const inventoryResponse = await axios.get('http://localhost:8070/api/inventories');
            console.log('Inventory response:', inventoryResponse.data);

            // Make sure we're accessing the inventory array correctly
            const inventories = Array.isArray(inventoryResponse.data) 
                ? inventoryResponse.data 
                : inventoryResponse.data.inventories || [];

            if (inventories.length === 0) {
                console.log('No inventories found to update');
            }

            // Update each inventory item's restock status
            for (const inventory of inventories) {
                if (inventory && inventory._id) {
                    console.log('Updating inventory:', inventory._id);
                    try {
                        const updatedInventory = {
                            ...inventory,
                            itemno: inventory.itemno,
                            itemname: inventory.itemname,
                            price: inventory.price,
                            qty: inventory.qty,
                            itemdescription: inventory.itemdescription,
                            restockStatus: 'restock successful'
                        };
                        
                        await axios.put(`http://localhost:8070/api/inventories/update/${inventory._id}`, updatedInventory);
                    } catch (updateError) {
                        console.error('Error updating inventory:', updateError);
                    }
                }
            }

            // Refresh suppliers list
            await fetchSuppliers();
            console.log('Restock confirmation completed successfully');

            // Navigate to inventory display page
            navigate('/display');

        } catch (error) {
            console.error('Detailed error in handleRestockConfirm:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                endpoint: error.config?.url
            });
            alert(`Failed to confirm restock: ${error.message}`);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Supplier Management
            </Typography>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <Table>
                    <thead>
                        <tr>
                            <th style={{ padding: '16px', backgroundColor: '#f5f5f5' }}>Supplier Name</th>
                            <th style={{ padding: '16px', backgroundColor: '#f5f5f5' }}>Address</th>
                            <th style={{ padding: '16px', backgroundColor: '#f5f5f5' }}>Email</th>
                            <th style={{ padding: '16px', backgroundColor: '#f5f5f5' }}>Status</th>
                            <th style={{ padding: '16px', backgroundColor: '#f5f5f5' }}>Confirm</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suppliers.map((supplier) => (
                            <tr key={supplier._id}>
                                <td style={{ padding: '16px' }}>{supplier.name}</td>
                                <td style={{ padding: '16px' }}>{supplier.address}</td>
                                <td style={{ padding: '16px' }}>{supplier.email}</td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px',
                                        borderRadius: '4px',
                                        backgroundColor: supplier.approvalStatus === 'approved' ? '#e8f5e9' : '#f5f5f5'
                                    }}>
                                        <span style={{
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            backgroundColor: supplier.approvalStatus === 'approved' ? '#4caf50' : '#9e9e9e',
                                            display: 'inline-block'
                                        }}/>
                                        <span style={{
                                            fontWeight: '500',
                                            color: supplier.approvalStatus === 'approved' ? '#1b5e20' : '#616161'
                                        }}>
                                            {supplier.approvalStatus || 'pending'}
                                        </span>
                                    </div>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <button 
                                        onClick={() => handleRestockConfirm(supplier._id)}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#4CAF50',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            fontWeight: '500'
                                        }}
                                        onMouseOver={(e) => e.target.style.backgroundColor = '#43a047'}
                                        onMouseOut={(e) => e.target.style.backgroundColor = '#4CAF50'}
                                    >
                                        Confirm Restock
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Paper>
        </Container>
    );
};

export default SupplierManagement; 