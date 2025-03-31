import React, { useState } from 'react';

interface WatermarkFormProps {
  onSubmit: (watermarkData: WatermarkData) => void;
  isProcessing: boolean;
}

export interface WatermarkData {
  text: string;
  strength: number;
}

// PUBLIC_INTERFACE
const WatermarkForm: React.FC<WatermarkFormProps> = ({ onSubmit, isProcessing }) => {
  const [formData, setFormData] = useState<WatermarkData>({
    text: '',
    strength: 50
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'strength' ? Number(value) : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="watermark-form">
      <div className="form-group">
        <label htmlFor="watermarkText">Watermark Text:</label>
        <input
          type="text"
          id="watermarkText"
          name="text"
          value={formData.text}
          onChange={handleChange}
          placeholder="Enter watermark text"
          required
          disabled={isProcessing}
        />
      </div>
      <div className="form-group">
        <label htmlFor="watermarkStrength">Watermark Strength: {formData.strength}%</label>
        <input
          type="range"
          id="watermarkStrength"
          name="strength"
          min="1"
          max="100"
          value={formData.strength}
          onChange={handleChange}
          disabled={isProcessing}
        />
      </div>
      <button type="submit" disabled={isProcessing || !formData.text.trim()}>
        {isProcessing ? 'Processing...' : 'Embed Watermark'}
      </button>
    </form>
  );
};

export default WatermarkForm;
