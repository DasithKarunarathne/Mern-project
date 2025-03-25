import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function RestockPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [restockQuantity, setRestockQuantity] = useState(0);
    const [restockDate, setRestockDate] = useState('');
    const [recommendedQuantity, setRecommendedQuantity] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const MAX_STOCK_THRESHOLD = 50;

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setRestockDate(today);

        const fetchItem = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:8070/inventory/${id}`);
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch item details: ${response.statusText}`);
                }
                
                const data = await response.json();
                
                if (!data.success || !data.inventory) {
                    throw new Error('Invalid item data received');
                }
                
                setItem(data.inventory);
                const recommended = MAX_STOCK_THRESHOLD - data.inventory.qty;
                setRecommendedQuantity(Math.max(recommended, 0));
            } catch (err) {
                setError(err.message);
                navigate('/display');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchItem();
        }
    }, [id, navigate]);

    const handleRestockQuantityChange = (e) => {
        const value = parseInt(e.target.value) || 0;
        setRestockQuantity(value);
    };

    const handleRestockDateChange = (e) => {
        setRestockDate(e.target.value);
    };

    const handleRestock = async () => {
        if (restockQuantity <= 0) {
            setError('Please enter a valid restock quantity');
            return;
        }
    
        try {
            setLoading(true);
            setError('');
            
            const response = await fetch(`http://localhost:8070/inventory/restock/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    quantity: restockQuantity,
                }),
            });
    
            const rawText = await response.text();
            console.log('Raw response:', rawText);
    
            let data;
            try {
                data = JSON.parse(rawText);
            } catch (jsonErr) {
                if (rawText.includes('<!DOCTYPE')) {
                    throw new Error('Server returned an HTML error page. Check if the backend route is correctly configured.');
                }
                throw new Error(`Server returned invalid JSON: ${rawText.slice(0, 100)}...`);
            }
    
            if (!response.ok) {
                throw new Error(data.error || `Restock failed with status: ${response.status}`);
            }
    
            if (!data.success) {
                throw new Error(data.error || 'Restock failed');
            }
    
            alert(`Successfully restocked ${item.itemname} with ${restockQuantity} units`);
            navigate('/display');
        } catch (err) {
            console.error('Restock error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    if (loading && !item) {
        return (
            <div style={{
                maxWidth: '600px',
                margin: '0 auto',
                padding: '20px',
                fontFamily: 'Arial, sans-serif',
                backgroundColor: '#f4f4f4'
            }}>
                <div style={{
                    textAlign: 'center',
                    color: '#666',
                    padding: '20px'
                }}>
                    Loading item details...
                </div>
            </div>
        );
    }

    if (!item) {
        return (
            <div style={{
                maxWidth: '600px',
                margin: '0 auto',
                padding: '20px',
                fontFamily: 'Arial, sans-serif',
                backgroundColor: '#f4f4f4'
            }}>
                <div style={{
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    padding: '10px',
                    borderRadius: '4px',
                    marginBottom: '15px',
                    border: '1px solid #f5c6cb'
                }}>
                    Item not found
                </div>
                <button 
                    style={{
                        flex: 1,
                        padding: '12px 15px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease'
                    }}
                    onClick={() => navigate('/display')}
                >
                    Back to Inventory
                </button>
            </div>
        );
    }

    return (
        <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '20px',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#f4f4f4'
        }}>
            <div style={{
                borderBottom: '1px solid #e0e0e0',
                paddingBottom: '15px',
                marginBottom: '20px'
            }}>
                <h1 style={{
                    margin: '0',
                    color: '#333',
                    fontSize: '24px'
                }}>
                    Restock Inventory Item
                </h1>
            </div>

            {error && (
                <div style={{
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    padding: '10px',
                    borderRadius: '4px',
                    marginBottom: '15px',
                    border: '1px solid #f5c6cb'
                }}>
                    {error}
                </div>
            )}

            <div style={{
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '5px',
                padding: '15px',
                marginBottom: '20px'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '10px',
                    padding: '5px 0',
                    borderBottom: '1px solid #f0f0f0'
                }}>
                    <span style={{
                        fontWeight: 'bold',
                        color: '#555'
                    }}>
                        Item Number:
                    </span>
                    <span style={{
                        color: '#333'
                    }}>
                        {item.itemno}
                    </span>
                </div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '10px',
                    padding: '5px 0',
                    borderBottom: '1px solid #f0f0f0'
                }}>
                    <span style={{
                        fontWeight: 'bold',
                        color: '#555'
                    }}>
                        Item Name:
                    </span>
                    <span style={{
                        color: '#333'
                    }}>
                        {item.itemname}
                    </span>
                </div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '10px',
                    padding: '5px 0',
                    borderBottom: '1px solid #f0f0f0'
                }}>
                    <span style={{
                        fontWeight: 'bold',
                        color: '#555'
                    }}>
                        Current Quantity:
                    </span>
                    <span style={{
                        color: '#333'
                    }}>
                        {item.qty}
                    </span>
                </div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '10px',
                    padding: '5px 0',
                    borderBottom: '1px solid #f0f0f0'
                }}>
                    <span style={{
                        fontWeight: 'bold',
                        color: '#555'
                    }}>
                        Recommended Restock:
                    </span>
                    <span style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.9em'
                    }}>
                        {recommendedQuantity} units
                    </span>
                </div>
            </div>

            <div style={{
                marginBottom: '20px'
            }}>
                <input
                    type="number"
                    style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '16px',
                        marginBottom: '10px'
                    }}
                    value={restockQuantity}
                    onChange={handleRestockQuantityChange}
                    placeholder="Enter Restock Quantity"
                    min="1"
                    disabled={loading}
                />
                <label style={{
                    display: 'block',
                    marginBottom: '5px',
                    fontWeight: 'bold',
                    color: '#333'
                }}>
                    Restock Date
                </label>
                <input
                    type="date"
                    style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '16px',
                        marginBottom: '10px'
                    }}
                    value={restockDate}
                    onChange={handleRestockDateChange}
                    disabled={loading}
                />
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '10px'
            }}>
                <button 
                    style={{
                        flex: 1,
                        padding: '12px 15px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading || restockQuantity <= 0 ? 'not-allowed' : 'pointer',
                        opacity: loading || restockQuantity <= 0 ? 0.5 : 1,
                        transition: 'background-color 0.3s ease'
                    }}
                    onClick={handleRestock}
                    disabled={loading || restockQuantity <= 0}
                >
                    {loading ? 'Processing...' : 'Confirm Restock'}
                </button>
                <button 
                    style={{
                        flex: 1,
                        padding: '12px 15px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.5 : 1,
                        transition: 'background-color 0.3s ease'
                    }}
                    onClick={() => navigate('/display')}
                    disabled={loading}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}