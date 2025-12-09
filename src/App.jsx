// // src/App.jsx - FINAL CODE WITH GOOGLE APPS SCRIPT FIXES
// import React, { useState, useCallback } from 'react';
// import axios from 'axios';
// import { initialMembers } from './MemberData';
// import './index.css';
//
// // ⚠️ IMPORTANT: WEB APP SUBMISSION FIXES APPLIED HERE
// // 1. The URL is correct for the Apps Script Web App.
// const FORM_ACTION_URL = 'https://script.google.com/macros/s/AKfycbyknWLQjEbzciiuzX627PbzuhoUimOIXvZzh43201rC6aRZ8hDyt8eVGZPDNiw_m3rS/exec';
//
// // 2. Use simple, readable keys that the Apps Script's doPost(e) function will look for.
// // You MUST ensure your Code.gs script looks for these exact keys ('selector' and 'partner').
// const SELECTED_MEMBER_FIELD = 'selector';
// const ASSIGNED_PARTNER_FIELD = 'partner';
//
// // Load pairs from local storage for persistence across sessions
// const getInitialPairs = () => {
//     try {
//         const storedPairs = localStorage.getItem('partnerPairs');
//         return storedPairs ? JSON.parse(storedPairs) : {};
//     } catch (e) {
//         console.error("Could not load pairs from local storage", e);
//         return {};
//     }
// };
//
// const App = () => {
//     const [assignedPairs, setAssignedPairs] = useState(getInitialPairs);
//     const [selectedMember, setSelectedMember] = useState('');
//     const [isDrawing, setIsDrawing] = useState(false);
//     const [scrolledName, setScrolledName] = useState('');
//     const [message, setMessage] = useState('');
//
//     // --- Data Submission Logic (FIXED) ---
//     const submitPairToSheet = async (selector, partner) => {
//         // FIX: The original condition was always true, causing submission to be skipped.
//         // Since we are using a deployed Apps Script URL, we proceed directly with the POST request.
//
//         const data = new URLSearchParams();
//         data.append(SELECTED_MEMBER_FIELD, selector); // Sends as 'selector=MemberName'
//         data.append(ASSIGNED_PARTNER_FIELD, partner); // Sends as 'partner=PartnerName'
//
//         try {
//             await axios.post(FORM_ACTION_URL, data.toString(), {
//                 headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
//             });
//             console.log(`✅ Submitted pair: ${selector} -> ${partner}`);
//         } catch (error) {
//             // NOTE: Errors here might mean the Apps Script is not deployed to 'Anyone'
//             console.error("❌ Error submitting data to Google Sheet via Apps Script:", error);
//         }
//     };
//
//     // --- Core Pairing Logic (Unchanged) ---
//     const findPartner = useCallback((member) => {
//         const partnerOfSelected = assignedPairs[member];
//         if (partnerOfSelected) {
//             return { partner: partnerOfSelected, isNew: false, message: `✅ Partner already completed for ${member}:` };
//         }
//
//         const assignedPartners = Object.values(assignedPairs);
//
//         const ineligiblePartners = new Set([
//             member,
//             ...assignedPartners
//         ]);
//
//         let availablePartners = initialMembers.filter(
//             m => !ineligiblePartners.has(m)
//         );
//
//         if (availablePartners.length > 0) {
//             const randomIndex = Math.floor(Math.random() * availablePartners.length);
//             const newPartner = availablePartners[randomIndex];
//
//             return { partner: newPartner, isNew: true, message: '🎄 Buddy Found!:' };
//         } else {
//             return { partner: null, isNew: false, message: '⚠️ No eligible partners left under current constraints.' };
//         }
//     }, [assignedPairs]);
//
//     // --- State Update and Submission ---
//     const handleAssignPartner = (selector, partner) => {
//         if (!partner) return;
//
//         setAssignedPairs(prevPairs => {
//             const newPairs = { ...prevPairs, [selector]: partner };
//             localStorage.setItem('partnerPairs', JSON.stringify(newPairs));
//             return newPairs;
//         });
//
//         submitPairToSheet(selector, partner);
//     };
//
//
//     // --- Lucky Draw Animation Logic (Unchanged) ---
//     const startDrawingAnimation = (finalPartner) => {
//         setIsDrawing(true);
//         setScrolledName('');
//
//         const allMembersExceptFinal = initialMembers.filter(m => m !== finalPartner);
//         let cycle = 0;
//
//         const interval = setInterval(() => {
//             if (cycle < 25) {
//                 const randomIndex = Math.floor(Math.random() * initialMembers.length);
//                 setScrolledName(initialMembers[randomIndex]);
//                 cycle++;
//             } else if (cycle < 40) {
//                 const index = Math.floor(Math.random() * allMembersExceptFinal.length);
//                 setScrolledName(allMembersExceptFinal[index]);
//                 cycle++;
//             } else {
//                 clearInterval(interval);
//                 setScrolledName(finalPartner);
//                 setIsDrawing(false);
//
//                 handleAssignPartner(selectedMember, finalPartner);
//             }
//         }, cycle < 25 ? 40 : 120);
//     };
//
//     const handleDraw = () => {
//         if (!selectedMember) {
//             setMessage("🔴 Please select a member first.");
//             return;
//         }
//
//         const assignmentResult = findPartner(selectedMember);
//         setMessage(assignmentResult.message);
//
//         if (assignmentResult.isNew && assignmentResult.partner) {
//             startDrawingAnimation(assignmentResult.partner);
//         } else {
//             setScrolledName(assignmentResult.partner || '—');
//         }
//     };
//     // ---------------------------------
//
//     return (
//         <div className="app-container">
//             <header>
//                 {/* Point 3: Changed Title and added Christmas Tree emoji */}
//                 <div className="header-title">
//                     <span className="christmas-tree">🎄</span>
//                     <h1>Christa Quest</h1>
//                 </div>
//             </header>
//
//             <div className="main-content">
//                 <div className="partner-section">
//                     <h2>✨ Select Your Name</h2>
//                     {/* Point 9: Removed Current Assignments count */}
//                     <p>Total Members: {initialMembers.length}</p>
//
//                     <div className="controls">
//                         <select
//                             value={selectedMember}
//                             onChange={(e) => {
//                                 setSelectedMember(e.target.value);
//                                 setScrolledName('');
//                                 setMessage('');
//                             }}
//                             disabled={isDrawing}
//                         >
//                             <option value="">-- Select a Name --</option>
//                             {initialMembers.map(member => (
//                                 <option
//                                     key={member}
//                                     value={member}
//                                     disabled={assignedPairs[member]}
//                                 >
//                                     {/* Point 7: Changed "Assigned" to "Completed" */}
//                                     {member} {assignedPairs[member] && ' (Completed)'}
//                                 </option>
//                             ))}
//                         </select>
//                         <button
//                             onClick={handleDraw}
//                             disabled={!selectedMember || isDrawing}
//                         >
//                             {/* Point 10: Changed button text */}
//                             {isDrawing ? "Drawing..." : "Find Your Buddy"}
//                         </button>
//                     </div>
//
//                     <div className="draw-result-container">
//                         <p className="status-message">{message}</p>
//                         <div className="draw-box">
//                             {scrolledName || '—'}
//                         </div>
//                     </div>
//                 </div>
//
//                 <div className="sidebar">
//                     <div className="current-pairs">
//                         <h3>Buddies Found:</h3>
//                         {/* Point 6: Scrollbar logic moved to index.css with max-height on the container */}
//                         <div className="assignment-list-container">
//                             <ul>
//                                 {Object.entries(assignedPairs).map(([selector, partner]) => (
//                                     <li key={selector}>
//                                         {/* Point 8: Removed asterisks */}
//                                         <strong>{selector}</strong>
//                                         <span> ➡️ </span>
//                                         <strong>{partner}</strong>
//                                     </li>
//                                 ))}
//                             </ul>
//                         </div>
//                         {/* Point 2: Removed "Reset All Assignments" button */}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };
//
// export default App;

// src/App.jsx - FINAL VERSION (Data Fetching, Pairing Logic, and UI)

import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { initialMembers } from './MemberData';
import './index.css';

// ⚠️ IMPORTANT: WEB APP SUBMISSION CONSTANTS
// This URL is used for BOTH reading (GET) and writing (POST) data.
const FORM_ACTION_URL = 'https://script.google.com/macros/s/AKfycby1u4EZ2OFDYKFsH2nlQApjS1H62rhjDFXGs8JybnRKpa9V4OffR1Rmd6GeOQ_qxlTm/exec';

// Keys the Google Apps Script's doPost(e) function expects
const SELECTED_MEMBER_FIELD = 'selector';
const ASSIGNED_PARTNER_FIELD = 'partner';

const App = () => {
    // Initial state set to empty, loading handled by the new 'isLoading' state
    const [assignedPairs, setAssignedPairs] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMember, setSelectedMember] = useState('');
    const [isDrawing, setIsDrawing] = useState(false);
    const [scrolledName, setScrolledName] = useState('');
    const [message, setMessage] = useState('');

    // --- Data Fetching (READ) on Component Load ---
    const fetchInitialPairs = useCallback(async () => {
        try {
            // Use axios.get to trigger the doGet(e) function in Code.gs
            const response = await axios.get(FORM_ACTION_URL);

            if (response.data.status === 'success' && response.data.assignments) {
                const fetchedPairs = response.data.assignments;
                setAssignedPairs(fetchedPairs);
            } else {
                console.error("Failed to fetch assignments from sheet:", response.data.message);
                setAssignedPairs({});
            }
        } catch (error) {
            console.error("Error fetching sheet data. Check CORS headers and deployment:", error);
            setAssignedPairs({});
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Run fetch on component mount to initialize state from the Google Sheet
    useEffect(() => {
        fetchInitialPairs();
        // Clean up localStorage data that we no longer rely on
        localStorage.removeItem('partnerPairs');
    }, [fetchInitialPairs]);


    // --- Data Submission (WRITE) ---
    const submitPairToSheet = async (selector, partner) => {
        const data = new URLSearchParams();
        data.append(SELECTED_MEMBER_FIELD, selector);
        data.append(ASSIGNED_PARTNER_FIELD, partner);

        try {
            // Use axios.post to trigger the doPost(e) function in Code.gs
            await axios.post(FORM_ACTION_URL, data.toString(), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            console.log(`✅ Submitted pair: ${selector} -> ${partner}`);

            // Re-fetch data immediately after submission to update the sidebar list
            fetchInitialPairs();

        } catch (error) {
            console.error("❌ Error submitting data to Google Sheet via Apps Script:", error);
        }
    };

    // --- Core Pairing Logic (Unchanged) ---
    const findPartner = useCallback((member) => {
        const partnerOfSelected = assignedPairs[member];
        if (partnerOfSelected) {
            return { partner: partnerOfSelected, isNew: false, message: `✅ Partner already completed for ${member}:` };
        }

        const assignedPartners = Object.values(assignedPairs);

        const ineligiblePartners = new Set([
            member,
            ...assignedPartners
        ]);

        let availablePartners = initialMembers.filter(
            m => !ineligiblePartners.has(m)
        );

        if (availablePartners.length > 0) {
            const randomIndex = Math.floor(Math.random() * availablePartners.length);
            const newPartner = availablePartners[randomIndex];

            return { partner: newPartner, isNew: true, message: '🎄 Buddy Found!:' };
        } else {
            return { partner: null, isNew: false, message: '⚠️ No eligible partners left under current constraints.' };
        }
    }, [assignedPairs]);

    // --- State Update and Submission ---
    const handleAssignPartner = (selector, partner) => {
        if (!partner) return;

        // Optimistic UI update (optional, but makes the app feel faster)
        setAssignedPairs(prevPairs => ({ ...prevPairs, [selector]: partner }));

        // Submit to the external sheet and trigger a full refresh
        submitPairToSheet(selector, partner);
    };


    // --- Lucky Draw Animation Logic (Unchanged) ---
    const startDrawingAnimation = (finalPartner) => {
        setIsDrawing(true);
        setScrolledName('');

        const allMembersExceptFinal = initialMembers.filter(m => m !== finalPartner);
        let cycle = 0;

        const interval = setInterval(() => {
            if (cycle < 25) {
                const randomIndex = Math.floor(Math.random() * initialMembers.length);
                setScrolledName(initialMembers[randomIndex]);
                cycle++;
            } else if (cycle < 40) {
                const index = Math.floor(Math.random() * allMembersExceptFinal.length);
                setScrolledName(allMembersExceptFinal[index]);
                cycle++;
            } else {
                clearInterval(interval);
                setScrolledName(finalPartner);
                setIsDrawing(false);

                handleAssignPartner(selectedMember, finalPartner);
            }
        }, cycle < 25 ? 40 : 120);
    };

    const handleDraw = () => {
        if (!selectedMember) {
            setMessage("🔴 Please select a member first.");
            return;
        }

        const assignmentResult = findPartner(selectedMember);
        setMessage(assignmentResult.message);

        if (assignmentResult.isNew && assignmentResult.partner) {
            startDrawingAnimation(assignmentResult.partner);
        } else {
            setScrolledName(assignmentResult.partner || '—');
        }
    };
    // ---------------------------------

    return (
        <div className="app-container">
            <header>
                <div className="header-title">
                    <span className="christmas-tree">🎄</span>
                    <h1>Christa Quest</h1>
                </div>
            </header>

            <div className="main-content">
                <div className="partner-section">
                    <h2>✨ Select Your Name</h2>
                    <p>Total Members: {initialMembers.length}</p>

                    {isLoading ? (
                        <p style={{marginTop: '20px'}}>Loading current assignments from sheet...</p>
                    ) : (
                        <>
                            <div className="controls">
                                <select
                                    value={selectedMember}
                                    onChange={(e) => {
                                        setSelectedMember(e.target.value);
                                        setScrolledName('');
                                        setMessage('');
                                    }}
                                    disabled={isDrawing}
                                >
                                    <option value="">-- Select a Name --</option>
                                    {initialMembers.map(member => (
                                        <option
                                            key={member}
                                            value={member}
                                            disabled={assignedPairs[member]}
                                        >
                                            {member} {assignedPairs[member] && ' (Completed)'}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleDraw}
                                    disabled={!selectedMember || isDrawing}
                                >
                                    {isDrawing ? "Drawing..." : "Find Your Buddy"}
                                </button>
                            </div>

                            <div className="draw-result-container">
                                <p className="status-message">{message}</p>
                                <div className="draw-box">
                                    {scrolledName || '—'}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="sidebar">
                    <div className="current-pairs">
                        <h3>Buddies Found:</h3>
                        <div className="assignment-list-container">
                            {isLoading ? (
                                <p>Loading...</p>
                            ) : (
                                <ul>
                                    {Object.entries(assignedPairs).map(([selector, partner]) => (
                                        <li key={selector}>
                                            <strong>{selector}</strong>
                                            <span> ➡️ </span>
                                            <strong>{partner}</strong>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;