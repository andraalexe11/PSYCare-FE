import React, { useEffect, useState, useCallback } from "react";
import {
  getMyJournals,
  createJournal,
  updateJournal,
  deleteJournal,
  shareJournal,
  submitMood,
  getTodayMood,
} from "../services/api";
import Header from "../components/Header";

const PatientDashboard = () => {
  const [journals, setJournals] = useState([]);
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [mood, setMood] = useState(5);
  const [todayMood, setTodayMood] = useState(null);
  const [moodChecked, setMoodChecked] = useState(false);

  const token = localStorage.getItem("token");

  const loadJournals = useCallback(async () => {
    const data = await getMyJournals(token);
    setJournals(Array.isArray(data) ? data : []);
  }, [token]);

  useEffect(() => {
    loadJournals();
  }, [loadJournals]);

  useEffect(() => {
    const loadTodayMood = async () => {
      try {
        const data = await getTodayMood(token);
        if (data) {
          setTodayMood(data);
          setMoodChecked(true);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadTodayMood();
  }, [token]);

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
    try {
      const res = await shareJournal(id, token);
      alert(res.message);
      loadJournals();
    } catch {
      alert("Failed to share journal");
    }
  };

  const handleMoodSubmit = async () => {
    try {
      await submitMood({ value: mood }, token);
      alert("Mood submitted");

      // Lock the UI immediately
      setTodayMood({ value: mood });
      setMoodChecked(true);
    } catch (err) {
      alert("You already submitted your mood today.");
    }
  };

  return (
    <div>
      <Header />
      <div className="dashboard-container">
        <h2>Patient Dashboard</h2>

        {/* Mood Check-in */}
        <div className="card">
          <h3>Daily Mood Check</h3>

          {moodChecked ? (
            <p>
              You’ve already checked in today 😊
              <br />
              <strong>Your mood:</strong> {todayMood?.value}
            </p>
          ) : (
            <>
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
            </>
          )}
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
