import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Wifi, 
  Tv, 
  CreditCard, 
  Cpu, 
  Building2, 
  HelpCircle,
  MapPin,
  User,
  Mail,
  Phone,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Flame
} from 'lucide-react';

const CATEGORIES = [
  { id: 'Wi-Fi & Network', label: 'Wi-Fi & Network', icon: Wifi, desc: 'Signal loss, router AP failure, portal login' },
  { id: 'Classroom Equipment', label: 'Classroom Equipment', icon: Tv, desc: 'Projectors, audio systems, smartboards, HDMI' },
  { id: 'ID Card & Access', label: 'ID Card & Access', icon: CreditCard, desc: 'RFID entry gates, turnstiles, library cards' },
  { id: 'Lab Software & PC', label: 'Lab Software & PC', icon: Cpu, desc: 'MATLAB licenses, lab PCs, OS boot issues' },
  { id: 'Hostel & Facility', label: 'Hostel & Facility', icon: Building2, desc: 'HVAC cooling, water dispensers, lighting, elevators' },
  { id: 'Other', label: 'Other', icon: HelpCircle, desc: 'General campus maintenance & requests' },
];

const QUICK_LOCATIONS = [
  'Science Block - Rm 204',
  'Lecture Hall 301',
  'Central Library - 2nd Floor',
  'Hostel Block B - East Gate',
  'CAD Computer Lab 2',
  'Student Dining Hall',
];

export const RequestModal = ({ isOpen, onClose, onSubmitSuccess }) => {
  const modalRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Wi-Fi & Network',
    priority: 'Medium',
    location: '',
    description: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        category: 'Wi-Fi & Network',
        priority: 'Medium',
        location: '',
        description: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
      });
      setTouched({});
      setErrors({});
      setServerError('');
    }
  }, [isOpen]);

  const validate = (data) => {
    const newErrors = {};
    if (!data.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (data.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
    }

    if (!data.category) {
      newErrors.category = 'Please choose a category';
    }

    if (!data.location.trim()) {
      newErrors.location = 'Campus location is required';
    }

    if (!data.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (data.description.trim().length < 10) {
      newErrors.description = 'Please provide at least 10 characters describing the issue';
    }

    if (!data.contactName.trim()) {
      newErrors.contactName = 'Your name is required';
    }

    if (data.contactEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail.trim())) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }

    return newErrors;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate(formData));
  };

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    if (touched[field]) {
      setErrors(validate(updated));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = {
      title: true,
      category: true,
      priority: true,
      location: true,
      description: true,
      contactName: true,
      contactEmail: true,
      contactPhone: true,
    };
    setTouched(allTouched);

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setServerError('');

    try {
      await onSubmitSuccess(formData);
      onClose();
    } catch (err) {
      setServerError(err.message || 'An error occurred while submitting the request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal-backdrop" 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-card" ref={modalRef}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <span className="modal-overline">CAMPUS SUPPORT DESK</span>
            <h2 id="modal-title" className="modal-title">Submit New Incident Report</h2>
          </div>
          <button 
            type="button" 
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Server error alert if any */}
        {serverError && (
          <div className="alert-box alert-error" role="alert">
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form" noValidate>
          {/* Category Selection Grid */}
          <div className="form-group">
            <label className="form-label">
              Category <span className="required-star">*</span>
            </label>
            <div className="category-picker-grid" role="radiogroup" aria-label="Select Category">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = formData.category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`category-tile ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => handleChange('category', cat.id)}
                  >
                    <div className="category-tile-icon">
                      <Icon size={18} />
                    </div>
                    <div className="category-tile-info">
                      <span className="category-tile-name">{cat.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            {touched.category && errors.category && (
              <p className="field-error-msg">{errors.category}</p>
            )}
          </div>

          {/* Title & Priority Row */}
          <div className="form-row two-col">
            <div className="form-group">
              <label htmlFor="req-title" className="form-label">
                Issue Title <span className="required-star">*</span>
              </label>
              <input
                id="req-title"
                type="text"
                className={`form-input ${touched.title && errors.title ? 'is-invalid' : ''}`}
                placeholder="e.g., Projector HDMI connection failing"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                onBlur={() => handleBlur('title')}
                maxLength={100}
                required
              />
              {touched.title && errors.title && (
                <p className="field-error-msg">{errors.title}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="req-priority" className="form-label">
                Urgency Level
              </label>
              <select
                id="req-priority"
                className="form-select"
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
              >
                <option value="Low">Low — Routine maintenance</option>
                <option value="Medium">Medium — Standard classroom/lab</option>
                <option value="High">High — Disrupting lecture or class</option>
                <option value="Urgent">Urgent — Campus-wide or safety issue</option>
              </select>
            </div>
          </div>

          {/* Location Field with Quick Suggestions */}
          <div className="form-group">
            <div className="label-with-hint">
              <label htmlFor="req-location" className="form-label">
                Campus Location <span className="required-star">*</span>
              </label>
              <span className="form-hint">Building, wing, room number</span>
            </div>
            <div className="input-with-icon">
              <MapPin size={17} className="input-prefix-icon" />
              <input
                id="req-location"
                type="text"
                className={`form-input has-icon ${touched.location && errors.location ? 'is-invalid' : ''}`}
                placeholder="e.g., Science Block - Room 204"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                onBlur={() => handleBlur('location')}
                required
              />
            </div>
            {/* Quick chips */}
            <div className="quick-suggestions-row">
              <span className="suggestions-label">Suggestions:</span>
              {QUICK_LOCATIONS.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  className="suggestion-chip"
                  onClick={() => handleChange('location', loc)}
                >
                  {loc}
                </button>
              ))}
            </div>
            {touched.location && errors.location && (
              <p className="field-error-msg">{errors.location}</p>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="req-description" className="form-label">
              Detailed Description <span className="required-star">*</span>
            </label>
            <textarea
              id="req-description"
              className={`form-textarea ${touched.description && errors.description ? 'is-invalid' : ''}`}
              rows={3}
              placeholder="Provide specific details about the issue, equipment labels, error codes, and symptoms..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              onBlur={() => handleBlur('description')}
              required
            />
            <div className="textarea-footer">
              <span className="form-hint">Minimum 10 characters</span>
              <span className="char-count">{formData.description.length} chars</span>
            </div>
            {touched.description && errors.description && (
              <p className="field-error-msg">{errors.description}</p>
            )}
          </div>

          {/* Reporter Details: Name, Email, Phone */}
          <div className="reporter-details-box">
            <span className="sub-section-title">Contact & Reporter Information</span>
            <div className="form-row three-col">
              <div className="form-group">
                <label htmlFor="req-contact-name" className="form-label">
                  Your Full Name <span className="required-star">*</span>
                </label>
                <div className="input-with-icon">
                  <User size={16} className="input-prefix-icon" />
                  <input
                    id="req-contact-name"
                    type="text"
                    className={`form-input has-icon ${touched.contactName && errors.contactName ? 'is-invalid' : ''}`}
                    placeholder="e.g., Aarav Sharma"
                    value={formData.contactName}
                    onChange={(e) => handleChange('contactName', e.target.value)}
                    onBlur={() => handleBlur('contactName')}
                    required
                  />
                </div>
                {touched.contactName && errors.contactName && (
                  <p className="field-error-msg">{errors.contactName}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="req-contact-email" className="form-label">
                  Campus Email
                </label>
                <div className="input-with-icon">
                  <Mail size={16} className="input-prefix-icon" />
                  <input
                    id="req-contact-email"
                    type="email"
                    className={`form-input has-icon ${touched.contactEmail && errors.contactEmail ? 'is-invalid' : ''}`}
                    placeholder="student@campus.edu"
                    value={formData.contactEmail}
                    onChange={(e) => handleChange('contactEmail', e.target.value)}
                    onBlur={() => handleBlur('contactEmail')}
                  />
                </div>
                {touched.contactEmail && errors.contactEmail && (
                  <p className="field-error-msg">{errors.contactEmail}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="req-contact-phone" className="form-label">
                  Mobile / Phone
                </label>
                <div className="input-with-icon">
                  <Phone size={16} className="input-prefix-icon" />
                  <input
                    id="req-contact-phone"
                    type="tel"
                    className="form-input has-icon"
                    placeholder="+91 98765 43210"
                    value={formData.contactPhone}
                    onChange={(e) => handleChange('contactPhone', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="modal-actions-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
              id="btn-submit-ticket"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="spin-icon" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Submit Support Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
