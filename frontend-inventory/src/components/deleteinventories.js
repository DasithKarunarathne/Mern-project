import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function DeleteInventories() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showConfirm, setShowConfirm] = useState(true);

    const handleDelete = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8070/inventory/delete/${id}`, {
                method: "DELETE"
            });
            
            const data = await response.json();
            
            if (!response.ok || !data.success) {
                throw new Error(data.error || "Failed to delete item");
            }

            navigate("/display");
        } catch (err) {
            setErrorMessage(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate("/display");
    };

    // Styles
    const styles = {
        container: {
            maxWidth: "500px",
            margin: "0 auto",
            padding: "20px",
            textAlign: "center"
        },
        confirmBox: {
            backgroundColor: "#f9f9f9",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        },
        title: {
            fontSize: "20px",
            marginBottom: "15px"
        },
        button: {
            padding: "10px 15px",
            margin: "0 10px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
        },
        deleteButton: {
            backgroundColor: "#f44336",
            color: "white"
        },
        cancelButton: {
            backgroundColor: "#2196F3",
            color: "white"
        },
        error: {
            color: "#f44336",
            marginBottom: "15px"
        }
    };

    return (
        <div style={styles.container}>
            {errorMessage && (
                <div style={styles.error}>{errorMessage}</div>
            )}

            {loading ? (
                <div>Deleting...</div>
            ) : showConfirm ? (
                <div style={styles.confirmBox}>
                    <h3 style={styles.title}>Confirm Deletion</h3>
                    <p>Are you sure you want to delete this inventory item?</p>
                    <div>
                        <button 
                            style={{...styles.button, ...styles.deleteButton}}
                            onClick={handleDelete}
                        >
                            Delete
                        </button>
                        <button 
                            style={{...styles.button, ...styles.cancelButton}}
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}