import React, { useContext, useState } from 'react';
import { EventContext } from '../context/EventContext';

const Filters: React.FC = () => {
  const { setFilterValue, filterValue } = useContext(EventContext);

  const [sourceFilter, setSourceFilter] = useState(filterValue.source || '');
  const [userFilter, setUserFilter] = useState(filterValue.userId || '');
  const [eventTypeFilter, setEventTypeFilter] = useState(filterValue.eventType || '');
  const [startDate, setStartDate] = useState(filterValue.startDate || '');
  const [endDate, setEndDate] = useState(filterValue.endDate || '');

  const handleFilterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newFilter = {
      source: sourceFilter,
      userId: userFilter,
      eventType: eventTypeFilter,
      startDate: startDate,
      endDate: endDate,
      // Add date filtering logic if needed (requires handling in backend)
    };
    setFilterValue(newFilter);
  };

  return (
    <form onSubmit={handleFilterSubmit} className="mb-4">
      <h2 className="text-2xl font-bold mb-2">Filters</h2>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {/* Source filter */}
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">All Sources</option>
          <option value="Jira">Jira</option>
          <option value="Notion">Notion</option>
          <option value="Slack">Slack</option>
        </select>

        {/* User filter */}
        <input
          type="text"
          placeholder="User ID"
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="border rounded p-2"
        />

        {/* Event type filter */}
        <input
          type="text"
          placeholder="Event Type"
          value={eventTypeFilter}
          onChange={(e) => setEventTypeFilter(e.target.value)}
          className="border rounded p-2"
        />

        {/* Start date filter */}
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border rounded p-2"
        />

        {/* End date filter */}
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border rounded p-2"
        />
      </div>

      <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2">
        Apply Filters
      </button>
    </form>
  );
}

export default Filters;
