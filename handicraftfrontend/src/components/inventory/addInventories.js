import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AddInventories() {
    const [inventory, setInventory] = useState({
        itemno: "",
        itemname: "",
        price: "",
        qty: 0,
        itemdescription: "",
        inventorydate: new Date().toISOString().split("T")[0],
    });

    const [errors, setErrors] = useState({});
    const [qualityVerified, setQualityVerified] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const validateField = (name, value) => {
        let error = "";
        switch (name) {
            case "itemno":
                if (!value) {
                    error = "Item number is required";
                } else if (!/^\d+$/.test(value)) {
                    error = "Item number must contain only numbers";
                } else if (value.startsWith('0')) {
                    error = "Item number cannot start with 0";
                } else if (/[^0-9]/.test(value)) {
                    error = "Item number cannot contain special characters";
                }
                break;
            case "itemname":
                if (!value) {
                    error = "Item name is required";
                } else if (value.length < 3) {
                    error = "Item name must be at least 3 characters long";
                } else if (!/^[a-zA-Z\s]+$/.test(value)) {
                    error = "Item name can only contain letters and spaces";
                } else if (/[^a-zA-Z\s]/.test(value)) {
                    error = "Item name cannot contain special characters or numbers";
                }
                break;
            case "price":
                if (!value) {
                    error = "Price is required";
                } else if (isNaN(value) || value <= 0) {
                    error = "Price must be a positive number";
                } else if (value.toString().startsWith('0')) {
                    error = "Price cannot start with 0";
                } else if (/[^0-9.]/.test(value.toString())) {
                    error = "Price cannot contain special characters";
                }
                break;
            case "qty":
                if (value === "") {
                    error = "Quantity is required";
                } else if (isNaN(value) || value < 0) {
                    error = "Quantity must be a non-negative number";
                }
                break;
            case "itemdescription":
                if (!value) {
                    error = "Description is required";
                } else if (value.length < 10) {
                    error = "Description must be at least 10 characters long";
                }
                break;
            case "inventorydate":
                if (!value) {
                    error = "Inventory date is required";
                } else {
                    const selectedDate = new Date(value);
                    const currentDate = new Date();
                    currentDate.setHours(0, 0, 0, 0); // Reset time to start of day
                    
                    if (selectedDate > currentDate) {
                        error = "Inventory date cannot be a future date";
                    }
                }
                break;
            default:
                break;
        }
        return error;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let parsedValue = value;

        // Special handling for price field
        if (name === "price") {
            // Remove leading zeros
            parsedValue = value.replace(/^0+/, '');
            // If empty after removing zeros, set to empty string
            if (parsedValue === '') {
                parsedValue = '';
            } else {
                // Convert to number for validation
                parsedValue = Number(parsedValue);
            }
        } else {
            parsedValue = ["qty"].includes(name) ? Number(value) : value;
        }

        setInventory({
            ...inventory,
            [name]: parsedValue,
        });

        // Validate the field
        const error = validateField(name, parsedValue);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    const handleCheckQuality = () => {
        // Validate all fields before proceeding
        const newErrors = {};
        Object.keys(inventory).forEach(key => {
            const error = validateField(key, inventory[key]);
            if (error) newErrors[key] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setError("Please fix all validation errors before checking quality.");
            return;
        }

        sessionStorage.setItem("pendingInventory", JSON.stringify(inventory));
        navigate("/inventory/check");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Validate all fields
        const newErrors = {};
        Object.keys(inventory).forEach(key => {
            const error = validateField(key, inventory[key]);
            if (error) newErrors[key] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setError("Please fix all validation errors before submitting.");
            return;
        }

        if (!qualityVerified) {
            setError("You must verify quality before adding the item.");
            return;
        }

        const payload = {
            itemno: inventory.itemno,
            itemname: inventory.itemname,
            price: inventory.price,
            qty: inventory.qty,
            itemdescription: inventory.itemdescription,
            inventorydate: inventory.inventorydate,
        };

        try {
            const response = await axios.post("http://localhost:5000/inventory/add", payload);
            if (response.data.success) {
                alert("Inventory item added successfully!");
                sessionStorage.removeItem("verifiedInventory");
                sessionStorage.removeItem("pendingInventory");
                navigate("/inventory/display");
            } else {
                throw new Error(response.data.error || "Failed to add inventory item");
            }
        } catch (err) {
            console.error("Error adding inventory:", err);
            const message = err.response?.data?.error || "Failed to add inventory item.";
            setError(message);
        }
    };

    useEffect(() => {
        const qualityStatus = sessionStorage.getItem("qualityStatus");
        const verifiedInventory = sessionStorage.getItem("verifiedInventory");

        if (qualityStatus === "verified" && verifiedInventory) {
            const verifiedData = JSON.parse(verifiedInventory);
            setQualityVerified(true);
            setInventory({
                ...inventory,
                ...verifiedData,
            });
            sessionStorage.removeItem("qualityStatus");
        }
    }, []);

    const handleKeyPress = (e, fieldType) => {
        const char = e.key;
        
        switch (fieldType) {
            case 'itemno':
                if (!/^\d$/.test(char)) {
                    e.preventDefault();
                }
                break;
            case 'itemname':
                if (!/^[a-zA-Z\s]$/.test(char)) {
                    e.preventDefault();
                }
                break;
            case 'price':
                if (!/^[\d.]$/.test(char)) {
                    e.preventDefault();
                }
                // Prevent multiple decimal points
                if (char === '.' && e.target.value.includes('.')) {
                    e.preventDefault();
                }
                break;
            default:
                break;
        }
    };

    const styles = {
        container: {
            maxWidth: "800px",
            margin: "20px auto",
            padding: "20px",
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        },
        header: {
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "20px",
            color: "#333",
            borderBottom: "2px solid #8B4513",
            paddingBottom: "10px",
        },
        form: {
            display: "flex",
            flexDirection: "column",
            gap: "20px",
        },
        formGroup: {
            display: "flex",
            flexDirection: "column",
            gap: "8px",
        },
        label: {
            fontWeight: "600",
            color: "#555",
        },
        input: {
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontSize: "14px",
            backgroundColor: "white",
        },
        textarea: {
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontSize: "14px",
            minHeight: "100px",
            resize: "vertical",
            backgroundColor: "white",
        },
        errorMessage: {
            color: "#e74c3c",
            fontSize: "14px",
            marginTop: "5px",
        },
        buttonContainer: {
            display: "flex",
            gap: "10px",
            marginTop: "20px",
        },
        qualityButton: {
            padding: "10px 20px",
            backgroundColor: "#f39c12",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
        },
        submitButton: {
            padding: "10px 20px",
            backgroundColor: "#2ecc71",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            opacity: qualityVerified ? 1 : 0.5,
            pointerEvents: qualityVerified ? "auto" : "none",
        },
        cancelButton: {
            padding: "10px 20px",
            backgroundColor: "#e74c3c",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
        },
        qualityStatus: {
            padding: "10px",
            backgroundColor: qualityVerified ? "#e8f8f5" : "#fef9e7",
            borderRadius: "4px",
            color: qualityVerified ? "#27ae60" : "#f39c12",
            marginBottom: "20px",
            fontWeight: "600",
        },
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Add New Inventory Item</h1>
            
            {error && <div style={styles.errorMessage}>{error}</div>}
            
            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Item Number *</label>
                    <input
                        type="text"
                        name="itemno"
                        value={inventory.itemno}
                        onChange={handleInputChange}
                        onKeyPress={(e) => handleKeyPress(e, 'itemno')}
                        style={{
                            ...styles.input,
                            borderColor: errors.itemno ? "#e74c3c" : "#ddd"
                        }}
                    />
                    {errors.itemno && <div style={styles.errorMessage}>{errors.itemno}</div>}
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Item Name *</label>
                    <input
                        type="text"
                        name="itemname"
                        value={inventory.itemname}
                        onChange={handleInputChange}
                        onKeyPress={(e) => handleKeyPress(e, 'itemname')}
                        style={{
                            ...styles.input,
                            borderColor: errors.itemname ? "#e74c3c" : "#ddd"
                        }}
                    />
                    {errors.itemname && <div style={styles.errorMessage}>{errors.itemname}</div>}
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Price (Rs) *</label>
                    <input
                        type="text"
                        name="price"
                        value={inventory.price}
                        onChange={handleInputChange}
                        onKeyPress={(e) => handleKeyPress(e, 'price')}
                        style={{
                            ...styles.input,
                            borderColor: errors.price ? "#e74c3c" : "#ddd"
                        }}
                    />
                    {errors.price && <div style={styles.errorMessage}>{errors.price}</div>}
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Quantity *</label>
                    <input
                        type="number"
                        name="qty"
                        value={inventory.qty}
                        onChange={handleInputChange}
                        style={{
                            ...styles.input,
                            borderColor: errors.qty ? "#e74c3c" : "#ddd"
                        }}
                    />
                    {errors.qty && <div style={styles.errorMessage}>{errors.qty}</div>}
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Description *</label>
                    <textarea
                        name="itemdescription"
                        value={inventory.itemdescription}
                        onChange={handleInputChange}
                        style={{
                            ...styles.textarea,
                            borderColor: errors.itemdescription ? "#e74c3c" : "#ddd"
                        }}
                    />
                    {errors.itemdescription && <div style={styles.errorMessage}>{errors.itemdescription}</div>}
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Inventory Date</label>
                    <input
                        type="date"
                        name="inventorydate"
                        value={inventory.inventorydate}
                        onChange={handleInputChange}
                        max={new Date().toISOString().split('T')[0]}
                        style={styles.input}
                    />
                </div>

                <div style={styles.qualityStatus}>
                    {qualityVerified 
                        ? "✅ Quality check passed" 
                        : "⚠️ Quality check required"}
                </div>

                <div style={styles.buttonContainer}>
                    <button
                        type="button"
                        onClick={handleCheckQuality}
                        style={styles.qualityButton}
                    >
                        Check Quality
                    </button>
                    <button
                        type="submit"
                        style={styles.submitButton}
                        disabled={!qualityVerified}
                    >
                        Add Item
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/inventory/display")}
                        style={styles.cancelButton}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}