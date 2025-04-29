import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement, 
  PointElement, 
  LineElement 
} from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function InventoryReport() {
    const [reportData, setReportData] = useState({
        inventories: [],
        totalItems: 0,
        totalValue: 0,
        newItems: [],
        stockStatus: { inStock: 0, lowStock: 0 },
        restockStatus: { pending: 0, inTransit: 0, completed: 0 },
        monthlyTrend: []
    });
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();

    useEffect(() => {
        fetchReportData();
    }, []);

    const fetchReportData = async () => {
        try {
            // Fetch inventory data with stats
            const inventoryResponse = await fetch("http://localhost:8070/api/inventories/?withStats=true");
            if (!inventoryResponse.ok) {
                throw new Error(`Error: ${inventoryResponse.status}`);
            }
            const inventoryData = await inventoryResponse.json();
            
            // Fetch restock data
            const restockResponse = await fetch("http://localhost:8070/api/restock/");
            if (!restockResponse.ok) {
                throw new Error(`Error: ${restockResponse.status}`);
            }
            const restockData = await restockResponse.json();

            // Process inventory data
            const inventories = inventoryData.inventories || [];
            const totalValue = inventories.reduce((sum, item) => sum + (item.price * item.qty), 0);
            
            // Calculate stock status exactly as in readinventories.js
            const stockStatus = {
                inStock: inventories.filter(item => item.qty >= 20).length,
                lowStock: inventories.filter(item => item.qty < 20).length
            };

            // Process restock data - only count active restock orders
            const activeRestocks = restockData.restocks.filter(restock => 
                restock.status !== 'completed' && 
                inventories.some(inv => inv._id === restock.itemId && inv.qty < 20)
            );

            // Count restock statuses only from active restock orders
            const restockStatus = {
                pending: activeRestocks.filter(restock => restock.status === 'pending').length,
                inTransit: activeRestocks.filter(restock => restock.status === 'in_transit').length,
                completed: activeRestocks.filter(restock => restock.status === 'completed').length
            };

            // Generate monthly trend data
            const monthlyTrend = [];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const currentMonth = new Date().getMonth();
            
            for (let i = 0; i < 6; i++) {
                const monthIndex = (currentMonth - i + 12) % 12;
                monthlyTrend.unshift({
                    month: months[monthIndex],
                    count: inventories.filter(item => 
                        new Date(item.createdAt).getMonth() === monthIndex
                    ).length
                });
            }

            setReportData({
                inventories,
                totalItems: inventories.length,
                totalValue,
                stockStatus,
                restockStatus,
                monthlyTrend
            });
        } catch (err) {
            setErrorMessage(err.message);
        } finally {
            setLoading(false);
        }
    };

    const stockStatusData = {
        labels: ['In Stock', 'Low Stock'],
        datasets: [{
            data: [reportData.stockStatus.inStock, reportData.stockStatus.lowStock],
            backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
            borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
            borderWidth: 1
        }]
    };

    const restockStatusData = {
        labels: ['Pending', 'In Transit', 'Completed'],
        datasets: [{
            data: [
                reportData.restockStatus.pending,
                reportData.restockStatus.inTransit,
                reportData.restockStatus.completed
            ],
            backgroundColor: [
                'rgba(255, 206, 86, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(75, 192, 192, 0.6)'
            ],
            borderColor: [
                'rgba(255, 206, 86, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 1
        }]
    };

    const monthlyTrendData = {
        labels: reportData.monthlyTrend.map(item => item.month),
        datasets: [{
            label: 'Total Items',
            data: reportData.monthlyTrend.map(item => item.count),
            fill: false,
            borderColor: 'rgba(75, 192, 192, 1)',
            tension: 0.1
        }]
    };

    const styles = {
        container: {
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "15px",
            fontFamily: "Arial, sans-serif",
            fontSize: "12px"
        },
        header: {
            textAlign: "center",
            color: "#2c3e50",
            marginBottom: "15px"
        },
        summaryCards: {
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "10px",
            marginBottom: "15px"
        },
        card: {
            backgroundColor: "white",
            padding: "10px",
            borderRadius: "6px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            textAlign: "center"
        },
        cardTitle: {
            fontSize: "12px",
            color: "#666",
            marginBottom: "5px"
        },
        cardValue: {
            fontSize: "16px",
            color: "#2c3e50",
            fontWeight: "bold"
        },
        section: {
            backgroundColor: "white",
            padding: "10px",
            borderRadius: "6px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            marginBottom: "10px"
        },
        sectionTitle: {
            fontSize: "14px",
            color: "#2c3e50",
            marginBottom: "10px"
        },
        chartsGrid: {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            marginBottom: "15px"
        },
        table: {
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "10px",
            fontSize: "11px"
        },
        th: {
            backgroundColor: "#f8f9fa",
            padding: "8px",
            textAlign: "left",
            borderBottom: "1px solid #dee2e6",
            fontSize: "11px"
        },
        td: {
            padding: "8px",
            borderBottom: "1px solid #dee2e6",
            fontSize: "11px"
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
        },
        chartsSection: {
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            marginBottom: "20px"
        },
        tr: {
            backgroundColor: "#f8f9fa",
            padding: "8px",
            textAlign: "left",
            borderBottom: "1px solid #dee2e6"
        }
    };

    const downloadPDF = () => {
        const reportContent = document.getElementById('inventory-report-container');
        if (!reportContent) {
            console.error('Report content not found');
            return;
        }

        // A4 dimensions in mm
        const a4Width = 210;
        const a4Height = 297;

        html2canvas(reportContent, {
            scale: 1.5, // Reduced scale for better fit
            useCORS: true,
            logging: true,
            allowTaint: true,
            width: reportContent.offsetWidth,
            height: reportContent.offsetHeight
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Calculate dimensions to fit A4
            const imgWidth = a4Width;
            const imgHeight = (canvas.height * a4Width) / canvas.width;

            // Scale down if content is too tall
            let finalWidth = imgWidth;
            let finalHeight = imgHeight;
            
            if (imgHeight > a4Height) {
                const scale = a4Height / imgHeight;
                finalWidth = imgWidth * scale;
                finalHeight = a4Height;
            }

            // Center the content on the page
            const xOffset = (a4Width - finalWidth) / 2;
            const yOffset = (a4Height - finalHeight) / 2;

            pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);
            pdf.save(`inventory_report_${currentMonth}_${currentYear}.pdf`);
        }).catch(error => {
            console.error('Error generating PDF:', error);
        });
    };

    if (loading) {
        return <div style={styles.container}>Loading report data...</div>;
    }

    if (errorMessage) {
        return <div style={styles.container}>Error: {errorMessage}</div>;
    }

    return (
        <div id="inventory-report-container" style={styles.container}>
            <div style={styles.header}>
                <h1>Inventory Report</h1>
                <p>{currentMonth} {currentYear}</p>
            </div>

            {/* Charts Section */}
            <div style={styles.chartsSection}>
                <div style={styles.chartsGrid}>
                    {/* Inventory Levels Chart */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Inventory Levels</h3>
                        <Line 
                            data={monthlyTrendData}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: { position: 'top' },
                                    title: { display: false }
                                }
                            }}
                        />
                    </div>

                    {/* Stock Status Chart */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Stock Status</h3>
                        <div style={{ width: '200px', height: '200px', margin: '0 auto' }}>
                            <Pie 
                                data={stockStatusData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { 
                                            position: 'top',
                                            labels: {
                                                boxWidth: 10,
                                                font: {
                                                    size: 10
                                                }
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div style={styles.summaryCards}>
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Total Items</h3>
                    <div style={styles.cardValue}>{reportData.totalItems}</div>
                </div>
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Total Value</h3>
                    <div style={styles.cardValue}>
                        Rs. {reportData.totalValue.toLocaleString()}
                    </div>
                </div>
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Low Stock Items</h3>
                    <div style={styles.cardValue}>{reportData.stockStatus.lowStock}</div>
                </div>
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Pending Restocks</h3>
                    <div style={styles.cardValue}>{reportData.restockStatus.pending}</div>
                </div>
            </div>

            {/* Inventory Table */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Newly Added Inventory Details</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Item Name</th>
                                <th style={styles.th}>Quantity</th>
                                <th style={styles.th}>Unit Price</th>
                                <th style={styles.th}>Total Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.inventories.map((item, index) => (
                                <tr key={index} style={styles.tr}>
                                    <td style={styles.td}>{item.itemname}</td>
                                    <td style={styles.td}>{item.qty}</td>
                                    <td style={styles.td}>Rs. {item.price.toLocaleString()}</td>
                                    <td style={styles.td}>Rs. {(item.price * item.qty).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Download Report Button */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginTop: '30px',
                marginBottom: '30px'
            }}>
                <button 
                    onClick={downloadPDF}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '500',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            backgroundColor: '#45a049',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                        }
                    }}
                >
                    Download Report
                </button>
            </div>
        </div>
    );
}