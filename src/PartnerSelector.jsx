// src/PartnerSelector.jsx
import React, { useState, useEffect, useCallback } from 'react';

const PartnerSelector = ({
    members,
    assignedPairs,
    onAssignPartner
}) => {
    const [selectedMember, setSelectedMember] = useState('');
    const [partnerResult, setPartnerResult] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [scrolledName, setScrolledName] = useState('');
    const [message, setMessage] = useState('');

    const findPartner = useCallback((member) => {
        // Check if partner already assigned
        const partnerOfSelected = assignedPairs[member];
        if (partnerOfSelected) {
            return { partner: partnerOfSelected, isNew: false, message: `✅ Partner already assigned to ${member}:` };
        }

        // Identify ineligible partners (mutual exclusion logic and already assigned partners)
        const assignedSelectors = Object.keys(assignedPairs);
        const assignedPartners = Object.values(assignedPairs);

        // Ineligible: the selected member, anyone who has already been a selector OR a partner.
        const ineligiblePartners = new Set([
            member,
            ...assignedSelectors,
            ...assignedPartners
        ]);

        // Filter the full member list to get available partners
        let availablePartners = members.filter(
            m => !ineligiblePartners.has(m)
        );

        if (availablePartners.length > 0) {
            // New assignment: randomly select one from the available list
            const randomIndex = Math.floor(Math.random() * availablePartners.length);
            const newPartner = availablePartners[randomIndex];

            return { partner: newPartner, isNew: true, message: '🔥 Lucky Draw Assignment:' };
        } else {
            // No eligible partners left
            return { partner: null, isNew: false, message: '😔 No eligible partners left!' };
        }
    }, [members, assignedPairs]);


    const handleDraw = () => {
        if (!selectedMember) {
            setMessage("🔴 Please select a member first.");
            return;
        }

        const assignmentResult = findPartner(selectedMember);
        setMessage(assignmentResult.message);
        setPartnerResult(assignmentResult.partner);

        if (assignmentResult.isNew) {
            startDrawingAnimation(assignmentResult.partner);
        } else {
            setScrolledName(assignmentResult.partner || 'N/A');
        }
    };

    // --- Lucky Draw Animation Logic ---
    const startDrawingAnimation = (finalPartner) => {
        setIsDrawing(true);
        setScrolledName('');

        const allMembersExceptFinal = members.filter(m => m !== finalPartner);
        let cycle = 0;

        const interval = setInterval(() => {
            if (cycle < 25) { // Fast scrolling
                const randomIndex = Math.floor(Math.random() * members.length);
                setScrolledName(members[randomIndex]);
                cycle++;
            } else if (cycle < 40) { // Slowing down
                const index = Math.floor(Math.random() * allMembersExceptFinal.length);
                setScrolledName(allMembersExceptFinal[index]);
                cycle++;
            } else { // Stop at the final partner
                clearInterval(interval);
                setScrolledName(finalPartner);
                setIsDrawing(false);

                // Finalize the assignment
                onAssignPartner(selectedMember, finalPartner);
            }
        }, cycle < 25 ? 40 : 120); // Interval time control
    };
    // ---------------------------------

    return (
        <div className="partner-selector">
            <h2>✨ Partner Finder</h2>
            <p>Select a member to find their unique, unassigned partner.</p>

            <div className="controls">
                <select
                    value={selectedMember}
                    onChange={(e) => {
                        setSelectedMember(e.target.value);
                        setPartnerResult(null);
                        setScrolledName('');
                        setMessage('');
                    }}
                    disabled={isDrawing}
                >
                    <option value="">-- Select a Member --</option>
                    {members.map(member => (
                        <option key={member} value={member}>
                            {member}
                        </option>
                    ))}
                </select>
                <button
                    onClick={handleDraw}
                    disabled={!selectedMember || isDrawing}
                >
                    {isDrawing ? "Drawing..." : "Start Lucky Draw"}
                </button>
            </div>

            <div className="draw-result-container">
                <p className="status-message">{message}</p>
                <div className="draw-box">
                    {scrolledName || '—'}
                </div>
            </div>

            <div className="current-pairs">
                <h3>Current Assignments:</h3>
                <ul>
                    {Object.entries(assignedPairs).map(([selector, partner]) => (
                        <li key={selector}>
                            **{selector}** ➡️ **{partner}**
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default PartnerSelector;