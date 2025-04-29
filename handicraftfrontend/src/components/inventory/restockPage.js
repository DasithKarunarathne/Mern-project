import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function RestockPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [inventory, setInventory] = useState(null);
    const [restockData, setRestockData] = useState({
        minimumQuantity: 20,
        restockLevel: 0,
        restockDate: new Date().toISOString().split('T')[0]
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInventory();
    }, [id]);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:5000/inventory/item/${id}`);
            if (response.data && response.data.success && response.data.inventory) {
                setInventory(response.data.inventory);
                setRestockData(prev => ({
                    ...prev,
                    minimumQuantity: response.data.inventory.minStockQty || 20
                }));
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            console.error('Error fetching inventory:', err);
            setError(err.response?.data?.error || 'Failed to fetch inventory item');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRestockData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!restockData.restockLevel || restockData.restockLevel <= 0) {
            setError('Restock level must be greater than 0');
            return false;
        }
        if (!restockData.restockDate) {
            setError('Please select a restock date');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateForm()) {
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/inventory/restock/create', {
                itemId: id,
                ...restockData
            });
            
            if (response.data && response.data.success) {
                setSuccess('Order sent to supplier successfully!');
                setTimeout(() => {
                    navigate('/inventory');
                }, 2000);
            } else {
                throw new Error('Failed to create restock order');
            }
        } catch (err) {
            console.error('Error creating restock order:', err);
            setError(err.response?.data?.error || 'Failed to create restock order');
        }
    };

    if (loading) {
        return <div style={styles.loading}>Loading...</div>;
    }

    if (!inventory) {
        return <div style={styles.error}>Item not found</div>;
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.header}>Restock Item</h2>
            
            {error && <div style={styles.error}>{error}</div>}
            {success && <div style={styles.success}>{success}</div>}

            <div style={styles.itemInfo}>
                <h3>Item Details</h3>
                <p><strong>Item No:</strong> {inventory.itemno}</p>
                <p><strong>Item Name:</strong> {inventory.itemname}</p>
                <p><strong>Current Quantity:</strong> {inventory.qty}</p>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                    <label htmlFor="minimumQuantity">Minimum Quantity:</label>
                    <input
                        type="number"
                        id="minimumQuantity"
                        name="minimumQuantity"
                        value={restockData.minimumQuantity}
                        onChange={handleInputChange}
                        required
                        min="0"
                    />
                </div>

                <div style={styles.formGroup}>
                    <label htmlFor="restockLevel">Restock Level:</label>
                    <input
                        type="number"
                        id="restockLevel"
                        name="restockLevel"
                        value={restockData.restockLevel}
                        onChange={handleInputChange}
                        required
                        min="1"
                    />
                </div>

                <div style={styles.formGroup}>
                    <label htmlFor="restockDate">Restock Date:</label>
                    <input
                        type="date"
                        id="restockDate"
                        name="restockDate"
                        value={restockData.restockDate}
                        onChange={handleInputChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                    />
                </div>

                <div style={styles.buttonContainer}>
                    <button type="submit" style={styles.submitButton}>
                        Confirm Restock
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/inventory')}
                        style={styles.cancelButton}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '800px',
        margin: '2rem auto',
        padding: '2rem',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    header: {
        color: '#333',
        marginBottom: '2rem',
        textAlign: 'center'
    },
    itemInfo: {
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    },
    'formGroup label': {
        fontWeight: '600',
        color: '#555'
    },
    'formGroup input': {
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '1rem'
    },
    buttonContainer: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        marginTop: '1rem'
    },
    submitButton: {
        padding: '1rem 2rem',
        backgroundColor: '#8B4513',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer'
    },
    cancelButton: {
        padding: '1rem 2rem',
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer'
    },
    error: {
        color: '#e74c3c',
        backgroundColor: '#fdecea',
        padding: '1rem',
        borderRadius: '4px',
        marginBottom: '1rem'
    },
    success: {
        color: '#27ae60',
        backgroundColor: '#e8f8f5',
        padding: '1rem',
        borderRadius: '4px',
        marginBottom: '1rem'
    },
    loading: {
        textAlign: 'center',
        padding: '2rem',
        color: '#666'
    }
};