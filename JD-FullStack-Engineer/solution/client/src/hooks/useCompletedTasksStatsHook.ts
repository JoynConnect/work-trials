import actions from '../actions';
import { useEffect, useContext } from 'react';
import { DashboardContext, DashboardDispatchContext } from '../dashboardContext';
import JoynAPI from '../JoynAPI';
import { POLLING_INTERVAL } from '../constants';


const useCompletedTasksStatsHook = () => {
    const { completedTasksStats } = useContext(DashboardContext);
    const dispatch = useContext(DashboardDispatchContext);

    useEffect(() => {
        const getCompletedTasksStats = async() => {
            const response = await JoynAPI.getCompletedTasksStats();
            if (response.ok) {
                const data = await response.json();
                dispatch(actions.completedTasksStatsLoaded(data));
            }
        };

        if (!completedTasksStats) {
            getCompletedTasksStats();
        }
        const intervalID = setInterval(getCompletedTasksStats, POLLING_INTERVAL);
        return () => clearInterval(intervalID);
    }, [completedTasksStats]);
};

export default useCompletedTasksStatsHook;
