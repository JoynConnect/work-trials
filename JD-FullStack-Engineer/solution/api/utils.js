export const getDateTimeAsDateStr = (datetimeStr) => {
    return new Date(datetimeStr).toISOString().split('T')[0];
};
