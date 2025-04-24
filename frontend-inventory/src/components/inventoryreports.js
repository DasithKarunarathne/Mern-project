import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function InventoryReport() {
    const [inventories, setInventories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Fetch inventory data
    useEffect(() => {
        const fetchInventories = async () => {
            setLoading(true);
            setErrorMessage("");
            try {
                const response = await fetch("http://localhost:8070/inventory/");
                
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Handle both response formats:
                // 1. Direct array response
                // 2. Object with inventories property
                if (Array.isArray(data)) {
                    setInventories(data);
                } else if (data.inventories && Array.isArray(data.inventories)) {
                    setInventories(data.inventories);
                } else {
                    throw new Error("Invalid data format received from server");
                }
            } catch (err) {
                setErrorMessage(err.message || "Failed to fetch inventories");
                setInventories([]); // Reset to empty array on error
            } finally {
                setLoading(false);
            }
        };

        fetchInventories();
    }, []);

    // Function to determine low stock
    const isLowStock = (quantity) => {
        return quantity <= 10;
    };

    // Function to calculate recommended restock quantity
    const calculateRecommendedQty = (quantity, income = 4000) => {
        let idealStock;
        if (income < 3000) {
            idealStock = 30;
        } else if (income >= 3000 && income <= 5000) {
            idealStock = 60;
        } else {
            idealStock = 100;
        }
        return Math.max(idealStock - quantity, 0);
    };

    // Function to download the report as PDF
    const downloadPDF = () => {
        const input = document.getElementById("inventory-report");
        html2canvas(input).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
            pdf.save("inventory_report.pdf");
        });
    };

    // Styles
    const styles = {
        container: {
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "20px",
            fontFamily: "Arial, sans-serif"
        },
        header: {
            textAlign: "center",
            color: "#2c3e50",
            marginBottom: "25px"
        },
        error: {
            color: "red",
            marginBottom: "20px"
        },
        table: {
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "20px"
        },
        th: {
            backgroundColor: "#f3f4f6",
            padding: "12px",
            textAlign: "left",
            borderBottom: "2px solid #e5e7eb"
        },
        td: {
            padding: "12px",
            borderBottom: "1px solid #e5e7eb"
        },
        lowStock: {
            color: "#dc2626",
            fontWeight: "bold"
        },
        restockRecommendation: {
            backgroundColor: "#d1fae5",
            padding: "8px",
            borderRadius: "4px",
            textAlign: "center"
        },
        downloadButton: {
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
            marginTop: "20px"
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Inventory Report</h1>

            {errorMessage && (
                <div style={styles.error}>{errorMessage}</div>
            )}

            {loading ? (
                <div style={{ textAlign: "center" }}>Loading inventory data...</div>
            ) : (
                <>
                    <div id="inventory-report">
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Item Number</th>
                                    <th style={styles.th}>Item Name</th>
                                    <th style={styles.th}>Price</th>
                                    <th style={styles.th}>Quantity</th>
                                    <th style={styles.th}>Description</th>
                                    <th style={styles.th}>Inventory Date</th>
                                    <th style={styles.th}>Stock Status</th>
                                    <th style={styles.th}>Restock Recommendation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventories.length > 0 ? (
                                    inventories.map(item => (
                                        <tr key={item._id}>
                                            <td style={styles.td}>{item.itemno}</td>
                                            <td style={styles.td}>{item.itemname}</td>
                                            <td style={styles.td}>${Number(item.price).toFixed(2)}</td>
                                            <td style={styles.td}>
                                                {item.qty}
                                                {isLowStock(item.qty) && (
                                                    <span style={styles.lowStock}> (Low Stock)</span>
                                                )}
                                            </td>
                                            <td style={styles.td}>{item.itemdescription}</td>
                                            <td style={styles.td}>
                                                {new Date(item.inventorydate).toLocaleDateString()}
                                            </td>
                                            <td style={styles.td}>
                                                {isLowStock(item.qty) ? "Low Stock" : "In Stock"}
                                            </td>
                                            <td style={styles.td}>
                                                {isLowStock(item.qty) ? (
                                                    <div style={styles.restockRecommendation}>
                                                        Recommended Restock: {calculateRecommendedQty(item.qty)} units
                                                    </div>
                                                ) : (
                                                    "No restock needed"
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                                            No inventory items found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        <div style={{ marginTop: "20px" }}>
                            <h3>Restock Recommendations</h3>
                            <p>
                                Restock recommendations are based on the following income levels:
                            </p>
                            <ul>
                                <li>Income &lt; $3000: Minimal restock (30 units)</li>
                                <li>Income $3000 - $5000: Moderate restock (60 units)</li>
                                <li>Income &gt; $5000: Full restock (100 units)</li>
                            </ul>
                        </div>
                    </div>

                    <div style={{ textAlign: "center" }}>
                        <button
                            onClick={downloadPDF}
                            style={styles.downloadButton}
                        >
                            Download Report as PDF
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}