import React from 'react'
import Filters from '../components/Filters'
import EventList from '../components/EventList'
import UserFootprint from '../components/UserFootprint'

const Home: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Event Tracker Dashboard</h1>
      <Filters />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <EventList />
        <UserFootprint />
      </div>
    </div>
  )
}

export default Home
