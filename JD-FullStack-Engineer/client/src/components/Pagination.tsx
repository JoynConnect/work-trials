import React, { useContext } from 'react'
import { EventContext } from '../context/EventContext'

const Pagination: React.FC = () => {
  const { currentPage, setCurrentPage, totalPages } = useContext(EventContext)

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }
  return (
    <div className="mt-4 flex justify-center">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 mr-2 bg-gray-200 hover:bg-gray-300 rounded"
      >
        Previous
      </button>

      <span className="px-4 py-2">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 ml-2 bg-gray-200 hover:bg-gray-300 rounded"
      >
        Next
      </button>
    </div>
  )
}

export default Pagination
