import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { initialMembers } from './MemberData';
import './index.css';

// Use proxy path instead of script.google.com directly
const FORM_ACTION_URL =
  'https://script.google.com/macros/s/AKfycbwvIVNwk4K4VKsS-KMr0F4epChPz9uYDqBddeTkoiYhlo2mgoAAVmKZsANFny_4uC00/exec';

const SELECTED_MEMBER_FIELD = 'selector';
const ASSIGNED_PARTNER_FIELD = 'partner';

const App = () => {
  const [assignedPairs, setAssignedPairs] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [scrolledName, setScrolledName] = useState('');
  const [message, setMessage] = useState('');

  // --- Data Fetching (READ) ---
  const fetchInitialPairs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(FORM_ACTION_URL);

      if (response.data.status === 'success' && response.data.assignments) {
        setAssignedPairs(response.data.assignments);
      } else {
        console.error(
          'Failed to fetch assignments from sheet:',
          response.data.message
        );
        setAssignedPairs({});
      }
    } catch (error) {
      console.error(
        'Error fetching sheet data. Check proxy/Vite setup:',
        error
      );
      setAssignedPairs({});
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialPairs();
  }, [fetchInitialPairs]);

  // --- Data Submission (WRITE) ---
  const submitPairToSheet = async (selector, partner) => {
    const data = new URLSearchParams();
    data.append(SELECTED_MEMBER_FIELD, selector);
    data.append(ASSIGNED_PARTNER_FIELD, partner);

    try {
      await axios.post(FORM_ACTION_URL, data.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      console.log(`✅ Submitted pair: ${selector} -> ${partner}`);
      // Re-fetch from sheet to stay in sync
      fetchInitialPairs();
    } catch (error) {
      console.error(
        '❌ Error submitting data to Google Sheet via Apps Script:',
        error
      );
    }
  };

  // --- Pairing logic ---
  const findPartner = useCallback(
    (member) => {
      const partnerOfSelected = assignedPairs[member];
      if (partnerOfSelected) {
        return {
          partner: partnerOfSelected,
          isNew: false,
          message: `✅ Buddy already assigned for ${member}:`,
        };
      }

      const assignedPartners = Object.values(assignedPairs);

      const ineligiblePartners = new Set([member, ...assignedPartners]);

      const availablePartners = initialMembers.filter(
        (m) => !ineligiblePartners.has(m)
      );

      if (availablePartners.length > 0) {
        const randomIndex = Math.floor(Math.random() * availablePartners.length);
        const newPartner = availablePartners[randomIndex];

        return {
          partner: newPartner,
          isNew: true,
          message: '🎄 Buddy Found!:',
        };
      } else {
        return {
          partner: null,
          isNew: false,
          message: '⚠️ No eligible partners left under current constraints.',
        };
      }
    },
    [assignedPairs]
  );

  const handleAssignPartner = (selector, partner) => {
    if (!partner) return;

    // Optimistic local update
    setAssignedPairs((prev) => ({ ...prev, [selector]: partner }));

    // Sync to sheet
    submitPairToSheet(selector, partner);
  };

// --- Lucky Draw animation ---
const startDrawingAnimation = (finalPartner) => {
  setIsDrawing(true);
  setScrolledName("");

  const allExceptFinal = initialMembers.filter((m) => m !== finalPartner);
  let cycle = 0;

  const runAnimation = () => {
    cycle++;

    // Phase 1: FAST (0–20)
    if (cycle <= 20) {
      setScrolledName(initialMembers[Math.floor(Math.random() * initialMembers.length)]);
      setTimeout(runAnimation, 30); // fast
    }
    // Phase 2: MEDIUM (21–35)
    else if (cycle <= 35) {
      setScrolledName(initialMembers[Math.floor(Math.random() * initialMembers.length)]);
      setTimeout(runAnimation, 90); // medium
    }
    // Phase 3: SLOW (36–45)
    else if (cycle <= 45) {
      setScrolledName(allExceptFinal[Math.floor(Math.random() * allExceptFinal.length)]);
      setTimeout(runAnimation, 150); // slow
    }
    // Phase 4: Sudden Stop → Final result
    else {
      setScrolledName(finalPartner);
      setIsDrawing(false);

      // Save pair
      handleAssignPartner(selectedMember, finalPartner);
    }
  };

  // Start animation
  runAnimation();
};

  const handleDraw = () => {
    if (isLoading) {
      setMessage('🔴 Please wait, loading assignments from sheet...');
      return;
    }

    if (!selectedMember) {
      setMessage('🔴 Please select a member first.');
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
            <p style={{ marginTop: '20px' }}>
              Loading current assignments from sheet...
            </p>
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
                  {initialMembers.map((member) => (
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
                  {isDrawing ? 'Drawing...' : 'Find Your Buddy'}
                </button>
              </div>

              <div className="draw-result-container">
                <p className="status-message">{message}</p>
                <div className="draw-box">{scrolledName || '—'}</div>
              </div>
            </>
          )}
        </div>

{/*         <div className="sidebar"> */}
{/*           <div className="current-pairs"> */}
{/*             <h3>Buddies Found:</h3> */}
{/*             <div className="assignment-list-container"> */}
{/*               {isLoading ? ( */}
{/*                 <p>Loading...</p> */}
{/*               ) : ( */}
{/*                 <ul> */}
{/*                   {Object.entries(assignedPairs).map(([selector, partner]) => ( */}
{/*                     <li key={selector}> */}
{/*                       <strong>{selector}</strong> */}
{/*                       <span> ➡️ </span> */}
{/*                       <strong>{partner}</strong> */}
{/*                     </li> */}
{/*                   ))} */}
{/*                 </ul> */}
{/*               )} */}
{/*             </div> */}
{/*           </div> */}
{/*         </div> */}
      </div>
    </div>
  );
};

export default App;
