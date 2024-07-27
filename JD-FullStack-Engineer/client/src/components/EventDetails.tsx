import React from 'react';
import { Event } from '../types';

interface EventDetailsProps {
  event: Event;
}

const EventDetails: React.FC<EventDetailsProps> = ({ event }) => {
  const createdAt = new Date(event.createdAt).toLocaleString();
  const updatedAt = new Date(event.updatedAt).toLocaleString();

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">{event.userId}</td>
      <td className="px-6 py-4 whitespace-nowrap">{event.eventType}</td>
      <td className="px-6 py-4 whitespace-nowrap">{event.source}</td>
      <td className="px-6 py-4 whitespace-nowrap">{createdAt}</td>
      <td className="px-6 py-4 whitespace-nowrap">{updatedAt}</td>
    </tr>
  );
}

export default EventDetails;