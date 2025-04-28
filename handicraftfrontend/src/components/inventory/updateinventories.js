import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function UpdateInventories() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        itemno: "",
        itemname: "",
        price: "",
        quantity: "",
        description: "",
        inventorydate: "",
    });
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (id) {
            fetchItemData();
        }
    }, [id]);

    const fetchItemData = async () => {
        setLoading(true);
        setErrorMessage("");
        try {
            const response = await fetch(`http://localhost:5000/inventory/item/${id}`);
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || "Failed to fetch item");
            }

            const inventory = data.inventory;
            setFormData({
                itemno: inventory.itemno,
                itemname: inventory.itemname,
                price: inventory.price,
                quantity: inventory.qty,
                description: inventory.itemdescription,
                inventorydate: inventory.inventorydate ? 
                    new Date(inventory.inventorydate).toISOString().split('T')[0] : ""
            });
        } catch (err) {
            setErrorMessage(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage("");
        setErrorMessage("");

        try {
            const response = await fetch(`http://localhost:5000/inventory/update/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    itemno: formData.itemno,
                    itemname: formData.itemname,
                    price: parseFloat(formData.price),
                    qty: parseInt(formData.quantity, 10),
                    itemdescription: formData.description,
                    inventorydate: formData.inventorydate
                })
            });

            const data = await response.json();
            
            if (!response.ok || !data.success) {
                throw new Error(data.error || "Failed to update item");
            }

            setSuccessMessage("Inventory updated successfully!");
            setTimeout(() => {
                navigate("/inventory/display");
            }, 1500);
        } catch (err) {
            setErrorMessage(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Styles
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
        'formGroup label': {
            fontWeight: '600',
            color: '#5D4037',
            fontSize: '1rem'
        },
        'formGroup input': {
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

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Update Inventory Item</h1>
            
            {successMessage && (
                <div style={styles.success}>
                    {successMessage}
                </div>
            )}
            
            {errorMessage && (
                <div style={styles.error}>
                    {errorMessage}
                </div>
            )}

            {loading ? (
                <div style={styles.loading}>Loading...</div>
            ) : (
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles['formGroup label']}>Item Number</label>
                        <input
                            style={styles['formGroup input']}
                            type="text"
                            name="itemno"
                            value={formData.itemno}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label style={styles['formGroup label']}>Item Name</label>
                        <input
                            style={styles['formGroup input']}
                            type="text"
                            name="itemname"
                            value={formData.itemname}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label style={styles['formGroup label']}>Price</label>
                        <input
                            style={styles['formGroup input']}
                            type="number"
                            step="0.01"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label style={styles['formGroup label']}>Quantity</label>
                        <input
                            style={styles['formGroup input']}
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label style={styles['formGroup label']}>Description</label>
                        <textarea
                            style={{...styles['formGroup input'], minHeight: "100px"}}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label style={styles['formGroup label']}>Inventory Date</label>
                        <input
                            style={styles['formGroup input']}
                            type="date"
                            name="inventorydate"
                            value={formData.inventorydate}
                            onChange={handleChange}
                        />
                    </div>
                    
                    <div style={styles.buttonContainer}>
                        <button 
                            type="submit" 
                            style={styles.submitButton}
                            disabled={loading}
                        >
                            {loading ? "Updating..." : "Update"}
                        </button>
                        <button 
                            type="button" 
                            style={styles.cancelButton}
                            onClick={() => navigate("/inventory/display")}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}