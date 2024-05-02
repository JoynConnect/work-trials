import {
    action,
    completedTasksStats,
    statusDistribution,
    statusDistributionByScope,
} from '../types';
import { actionTypes } from '../actions';

interface dashboardState {
    completedTasksStats: completedTasksStats;
    statusDistribution: statusDistribution[];
};

export const initialState: dashboardState = {
    statusDistribution: [],
    completedTasksStats: null,
};

function dashboardReducer(state: dashboardState, action: action) {
    switch (action.type) {
        case actionTypes.COMPLETED_TASKS_STATS_LOADED:
            return {
                ...state,
                completedTasksStats: action.value,
            };

        case actionTypes.STATUS_DISTRIBUTION_LOADED:
            return {
                ...state,
                statusDistribution: action.value,
            };

        default: {
            throw Error(`Unknown action: ${action.type}`);
        }
    }
}

export default dashboardReducer;
