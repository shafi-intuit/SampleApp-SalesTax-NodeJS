# QuickBooks Sales Tax API

A Node Js App for calculating sales tax using QuickBooks Online Sales Tax API via GraphQL and the Intuit SDK.

## Features

- **Complete Sales Tax Operations**: Full tax calculation and lookup capabilities
  - ✅ **Calculate**: Real-time tax calculations for transactions
  - ✅ **Customer Integration**: Automatic QuickBooks customer lookup and resolution
- **GraphQL Integration**: Uses QuickBooks Sales Tax GraphQL API for efficient tax operations
  - **Tax Calculation Mutation**: `indirectTaxCalculateSaleTransactionTax` for real-time calculations
  - **Dynamic Variables**: Automatic conversion of REST requests to GraphQL variables
  - **Schema Compliance**: Exact implementation of QuickBooks Sales Tax mutation structure
- **Dynamic Input Processing**: **No hardcoded values** - all data comes from request input
  - **Customer ID**: Uses provided `customerId` or auto-fetches first available QuickBooks customer
  - **Addresses**: Requires `shipFromAddress` or `businessAddress` input for shipping calculations
  - **Item IDs**: Accepts QuickBooks-compatible numeric `itemId` values or defaults to "1"
- **Intuit Node JS SDK**: Built with official Intuit Node JS SDK for QuickBooks API v3 with OAuth 2.0

## OAuth Implementation

This API implements OAuth 2.0 as per Intuit Node JS specifications:

### Required OAuth Scopes

The API requires the following OAuth scopes for full functionality:

- `com.intuit.quickbooks.accounting` - Access to QuickBooks accounting data and customer information
- `indirect-tax.tax-calculation.quickbooks` - **Required for Sales Tax API access**
- `openid`, `profile`, `email`, `phone`, `address` - User identity information

> **Note**: The `indirect-tax.tax-calculation.quickbooks` scope is essential for accessing QuickBooks Sales Tax GraphQL API endpoints.

### Endpoints
- **Production**: `https://qb.api.intuit.com/graphql`
- **Sandbox**: `https://qb-sandbox.api.intuit.com/graphql`


## Prerequisites

- **Node.js**: Version 12.0.0 or higher (recommended: 14.x or 16.x)
- **npm**: Comes with Node.js installation

### Check Node.js Version
```bash
node --version
npm --version
```

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure QuickBooks App**
   - Create a QuickBooks app at https://developer.intuit.com
   - Update `.env` with your app credentials

3. **Run the Application**
   ```bash
   node index.js
   ```

4. **Complete OAuth Authentication**
   - Navigate to `http://localhost:3000`
   - Click on the 'Connect to Quickbooks' Button
   - Complete the QuickBooks OAuth flow
   - It Navigates you back to the Home Page where you can now have access to the Sales Tax UI.

5. **Test the API**
   - Navigate to `http://localhost:3000` for the web interface
   - Use the UI to perform the various operations.

## Configuration

Create a `.env` file with your QuickBooks app credentials:

```bash
PORT=3000

CLIENT_ID: PUT_YOUR_CLIENT_ID_HERE
CLIENT_SECRET: PUT_YOUR_CLIENT_SECRET_HERE
ENVIRONMENT: PUT_THE_ENVIRONMENT_HERE
REDIRECT_URI: http://localhost:3000/api/auth/
```

## Authentication

This API requires OAuth 2.0 authentication with QuickBooks Online. The authentication flow includes:

1. **OAuth Authorization**: Visit `/api/auth/login` to start the flow
2. **Scope Configuration**: Configurable scopes
3. **Sales Tax Permissions**: Requires `indirect-tax.tax-calculation.quickbooks` scope for Sales Tax API access

### Example OAuth Flow

```bash
# 1. Initiate OAuth
curl "http://localhost:3000/api/auth/login"

# 2. Complete authorization in browser, then test API
```

## API Endpoints

### OAuth Management
- `GET /api/auth/login` - Initiate OAuth authorization with QuickBooks
- `GET /api/auth/callback` - Handle OAuth callback from QuickBooks
- `GET /api/auth/retrieveToken` - Retrieve Token

### Sales Tax Operations
- `POST /api/quickbook/salestax/indirect-tax` - Calculate tax for a transaction (uses indirectTaxCalculateSaleTransactionTax mutation)
- `GET /api/quickbook/salestax/customers` - Get QuickBooks customers for testing and integration


## GraphQL Implementation

This API implements the exact QuickBooks Sales Tax GraphQL schema:

### Mutation Used
```graphql
mutation IndirectTaxCalculateSaleTransactionTax($input: IndirectTax_TaxCalculationInput!) {
  indirectTaxCalculateSaleTransactionTax(input: $input) {
    taxCalculation {
      transactionDate
      taxTotals {
        totalTaxAmountExcludingShipping {
          value
        }
      }
      subject {
        customer {
          id
        }
      }
      shipping {
        shipToAddress {
          rawAddress {
            ... on IndirectTax_FreeFormAddress {
              freeformAddressLine
            }
          }
        }
        shipFromAddress {
          rawAddress {
            ... on IndirectTax_FreeFormAddress {
              freeformAddressLine
            }
          }
        }
      }
      lineItems {
        edges {
          node {
            numberOfUnits
            pricePerUnitExcludingTaxes {
              value
            }
          }
        }
        nodes {
          productVariantTaxability {
            product {
              id
            }
          }
        }
      }
    }
  }
}
```

### Input Variables Format
```json
{
  "input": {
    "transactionDate": "2025-06-17",
    "subject": {
      "qbCustomerId": "1"
    },
    "shipping": {
      "shipFromAddress": {
        "freeFormAddressLine": "2600 Marine Way, Mountain View, CA 94043"
      },
      "shipToAddress": {
        "freeFormAddressLine": "2600 Marine Way, Mountain View, CA 94043"
      }
    },
    "lineItems": [
      {
        "numberOfUnits": 1,
        "pricePerUnitExcludingTaxes": {
          "value": 10.95
        },
        "productVariantTaxability": {
          "productVariantId": "1"
        }
      }
    ]
  }
}
```

## API Input Requirements Summary

### 🔄 Dynamic Input Implementation

All APIs now require input data and do not rely on hardcoded values:

#### **Main Calculate Endpoint** (`POST /api/quickbook/salestax/indirect-tax`)
- **Required**: `customerAddress` (complete address object)
- **Required**: Either `shipFromAddress` OR `businessAddress` (complete address object)
- **Optional**: `customerId` (auto-fetches first customer if not provided)
- **Optional**: `itemId` (accepts numeric strings like "1", "2", "3", etc. - defaults to "1")
- **Optional**: `transactionDate` (defaults to current date)

#### **Customers Endpoint**
- **No input required**: Returns all available QuickBooks customers for integration

### 🚨 Important Validation Rules

1. **Ship-From Address**: Must provide either `shipFromAddress` OR `businessAddress`
2. **Customer ID**: If not provided, system auto-fetches first available customer
3. **Address Completeness**: All address fields (city, state, postal code) are required
4. **Item IDs**: Must be numeric strings ("1", "2", "3", etc.) - custom alphanumeric IDs will fail QuickBooks validation

## API Usage Examples

### 1. Calculate Sales Tax for Transaction

**✅ Dynamic Input Version (No Hardcoded Values):**

```bash
curl -X POST "http://localhost:3000/api/quickbook/salestax/indirect-tax" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
  "transaction": {
      "transactionDate": "2025-06-17",
      "customerId": "1",
      "customerAddress": {
        "line1": "2600 Marine Way",
        "city": "Mountain View", 
        "state": "CA",
        "postalCode": "94043"
      },
      "shipFromAddress": {
        "line1": "123 Business St",
        "city": "San Francisco",
        "state": "CA",
        "postalCode": "94102"
      },
      "lines": [
        {
          "amount": 10.95,
          "description": "Test Product",
          "itemId": "2"
        }
      ]
    }
  }'
```

**Alternative with businessAddress (instead of shipFromAddress):**

```bash
curl -X POST "http://localhost:3000/api/quickbook/salestax/indirect-tax" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
  "transaction": {
      "transactionDate": "2025-06-17",
      "customerAddress": {
        "line1": "2600 Marine Way",
        "city": "Mountain View", 
        "state": "CA",
        "postalCode": "94043"
      },
      "businessAddress": {
        "line1": "123 Business St",
        "city": "San Francisco",
        "state": "CA",
        "postalCode": "94102"
      },
      "lines": [
        {
          "amount": 10.95,
          "description": "Test Product"
        }
      ]
    }
  }'
```

### 🔍 **ItemId Validation Requirements**

**✅ Valid ItemId Values:**
- **Numeric strings**: `"1"`, `"2"`, `"3"`, `"10"`, etc.
- **No itemId provided**: Defaults to `"1"`

**❌ Invalid ItemId Values:**
- **Custom alphanumeric**: `"CUSTOM-123"`, `"PROD-456"` 
- **Generated patterns**: `"item_1"`, `"product_abc"`

> **Note**: Either `shipFromAddress` OR `businessAddress` is required. If `customerId` is not provided, the system will automatically use the first available QuickBooks customer. ItemId must be a numeric string to pass QuickBooks validation.

**GraphQL Mutation Used:**
```graphql
mutation IndirectTaxCalculateSaleTransactionTax($input: IndirectTax_TaxCalculationInput!) {
  indirectTaxCalculateSaleTransactionTax(input: $input) {
    taxCalculation {
      transactionDate
      taxTotals {
        totalTaxAmountExcludingShipping {
          value
        }
      }
      subject {
        customer {
          id
        }
      }
      shipping {
        shipToAddress {
          rawAddress {
            ... on IndirectTax_FreeFormAddress {
              freeformAddressLine
            }
          }
        }
        shipFromAddress {
          rawAddress {
            ... on IndirectTax_FreeFormAddress {
              freeformAddressLine
            }
          }
        }
      }
      lineItems {
        edges {
          node {
            numberOfUnits
            pricePerUnitExcludingTaxes {
              value
            }
          }
        }
        nodes {
          productVariantTaxability {
            product {
              id
            }
          }
        }
      }
    }
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalTaxAmount": 1.0,
    "totalAmount": 11.95,
    "lines": [
      {
        "lineNumber": 1,
        "amount": 10.95,
        "taxAmount": 1.0,
        "taxRate": 0.0913242009132420091324200913,
        "description": "Test Product",
        "taxBreakdown": [
          {
            "taxType": "Sales Tax",
            "taxName": "QuickBooks Sales Tax",
            "taxRate": 0.0913242009132420091324200913,
            "taxAmount": 1.0,
            "jurisdiction": "Mountain View, CA",
            "taxableAmount": 10.95
          }
        ]
      }
    ],
    "transactionDate": "2025-06-17T00:00:00"
  }
}
```

### 2. Get QuickBooks Customers

```bash
curl -X GET "http://localhost:5038/api/salestax/customers" \
  -H "Accept: application/json"
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "",
      "companyName": "Amy's Bird Sanctuary",
      "active": true
    },
    {
      "id": "2",
      "name": "",
      "companyName": "Bill's Windsurf Shop",
      "active": true
    }
  ]
}
```

## Project Structure

```
├── graphql/salesTax
│   ├── inirectTax.js                   # GraphQL query and variables for calculating tax
├── pages/
│   ├── index.html                      # HTML for web UI
│   └── style.css                       # Styling for the UI
├── routes/
│   ├── oauth=route.js                  # routes for authentication flow
│   ├── sales-tax-route.cs              # routes for sales tax
├── services/                       
│   ├── auth-service.js                 # service for authentication
│   └── sales-tax-service.js            # service for sales tax
├── env                                 # Configs
├── index.js                            # Application startup
```


## GraphQL Implementation Details

This API implements the QuickBooks Sales Tax GraphQL schema with the following operations:

### Tax Calculation Mutation (`indirectTaxCalculateSaleTransactionTax`)
- **Purpose**: Calculate real-time sales tax for transactions
- **Method**: `CalculateSaleTransactionTaxAsync()`
- **Endpoint**: `POST /api/quickbook/salestax/indirect-tax`
- **GraphQL Type**: Mutation with `IndirectTax_TaxCalculationInput` input type
- **Features**: Dynamic customer lookup, address processing, line item support

### Customer Integration (QuickBooks REST API)
- **Purpose**: Retrieve QuickBooks customer data for tax calculations
- **Method**: `GetCustomersAsync()`
- **Endpoint**: `GET /api/quickbook/salestax/customers`
- **Integration**: Uses QuickBooks REST API v3 for customer data



## Dependencies

- **GraphQL.Client** - GraphQL client for Node Js (graphql-request)
- **IntuitNodeSDK** - Official Intuit Node JS SDK for OAuth
- **Express** - Node Express


## Implementation Details
### OAuth 2.0 Flow
**Authorization**: Uses Intuit Node Js SDK's OAuth2Client with proper environment handling


### GraphQL Integration
- **Real API Calls**: Direct integration with QuickBooks GraphQL endpoint
- **Dynamic Variables**: Converts REST request to GraphQL variables automatically
- **Customer Lookup**: Automatically retrieves QuickBooks customer ID for transactions
- **Error Handling**: Comprehensive error logging and debugging support


## Security Considerations

- OAuth state parameter validation
- Granular permission scope
- HTTPS redirect URI recommended for production

## Development

The application uses:
- **Intuit Node JS SDK** for OAuth 2.0
- **GraphQL.Client** for API communication


## Troubleshooting

### Common Issues

1. **"Cannot find module 'node:events'" Error**:
   - **Root Cause**: Using Express v5.x with Node.js < 18.0.0
   - **Solution**: Upgrade to Node.js 18+ or use Express v4.x
   - **Check Version**: Run `node --version` (should be 12.0.0+ for this project)
   - **Fix**: Delete `node_modules` and `package-lock.json`, then run `npm install`

2. **"Cannot find package 'graphql'" Error**:
   - **Root Cause**: Missing `graphql` peer dependency for `graphql-request`
   - **Solution**: Install the missing dependency
   - **Fix**: Run `npm install graphql` or `npm install` (package.json updated with graphql dependency)

3. **"Invalid URI or environment" Error**:
   - Ensure `DiscoveryDocument` is set to `https://appcenter.intuit.com/api/v1/connection/oauth2`
   - Verify `Environment` is set to `"sandbox"` or `"production"`

4. **"Access Denied" GraphQL Error**:
   - Verify both required scopes are present in `ProjectScopes`
   - Ensure QuickBooks company has sales tax enabled
   - Check that OAuth token includes `indirect-tax.tax-calculation.quickbooks` scope

5. **"-37109" Application Error**:
   - Configure sales tax settings in QuickBooks company
   - Enable tax agencies and rates for the addresses being tested
   - Verify customer exists in QuickBooks (or use hardcoded customer ID "1")

6. **"INV-GraphQL expression=Validation failed" Error**:
   - **Root Cause**: Invalid `itemId` format
   - **Solution**: Use numeric string itemIds only (`"1"`, `"2"`, `"3"`, etc.)
   - **Avoid**: Custom alphanumeric itemIds (`"CUSTOM-123"`, `"PROD-456"`)
   - **Default**: If no itemId provided, system defaults to `"1"`

### Debugging
- Check application logs for detailed GraphQL request/response information
- Use `/api/oauth/retrieveTOken` to verify token exists


## Production Deployment

For production:
1. Update `.env` with production credentials
2. Change `Environment` to `"production"`
3. Update `GraphQLEndpoint` to `"https://qb.api.intuit.com/graphql"`
4. Update `BaseUrl` to `"https://quickbooks.api.intuit.com"`
5. Use HTTPS for redirect URI (required by QuickBooks)

## Testing & Validation

The implementation has been comprehensively tested with real QuickBooks sandbox data:

### ✅ OAuth 2.0 Integration
- **Scope Configuration**: Both required scopes (`com.intuit.quickbooks.accounting` + `indirect-tax.tax-calculation.quickbooks`) working
- **Authorization Flow**: Complete OAuth flow using Intuit Node JS SDK

### ✅ GraphQL API Integration  
- **Real API Calls**: Direct integration with `https://qb-sandbox.api.intuit.com/graphql`
- **Exact Schema Implementation**: `IndirectTaxCalculateSaleTransactionTax` mutation with proper input structure
- **Customer Integration**: Automatic QuickBooks customer lookup and ID resolution
- **Dynamic Variables**: Request data converted to GraphQL variables correctly


### ✅ All Endpoints Validated (Dynamic Input Implementation)
| Endpoint | Status | Input Requirements | Test Results |
|----------|--------|-------------------|--------------|
| `POST /api/quickbook/salestax/indirect-tax` | ✅ Working | Requires `customerAddress` + (`shipFromAddress` OR `businessAddress`) + numeric `itemId` | $10.95 → $1.00 tax with itemId="1" |
| `GET /api/quickbook/salestax/customers` | ✅ Working | No input required | Returns QuickBooks customer list for dynamic lookup |


### Environment Setup

- **Sandbox**: Use `qb-sandbox.api.intuit.com` endpoints
- **Production**: Use `qb.api.intuit.com` endpoints  
- **Port**: Default is `3000`, configurable in `env`

## License

This project is for demonstration purposes and follows QuickBooks API terms of service.