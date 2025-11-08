// src/components/WellnessDNAAnalyzer.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/WellnessDNAAnalyzer.css';

const WellnessDNAAnalyzer = () => {
  const [activeStrand, setActiveStrand] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const canvasRef = useRef(null);

  const handleStrandInteraction = (strand) => {
    setActiveStrand(strand);
    setAnalysisProgress(prev => Math.min(prev + 20, 100));
    
    // Simulate analysis
    setTimeout(() => {
      if (analysisProgress >= 80 && !showResults) {
        setShowResults(true);
        generateUserProfile();
      }
    }, 1000);
  };

  const generateUserProfile = () => {
    const profile = {
      mental: Math.random() * 100,
      emotional: Math.random() * 100,
      physical: Math.random() * 100,
      spiritual: Math.random() * 100,
      nutritional: Math.random() * 100,
      primaryNeed: wellnessStrands[Math.floor(Math.random() * wellnessStrands.length)].name,
      recommendedPlan: 'Personalized Wellness Journey'
    };
    setUserProfile(profile);
  };

  return (
    <div className="dna-analyzer-container">
      {/* Interactive DNA Strands */}
      <div className="dna-strands-container">
        {wellnessStrands.map((strand, index) => (
          <motion.div
            key={strand.id}
            className={`dna-strand ${activeStrand?.id === strand.id ? 'active' : ''}`}
            style={{ '--strand-color': strand.color }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.2 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleStrandInteraction(strand)}
          >
            <div className="strand-visual">
              <div className="strand-line"></div>
              <div className="strand-node"></div>
              <div className="strand-glow"></div>
            </div>
            <div className="strand-info">
              <h4>{strand.name}</h4>
              <p>{strand.aspect}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Analysis Progress */}
      <motion.div 
        className="analysis-progress"
        initial={{ width: 0 }}
        animate={{ width: `${analysisProgress}%` }}
      >
        <span>Decoding Your Wellness DNA... {analysisProgress}%</span>
      </motion.div>

      {/* Results Modal */}
      <AnimatePresence>
        {showResults && userProfile && (
          <motion.div
            className="results-modal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="modal-content">
              <h2>Your Wellness DNA Blueprint</h2>
              
              <div className="profile-stats">
                {wellnessStrands.map((strand, index) => (
                  <div key={strand.id} className="stat-item">
                    <div className="stat-header">
                      <span className="stat-name">{strand.name}</span>
                      <span className="stat-value">{Math.round(userProfile[strand.name.toLowerCase().split(' ')[0]])}%</span>
                    </div>
                    <div className="stat-bar">
                      <motion.div 
                        className="stat-fill"
                        style={{ backgroundColor: strand.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${userProfile[strand.name.toLowerCase().split(' ')[0]]}%` }}
                        transition={{ delay: index * 0.1 + 0.5 }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="key-insights">
                <h3>Key Insights</h3>
                <p>Your primary wellness focus should be on <strong>{userProfile.primaryNeed}</strong></p>
                <p>We recommend starting with our <strong>{userProfile.recommendedPlan}</strong></p>
              </div>

              <div className="modal-actions">
                <button className="btn-primary" onClick={() => window.location.href = '/membership'}>
                  Start Your Personalized Journey
                </button>
                <button className="btn-secondary" onClick={() => setShowResults(false)}>
                  Explore More
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WellnessDNAAnalyzer;