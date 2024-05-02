import React, { useReducer } from 'react';
import { createRoot } from 'react-dom/client';
import dashboardReducer, { initialState } from './reducers/dashboard';
import { DashboardContext, DashboardDispatchContext } from './dashboardContext';
import StatusDistributionPage from './StatusDistributionPage';
import './style/app.css';


const App = () => {
    const [dashboardStore, dispatch] = useReducer(dashboardReducer, initialState);
    return (
        <DashboardContext.Provider value={dashboardStore}>
            <DashboardDispatchContext.Provider value={dispatch}>
                <StatusDistributionPage />
            </DashboardDispatchContext.Provider>
        </DashboardContext.Provider>
    );
}

const domNode = document.getElementById('app');
const root = createRoot(domNode);
root.render(<App />);
