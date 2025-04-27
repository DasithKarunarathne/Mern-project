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
            padding: "25px",
            maxWidth: "1400px",
            margin: "0 auto",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            backgroundColor: "#f5f7fa",
            minHeight: "100vh"
        },
        header: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px",
            flexWrap: "wrap",
            gap: "15px"
        },
        headerTitle: {
            fontSize: "28px",
            fontWeight: "600",
            color: "#2c3e50",
            margin: "0"
        },
        headerActions: {
            display: "flex",
            gap: "15px",
            flexWrap: "wrap"
        },
        primaryButton: {
            padding: "10px 20px",
            backgroundColor: "#27ae60",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "15px",
            fontWeight: "500",
            transition: "all 0.3s",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            "&:hover": {
                backgroundColor: "#219653"
            }
        },
        secondaryButton: {
            padding: "10px 20px",
            backgroundColor: "#3498db",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "15px",
            fontWeight: "500",
            transition: "all 0.3s",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            "&:hover": {
                backgroundColor: "#2980b9"
            }
        },
        searchContainer: {
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "20px"
        },
        searchInput: {
            padding: "12px 15px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            width: "300px",
            fontSize: "15px",
            outline: "none",
            transition: "all 0.3s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            "&:focus": {
                borderColor: "#3498db",
                boxShadow: "0 0 0 2px rgba(52,152,219,0.2)"
            }
        },
        errorMessage: {
            color: "#e74c3c",
            backgroundColor: "#fdecea",
            padding: "15px",
            borderRadius: "6px",
            marginBottom: "20px",
            borderLeft: "4px solid #e74c3c",
            fontWeight: "500"
        },
        loadingState: {
            padding: "30px",
            textAlign: "center",
            color: "#7f8c8d",
            fontSize: "18px"
        },
        tableContainer: {
            overflowX: "auto",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            backgroundColor: "white"
        },
        table: {
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "900px"
        },
        tableHeader: {
            backgroundColor: "#3498db",
            color: "white"
        },
        tableHeaderCell: {
            padding: "15px",
            textAlign: "left",
            fontWeight: "600",
            fontSize: "15px"
        },
        tableRow: {
            borderBottom: "1px solid #eee",
            transition: "background-color 0.2s",
            "&:hover": {
                backgroundColor: "#f8f9fa"
            }
        },
        tableCell: {
            padding: "15px",
            textAlign: "left",
            verticalAlign: "middle",
            fontSize: "14px",
            color: "#34495e"
        },
        lowStockButton: {
            padding: "5px 10px",
            backgroundColor: "#e67e22",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "500",
            marginLeft: "8px",
            transition: "all 0.2s",
            "&:hover": {
                backgroundColor: "#d35400"
            }
        },
        actionCell: {
            display: "flex",
            gap: "10px"
        },
        editButton: {
            padding: "8px 15px",
            backgroundColor: "#3498db",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "500",
            transition: "all 0.2s",
            "&:hover": {
                backgroundColor: "#2980b9"
            }
        },
        deleteButton: {
            padding: "8px 15px",
            backgroundColor: "#e74c3c",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "500",
            transition: "all 0.2s",
            "&:hover": {
                backgroundColor: "#c0392b"
            }
        },
        emptyState: {
            padding: "30px",
            textAlign: "center",
            color: "#7f8c8d",
            fontSize: "16px"
        },
        popupOverlay: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            backdropFilter: "blur(3px)"
        },
        popupContent: {
            backgroundColor: "white",
            borderRadius: "10px",
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
            padding: "25px",
            width: "90%",
            maxWidth: "600px",
            maxHeight: "80vh",
            overflow: "auto"
        },
        popupHeader: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            paddingBottom: "15px",
            borderBottom: "1px solid #eee"
        },
        popupTitle: {
            fontSize: "20px",
            fontWeight: "600",
            color: "#e74c3c",
            display: "flex",
            alignItems: "center",
            gap: "10px"
        },
        closeButton: {
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "24px",
            color: "#7f8c8d",
            transition: "color 0.2s",
            "&:hover": {
                color: "#e74c3c"
            }
        },
        popupMessage: {
            color: "#e74c3c",
            marginBottom: "20px",
            fontWeight: "500",
            fontSize: "15px"
        },
        lowStockList: {
            listStyle: "none",
            padding: 0,
            margin: 0
        },
        lowStockItem: {
            padding: "12px 0",
            borderBottom: "1px solid #f5f5f5",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
        },
        itemName: {
            fontWeight: "600",
            color: "#2c3e50",
            fontSize: "15px"
        },
        itemQuantity: {
            color: "#e74c3c",
            fontWeight: "600",
            fontSize: "14px"
        },
        popupFooter: {
            marginTop: "20px",
            display: "flex",
            justifyContent: "flex-end",
            gap: "15px",
            borderTop: "1px solid #eee",
            paddingTop: "20px"
        },
        closePopupButton: {
            padding: "10px 20px",
            backgroundColor: "#e74c3c",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "15px",
            fontWeight: "500",
            transition: "all 0.3s",
            "&:hover": {
                backgroundColor: "#c0392b"
            }
        },
        stockStatus: {
            display: "flex",
            alignItems: "center",
            gap: "8px"
        },
        stockIndicator: {
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            display: "inline-block"
        },
        restockStatus: {
            display: "flex",
            alignItems: "center",
            gap: "8px"
        },
        statusIndicator: {
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            display: "inline-block"
        },
        statusText: {
            fontSize: "14px",
            fontWeight: "500"
        },
        inStock: {
            backgroundColor: "#27ae60"
        },
        lowStock: {
            backgroundColor: "#e67e22"
        },
        outOfStock: {
            backgroundColor: "#e74c3c"
        }
    };

    useEffect(() => {
        fetchInventories();
        fetchRestockStatus();
    }, []);

    useEffect(() => {
        // Check for low stock items when inventories are loaded
        if (inventories.length > 0) {
            const lowStockItems = inventories.filter(item => item.qty < 20);
            if (lowStockItems.length > 0) {
                setLowStockItems(lowStockItems);
                setShowLowStockPopup(true);
            }
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
            const response = await axios.get("http://localhost:8070/inventories");
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
            const response = await axios.get("http://localhost:8070/restock");
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
        navigate(`/update/${id}`);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                await axios.delete(`http://localhost:8070/inventories/delete/${id}`);
                fetchInventories();
            } catch (err) {
                setErrorMessage(err.response?.data?.error || "Failed to delete item");
            }
        }
    };

    const handleRestock = (item) => {
        navigate(`/restock/${item._id}`);
    };

    const handleGenerateReport = () => {
        navigate('/report');
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const closePopup = () => {
        setShowLowStockPopup(false);
    };

    return (
        <div style={styles.container}>
            {showLowStockPopup && (
                <div style={styles.popupOverlay}>
                    <div style={styles.popupContent}>
                        <div style={styles.popupHeader}>
                            <h2 style={styles.popupTitle}>
                                <span>⚠️</span> LOW STOCK WARNING
                            </h2>
                            <button style={styles.closeButton} onClick={closePopup}>×</button>
                        </div>
                        <div style={styles.popupMessage}>
                            The following items are below their minimum stock levels:
                        </div>
                        <ul style={styles.lowStockList}>
                            {lowStockItems.map(item => (
                                <li key={item._id} style={styles.lowStockItem}>
                                    <span style={styles.itemName}>{item.itemname}</span>
                                    <div>
                                        <span style={styles.itemQuantity}>
                                            {item.qty} units (Threshold: 20)
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div style={styles.popupFooter}>
                            <button
                                style={styles.closePopupButton}
                                onClick={closePopup}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={styles.header}>
                <h1 style={styles.headerTitle}>Inventory Management</h1>
                <div style={styles.headerActions}>
                    <button
                        style={styles.primaryButton}
                        onClick={() => navigate("/add")}
                    >
                        <span>+</span> Add New Item
                    </button>
                    <button
                        style={styles.secondaryButton}
                        onClick={handleGenerateReport}
                    >
                        <span>📊</span> Generate Report
                    </button>
                </div>
            </div>

            <div style={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Search by Item Number or Name..."
                    value={searchTerm}
                    onChange={handleSearchChange}
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
                            <tr style={styles.tableHeader}>
                                <th style={styles.tableHeaderCell}>Item No</th>
                                <th style={styles.tableHeaderCell}>Item Name</th>
                                <th style={styles.tableHeaderCell}>Price (Rs)</th>
                                <th style={styles.tableHeaderCell}>Quantity</th>
                                <th style={styles.tableHeaderCell}>Description</th>
                                <th style={styles.tableHeaderCell}>Inventory Date</th>
                                <th style={styles.tableHeaderCell}>Restock Status</th>
                                <th style={styles.tableHeaderCell}>Actions</th>
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
                                                ...styles.tableRow,
                                                backgroundColor: isLowStock ? "#fff5f5" : "inherit"
                                            }}
                                        >
                                            <td style={styles.tableCell}>{item.itemno}</td>
                                            <td style={styles.tableCell}>{item.itemname}</td>
                                            <td style={styles.tableCell}>Rs {item.price?.toFixed(2)}</td>
                                            <td style={styles.tableCell}>
                                                <div style={styles.stockStatus}>
                                                    <span 
                                                        style={{
                                                            ...styles.stockIndicator,
                                                            backgroundColor: isLowStock ? "#e74c3c" : "#27ae60"
                                                        }}
                                                    />
                                                    {item.qty}
                                                    {isLowStock && !restockStatus[item._id] && (
                                                        <button
                                                            style={styles.lowStockButton}
                                                            onClick={() => handleRestock(item)}
                                                        >
                                                            Low Stock
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={styles.tableCell}>
                                                {item.itemdescription?.length > 50
                                                    ? `${item.itemdescription.substring(0, 50)}...`
                                                    : item.itemdescription}
                                            </td>
                                            <td style={styles.tableCell}>
                                                {new Date(item.inventorydate).toLocaleDateString()}
                                            </td>
                                            <td style={styles.tableCell}>
                                                {restockStatus[item._id] && (
                                                    <div style={styles.restockStatus}>
                                                        <span 
                                                            style={{
                                                                ...styles.statusIndicator,
                                                                backgroundColor: 
                                                                    restockStatus[item._id] === 'in_transit' ? "#e67e22" :
                                                                    restockStatus[item._id] === 'completed' ? "#27ae60" : "#95a5a6"
                                                            }}
                                                        />
                                                        <span style={styles.statusText}>
                                                            {restockStatus[item._id] === 'in_transit' ? 'In Transit' :
                                                             restockStatus[item._id] === 'completed' ? 'Completed' : 'Pending'}
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                            <td style={styles.tableCell}>
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
                                    <td colSpan="8" style={styles.emptyState}>
                                        {searchTerm
                                            ? "No items found matching your search"
                                            : "No inventory items found. Add your first item!"}
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