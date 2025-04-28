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
            maxWidth: '1200px',
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
        filterContainer: {
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center'
        },
        filterInput: {
            padding: '0.75rem 1rem',
            border: '1px solid #BCAAA4',
            borderRadius: '8px',
            fontSize: '1rem',
            minWidth: '200px',
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
        exportButton: {
            padding: '0.75rem 1.5rem',
            backgroundColor: '#8D6E63',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
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
        chartContainer: {
            marginTop: '3rem',
            padding: '2rem',
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        },
        chartTitle: {
            color: '#5D4037',
            marginBottom: '1.5rem',
            textAlign: 'center',
            fontSize: '1.4rem',
            fontWeight: '600'
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
        loading: {
            textAlign: 'center',
            padding: '2rem',
            color: '#5D4037',
            fontSize: '1.1rem'
        },
        pagination: {
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            marginTop: '2rem'
        },
        pageButton: {
            padding: '0.5rem 1rem',
            backgroundColor: '#EFEBE9',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            color: '#5D4037',
            transition: 'all 0.3s ease',
            '&:hover': {
                backgroundColor: '#D7CCC8'
            },
            '&.active': {
                backgroundColor: '#8D6E63',
                color: 'white'
            }
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
                        <div style={{ width: '400px', height: '300px', margin: '0 auto' }}>
                            <Line 
                                data={monthlyTrendData}
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
                                        },
                                        title: { display: false }
                                    }
                                }}
                            />
                        </div>
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