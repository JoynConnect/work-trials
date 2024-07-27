import React from 'react';
import EventProvider from './context/EventContext';
import Home from './pages/Home';

function App() {
  return (
    <EventProvider>
      <div className="container mx-auto p-4">
        <Home />
      </div>
    </EventProvider>
  );
}

export default App;
