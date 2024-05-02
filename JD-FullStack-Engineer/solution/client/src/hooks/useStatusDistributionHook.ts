import actions from '../actions';
import { useEffect, useContext } from 'react';
import { DashboardContext, DashboardDispatchContext } from '../dashboardContext';
import JoynAPI from '../JoynAPI';
import { POLLING_INTERVAL } from '../constants';


const useStatusDistributionHook = () => {
    const { statusDistribution } = useContext(DashboardContext);
    const dispatch = useContext(DashboardDispatchContext);

    useEffect(() => {
        const getStatusDistribution = async () => {
            const response = await JoynAPI.getStatusDistribution();
            if (response.ok) {
                const data = await response.json();
                dispatch(actions.statusDistributionLoaded(data));
            }
        };

        if (!statusDistribution) {
            getStatusDistribution();
        }
        const intervalID = setInterval(getStatusDistribution, POLLING_INTERVAL);
        return () => clearInterval(intervalID);

    }, [statusDistribution]);
};

export default useStatusDistributionHook;
