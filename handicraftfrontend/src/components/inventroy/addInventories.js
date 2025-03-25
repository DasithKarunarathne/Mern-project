import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

export default function AddInventories() {
  const [formData, setFormData] = useState({
    itemno: "",
    itemname: "",
    price: "",
    quantity: "",
    description: "",
    inventorydate: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const navigate = useNavigate(); // Initialize useNavigate

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    if (!formData.itemno.trim()) {
      newErrors.itemno = "Item number is required";
    } else if (!/^[a-zA-Z0-9-]+$/.test(formData.itemno)) {
      newErrors.itemno = "Item number must contain only letters, numbers, and hyphens";
    }

    if (!formData.itemname.trim()) {
      newErrors.itemname = "Item name is required";
    } else if (formData.itemname.length < 3) {
      newErrors.itemname = "Item name must be at least 3 characters";
    }

    if (!formData.price) {
      newErrors.price = "Price is required";
    } else if (isNaN(formData.price) || Number(formData.price) <= 0) {
      newErrors.price = "Price must be a positive number";
    }

    if (!formData.quantity) {
      newErrors.quantity = "Quantity is required";
    } else if (isNaN(formData.quantity) || !Number.isInteger(Number(formData.quantity)) || Number(formData.quantity) < 0) {
      newErrors.quantity = "Quantity must be a non-negative integer";
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    if (formData.inventorydate) {
      const selectedDate = new Date(formData.inventorydate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.inventorydate = "Inventory date must be a future date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const resetForm = () => {
    setFormData({
      itemno: "",
      itemname: "",
      price: "",
      quantity: "",
      description: "",
      inventorydate: ""
    });
    setErrors({});
    setSuccessMessage("");
    setErrorMessage("");
  };

  const sendData = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");
    setShowAlert(false);

    const inventoryData = {
      itemno: formData.itemno.trim(),
      itemname: formData.itemname.trim(),
      price: parseFloat(formData.price),
      qty: parseInt(formData.quantity, 10),
      itemdescription: formData.description.trim(),
      inventorydate: formData.inventorydate
    };

    try {
      const response = await fetch("http://localhost:5000/inventory/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(inventoryData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Error ${response.status}: Failed to add inventory item`);
      }

      setSuccessMessage("Inventory added successfully!");
      setShowAlert(true);

      // Navigate to the readInventories page after 3 seconds
      setTimeout(() => {
        navigate("/inventory/display"); // Navigate to the readInventories page
      }, 3000);

      resetForm();
    } catch (err) {
      setErrorMessage(err.message || "Failed to add inventory item");
    } finally {
      setLoading(false);
    }
  };

  // Styles (same as before)
  const styles = {
    pageWrapper: {
      position: "relative",
      minHeight: "100vh",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundImage: "url('https://images.unsplash.com/photo-1472851294608-062f824d29cc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      padding: "40px 0"
    },
    blurOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backdropFilter: "blur(8px)",
      backgroundColor: "rgba(255, 255, 255, 0.6)",
      zIndex: 1
    },
    container: {
      position: "relative",
      maxWidth: "1000px",
      width: "100%",
      margin: "0 auto",
      padding: "20px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      zIndex: 2
    },
    heading: {
      textAlign: "center",
      color: "#2c3e50",
      marginBottom: "25px",
      fontSize: "32px",
      fontWeight: "bold"
    },
    message: {
      padding: "12px 15px",
      borderRadius: "6px",
      marginBottom: "20px",
      textAlign: "center",
      fontWeight: "500",
      fontSize: "16px"
    },
    successMessage: {
      backgroundColor: "#d4edda",
      color: "#155724",
      border: "1px solid #c3e6cb"
    },
    errorMessage: {
      backgroundColor: "#f8d7da",
      color: "#721c24",
      border: "1px solid #f5c6cb"
    },
    form: {
      backgroundColor: "#ffffff",
      padding: "30px",
      borderRadius: "10px",
      boxShadow: "0 5px 25px rgba(0, 0, 0, 0.15)"
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "25px"
    },
    formGroup: {
      marginBottom: "10px"
    },
    fullWidth: {
      gridColumn: "1 / span 2"
    },
    label: {
      display: "block",
      marginBottom: "8px",
      fontWeight: "600",
      color: "#344054",
      fontSize: "15px"
    },
    input: {
      width: "100%",
      padding: "12px 14px",
      fontSize: "16px",
      border: "1px solid #d0d5dd",
      borderRadius: "6px",
      boxSizing: "border-box",
      transition: "all 0.2s ease-in-out"
    },
    validInput: {
      borderColor: "#d0d5dd",
    },
    invalidInput: {
      borderColor: "#dc3545",
      backgroundColor: "#fff8f8"
    },
    textarea: {
      resize: "vertical",
      minHeight: "120px"
    },
    errorText: {
      color: "#dc3545",
      fontSize: "14px",
      marginTop: "6px",
      fontWeight: "500"
    },
    formActions: {
      display: "flex",
      justifyContent: "center",
      gap: "20px",
      marginTop: "30px"
    },
    button: {
      padding: "12px 25px",
      fontSize: "16px",
      borderRadius: "6px",
      cursor: "pointer",
      border: "none",
      fontWeight: "600",
      transition: "all 0.2s ease-in-out"
    },
    submitBtn: {
      backgroundColor: "#0066cc",
      color: "white"
    },
    submitBtnHover: {
      backgroundColor: "#0052a3"
    },
    submitBtnDisabled: {
      backgroundColor: "#87b5eb",
      cursor: "not-allowed"
    },
    resetBtn: {
      backgroundColor: "#6c757d",
      color: "white"
    },
    resetBtnHover: {
      backgroundColor: "#5a6268"
    },
    charCount: {
      fontSize: "12px",
      color: "#6c757d",
      textAlign: "right",
      marginTop: "5px"
    },
    alertOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      padding: "15px",
      backgroundColor: "#4CAF50",
      color: "white",
      textAlign: "center",
      fontWeight: "bold",
      fontSize: "18px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
      transform: "translateY(0)",
      transition: "transform 0.3s ease-in-out",
    },
    alertHidden: {
      transform: "translateY(-100%)",
    }
  };

  return (
    <div style={styles.pageWrapper}>
      {/* Top Alert Notification */}
      <div 
        style={{
          ...styles.alertOverlay,
          ...(showAlert ? {} : styles.alertHidden)
        }}
      >
        Product added successfully! Redirecting to Inventory List...
      </div>

      <div style={styles.blurOverlay}></div>
      <div style={styles.container}>
        <h1 style={styles.heading}>Add Inventory Item</h1>

        {successMessage && (
          <div style={{...styles.message, ...styles.successMessage}}>
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div style={{...styles.message, ...styles.errorMessage}}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={sendData} style={styles.form}>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="itemno">Item Number *</label>
              <input
                style={{
                  ...styles.input, 
                  ...(errors.itemno ? styles.invalidInput : styles.validInput)
                }}
                id="itemno"
                type="text"
                name="itemno"
                placeholder="Enter item number (e.g. ITM-001)"
                value={formData.itemno}
                onChange={handleChange}
                required
              />
              {errors.itemno && <div style={styles.errorText}>{errors.itemno}</div>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="itemname">Item Name *</label>
              <input
                style={{
                  ...styles.input, 
                  ...(errors.itemname ? styles.invalidInput : styles.validInput)
                }}
                id="itemname"
                type="text"
                name="itemname"
                placeholder="Enter item name"
                value={formData.itemname}
                onChange={handleChange}
                required
              />
              {errors.itemname && <div style={styles.errorText}>{errors.itemname}</div>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="price">Price ($) *</label>
              <input
                style={{
                  ...styles.input, 
                  ...(errors.price ? styles.invalidInput : styles.validInput)
                }}
                id="price"
                type="number"
                name="price"
                step="0.01"
                min="0.01"
                placeholder="Enter price"
                value={formData.price}
                onChange={handleChange}
                required
              />
              {errors.price && <div style={styles.errorText}>{errors.price}</div>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="quantity">Quantity *</label>
              <input
                style={{
                  ...styles.input, 
                  ...(errors.quantity ? styles.invalidInput : styles.validInput)
                }}
                id="quantity"
                type="number"
                name="quantity"
                min="0"
                step="1"
                placeholder="Enter quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
              {errors.quantity && <div style={styles.errorText}>{errors.quantity}</div>}
            </div>

            <div style={{...styles.formGroup, ...styles.fullWidth}}>
              <label style={styles.label} htmlFor="description">
                Item Description {formData.description && `(${formData.description.length}/500)`}
              </label>
              <textarea
                style={{
                  ...styles.input, 
                  ...styles.textarea,
                  ...(errors.description ? styles.invalidInput : styles.validInput)
                }}
                id="description"
                name="description"
                rows="4"
                placeholder="Enter item description (optional)"
                value={formData.description}
                onChange={handleChange}
                maxLength="500"
              ></textarea>
              {errors.description && <div style={styles.errorText}>{errors.description}</div>}
            </div>

            <div style={{...styles.formGroup, ...styles.fullWidth}}>
              <label style={styles.label} htmlFor="inventorydate">Inventory Date</label>
              <input
                style={{
                  ...styles.input, 
                  ...(errors.inventorydate ? styles.invalidInput : styles.validInput)
                }}
                id="inventorydate"
                type="date"
                name="inventorydate"
                value={formData.inventorydate}
                onChange={handleChange}
              />
              {errors.inventorydate && <div style={styles.errorText}>{errors.inventorydate}</div>}
            </div>
          </div>

          <div style={styles.formActions}>
            <button 
              style={{
                ...styles.button, 
                ...styles.submitBtn,
                ...(loading ? styles.submitBtnDisabled : {})
              }} 
              type="submit" 
              disabled={loading}
              onMouseOver={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = styles.submitBtnHover.backgroundColor;
              }}
              onMouseOut={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = styles.submitBtn.backgroundColor;
              }}
            >
              {loading ? "Adding..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}