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
            maxWidth: "800px",
            margin: "0 auto",
            padding: "20px"
        },
        form: {
            backgroundColor: "#f9f9f9",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        },
        formGroup: {
            marginBottom: "15px"
        },
        label: {
            display: "block",
            marginBottom: "5px",
            fontWeight: "bold"
        },
        input: {
            width: "100%",
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px"
        },
        button: {
            padding: "10px 15px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginRight: "10px"
        },
        cancelButton: {
            backgroundColor: "#f44336"
        },
        message: {
            padding: "10px",
            marginBottom: "15px",
            borderRadius: "4px"
        },
        success: {
            backgroundColor: "#dff0d8",
            color: "#3c763d"
        },
        error: {
            backgroundColor: "#f2dede",
            color: "#a94442"
        }
    };

    return (
        <div style={styles.container}>
            <h1>Update Inventory Item</h1>
            
            {successMessage && (
                <div style={{...styles.message, ...styles.success}}>
                    {successMessage}
                </div>
            )}
            
            {errorMessage && (
                <div style={{...styles.message, ...styles.error}}>
                    {errorMessage}
                </div>
            )}

            {loading ? (
                <div>Loading...</div>
            ) : (
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Item Number</label>
                        <input
                            style={styles.input}
                            type="text"
                            name="itemno"
                            value={formData.itemno}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Item Name</label>
                        <input
                            style={styles.input}
                            type="text"
                            name="itemname"
                            value={formData.itemname}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Price</label>
                        <input
                            style={styles.input}
                            type="number"
                            step="0.01"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Quantity</label>
                        <input
                            style={styles.input}
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Description</label>
                        <textarea
                            style={{...styles.input, minHeight: "100px"}}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Inventory Date</label>
                        <input
                            style={styles.input}
                            type="date"
                            name="inventorydate"
                            value={formData.inventorydate}
                            onChange={handleChange}
                        />
                    </div>
                    
                    <div>
                        <button 
                            type="submit" 
                            style={styles.button}
                            disabled={loading}
                        >
                            {loading ? "Updating..." : "Update"}
                        </button>
                        <button 
                            type="button" 
                            style={{...styles.button, ...styles.cancelButton}}
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