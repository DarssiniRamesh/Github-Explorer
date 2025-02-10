import React, { useState, useEffect } from 'react';
import { getUserContributions } from '../services/github';
import { setCacheItem, getCacheItem } from '../services/cache';

// PUBLIC_INTERFACE
/**
 * ActivityCalendar component displays a GitHub-style contribution visualization
 * @param {Object} props - Component props
 * @param {string} props.username - GitHub username
 */
const ActivityCalendar = ({ username }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contributions, setContributions] = useState(null);
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const cacheKey = `contributions_${username}`;
        const cachedData = getCacheItem(cacheKey);

        if (cachedData) {
          setContributions(cachedData);
          setIsLoading(false);
          return;
        }

        const data = await getUserContributions(username);
        setContributions(data);
        setCacheItem(cacheKey, data);
      } catch (err) {
        setError(err.message || 'Failed to fetch contribution data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContributions();
  }, [username]);

  const handleCellHover = (event, contribution) => {
    const rect = event.target.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY - 40
    });
    setTooltipContent(
      `${contribution.count} contributions on ${new Date(contribution.date).toLocaleDateString()}`
    );
  };

  const handleCellLeave = () => {
    setTooltipContent('');
  };

  const getContributionColor = (count) => {
    if (count === 0) return '#ebedf0';
    if (count <= 3) return '#9be9a8';
    if (count <= 6) return '#40c463';
    if (count <= 9) return '#30a14e';
    return '#216e39';
  };

  if (isLoading) {
    return <div className="activity-calendar-loading">Loading activity data...</div>;
  }

  if (error) {
    return <div className="activity-calendar-error">{error}</div>;
  }

  if (!contributions) {
    return <div className="activity-calendar-empty">No contribution data available</div>;
  }

  return (
    <div className="activity-calendar">
      <h3>Contribution Activity</h3>
      <div className="calendar-grid">
        {contributions.map((week, weekIndex) => (
          <div key={weekIndex} className="calendar-week">
            {week.map((day, dayIndex) => (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className="calendar-day"
                style={{ backgroundColor: getContributionColor(day.count) }}
                onMouseEnter={(e) => handleCellHover(e, day)}
                onMouseLeave={handleCellLeave}
                role="gridcell"
                aria-label={`${day.count} contributions on ${new Date(day.date).toLocaleDateString()}`}
              />
            ))}
          </div>
        ))}
      </div>
      {tooltipContent && (
        <div
          className="calendar-tooltip"
          style={{
            position: 'absolute',
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`
          }}
        >
          {tooltipContent}
        </div>
      )}
    </div>
  );
};

export default ActivityCalendar;