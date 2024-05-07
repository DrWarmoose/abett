import axios from 'axios';

export const read = (url) => {
    try {
        return axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });
    } catch (error) {
        console.error(error);
    }
};