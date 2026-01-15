import React, { useEffect, useState, useCallback } from "react";
import {
  getMyJournals,
  createJournal,
  updateJournal,
  deleteJournal,
  shareJournal,
  submitMood,
} from "../services/api";
import Header from "../components/Header";

const PatientDashboard = () => {
  const [journals, setJournals] = useState([]);
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [mood, setMood] = useState(5);
  const token = localStorage.getItem("token");

  const loadJournals = useCallback(async () => {
    const data = await getMyJournals(token);
    setJournals(Array.isArray(data) ? data : []);
  }, [token]);

  useEffect(() => {
    loadJournals();
  }, [loadJournals]);

  const handleSave = async () => {
    if (editingId) {
      await updateJournal(editingId, { title, text }, token);
    } else {
      await createJournal({ title, text }, token);
    }
    setText("");
    setTitle("");
    setEditingId(null);
    loadJournals();
  };

  const handleEdit = (j) => {
    setEditingId(j.id);
    setTitle(j.title);
    setText(j.text);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete entry?")) {
      await deleteJournal(id, token);
      loadJournals();
    }
  };

  const handleShare = async (id) => {
    const psychologistId = prompt("Enter psychologist ID:");
    if (psychologistId) {
      await shareJournal(id, parseInt(psychologistId), token);
      alert("Shared successfully");
    }
  };

  const handleMoodSubmit = async () => {
    await submitMood({ mood }, token);
    alert("Mood submitted");
  };

  return (
    <div>
      <Header />
      <div className="dashboard-container">
        <h2>Patient Dashboard</h2>

        {/* Mood Check-in */}
        <div className="card">
          <h3>Daily Mood Check</h3>
          <input
            type="range"
            min="1"
            max="10"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
          />
          <span>Mood: {mood}</span>
          <button className="glass-btn" onClick={handleMoodSubmit}>
            Submit Mood
          </button>
        </div>

        {/* Journal Form */}
        <div className="card">
          <h3>{editingId ? "Edit Journal" : "New Journal Entry"}</h3>
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Write your thoughts..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className="glass-btn" onClick={handleSave}>
            {editingId ? "Update" : "Add"}
          </button>
        </div>

        {/* Journal List */}
        <div className="card">
          <h3>My Journal Entries</h3>
          {Array.isArray(journals) ? (
            journals.map((j) => (
              <div key={j.id} className="journal-item">
                <h4>{j.title}</h4>
                <p>{j.text}</p>
                <button onClick={() => handleEdit(j)}>Edit</button>
                <button onClick={() => handleDelete(j.id)}>Delete</button>
                <button onClick={() => handleShare(j.id)}>Share</button>
              </div>
            ))
          ) : (
            <p>No journal entries found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
