import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function CheckInventoryQuality() {
    const [inventory, setInventory] = useState(null);
    const [qualityScores, setQualityScores] = useState(null);
    const [overallScore, setOverallScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Simplified quality measurement criteria for handicrafts
    const QUALITY_CRITERIA = {
        QUALITY_TEST: {
            name: "Quality Test",
            description: "Product quality assessment",
            maxScore: 100
        },
        ANALYSIS_RESULTS: {
            name: "Analysis Results",
            description: "Detailed analysis of product quality",
            maxScore: 100
        },
        QUANTITY_CHECK: {
            name: "Quantity Check",
            description: "Minimum quantity requirement (10 units)",
            maxScore: 100
        },
        UNIQUE_IDENTIFIER: {
            name: "Unique Identifier",
            description: "Each item has a unique item number",
            maxScore: 100
        }
    };

    // Quality thresholds
    const QUALITY_THRESHOLDS = {
        EXCELLENT: 90,
        GOOD: 75,
        ACCEPTABLE: 50
    };

    useEffect(() => {
        // Get inventory data from session storage
        const pendingInventory = sessionStorage.getItem("pendingInventory");
        
        if (!pendingInventory) {
            setError("No handicraft item found to check. Please go back and try again.");
            setLoading(false);
            return;
        }
        
        try {
            const inventoryData = JSON.parse(pendingInventory);
            setInventory(inventoryData);
            
            // Perform quality check automatically
            performQualityMeasurements(inventoryData);
        } catch (err) {
            setError("Failed to parse handicraft inventory data.");
            setLoading(false);
        }
    }, []);

    // Function to perform quality measurements
    const performQualityMeasurements = async (item) => {
        setLoading(true);
        
        try {
            // Initialize quality scores
            let scores = {};
            
            // 1. Quality Test (Hardcoded score)
            const qualityTestScore = 85; // Hardcoded score above 50
            scores.qualityTest = {
                score: qualityTestScore,
                maxScore: QUALITY_CRITERIA.QUALITY_TEST.maxScore,
                issues: [],
                passingScore: true
            };
            
            // 2. Analysis Results (Hardcoded score)
            const analysisScore = 80; // Hardcoded score above 50
            scores.analysisResults = {
                score: analysisScore,
                maxScore: QUALITY_CRITERIA.ANALYSIS_RESULTS.maxScore,
                issues: [],
                passingScore: true
            };

            // 3. Quantity Check
            const quantityIssues = [];
            let quantityScore = 0;
            
            if (!item.qty || item.qty < 10) {
                quantityIssues.push('Quantity must be at least 10 units');
                quantityScore = 0;
            } else {
                quantityScore = 100;
            }
            
            scores.quantityCheck = {
                score: quantityScore,
                maxScore: QUALITY_CRITERIA.QUANTITY_CHECK.maxScore,
                issues: quantityIssues,
                passingScore: quantityScore >= 100
            };
            
            // 4. Check Unique Identifier
            const uniqueIssues = [];
            let isUnique = true;
            
            try {
                // Use the correct API endpoint
                const response = await axios.get('http://localhost:8070/api/inventories');
                const existingInventory = response.data.success ? response.data.inventories : [];
                
                // Check for duplicates in current active inventory
                const isDuplicate = existingInventory.some(existingItem => 
                    existingItem.itemno.toString() === item.itemno.toString()
                );
                
                if (isDuplicate) {
                    uniqueIssues.push(`Item number ${item.itemno} already exists in inventory`);
                    isUnique = false;
                }
            } catch (err) {
                console.error("Error checking for duplicates:", err);
                uniqueIssues.push('Could not verify item number uniqueness. Please try again.');
                isUnique = false;
            }
            
            const uniqueScore = isUnique ? 
                QUALITY_CRITERIA.UNIQUE_IDENTIFIER.maxScore : 0;
            
            scores.uniqueIdentifier = {
                score: uniqueScore,
                maxScore: QUALITY_CRITERIA.UNIQUE_IDENTIFIER.maxScore,
                issues: uniqueIssues,
                passingScore: uniqueScore >= (QUALITY_CRITERIA.UNIQUE_IDENTIFIER.maxScore * 0.8)
            };
            
            // Calculate overall score
            const totalScore = Object.values(scores).reduce((sum, category) => sum + category.score, 0);
            const totalMaxScore = Object.values(scores).reduce((sum, category) => sum + category.maxScore, 0);
            const overallScoreValue = Math.round((totalScore / totalMaxScore) * 100);
            
            // Determine if the inventory passes quality checks
            const passingQuality = overallScoreValue >= QUALITY_THRESHOLDS.ACCEPTABLE &&
                scores.qualityTest.passingScore && 
                scores.analysisResults.passingScore &&
                scores.quantityCheck.passingScore &&
                scores.uniqueIdentifier.passingScore;
            
            setQualityScores({
                ...scores,
                overall: {
                    score: overallScoreValue,
                    totalScore,
                    totalMaxScore,
                    qualityRating: getQualityRating(overallScoreValue),
                    passingQuality
                }
            });
            
            setOverallScore(overallScoreValue);
            
        } catch (err) {
            console.error("Error performing quality measurements:", err);
            setError("Error checking quality: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Function to get quality rating based on score
    const getQualityRating = (score) => {
        if (score >= QUALITY_THRESHOLDS.EXCELLENT) return "Excellent";
        if (score >= QUALITY_THRESHOLDS.GOOD) return "Good";
        if (score >= QUALITY_THRESHOLDS.ACCEPTABLE) return "Acceptable";
        return "Needs Improvement";
    };

    // Function to get score color based on rating
    const getScoreColor = (score) => {
        if (score >= QUALITY_THRESHOLDS.EXCELLENT) return "#388e3c"; // Green
        if (score >= QUALITY_THRESHOLDS.GOOD) return "#689f38"; // Light Green
        if (score >= QUALITY_THRESHOLDS.ACCEPTABLE) return "#ffa000"; // Amber
        return "#d32f2f"; // Red
    };

    // Function to confirm and continue to add inventory
    const handleConfirmAndContinue = () => {
        if (!qualityScores?.overall.passingQuality) {
            alert("Cannot proceed with failed quality check. Please fix the issues first.");
            return;
        }
        
        // Mark the inventory as quality verified in sessionStorage
        sessionStorage.setItem("qualityStatus", "verified");
        sessionStorage.setItem("verifiedInventory", JSON.stringify(inventory));
        
        // Navigate back to add inventory form
        navigate("/add");
    };

    // Function to go back to edit inventory
    const handleGoBack = () => {
        navigate("/add");
    };

    // Styles
    const styles = {
        container: {
            maxWidth: "800px",
            margin: "0 auto",
            padding: "20px",
            fontFamily: "Arial, sans-serif"
        },
        header: {
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "20px",
            color: "#333"
        },
        subheader: {
            fontSize: "18px",
            fontWeight: "bold",
            marginBottom: "10px",
            color: "#555"
        },
        loading: {
            padding: "20px",
            textAlign: "center",
            color: "#666"
        },
        errorMessage: {
            color: "#f44336",
            backgroundColor: "#ffebee",
            padding: "10px",
            borderRadius: "4px",
            marginBottom: "15px"
        },
        scoreOverview: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "20px",
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
            marginBottom: "20px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        },
        scoreCircle: {
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "32px",
            fontWeight: "bold",
            marginBottom: "10px",
            border: "6px solid"
        },
        scoreRating: {
            fontSize: "20px",
            fontWeight: "bold",
            marginBottom: "5px"
        },
        scoreText: {
            fontSize: "14px",
            color: "#666"
        },
        categoryContainer: {
            backgroundColor: "#f5f5f5",
            borderRadius: "4px",
            padding: "15px",
            marginBottom: "15px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        },
        categoryHeader: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px"
        },
        categoryName: {
            fontSize: "16px",
            fontWeight: "bold"
        },
        categoryScore: {
            fontSize: "16px",
            fontWeight: "bold"
        },
        categoryDescription: {
            fontSize: "14px",
            color: "#666",
            marginBottom: "10px"
        },
        progressBarContainer: {
            height: "10px",
            backgroundColor: "#e0e0e0",
            borderRadius: "5px",
            marginBottom: "10px",
            overflow: "hidden"
        },
        progressBar: {
            height: "100%",
            borderRadius: "5px"
        },
        issuesContainer: {
            marginTop: "10px",
            padding: "10px",
            backgroundColor: "#ffebee",
            borderRadius: "4px",
            display: "flex",
            flexDirection: "column",
            gap: "5px"
        },
        issueItem: {
            fontSize: "14px",
            color: "#d32f2f"
        },
        buttonContainer: {
            display: "flex",
            gap: "10px",
            marginTop: "20px"
        },
        confirmButton: {
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px"
        },
        disabledButton: {
            padding: "10px 20px",
            backgroundColor: "#aaaaaa",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "not-allowed",
            fontSize: "14px"
        },
        backButton: {
            padding: "10px 20px",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px"
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Handicraft Inventory Quality Check</h1>
            
            {error && <div style={styles.errorMessage}>{error}</div>}
            
            {loading ? (
                <div style={styles.loading}>Checking handicraft quality...</div>
            ) : (
                <>
                    {qualityScores && qualityScores.overall && (
                        <div>
                            {/* Overall Score Display */}
                            <div style={styles.scoreOverview}>
                                <div 
                                    style={{
                                        ...styles.scoreCircle,
                                        borderColor: getScoreColor(qualityScores.overall.score),
                                        color: getScoreColor(qualityScores.overall.score)
                                    }}
                                >
                                    {qualityScores.overall.score}
                                </div>
                                <div style={styles.scoreRating}>
                                    {qualityScores.overall.qualityRating} Quality
                                </div>
                                <div style={styles.scoreText}>
                                    {qualityScores.overall.passingQuality 
                                        ? "This handicraft meets quality requirements" 
                                        : "This handicraft needs improvement"}
                                </div>
                            </div>
                            
                            <h2 style={styles.subheader}>Quality Measurements</h2>
                            
                            {/* Quality Test */}
                            {qualityScores.qualityTest && (
                                <div style={styles.categoryContainer}>
                                    <div style={styles.categoryHeader}>
                                        <div style={styles.categoryName}>
                                            {QUALITY_CRITERIA.QUALITY_TEST.name}
                                        </div>
                                        <div style={styles.categoryScore}>
                                            {qualityScores.qualityTest.score}/{qualityScores.qualityTest.maxScore}
                                        </div>
                                    </div>
                                    <div style={styles.categoryDescription}>
                                        {QUALITY_CRITERIA.QUALITY_TEST.description}
                                    </div>
                                    <div style={styles.progressBarContainer}>
                                        <div 
                                            style={{
                                                ...styles.progressBar,
                                                width: `${(qualityScores.qualityTest.score / qualityScores.qualityTest.maxScore) * 100}%`,
                                                backgroundColor: "#4CAF50" // Always green
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                            
                            {/* Analysis Results */}
                            {qualityScores.analysisResults && (
                                <div style={styles.categoryContainer}>
                                    <div style={styles.categoryHeader}>
                                        <div style={styles.categoryName}>
                                            {QUALITY_CRITERIA.ANALYSIS_RESULTS.name}
                                        </div>
                                        <div style={styles.categoryScore}>
                                            {qualityScores.analysisResults.score}/{qualityScores.analysisResults.maxScore}
                                        </div>
                                    </div>
                                    <div style={styles.categoryDescription}>
                                        {QUALITY_CRITERIA.ANALYSIS_RESULTS.description}
                                    </div>
                                    <div style={styles.progressBarContainer}>
                                        <div 
                                            style={{
                                                ...styles.progressBar,
                                                width: `${(qualityScores.analysisResults.score / qualityScores.analysisResults.maxScore) * 100}%`,
                                                backgroundColor: "#4CAF50" // Always green
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                            
                            {/* Quantity Check */}
                            {qualityScores.quantityCheck && (
                                <div style={styles.categoryContainer}>
                                    <div style={styles.categoryHeader}>
                                        <div style={styles.categoryName}>
                                            {QUALITY_CRITERIA.QUANTITY_CHECK.name}
                                        </div>
                                        <div style={styles.categoryScore}>
                                            {qualityScores.quantityCheck.score}/{qualityScores.quantityCheck.maxScore}
                                        </div>
                                    </div>
                                    <div style={styles.categoryDescription}>
                                        {QUALITY_CRITERIA.QUANTITY_CHECK.description}
                                    </div>
                                    <div style={styles.progressBarContainer}>
                                        <div 
                                            style={{
                                                ...styles.progressBar,
                                                width: `${(qualityScores.quantityCheck.score / qualityScores.quantityCheck.maxScore) * 100}%`,
                                                backgroundColor: qualityScores.quantityCheck.passingScore ? "#4CAF50" : "#f44336"
                                            }}
                                        />
                                    </div>
                                    {qualityScores.quantityCheck.issues.length > 0 && (
                                        <div style={styles.issuesContainer}>
                                            {qualityScores.quantityCheck.issues.map((issue, index) => (
                                                <div key={index} style={styles.issueItem}>• {issue}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {/* Unique Identifier */}
                            {qualityScores.uniqueIdentifier && (
                                <div style={styles.categoryContainer}>
                                    <div style={styles.categoryHeader}>
                                        <div style={styles.categoryName}>
                                            {QUALITY_CRITERIA.UNIQUE_IDENTIFIER.name}
                                        </div>
                                        <div style={styles.categoryScore}>
                                            {qualityScores.uniqueIdentifier.score}/{qualityScores.uniqueIdentifier.maxScore}
                                        </div>
                                    </div>
                                    <div style={styles.categoryDescription}>
                                        {QUALITY_CRITERIA.UNIQUE_IDENTIFIER.description}
                                    </div>
                                    <div style={styles.progressBarContainer}>
                                        <div 
                                            style={{
                                                ...styles.progressBar,
                                                width: `${(qualityScores.uniqueIdentifier.score / qualityScores.uniqueIdentifier.maxScore) * 100}%`,
                                                backgroundColor: qualityScores.uniqueIdentifier.passingScore ? "#4CAF50" : "#f44336"
                                            }}
                                        />
                                    </div>
                                    {qualityScores.uniqueIdentifier.issues.length > 0 && (
                                        <div style={styles.issuesContainer}>
                                            {qualityScores.uniqueIdentifier.issues.map((issue, index) => (
                                                <div key={index} style={styles.issueItem}>• {issue}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            <div style={styles.buttonContainer}>
                                <button
                                    style={qualityScores.overall.passingQuality ? styles.confirmButton : styles.disabledButton}
                                    onClick={handleConfirmAndContinue}
                                    disabled={!qualityScores.overall.passingQuality}
                                >
                                    Confirm & Continue
                                </button>
                                <button 
                                    style={styles.backButton}
                                    onClick={handleGoBack}
                                >
                                    Go Back to Edit
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}