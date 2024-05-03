
/**
 * Singleton class that holds all API call logic
 */
class JoynAPI {
    // TODO: Make this configurable when the API runs on aws.
    static BASE_URL = 'http://localhost:8080/';

    async callAPI(endpoint: string, params: {[key: string]: string}|null, body: {[key: string]: any} = undefined, method: string = 'GET') {
        const url = params
            ? `${endpoint}?` + new URLSearchParams(params)
            : endpoint;

        return await fetch(JoynAPI.BASE_URL + url, {
            method: method,
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async getCompletedTasksStats() {
        const path = 'completed-tasks';
        return await this.callAPI(path, null);
    }

    async getStatusDistribution() {
        const path = 'status-distribution';
        return await this.callAPI(path, null);
    }

};

export default new JoynAPI();
