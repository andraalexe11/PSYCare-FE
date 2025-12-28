import React, { useState } from 'react';
import { getUnassignedPatients, assignPatient, getBookedSessions, bookSession} from '../services/api'; 
import '../App.css';

const PsychDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [errorSessions, setErrorSessions] = useState(null);
  const [activePanel, setActivePanel] = useState(null); 
  
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    id: '',
    date: '',         
    time: '10:00',      
    duration: 60,
    notes: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  const showPatientsPanel = () => {
    setShowBookingModal(false);
    setActivePanel('patients');
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

  const handleBookSession = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

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

  const handleGetSessions = async () => {
    setLoadingSessions(true);
    setErrorSessions(null);
    
    try {
      const token = localStorage.getItem('token');
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
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2> Psychologist Dashboard</h2>
        <p>Manage your patients and activities</p>
      </header>

      <div className="dashboard-main">
        <div className="dashboard-actions">
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
                      <h4>{patient.username || `Patient #${patient.id}`}</h4>
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
      </div>
    </div>
  );
};

export default PsychDashboard;