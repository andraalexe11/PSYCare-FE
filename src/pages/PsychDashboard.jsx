import React, { useState } from 'react';
import { getUnassignedPatients, assignPatient, getBookedSessions, bookSession, getAssignedPatients, getSharedJournalEntries} from '../services/api'; 
import '../App.css';
import '../components/Header'
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { useBreakReminder } from '../hooks/useBreakReminder';
import BreakReminderModal from '../components/BreakReminderModal';


const PsychDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [errorSessions, setErrorSessions] = useState(null);
  const [activePanel, setActivePanel] = useState(null); 
  const [selectedPatients, setSelectedPatients] = useState(null);
  const [loadingSelectedPatients, setLoadingSelectedPatients] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const { showBreak, countdown } = useBreakReminder(3); 
  const [bookingData, setBookingData] = useState({
    id: '',
    date: '',         
    time: '10:00',      
    duration: 60,
    notes: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [journalLoading, setJournalLoading] = useState(false);
  const [journalError, setJournalError] = useState(null);
  const [patientEntries, setPatientEntries] = useState({}); 
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const navigate = useNavigate();
  const [expandedEntries, setExpandedEntries] = useState({}); 
  
  const toggleEntry = (entryId) => {
    setExpandedEntries(prev => ({
      ...prev,
      [entryId]: !prev[entryId] 
    }));
  };

  const showJournalPanel = () => {
    setShowBookingModal(false);
    setActivePanel('journal');
  };

  const showPatientsPanel = () => {
    setShowBookingModal(false);
    setActivePanel('patients');
  };

  const showSelectedPatientsPanel = () => {
    setShowBookingModal(false);
    setActivePanel('selected-patients');
  };
  
  const showSessionsPanel = () => {
    setShowBookingModal(false);
    setActivePanel('sessions');
  };
  
  const closePanel = () => {
    setActivePanel(null);
  };

  const handleOpenBooking = () => {
    setShowBookingModal(true);
    setActivePanel(null);
    setBookingError(null);
  };
  
  const handleCloseBooking = () => {
    setShowBookingModal(false);
    setBookingData({
      id: '',
      date: '',
      time: '10:00',
      duration: 60,
      notes: ''
    });
    setBookingError(null);
  };
  
  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) : value
    }));
  };

  const calculateEndTime = (dateStr, timeStr, durationMinutes) => {
    const startDate = new Date(`${dateStr}T${timeStr}:00`);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    
    const year = endDate.getFullYear();
    const month = String(endDate.getMonth() + 1).padStart(2, '0');
    const day = String(endDate.getDate()).padStart(2, '0');
    const hours = String(endDate.getHours()).padStart(2, '0');
    const minutes = String(endDate.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:00`;
  };
  
  const checkTokenValidity = (token) => {
      if (!token) {
        return false;
      }
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 >= Date.now();
  };


  const handleBookSession = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingError(null);

    try {
      const token = localStorage.getItem('token');
      if (!checkTokenValidity(token)) {
        navigate('/login');
        return;
      }

      if (!bookingData.id || !bookingData.date || !bookingData.time) {
        throw new Error('Please fill required fields (Patient ID, Date, Time)');
      }

      const startTime = `${bookingData.date} ${bookingData.time}:00`;
      const endTime = calculateEndTime(bookingData.date, bookingData.time, bookingData.duration);

      const appointmentData = {
        startTime: startTime,  
        endTime: endTime,     
        id: bookingData.id
      };

      console.log('Sending appointment data:', appointmentData);

      const result = await bookSession(appointmentData, token);
      
      if (result.success) {
        alert(`✅ ${result.message}`);
        handleCloseBooking(); 
      } else {
        setBookingError(result.message);
      }
    } catch (error) {
      setBookingError(error.message);
      console.error('Booking error:', error);
    } finally {
      setBookingLoading(false);
    }
  };


  const handleFindPatients = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
       if (!checkTokenValidity(token)) {
        navigate('/login');
        return;
      }
      const data = await getUnassignedPatients(token);
      setPatients(data);
      showPatientsPanel(); 
    } catch (err) {
      setError(err.message);
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAllPatientEntries = async () => {
    const token = localStorage.getItem('token');
    if (!checkTokenValidity(token)) {
        navigate('/login');
        return;
      }
    try {
      const allEntries = await getSharedJournalEntries(token);
      
      const entriesByPatient = {};
      allEntries.forEach(entry => {
        if (!entriesByPatient[entry.patientId]) {
          entriesByPatient[entry.patientId] = [];
        }
        entriesByPatient[entry.patientId].push(entry);
      });
      
      setPatientEntries(entriesByPatient);
    } catch (err) {
      console.error('Error loading journal entries:', err);
    }
  };

  const handleGetJournalEntries = async (patientId) => {
    setJournalLoading(true);
    setJournalError(null);
    try {
      setSelectedPatientId(patientId);
      showJournalPanel(); 
    } catch (err) {
      setJournalError(err.message);
    } finally {
      setJournalLoading(false);
    }
  };

  const handleFindSelectedPatients = async () => {
    setLoadingSelectedPatients(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!checkTokenValidity(token)) {
        navigate('/login');
        return;
      }
      const data = await getAssignedPatients(token);
      setSelectedPatients(data);
      
      await loadAllPatientEntries(data);
      
      showSelectedPatientsPanel(); 
    } catch (err) {
      setError(err.message);
      console.error('Error fetching selected patients:', err);
    } finally {
      setLoadingSelectedPatients(false);
    }
  };

  const handleGetSessions = async () => {
    setLoadingSessions(true);
    setErrorSessions(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!checkTokenValidity(token)) {
        navigate('/login');
        return;
      }
      const data = await getBookedSessions(token);
      setSessions(data);
      console.log('Fetched sessions:', data);
      showSessionsPanel(); 
    } catch (err) {
      setErrorSessions(err.message);
      console.error('Error fetching sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  };


const handleAssignPatient = async (patientId, patientName) => {
  if (!window.confirm(`Assign ${patientName || 'this patient'} to you?`)) {
    return;
  }

  const token = localStorage.getItem('token');
  if (!checkTokenValidity(token)) {
        navigate('/login');
        return;
      }
  
  setPatients(prev => prev.map(p => 
    p.id === patientId ? { ...p, isAssigning: true } : p
  ));

  try {
    const result = await assignPatient(patientId, token);
    
    if (result.success) {
      setPatients(prev => prev.filter(p => p.id !== patientId));
      
      alert(`✅ ${result.message}`);
      
      setTimeout(() => {
        handleFindPatients(); 
      }, 1000);
    } else {
      alert(`❌ ${result.message}`);
    }
  } catch (error) {
    console.error('Assignment error:', error);
    alert('Error assigning patient');
  } finally {
    setPatients(prev => prev.map(p => 
      p.id === patientId ? { ...p, isAssigning: false } : p
    ));
  }
};

  return (
    <div>
      <Header />
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h2> Psychologist Dashboard</h2>
          <p>Manage your patients and activities</p>
        </header>

        <div className="dashboard-main">
          <div className="dashboard-actions">
            <div className="action-card">
              <h3>My Patients</h3>
              <p>Browse patients who have been assigned to you.</p>
              
              <button 
                className="dashboard-btn glass-btn"
                onClick={handleFindSelectedPatients}
                disabled={loadingSelectedPatients}
              >
                {loadingSelectedPatients ? 'Loading...' : 'Find My Patients'}
              </button>
              
              {error && (
                <div className="error-message">
                  Error: {error}
                </div>
              )}
            </div>
            <div className="action-card">
              <h3>Looking for a new patient?</h3>
              <p>Browse patients who haven't been assigned to a psychologist yet.</p>
              
              <button 
                className="dashboard-btn glass-btn"
                onClick={handleFindPatients}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Find Unassigned Patients'}
              </button>
              
              {error && (
                <div className="error-message">
                  Error: {error}
                </div>
              )}
            </div>

            <div className="action-card">
              <h3>My Upcoming Sessions</h3>
              <p>View and manage your sessions.</p>
              <button 
                className="dashboard-btn glass-btn"
                onClick={handleGetSessions}
                disabled={loadingSessions}
              >
                {loadingSessions ? 'Loading...' : 'View My Sessions'}
              </button>
              {errorSessions && (
                <div className="error-message">
                  Error: {errorSessions}
                </div>
              )}
            </div>

            <div className="action-card">
              <h3>Book a New Session</h3>
              <p>Book your next appointment.</p>
              <button 
                className="dashboard-btn glass-btn"
                onClick={handleOpenBooking}
                disabled={bookingLoading}
              >
                Book Session
              </button>
            </div>
          </div>

          {activePanel === 'selected-patients' && (
            <div className="patients-panel">
              <div className="patients-header">
                <h3>My Patients ({selectedPatients.length})</h3>
                <button 
                  className="close-btn"
                  onClick={() => closePanel()}
                >
                  ✕
                </button>
              </div>
              
              <div className="patients-list">
                {selectedPatients.length === 0 ? (
                  <div className="empty-state">
                    <p>No assigned patients found.</p>
                  </div>
                ) : 
                  (selectedPatients.map((patient) => {
                      const hasEntries = patientEntries[patient.id] && patientEntries[patient.id].length > 0;
                      
                      return (
                        <div key={patient.id} className="patient-card">
                          <div className="patient-info">
                            <h4>{patient.firstName} {patient.lastName}</h4>
                            <div className="patient-details">
                              {patient.age && <span>Age: {patient.age}</span>}
                              {patient.id && <span>Patient ID: {patient.id}</span>}
                            </div>
                          </div>
                          <div className="patient-actions">
                            {hasEntries && (
                              <button 
                                className="glass-btn view-journal-btn"
                                onClick={() => handleGetJournalEntries(patient.id)}
                              >
                                View Journal Entries
                              </button>
                            )}
                            {!hasEntries && patientEntries[patient.id] !== undefined && (
                              <span className="no-entries">No journal entries</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
              </div>
            </div>
          )}

          
          {activePanel === 'journal' && selectedPatientId && (
            <div className="patients-panel"> 
              <div className="patients-header">
                <h3>
                  Journal Entries for Patient
                  {selectedPatients?.find(p => p.id === selectedPatientId) && 
                    ` ${selectedPatients.find(p => p.id === selectedPatientId).firstName} 
                    ${selectedPatients.find(p => p.id === selectedPatientId).lastName}`
                  }
                </h3>
                <button 
                  className="close-btn"
                  onClick={closePanel}
                >
                  ✕
                </button>
              </div>
              
              <div className="patients-list journal-entries-list">
                {journalLoading ? (
                  <div className="empty-state">
                    <p>Loading journal entries...</p>
                  </div>
                ) : journalError ? (
                  <div className="error-message">
                    Error: {journalError}
                  </div>
                ) : patientEntries[selectedPatientId]?.length > 0 ? (
                  patientEntries[selectedPatientId].map((entry) =>{
                    const isExpanded = expandedEntries[entry.id] || false;
                    
                    return(
                    <div key={entry.id} className="patient-card journal-card" onClick={() => toggleEntry(entry.id)}>
                      <div className="patient-header journal-header">
                        <h3>{entry.title || 'Untitled Entry'}</h3>
                        <span className="entry-date">
                          {entry.date ? new Date(entry.date).toLocaleDateString() : 'No date'}
                        </span>
                        {entry.tags && (
                          <div className="entry-tags">
                            {entry.tags.split(',').map((tag, index) => (
                              <span key={index} className="tag">#{tag.trim()}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="journal-entry-content" style={{
                        maxHeight: isExpanded ? 'none' : '80px',
                        overflow: isExpanded ? 'visible' : 'hidden'
                      }}>
                        <p>{entry.text || 'No content'}</p>
                      </div>
                    </div>
                    );
                  })  
                ) : (
                  <div className="empty-state">
                    <p>No journal entries found for this patient.</p>
                  </div>
                )}
              </div>
            </div>
          )}


          {activePanel === 'patients' && (
            <div className="patients-panel">
              <div className="patients-header">
                <h3>Available Patients ({patients.length})</h3>
                <button 
                  className="close-btn"
                  onClick={() => closePanel()}
                >
                  ✕
                </button>
              </div>
              
              <div className="patients-list">
                {patients.length === 0 ? (
                  <div className="empty-state">
                    <p>No unassigned patients found.</p>
                  </div>
                ) : (
                  patients.map((patient) => (
                    <div key={patient.id} className="patient-card">
                      <div className="patient-info">
                        <h4>{patient.firstName} {patient.lastName}</h4>
                        <div className="patient-details">
                          {patient.age && <span>Age: {patient.age}</span>}
                        </div>
                      </div>
                      <div className="patient-actions">
                        <button 
                          className=" glass-btn assign-btn"
                          onClick={() => handleAssignPatient(patient.id)}
                        >
                          Assign to Me
                        </button>
                        {/* <button className=" glass-btn view-btn">
                          View Profile
                        </button> */}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activePanel === 'sessions' && (
            <div className="patients-panel"> 
              <div className="patients-header">
                <h3>My Booked Sessions ({sessions.length})</h3>
                <button 
                  className="close-btn"
                  onClick={closePanel}
                >
                  ✕
                </button>
              </div>
              
              <div className="patients-list">
                {sessions.length === 0 ? (
                  <div className="empty-state">
                    <p>No booked sessions found.</p>
                  </div>
                ) : (
                  sessions.map((session) => (
                    <div key={session.id} className="patient-card session-card">
                      <div className="patient-info">
                        <h4>Session with {session.patientFirstName} {session.patientLastName}</h4>
                        <div className="patient-details">
                          <span>Date: {session.startTime.split(' ')[0]}</span>
                          <span>Time: {session.startTime.split(' ')[1]}</span>
                        </div>
                      </div>
                      {/* <div className="patient-actions">
                        <button className="glass-btn view-btn">
                          View Details
                        </button>
                        <button className="glass-btn cancel-btn">
                          Cancel
                        </button>
                      </div> */}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {showBookingModal && (
            <div className="patients-panel"> 
              <div className="patients-header">
                  <h3> Book New Session</h3>
                  <button 
                    className="close-btn"
                    onClick={handleCloseBooking}
                    disabled={bookingLoading}
                  >
                    ✕
                  </button>
                </div>
                
                <form onSubmit={handleBookSession} className="booking-form">
                  {bookingError && (
                    <div className="booking-error">
                      ❌ {bookingError}
                    </div>
                  )}
                  
                  <div className="form-group">
                    <label>Patient ID *</label>
                    <input
                      type="text"
                      name="patientId"
                      value={bookingData.patientId}
                      onChange={handleBookingChange}
                      required
                      disabled={bookingLoading}
                      placeholder="Enter patient ID"
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Date *</label>
                      <input
                        type="date"
                        name="date"
                        value={bookingData.date}
                        onChange={handleBookingChange}
                        required
                        disabled={bookingLoading}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Time *</label>
                      <input
                        type="time"
                        name="time"
                        value={bookingData.time}
                        onChange={handleBookingChange}
                        required
                        disabled={bookingLoading}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Duration *</label>
                    <select
                      name="duration"
                      value={bookingData.duration}
                      onChange={handleBookingChange}
                      disabled={bookingLoading}
                      required
                    >
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="90">90 minutes</option>
                      <option value="120">120 minutes</option>
                    </select>
                  </div>
                  <div className="modal-actions">
                    <button 
                      type="button" 
                      className=" glass-btn cancel-btn"
                      onClick={handleCloseBooking}
                      disabled={bookingLoading}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="glass-btn submit-btn"
                      disabled={bookingLoading}
                    >
                      {bookingLoading ? 'Booking...' : 'Book Session'}
                    </button>
                  </div>
                </form>
              </div>
          )}
          {showBreak && <BreakReminderModal countdown={countdown} />}
        </div>
      </div>
    </div>
  );
};

export default PsychDashboard;