import { GraphQLClient, gql } from 'graphql-request';
import axios from 'axios';
import dotenv from 'dotenv'

import {indirectTaxQuery, indirectTaxVariables} from '../graphql/salesTax/indirectTax.js';

dotenv.config();

export const getGraphQLClient = (endpoint, token) => new GraphQLClient(endpoint, {
    headers: {
        authorization: `Bearer ${token}`,
    }
});

export const getAxiosClient = (baseUrl, token) => axios.create({
    baseURL: baseUrl,
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    }
});

const makeHttpRequest = async(client, url, method, body) => {
    if(method === 'get') {
        const response = await client.get(url);
        return response;
    } else if(method === 'post') {
        const response = await client.post(url, body);
        return response;
    }
}

const makeRequest = async (client, queryData, variables) => {
    try{
        const query = gql`${queryData}`;
        const response = await client.request(query, variables);
        return response;
    } catch(error) {
        console.log('An Error Occured', error.response.errors || error.response);
    }
}

export const calculateIndirectTax = async (client, params) => {
    const response = await makeRequest(client, indirectTaxQuery, indirectTaxVariables(params));
    return response;
}

export const getCustomers = async (client, realmId) => {
    const url = `/v3/company/${realmId}/query?query=SELECT * FROM Customer maxresults 10`;
    const response = await makeHttpRequest(client, url, 'get');

    return response;
}