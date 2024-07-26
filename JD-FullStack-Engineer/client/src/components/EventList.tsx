import React, { useContext } from 'react'
import { EventContext } from '../context/EventContext'
import EventDetails from './EventDetails'
import Pagination from './Pagination'

const EventList: React.FC = () => {
  const { events } = useContext(EventContext)

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                User ID
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Event Type
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Create At
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Update At
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {events.length > 0 ? (
              events.map(event => <EventDetails key={event.id} event={event} />)
            ) : (
              <tr>
                <td className="px-6 py-4 whitespace-nowrap" colSpan={5}>
                  No events found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Toolbar */}
      {events.length > 0 && <Pagination />}
    </div>
  )
}

export default EventList
