import React, { useState } from 'react';
import './courseCard.css';

const StarRating = ({ initialRating = 0, onRatingChange, ratingCount = 0, showTooltip = false }) => {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);

  const handleClick = (value) => {
    setRating(value);
    if (onRatingChange) {
      onRatingChange(value);
    }
  };

  // Format rating to one decimal place
  const formattedRating = rating.toFixed(1);

  return (
    <div className="star-rating-container">
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= (hover || rating) ? 'filled' : ''}`}
            onClick={() => handleClick(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
          >
            ★
          </span>
        ))}
      </div>
      <div className="rating-info">
        <span className="rating-value">{formattedRating}</span>
        {ratingCount > 0 && (
          <span className="rating-count">({ratingCount.toLocaleString()} ratings)</span>
        )}
      </div>
      {showTooltip && (
        <div className="rating-tooltip">
          <div className="rating-distribution">
            <div className="rating-bar">
              <div className="rating-bar-fill" style={{ width: `${(rating / 5) * 100}%` }}></div>
            </div>
            <span className="rating-label">Course Rating</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StarRating; 