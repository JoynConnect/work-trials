import {
    action,
    completedTasksStats,
    statusDistribution,
} from './types';

export const actionTypes = {
    COMPLETED_TASKS_STATS_LOADED: 'COMPLETED_TASKS_STATS_LOADED',
    STATUS_DISTRIBUTION_LOADED: 'STATUS_DISTRIBUTION_LOADED',
};

const completedTasksStatsLoaded = (value: completedTasksStats): action => ({
    type: actionTypes.COMPLETED_TASKS_STATS_LOADED,
    value,
});

const statusDistributionLoaded = (value: statusDistribution): action => ({
    type: actionTypes.STATUS_DISTRIBUTION_LOADED,
    value,
});

export default {
    completedTasksStatsLoaded,
    statusDistributionLoaded,
};

