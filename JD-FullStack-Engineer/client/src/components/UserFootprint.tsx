import React, { useContext } from 'react'
import { EventContext } from '../context/EventContext'
import Chart from './Chart'

const UserFootprint: React.FC = () => {
  const { stats } = useContext(EventContext)

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">User Footprint</h2>
      <Chart data={stats} />
    </div>
  )
}

export default UserFootprint
