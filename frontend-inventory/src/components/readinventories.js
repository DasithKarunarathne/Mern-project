import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function InventoryTable() {
    const [inventories, setInventories] = useState([]);
    const [filteredInventories, setFilteredInventories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const LOW_STOCK_THRESHOLD = 10;
    const navigate = useNavigate();

    // Styles definition
    const styles = {
        container: {
            padding: "20px",
            maxWidth: "1200px",
            margin: "0 auto",
            fontFamily: "Arial, sans-serif"
        },
        header: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px"
        },
        headerTitle: {
            fontSize: "24px",
            fontWeight: "bold",
            color: "#333"
        },
        headerActions: {
            display: "flex",
            gap: "10px"
        },
        primaryButton: {
            padding: "8px 16px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px"
        },
        secondaryButton: {
            padding: "8px 16px",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px"
        },
        searchContainer: {
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "15px"
        },
        searchInput: {
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            width: "250px",
            fontSize: "14px"
        },
        errorMessage: {
            color: "#f44336",
            backgroundColor: "#ffebee",
            padding: "10px",
            borderRadius: "4px",
            marginBottom: "15px"
        },
        loadingState: {
            padding: "20px",
            textAlign: "center",
            color: "#666"
        },
        table: {
            width: "100%",
            borderCollapse: "collapse",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        },
        tableHeader: {
            backgroundColor: "#f5f5f5"
        },
        tableHeaderCell: {
            padding: "12px 15px",
            textAlign: "left",
            borderBottom: "1px solid #ddd",
            fontWeight: "bold"
        },
        tableRow: {
            borderBottom: "1px solid #eee",
            "&:hover": {
                backgroundColor: "#f9f9f9"
            }
        },
        tableCell: {
            padding: "12px 15px",
            textAlign: "left",
            verticalAlign: "middle"
        },
        lowStockButton: {
            padding: "4px 8px",
            backgroundColor: "#ff9800",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px",
            marginLeft: "8px"
        },
        actionCell: {
            display: "flex",
            gap: "8px"
        },
        editButton: {
            padding: "6px 12px",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px"
        },
        deleteButton: {
            padding: "6px 12px",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px"
        },
        emptyState: {
            padding: "20px",
            textAlign: "center",
            color: "#666"
        }
    };

    useEffect(() => {
        fetchInventories();
    }, []);

    useEffect(() => {
        const filtered = inventories.filter(item => 
            item.itemno.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.itemname.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredInventories(filtered);
    }, [searchTerm, inventories]);

    const fetchInventories = async () => {
        setLoading(true);
        setErrorMessage("");
        try {
            const response = await fetch("http://localhost:8070/inventory/");
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (Array.isArray(data)) {
                setInventories(data);
                setFilteredInventories(data);
            } else if (data.inventories && Array.isArray(data.inventories)) {
                setInventories(data.inventories);
                setFilteredInventories(data.inventories);
            } else {
                throw new Error("Invalid data format received from server");
            }
        } catch (err) {
            console.error("Error fetching inventories:", err);
            setErrorMessage(err.message || "Failed to fetch inventories. Please try again later.");
            setInventories([]);
            setFilteredInventories([]);
        } finally {
            setLoading(false);
        }
    };

    const isLowStock = (quantity) => {
        return quantity <= LOW_STOCK_THRESHOLD;
    };

    const handleEdit = (id) => {
        navigate(`/edit/${id}`);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                const response = await fetch(`http://localhost:8070/inventory/delete/${id}`, {
                    method: "DELETE"
                });
                
                if (!response.ok) {
                    throw new Error("Failed to delete item");
                }
                
                fetchInventories(); // Refresh the list after deletion
            } catch (err) {
                setErrorMessage(err.message);
            }
        }
    };

    const handleRestock = (item) => {
        navigate(`/restock/${item._id}`);
    };

    const handleGenerateReport = () => {
        // Implement report generation logic here
        alert("Report generation functionality would go here");
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.headerTitle}>Inventory Table</h1>
                <div style={styles.headerActions}>
                    <button 
                        style={styles.primaryButton}
                        onClick={() => navigate("/add")}
                    >
                        Add New Item
                    </button>
                    <button 
                        style={styles.secondaryButton}
                        onClick={handleGenerateReport}
                    >
                        Generate Report
                    </button>
                </div>
            </div>

            <div style={styles.searchContainer}>
                <input 
                    type="text" 
                    placeholder="Search by Item Number or Name" 
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
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeader}>
                            <th style={styles.tableHeaderCell}>Item Number</th>
                            <th style={styles.tableHeaderCell}>Item Name</th>
                            <th style={styles.tableHeaderCell}>Price</th>
                            <th style={styles.tableHeaderCell}>Quantity</th>
                            <th style={styles.tableHeaderCell}>Description</th>
                            <th style={styles.tableHeaderCell}>Inventory Date</th>
                            <th style={styles.tableHeaderCell}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInventories.length > 0 ? (
                            filteredInventories.map(item => (
                                <tr key={item._id} style={styles.tableRow}>
                                    <td style={styles.tableCell}>{item.itemno}</td>
                                    <td style={styles.tableCell}>{item.itemname}</td>
                                    <td style={styles.tableCell}>${item.price.toFixed(2)}</td>
                                    <td style={styles.tableCell}>
                                        {item.qty}
                                        {isLowStock(item.qty) && (
                                            <button 
                                                style={styles.lowStockButton}
                                                onClick={() => handleRestock(item)}
                                            >
                                                Low stock
                                            </button>
                                        )}
                                    </td>
                                    <td style={styles.tableCell}>{item.itemdescription}</td>
                                    <td style={styles.tableCell}>
                                        {new Date(item.inventorydate).toLocaleDateString()}
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
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={styles.emptyState}>
                                    {searchTerm ? "No items found matching the search" : "No inventory items found"}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}