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
            const response = await axios.get(`http://localhost:5000/inventory/restock/${id}`);
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
            setError('Failed to fetch inventory item');
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await axios.post('http://localhost:5000/inventory/restock/create', {
                itemId: id,
                ...restockData
            });
            setSuccess('Order sent to supplier successfully!');
            setTimeout(() => {
                navigate('/display');
            }, 2000);
        } catch (err) {
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
                    <label htmlFor="minimumQuantity" style={styles.label}>Minimum Quantity:</label>
                    <input
                        type="number"
                        id="minimumQuantity"
                        name="minimumQuantity"
                        value={restockData.minimumQuantity}
                        onChange={handleInputChange}
                        required
                        min="0"
                        style={styles.input}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label htmlFor="restockLevel" style={styles.label}>Restock Level:</label>
                    <input
                        type="number"
                        id="restockLevel"
                        name="restockLevel"
                        value={restockData.restockLevel}
                        onChange={handleInputChange}
                        required
                        min="0"
                        style={styles.input}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label htmlFor="restockDate" style={styles.label}>Restock Date:</label>
                    <input
                        type="date"
                        id="restockDate"
                        name="restockDate"
                        value={restockData.restockDate}
                        onChange={handleInputChange}
                        required
                        style={styles.input}
                    />
                </div>

                <div style={styles.buttonContainer}>
                    <button type="submit" style={styles.submitButton}>
                        Confirm Restock
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/display')}
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
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },
    header: {
        color: '#5D4037',
        marginBottom: '2rem',
        textAlign: 'center',
        fontSize: '1.8rem',
        fontWeight: '600'
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
    label: {
        fontWeight: '600',
        color: '#5D4037',
        fontSize: '1rem'
    },
    input: {
        padding: '0.75rem 1rem',
        border: '1px solid #BCAAA4',
        borderRadius: '8px',
        fontSize: '1rem',
        transition: 'all 0.3s ease',
        '&:focus': {
            outline: 'none',
            borderColor: '#8D6E63',
            boxShadow: '0 0 0 3px rgba(141, 110, 99, 0.1)'
        }
    },
    itemInfo: {
        marginBottom: '2rem',
        padding: '1.5rem',
        backgroundColor: '#EFEBE9',
        borderRadius: '8px',
        color: '#5D4037'
    },
    infoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '0.5rem',
        fontSize: '1rem'
    },
    infoLabel: {
        fontWeight: '600'
    },
    buttonContainer: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        marginTop: '1.5rem'
    },
    submitButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#8D6E63',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
            backgroundColor: '#6D4C41',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(141, 110, 99, 0.3)'
        }
    },
    cancelButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#A1887F',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
            backgroundColor: '#8D6E63',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(161, 136, 127, 0.3)'
        }
    },
    error: {
        color: '#D32F2F',
        backgroundColor: '#FFEBEE',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },
    success: {
        color: '#388E3C',
        backgroundColor: '#E8F5E9',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },
    loading: {
        textAlign: 'center',
        padding: '2rem',
        color: '#5D4037',
        fontSize: '1.1rem'
    }
};