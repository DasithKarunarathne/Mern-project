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
import { HERITAGE_HANDS_LOGO } from '../hr/logo';
import autoTable from "jspdf-autotable";

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
            const inventoryResponse = await fetch("http://localhost:5000/inventory/?withStats=true");
            if (!inventoryResponse.ok) {
                throw new Error(`Error: ${inventoryResponse.status}`);
            }
            const inventoryData = await inventoryResponse.json();
            
            // Fetch restock data
            const restockResponse = await fetch("http://localhost:5000/inventory/restock/");
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

            // Process restock data
            const restockStatus = {
                pending: restockData.restocks.filter(item => item.status === 'pending').length,
                inTransit: restockData.restocks.filter(item => item.status === 'in_transit').length,
                completed: restockData.restocks.filter(item => item.status === 'completed').length
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
            padding: "20px",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            backgroundColor: "#f5f7fa",
            minHeight: "100vh"
        },
        header: {
            textAlign: "center",
            color: "#8B4513", // Brown color
            marginBottom: "25px",
            fontSize: "24px",
            fontWeight: "600"
        },
        summaryCards: {
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "15px",
            marginBottom: "25px"
        },
        card: {
            backgroundColor: "white",
            padding: "15px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            textAlign: "center",
            borderTop: "4px solid #8B4513" // Brown border
        },
        cardTitle: {
            fontSize: "14px",
            color: "#666",
            marginBottom: "8px",
            fontWeight: "500"
        },
        cardValue: {
            fontSize: "20px",
            color: "#8B4513", // Brown color
            fontWeight: "bold"
        },
        section: {
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            marginBottom: "20px"
        },
        sectionTitle: {
            fontSize: "18px",
            color: "#8B4513", // Brown color
            marginBottom: "15px",
            fontWeight: "600",
            borderBottom: "2px solid #8B4513", // Brown border
            paddingBottom: "8px"
        },
        chartsGrid: {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "25px"
        },
        table: {
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "15px",
            fontSize: "14px"
        },
        th: {
            backgroundColor: "#8B4513", // Brown background
            color: "white",
            padding: "12px",
            textAlign: "left",
            borderBottom: "2px solid #654321", // Darker brown border
            fontSize: "14px",
            fontWeight: "600"
        },
        td: {
            padding: "12px",
            borderBottom: "1px solid #ddd",
            fontSize: "14px",
            color: "#333"
        },
        downloadButton: {
            backgroundColor: "#8B4513", // Brown color
            color: "white",
            padding: "12px 24px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "600",
            marginTop: "25px",
            transition: "all 0.3s",
            "&:hover": {
                backgroundColor: "#654321" // Darker brown on hover
            }
        },
        chartsSection: {
            backgroundColor: "white",
            padding: "25px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            marginBottom: "25px"
        },
        tr: {
            "&:hover": {
                backgroundColor: "#f8f9fa"
            }
        }
    };

    const downloadPDF = () => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Add logo
        pdf.addImage(HERITAGE_HANDS_LOGO, 'PNG', 20, 10, 30, 15);

        // Add header
        pdf.setFontSize(20);
        pdf.setTextColor(139, 69, 19); // Brown color
        pdf.text('Inventory Report', pageWidth / 2, 20, { align: 'center' });
        
        // Add date
        pdf.setFontSize(12);
        pdf.setTextColor(100);
        pdf.text(`${currentMonth} ${currentYear}`, pageWidth / 2, 30, { align: 'center' });

        // Add summary cards
        const summaryData = [
            ['Total Items', reportData.totalItems],
            ['Total Value', `Rs. ${reportData.totalValue.toLocaleString()}`],
            ['Low Stock Items', reportData.stockStatus.lowStock],
            ['Pending Restocks', reportData.restockStatus.pending]
        ];

        autoTable(pdf, {
            startY: 40,
            head: [['Metric', 'Value']],
            body: summaryData,
            theme: 'grid',
            headStyles: {
                fillColor: [139, 69, 19],
                textColor: 255,
                fontSize: 12,
                fontStyle: 'bold'
            },
            styles: {
                fontSize: 11,
                cellPadding: 5
            }
        });

        // Add inventory table
        const tableData = reportData.inventories.map(item => [
            item.itemname,
            item.qty,
            `Rs. ${item.price.toLocaleString()}`,
            `Rs. ${(item.price * item.qty).toLocaleString()}`
        ]);

        autoTable(pdf, {
            startY: pdf.lastAutoTable.finalY + 20,
            head: [['Item Name', 'Quantity', 'Unit Price', 'Total Value']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [139, 69, 19],
                textColor: 255,
                fontSize: 12,
                fontStyle: 'bold'
            },
            styles: {
                fontSize: 11,
                cellPadding: 5
            }
        });

        // Add footer
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.text('Generated by Heritage Hands Inventory System', pageWidth / 2, pageHeight - 10, { align: 'center' });
        pdf.text(`Page 1 of 1`, pageWidth - 20, pageHeight - 10, { align: 'right' });

        // Save the PDF
        pdf.save(`inventory-report-${currentMonth}-${currentYear}.pdf`);
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
                    style={styles.downloadButton}
                >
                    Download Report
                </button>
            </div>
        </div>
    );
}