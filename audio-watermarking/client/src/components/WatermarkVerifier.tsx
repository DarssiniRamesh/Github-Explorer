import React, { useState } from 'react';
import axios from 'axios';

interface WatermarkVerifierProps {
  audioFile: File;
  onVerificationComplete: (result: VerificationResult) => void;
}

interface VerificationResult {
  success: boolean;
  watermark?: string;
  error?: string;
}

// PUBLIC_INTERFACE
const WatermarkVerifier: React.FC<WatermarkVerifierProps> = ({ 
  audioFile, 
  onVerificationComplete 
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string>('');

  const verifyWatermark = async () => {
    setIsVerifying(true);
    setVerificationStatus('Verifying watermark...');

    const formData = new FormData();
    formData.append('audio', audioFile);

    try {
      const response = await axios.post('/api/watermark/verify', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const result: VerificationResult = {
        success: true,
        watermark: response.data.watermark
      };

      setVerificationStatus('Verification complete');
      onVerificationComplete(result);
    } catch (error) {
      const errorResult: VerificationResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Verification failed'
      };
      setVerificationStatus('Verification failed');
      onVerificationComplete(errorResult);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="watermark-verifier">
      <h3>Watermark Verification</h3>
      <div className="verification-controls">
        <button 
          onClick={verifyWatermark} 
          disabled={isVerifying}
          className="verify-button"
        >
          {isVerifying ? 'Verifying...' : 'Verify Watermark'}
        </button>
        {verificationStatus && (
          <div className="verification-status">
            <p>{verificationStatus}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WatermarkVerifier;
