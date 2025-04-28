import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ReadInventories() {
    const [inventories, setInventories] = useState([]);
    const [filteredInventories, setFilteredInventories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [showLowStockPopup, setShowLowStockPopup] = useState(false);
    const [lowStockItems, setLowStockItems] = useState([]);
    const [restockStatus, setRestockStatus] = useState({});
    const navigate = useNavigate();

    const styles = {
        container: {
            padding: '2rem',
            backgroundColor: '#f5f5f5',
            minHeight: '100vh'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            padding: '1.5rem',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        },
        headerTitle: {
            fontSize: '1.8rem',
            fontWeight: '600',
            color: '#5D4037',
            margin: '0'
        },
        headerActions: {
            display: 'flex',
            gap: '1rem'
        },
        primaryButton: {
            padding: '0.75rem 1.5rem',
            backgroundColor: '#8D6E63',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s ease',
            '&:hover': {
                backgroundColor: '#6D4C41',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(141, 110, 99, 0.3)'
            }
        },
        secondaryButton: {
            padding: '0.75rem 1.5rem',
            backgroundColor: '#A1887F',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s ease',
            '&:hover': {
                backgroundColor: '#8D6E63',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(161, 136, 127, 0.3)'
            }
        },
        searchContainer: {
            marginBottom: '2rem',
            padding: '1.5rem',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        },
        searchInput: {
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: '1px solid #BCAAA4',
            width: '100%',
            fontSize: '1rem',
            transition: 'all 0.3s ease',
            '&:focus': {
                outline: 'none',
                borderColor: '#8D6E63',
                boxShadow: '0 0 0 3px rgba(141, 110, 99, 0.1)'
            }
        },
        tableContainer: {
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            margin: '2rem 0'
        },
        table: {
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: 0,
            backgroundColor: '#ffffff'
        },
        th: {
            backgroundColor: '#8D6E63',
            color: 'white',
            padding: '1.2rem 1rem',
            textAlign: 'left',
            fontWeight: '600',
            fontSize: '1rem',
            position: 'sticky',
            top: 0,
            zIndex: 10
        },
        td: {
            padding: '1rem',
            borderBottom: '1px solid #EFEBE9',
            fontSize: '0.95rem',
            color: '#5D4037'
        },
        tr: {
            transition: 'all 0.3s ease',
            backgroundColor: '#ffffff',
            '&:hover': {
                backgroundColor: '#EFEBE9'
            }
        },
        lowStockRow: {
            backgroundColor: '#FFF5F5',
            '&:hover': {
                backgroundColor: '#FFE5E5'
            }
        },
        actionCell: {
            display: 'flex',
            gap: '0.5rem'
        },
        editButton: {
            padding: '0.5rem 1rem',
            backgroundColor: '#8D6E63',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            '&:hover': {
                backgroundColor: '#6D4C41',
                transform: 'translateY(-2px)'
            }
        },
        deleteButton: {
            padding: '0.5rem 1rem',
            backgroundColor: '#A1887F',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            '&:hover': {
                backgroundColor: '#8D6E63',
                transform: 'translateY(-2px)'
            }
        },
        lowStockButton: {
            padding: '0.5rem 1rem',
            backgroundColor: '#D32F2F',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            '&:hover': {
                backgroundColor: '#B71C1C',
                transform: 'translateY(-2px)'
            }
        },
        stockStatus: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        stockIndicator: {
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            display: 'inline-block'
        },
        inStock: {
            backgroundColor: '#388E3C'
        },
        lowStock: {
            backgroundColor: '#F57C00'
        },
        outOfStock: {
            backgroundColor: '#D32F2F'
        },
        errorMessage: {
            color: '#D32F2F',
            backgroundColor: '#FFEBEE',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        loadingState: {
            padding: '2rem',
            textAlign: 'center',
            color: '#5D4037',
            fontSize: '1.1rem'
        },
        emptyState: {
            padding: '2rem',
            textAlign: 'center',
            color: '#5D4037',
            fontSize: '1.1rem'
        },
        popup: {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#ffffff',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            maxWidth: '500px',
            width: '90%'
        },
        popupOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999
        },
        popupHeader: {
            color: '#D32F2F',
            fontSize: '1.5rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        popupContent: {
            marginBottom: '1.5rem'
        },
        popupItem: {
            padding: '0.75rem',
            backgroundColor: '#FFF5F5',
            borderRadius: '6px',
            marginBottom: '0.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        popupButtons: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem'
        },
        closeButton: {
            padding: '0.75rem 1.5rem',
            backgroundColor: '#A1887F',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            '&:hover': {
                backgroundColor: '#8D6E63',
                transform: 'translateY(-2px)'
            }
        },
        actionButton: {
            padding: '0.75rem 1.5rem',
            backgroundColor: '#D32F2F',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            '&:hover': {
                backgroundColor: '#B71C1C',
                transform: 'translateY(-2px)'
            }
        }
    };

    useEffect(() => {
        fetchInventories();
        fetchRestockStatus();
    }, []);

    useEffect(() => {
        const lowStockItems = inventories.filter(item => item.qty < 20);
        if (lowStockItems.length > 0) {
            setLowStockItems(lowStockItems);
            setShowLowStockPopup(true);
        }
    }, [inventories]);

    useEffect(() => {
        const filtered = inventories.filter(item =>
            item.itemno.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.itemname.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredInventories(filtered);
    }, [searchTerm, inventories]);

    const fetchInventories = async () => {
        try {
            setLoading(true);
            const response = await axios.get("http://localhost:5000/inventory");
            if (response.data && response.data.success) {
                setInventories(response.data.inventories);
                setFilteredInventories(response.data.inventories);
            }
        } catch (err) {
            console.error("Error fetching inventories:", err);
            setErrorMessage("Failed to fetch inventories");
        } finally {
            setLoading(false);
        }
    };

    const fetchRestockStatus = async () => {
        try {
            const response = await axios.get("http://localhost:5000/inventory/restock");
            if (response.data && response.data.success) {
                const statusMap = {};
                response.data.restocks.forEach(restock => {
                    statusMap[restock.itemId] = restock.status;
                });
                setRestockStatus(statusMap);
            }
        } catch (err) {
            console.error("Error fetching restock status:", err);
        }
    };

    const getStockStatus = (item) => {
        if (!item.trackStock) return null;
        
        const qty = Number(item.qty) || 0;
        const minStockQty = Number(item.minStockQty) || 0;
        
        if (qty === 0) return "out";
        if (qty <= minStockQty) return "low";
        return "in";
    };

    const handleEdit = (id) => {
        navigate(`/inventory/update/${id}`);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                await axios.delete(`http://localhost:5000/inventory/delete/${id}`);
                fetchInventories();
            } catch (err) {
                setErrorMessage(err.response?.data?.error || "Failed to delete item");
            }
        }
    };

    const handleRestock = (item) => {
        navigate(`/inventory/restock/${item._id}`);
    };

    const handleGenerateReport = () => {
        navigate('/inventory/report');
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleClosePopup = () => {
        setShowLowStockPopup(false);
    };

    const handleRestockFromPopup = (item) => {
        handleRestock(item);
        setShowLowStockPopup(false);
    };

    // Add this component for the popup
    const LowStockPopup = ({ items, onClose, onRestock }) => {
        if (!items || items.length === 0) return null;

        return (
            <>
                <div style={styles.popupOverlay} onClick={onClose} />
                <div style={styles.popup}>
                    <div style={styles.popupHeader}>
                        <span>⚠️ Low Stock Alert</span>
                    </div>
                    <div style={styles.popupContent}>
                        <p>The following items are running low on stock:</p>
                        {items.map(item => (
                            <div key={item._id} style={styles.popupItem}>
                                <span>{item.itemname} - {item.qty} remaining</span>
                                <button
                                    style={styles.actionButton}
                                    onClick={() => onRestock(item)}
                                >
                                    Restock
                                </button>
                            </div>
                        ))}
                    </div>
                    <div style={styles.popupButtons}>
                        <button style={styles.closeButton} onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </>
        );
    };

    return (
        <div style={styles.container}>
            {showLowStockPopup && (
                <LowStockPopup
                    items={lowStockItems}
                    onClose={handleClosePopup}
                    onRestock={handleRestockFromPopup}
                />
            )}
            
            <div style={styles.header}>
                <h1 style={styles.headerTitle}>Inventory Management</h1>
                <div style={styles.headerActions}>
                    <button
                        style={styles.primaryButton}
                        onClick={() => navigate("/inventory/add")}
                    >
                        <span>+</span> Add New Item
                    </button>
                    <button
                        style={styles.secondaryButton}
                        onClick={() => navigate("/inventory/report")}
                    >
                        <span>📊</span> Generate Report
                    </button>
                </div>
            </div>

            <div style={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Search inventory..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                />
            </div>

            {errorMessage && (
                <div style={styles.errorMessage}>{errorMessage}</div>
            )}

            {loading ? (
                <div style={styles.loadingState}>Loading inventory data...</div>
            ) : (
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Item No</th>
                                <th style={styles.th}>Item Name</th>
                                <th style={styles.th}>Price (Rs)</th>
                                <th style={styles.th}>Quantity</th>
                                <th style={styles.th}>Description</th>
                                <th style={styles.th}>Inventory Date</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInventories.length > 0 ? (
                                filteredInventories.map(item => {
                                    const isLowStock = item.qty < 20;
                                    return (
                                        <tr
                                            key={item._id}
                                            style={{
                                                ...(isLowStock ? styles.lowStockRow : styles.tr)
                                            }}
                                        >
                                            <td style={styles.td}>{item.itemno}</td>
                                            <td style={styles.td}>{item.itemname}</td>
                                            <td style={styles.td}>Rs {item.price?.toFixed(2)}</td>
                                            <td style={styles.td}>
                                                <div style={styles.stockStatus}>
                                                    <span 
                                                        style={{
                                                            ...styles.stockIndicator,
                                                            backgroundColor: isLowStock ? "#e74c3c" : "#27ae60"
                                                        }}
                                                    />
                                                    {item.qty}
                                                </div>
                                            </td>
                                            <td style={styles.td}>
                                                {item.itemdescription?.length > 50
                                                    ? `${item.itemdescription.substring(0, 50)}...`
                                                    : item.itemdescription}
                                            </td>
                                            <td style={styles.td}>
                                                {new Date(item.inventorydate).toLocaleDateString()}
                                            </td>
                                            <td style={styles.td}>
                                                {restockStatus[item._id] ? (
                                                    <div style={styles.stockStatus}>
                                                        <span 
                                                            style={{
                                                                ...styles.stockIndicator,
                                                                backgroundColor: 
                                                                    restockStatus[item._id] === 'in_transit' ? "#e67e22" :
                                                                    restockStatus[item._id] === 'completed' ? "#27ae60" : "#95a5a6"
                                                            }}
                                                        />
                                                        {restockStatus[item._id] === 'in_transit' ? 'In Transit' :
                                                         restockStatus[item._id] === 'completed' ? 'Completed' : 'Pending'}
                                                    </div>
                                                ) : (
                                                    isLowStock && (
                                                        <button
                                                            style={styles.actionButton}
                                                            onClick={() => handleRestock(item)}
                                                        >
                                                            Restock
                                                        </button>
                                                    )
                                                )}
                                            </td>
                                            <td style={styles.td}>
                                                <div style={styles.actionCell}>
                                                    <button
                                                        style={styles.editButton}
                                                        onClick={() => handleEdit(item._id)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        style={styles.deleteButton}
                                                        onClick={() => handleDelete(item._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" style={styles.td}>
                                        <div style={styles.noResults}>
                                            {searchTerm
                                                ? "No items found matching your search"
                                                : "No inventory items found. Add your first item!"}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}