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
        navigate("/checkinventories");
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
                navigate("/display");
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
            padding: "25px",
            maxWidth: "800px",
            margin: "0 auto",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            backgroundColor: "#f5f5f5",
            minHeight: "100vh"
        },
        header: {
            marginBottom: "25px",
            textAlign: "center"
        },
        headerTitle: {
            fontSize: "28px",
            fontWeight: "600",
            color: "#5D4037",
            margin: "0"
        },
        form: {
            backgroundColor: "white",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        },
        formGroup: {
            marginBottom: "20px"
        },
        label: {
            display: "block",
            marginBottom: "8px",
            fontWeight: "500",
            color: "#5D4037"
        },
        input: {
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #BCAAA4",
            fontSize: "14px",
            transition: "all 0.3s ease",
            "&:focus": {
                outline: "none",
                borderColor: "#8D6E63",
                boxShadow: "0 0 0 3px rgba(141, 110, 99, 0.1)"
            }
        },
        error: {
            color: "#D32F2F",
            fontSize: "12px",
            marginTop: "5px"
        },
        button: {
            padding: "10px 20px",
            backgroundColor: "#8D6E63",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            transition: "all 0.3s ease",
            "&:hover": {
                backgroundColor: "#6D4C41",
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(141, 110, 99, 0.3)"
            }
        },
        qualityCheck: {
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "20px"
        },
        checkbox: {
            width: "18px",
            height: "18px",
            cursor: "pointer"
        },
        checkboxLabel: {
            color: "#5D4037",
            cursor: "pointer"
        },
        errorMessage: {
            color: "#D32F2F",
            backgroundColor: "#FFEBEE",
            padding: "10px",
            borderRadius: "8px",
            marginBottom: "15px"
        },
        successMessage: {
            color: "#388E3C",
            backgroundColor: "#E8F5E9",
            padding: "10px",
            borderRadius: "8px",
            marginBottom: "15px"
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>
                <span style={styles.headerTitle}>Add New Inventory Item</span>
            </h1>
            
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
                    {errors.itemno && <div style={styles.error}>{errors.itemno}</div>}
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
                    {errors.itemname && <div style={styles.error}>{errors.itemname}</div>}
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
                    {errors.price && <div style={styles.error}>{errors.price}</div>}
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
                    {errors.qty && <div style={styles.error}>{errors.qty}</div>}
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Description *</label>
                    <textarea
                        name="itemdescription"
                        value={inventory.itemdescription}
                        onChange={handleInputChange}
                        style={{
                            ...styles.input,
                            borderColor: errors.itemdescription ? "#e74c3c" : "#ddd"
                        }}
                    />
                    {errors.itemdescription && <div style={styles.error}>{errors.itemdescription}</div>}
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

                <div style={styles.qualityCheck}>
                    <input
                        type="checkbox"
                        id="qualityVerified"
                        checked={qualityVerified}
                        onChange={(e) => setQualityVerified(e.target.checked)}
                        style={styles.checkbox}
                    />
                    <label htmlFor="qualityVerified" style={styles.checkboxLabel}>
                        {qualityVerified ? "✅ Quality check passed" : "⚠️ Quality check required"}
                    </label>
                </div>

                <div style={styles.buttonContainer}>
                    <button
                        type="button"
                        onClick={handleCheckQuality}
                        style={styles.button}
                    >
                        Check Quality
                    </button>
                    <button
                        type="submit"
                        style={styles.button}
                        disabled={!qualityVerified}
                    >
                        Add Item
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/display")}
                        style={styles.button}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}