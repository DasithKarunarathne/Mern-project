import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Tooltip,
  Chip,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate, useParams } from "react-router-dom";
import {
  Add as AddIcon,
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
  PictureAsPdf as PdfIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip as ChartTooltip, 
  Legend, 
  ArcElement, 
  PointElement, 
  LineElement 
} from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import autoTable from "jspdf-autotable";
import { HERITAGE_HANDS_LOGO } from '../hr/logo';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
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

    const downloadPDF = async () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Define theme colors
        const primaryColor = {
            r: 93,
            g: 64,
            b: 55
        }; // #5D4037 - Deep Brown
        const secondaryColor = {
            r: 255,
            g: 215,
            b: 0
        }; // #FFD700 - Gold

        // Add letterhead border
        doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b);
        doc.setLineWidth(0.5);
        doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

        // Add company logo on the right (smaller size)
        try {
            const logoWidth = 35;
            const logoHeight = 35;
            const logoX = pageWidth - logoWidth - 25;
            const logoY = 20;
            doc.addImage(HERITAGE_HANDS_LOGO, 'PNG', logoX, logoY, logoWidth, logoHeight);
        } catch (error) {
            console.error('Error adding logo to PDF:', error);
        }

        // Add company header on the left
        doc.setFontSize(22);
        doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
        doc.text('HERITAGE HANDS', 25, 35);
        
        // Add document title
        doc.setFontSize(16);
        doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
        doc.text('INVENTORY MANAGEMENT REPORT', pageWidth/2, 60, { align: 'center' });

        // Add horizontal line under the title
        doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b);
        doc.setLineWidth(0.5);
        doc.line(pageWidth/2 - 50, 65, pageWidth/2 + 50, 65);

        // Add reference number and date section
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        const refNumber = `REF: HH/INV/${currentMonth.toUpperCase()}/${currentYear}`;
        doc.text(refNumber, 25, 80);
        
        // Add date information in a more formal format
        const formattedDate = new Date().toLocaleDateString('en-US', { 
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
        
        doc.text('Date: ' + formattedDate, 25, 87);
        doc.text('Report Period: ' + currentMonth + ' ' + currentYear, 25, 94);

        // Add a subtle divider before the charts
        doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b);
        doc.setLineWidth(0.2);
        doc.line(25, 105, pageWidth - 25, 105);

        // Capture and add charts
        try {
            // Capture Stock Status Chart
            const stockStatusChart = document.querySelector('#stock-status-chart');
            if (stockStatusChart) {
                const stockStatusCanvas = await html2canvas(stockStatusChart, {
                    scale: 2,
                    useCORS: true,
                    logging: true,
                    allowTaint: true
                });
                const stockStatusImg = stockStatusCanvas.toDataURL('image/png');
                doc.addImage(stockStatusImg, 'PNG', 25, 115, 80, 60);
            }

            // Capture Restock Status Chart
            const restockStatusChart = document.querySelector('#restock-status-chart');
            if (restockStatusChart) {
                const restockStatusCanvas = await html2canvas(restockStatusChart, {
                    scale: 2,
                    useCORS: true,
                    logging: true,
                    allowTaint: true
                });
                const restockStatusImg = restockStatusCanvas.toDataURL('image/png');
                doc.addImage(restockStatusImg, 'PNG', pageWidth - 105, 115, 80, 60);
            }

            // Capture Monthly Trend Chart
            const monthlyTrendChart = document.querySelector('#monthly-trend-chart');
            if (monthlyTrendChart) {
                const monthlyTrendCanvas = await html2canvas(monthlyTrendChart, {
                    scale: 2,
                    useCORS: true,
                    logging: true,
                    allowTaint: true
                });
                const monthlyTrendImg = monthlyTrendCanvas.toDataURL('image/png');
                doc.addImage(monthlyTrendImg, 'PNG', 25, 190, pageWidth - 50, 60);
            }
        } catch (error) {
            console.error('Error capturing charts:', error);
        }

        // Add a divider after charts
        doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b);
        doc.setLineWidth(0.2);
        doc.line(25, 265, pageWidth - 25, 265);

        // Prepare table data
        const tableData = reportData.inventories.map((item) => [
            item.itemname,
            item.qty.toString(),
            `Rs. ${item.price.toLocaleString()}`,
            `Rs. ${(item.price * item.qty).toLocaleString()}`,
            item.qty < 20 ? 'Low Stock' : 'In Stock',
            new Date(item.createdAt).toLocaleDateString()
        ]);

        // Add the main table with themed colors
        autoTable(doc, {
            startY: 275,
            head: [
                [
                    "Item Name",
                    "Quantity",
                    "Unit Price",
                    "Total Value",
                    "Status",
                    "Added Date"
                ],
            ],
            body: tableData,
            theme: "grid",
            styles: { 
                fontSize: 9,
                cellPadding: 3,
                lineColor: [primaryColor.r, primaryColor.g, primaryColor.b],
                lineWidth: 0.1,
                font: 'helvetica',
            },
            headStyles: { 
                fillColor: [primaryColor.r, primaryColor.g, primaryColor.b],
                textColor: 255,
                fontSize: 10,
                fontStyle: 'bold',
                halign: 'center',
            },
            alternateRowStyles: {
                fillColor: [251, 247, 245],
            },
            bodyStyles: {
                textColor: [primaryColor.r, primaryColor.g, primaryColor.b],
            },
            margin: { left: 25, right: 25 },
        });

        // Add summary section
        const finalY = doc.lastAutoTable.finalY || 275;
        doc.setFontSize(12);
        doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
        doc.text('Summary', 25, finalY + 20);
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Total Items: ${reportData.totalItems}`, 25, finalY + 30);
        doc.text(`Total Value: Rs. ${reportData.totalValue.toLocaleString()}`, 25, finalY + 37);
        doc.text(`Low Stock Items: ${reportData.stockStatus.lowStock}`, 25, finalY + 44);
        doc.text(`Pending Restocks: ${reportData.restockStatus.pending}`, 25, finalY + 51);

        // Add footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            // Add footer border
            doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b);
            doc.setLineWidth(0.2);
            doc.line(25, pageHeight - 35, pageWidth - 25, pageHeight - 35);

            // Footer text
            doc.setFontSize(8);
            doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
            
            // Left side
            doc.text('Heritage Hands Pvt Ltd.', 25, pageHeight - 25);
            
            // Center
            doc.text(
                `Page ${i} of ${pageCount}`,
                pageWidth / 2,
                pageHeight - 25,
                { align: 'center' }
            );
            
            // Right side
            doc.text(
                'CONFIDENTIAL',
                pageWidth - 25,
                pageHeight - 25,
                { align: 'right' }
            );
        }

        doc.save(`Heritage_Hands_Inventory_Report_${currentMonth}_${currentYear}.pdf`);
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
                    {/* Stock Status Chart */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Stock Status</h3>
                        <div id="stock-status-chart" style={{ width: '200px', height: '200px', margin: '0 auto' }}>
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

                    {/* Restock Status Chart */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Restock Status</h3>
                        <div id="restock-status-chart" style={{ width: '200px', height: '200px', margin: '0 auto' }}>
                            <Pie 
                                data={restockStatusData}
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

                {/* Monthly Trend Chart */}
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Monthly Trend</h3>
                    <div id="monthly-trend-chart" style={{ width: '100%', height: '300px', margin: '0 auto' }}>
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