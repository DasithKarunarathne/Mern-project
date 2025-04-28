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
            const response = await fetch(`http://localhost:5000/inventory/delete/${id}`, {
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
        searchContainer: {
            marginBottom: '2rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'center'
        },
        searchInput: {
            padding: '0.75rem 1rem',
            border: '1px solid #BCAAA4',
            borderRadius: '8px',
            fontSize: '1rem',
            width: '300px',
            transition: 'all 0.3s ease',
            '&:focus': {
                outline: 'none',
                borderColor: '#8D6E63',
                boxShadow: '0 0 0 3px rgba(141, 110, 99, 0.1)'
            }
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '1rem',
            backgroundColor: '#fff',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)'
        },
        th: {
            backgroundColor: '#8D6E63',
            color: '#fff',
            padding: '1rem',
            textAlign: 'left',
            fontWeight: '500'
        },
        td: {
            padding: '1rem',
            borderBottom: '1px solid #EFEBE9',
            color: '#5D4037'
        },
        tr: {
            '&:hover': {
                backgroundColor: '#EFEBE9'
            }
        },
        deleteButton: {
            padding: '0.5rem 1rem',
            backgroundColor: '#D32F2F',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
                backgroundColor: '#B71C1C',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)'
            }
        },
        noResults: {
            textAlign: 'center',
            padding: '2rem',
            color: '#5D4037',
            fontSize: '1.1rem'
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
            {errorMessage && (
                <div style={styles.error}>{errorMessage}</div>
            )}

            {loading ? (
                <div style={styles.loading}>Deleting...</div>
            ) : showConfirm ? (
                <div style={styles.itemInfo}>
                    <h3 style={styles.header}>Confirm Deletion</h3>
                    <p>Are you sure you want to delete this inventory item?</p>
                    <div style={styles.buttonContainer}>
                        <button 
                            style={styles.deleteButton}
                            onClick={handleDelete}
                        >
                            Delete
                        </button>
                        <button 
                            style={styles.cancelButton}
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