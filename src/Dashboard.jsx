// src/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// NOTE: Replace these with your actual IDs.
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const API_KEY = 'YOUR_API_KEY_HERE';
const RANGE = 'Sheet1!A2:C';

const Dashboard = () => {
    const [sheetData, setSheetData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAssignments = async () => {
            const API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;

            try {
                const response = await axios.get(API_URL);
                setSheetData(response.data.values || []);
            } catch (err) {
                console.error("Failed to fetch Google Sheet data:", err);
                setError("Failed to fetch dashboard data. Check API Key and Sheet ID.");
            } finally {
                setLoading(false);
            }
        };

        if (SPREADSHEET_ID.includes('YOUR_SPREADSHEET_ID')) {
             setLoading(false);
             setError("Dashboard is using placeholder IDs. Please update SPREADSHEET_ID and API_KEY.");
        } else {
             fetchAssignments();
        }
    }, []);

    if (loading) return <div>⏳ Loading Dashboard Data...</div>;
    if (error) return <div className="error-message">⚠️ Error: {error}</div>;

    return (
        <div className="dashboard-view">
            <h3>📊 Assignments Dashboard (Live Data)</h3>
            {sheetData.length === 0 ? (
                <p>No assignments found in the Google Sheet yet.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Selected Member</th>
                            <th>Assigned Partner</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sheetData.map((row, index) => (
                            <tr key={index}>
                                <td>{row[0]}</td>
                                <td>{row[1]}</td>
                                <td>{row[2]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Dashboard;