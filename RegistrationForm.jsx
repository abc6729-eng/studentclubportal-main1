import React, { useEffect, useMemo, useState } from 'react';

const API_URL = 'http://localhost:3000/api/members';

const initialFormData = {
  memberName: '',
  email: '',
  yearLevel: '',
  organization: '',
  phone: '',
  studentId: '',
  major: '',
  clubRole: 'Member',
  interests: '',
  availability: ''
};

const validateEmail = (value) => {
  return /^\S+@\S+\.\S+$/.test(value);
};

const RegistrationForm = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [members, setMembers] = useState([]);
  const [message, setMessage] = useState(null);
  const [editIndex, setEditIndex] = useState(-1);

  useEffect(() => {
    const stored = localStorage.getItem('studentClubMembers');
    if (stored) {
      try {
        setMembers(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse stored members', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('studentClubMembers', JSON.stringify(members));
  }, [members]);

  const jsonPreview = useMemo(() => JSON.stringify(members, null, 2), [members]);

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.memberName.trim()) {
      nextErrors.memberName = 'Member name is required.';
    }

    if (!validateEmail(formData.email.trim())) {
      nextErrors.email = 'A valid email address is required.';
    }

    if (!formData.yearLevel.trim()) {
      nextErrors.yearLevel = 'Year / grade level is required.';
    }

    if (!formData.organization.trim()) {
      nextErrors.organization = 'Institution / organization is required.';
    }

    if (formData.phone.trim() && !/^\+?[0-9\-() ]{7,20}$/.test(formData.phone.trim())) {
      nextErrors.phone = 'Please enter a valid phone number or leave blank.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const showTemporaryMessage = (type, text) => {
    setMessage({ type, text });
    window.setTimeout(() => {
      setMessage(null);
    }, 4000);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      showTemporaryMessage('danger', 'Please fix the errors in the form and try again.');
      return;
    }

    const payload = {
      ...formData,
      submittedAt: new Date().toISOString()
    };

    const nextMembers = editIndex >= 0
      ? members.map((member, index) => (index === editIndex ? payload : member))
      : [...members, payload];

    setMembers(nextMembers);
    setEditIndex(-1);
    setFormData(initialFormData);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Server rejected the registration request.');
      }

      showTemporaryMessage('success', 'Member saved and sent to server successfully.');
    } catch (error) {
      console.error('AJAX POST failed:', error);
      showTemporaryMessage('danger', `Saved locally, but server POST failed: ${error.message}`);
    }
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setFormData(members[index]);
    setErrors({});
    setMessage({ type: 'info', text: 'Loaded member for editing.' });
  };

  const handleDelete = (index) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      const updated = members.filter((_, i) => i !== index);
      setMembers(updated);
      if (editIndex === index) {
        setEditIndex(-1);
        setFormData(initialFormData);
      }
      showTemporaryMessage('warning', 'Member removed.');
    }
  };

  const handleClear = () => {
    setFormData(initialFormData);
    setErrors({});
    setEditIndex(-1);
    setMessage(null);
  };

  return (
    <div className="container my-5">
      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h1 className="h4 mb-0">Register / Update Member</h1>
            </div>
            <div className="card-body">
              {message && (
                <div className={`alert alert-${message.type}`} role="alert">
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label htmlFor="memberName" className="form-label">Member Name *</label>
                  <input
                    id="memberName"
                    name="memberName"
                    type="text"
                    className={`form-control ${errors.memberName ? 'is-invalid' : ''}`}
                    value={formData.memberName}
                    onChange={handleChange}
                  />
                  <div className="invalid-feedback">{errors.memberName || 'Please enter the member name.'}</div>
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email Address *</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    value={formData.email}
                    onChange={handleChange}
                  />
                  <div className="invalid-feedback">{errors.email || 'Please enter a valid email address.'}</div>
                </div>

                <div className="mb-3">
                  <label htmlFor="yearLevel" className="form-label">Year / Grade Level *</label>
                  <input
                    id="yearLevel"
                    name="yearLevel"
                    type="text"
                    className={`form-control ${errors.yearLevel ? 'is-invalid' : ''}`}
                    value={formData.yearLevel}
                    onChange={handleChange}
                    placeholder="Freshman, Sophomore, Senior..."
                  />
                  <div className="invalid-feedback">{errors.yearLevel || 'Please enter year or grade level.'}</div>
                </div>

                <div className="mb-3">
                  <label htmlFor="organization" className="form-label">Institution / Organization *</label>
                  <input
                    id="organization"
                    name="organization"
                    type="text"
                    className={`form-control ${errors.organization ? 'is-invalid' : ''}`}
                    value={formData.organization}
                    onChange={handleChange}
                  />
                  <div className="invalid-feedback">{errors.organization || 'Please enter institution or organization.'}</div>
                </div>

                <div className="mb-3">
                  <label htmlFor="studentId" className="form-label">Student ID</label>
                  <input
                    id="studentId"
                    name="studentId"
                    type="text"
                    className="form-control"
                    value={formData.studentId}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="major" className="form-label">Major / Focus Area</label>
                  <input
                    id="major"
                    name="major"
                    type="text"
                    className="form-control"
                    value={formData.major}
                    onChange={handleChange}
                    placeholder="e.g. Computer Science, Design"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="clubRole" className="form-label">Club Role</label>
                  <select
                    id="clubRole"
                    name="clubRole"
                    className="form-select"
                    value={formData.clubRole}
                    onChange={handleChange}
                  >
                    <option>Member</option>
                    <option>Officer</option>
                    <option>Volunteer</option>
                    <option>Coach</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">Contact Number</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                  <div className="invalid-feedback">{errors.phone || 'Enter a valid phone number or leave blank.'}</div>
                </div>

                <div className="mb-3">
                  <label htmlFor="interests" className="form-label">Gaming / Club Interests</label>
                  <textarea
                    id="interests"
                    name="interests"
                    rows="2"
                    className="form-control"
                    value={formData.interests}
                    onChange={handleChange}
                    placeholder="League of Legends, Rocket League, events, coaching..."
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="availability" className="form-label">Availability</label>
                  <input
                    id="availability"
                    name="availability"
                    type="text"
                    className="form-control"
                    value={formData.availability}
                    onChange={handleChange}
                    placeholder="Tuesdays, evenings, weekends..."
                  />
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary">{editIndex >= 0 ? 'Update Member' : 'Save Member'}</button>
                  <button type="button" className="btn btn-secondary" onClick={handleClear}>Clear Form</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-dark text-white">
              <h2 className="h5 mb-0">Member Directory</h2>
            </div>
            <div className="card-body table-responsive">
              <table className="table table-striped table-hover align-middle">
                <thead className="table-primary">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Year</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4">No members registered yet.</td>
                    </tr>
                  ) : (
                    members.map((member, index) => (
                      <tr key={index}>
                        <td>{member.memberName}</td>
                        <td>{member.email}</td>
                        <td>{member.yearLevel}</td>
                        <td>{member.clubRole}</td>
                        <td>{member.phone || '-'}</td>
                        <td>
                          <button className="btn btn-sm btn-warning me-1" onClick={() => handleEdit(index)}>Edit</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(index)}>Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-header bg-success text-white">
              <h2 className="h5 mb-0">JSON Data Preview</h2>
            </div>
            <div className="card-body">
              <pre className="json-box bg-light p-3 rounded">{jsonPreview}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
