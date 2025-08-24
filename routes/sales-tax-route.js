import { Router } from 'express';
import dotenv from 'dotenv';

import {getClient} from '../services/auth-service.js';
import {
    getGraphQLClient,
    calculateIndirectTax,
    getCustomers,
    getAxiosClient
} from '../services/sales-tax-service.js';

dotenv.config();

const router = Router();

const sandBoxUrl = 'https://qb-sandbox.api.intuit.com/graphql';
const prodUrl = 'https://qb.api.intuit.com/graphql';

const getUrl = () => 
    process.env.ENVIRONMENT === 'sandbox'
      ? sandBoxUrl
      : prodUrl;

const baseHttpUri = process.env.ENVIRONMENT === 'sandbox'
                    ? "https://sandbox-quickbooks.api.intuit.com" 
                    : "https://quickbooks.api.intuit.com";
      
const getSalesTaxClient = () => {
    const token = getClient().getToken().getToken().access_token;
    const graphqlUrl = getUrl();
    const client = getGraphQLClient(graphqlUrl, token);
    return client;
};

router.post('/indirect-tax', async function (req, res) {
    const client = getSalesTaxClient();
    const response = await calculateIndirectTax(client, req.body);
    res.send(response);
});

router.get('/customers', async function (req, res) {
    const token = getClient().getToken().getToken();
    console.log('tok', token);
    const client = getAxiosClient(baseHttpUri, token.access_token);
    const response = await getCustomers(client, token.realmId);
    res.send(response.data);
})

export default router;
