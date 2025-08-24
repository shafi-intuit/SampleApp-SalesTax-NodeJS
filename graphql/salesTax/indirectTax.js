export const indirectTaxQuery = `
mutation IndirectTaxCalculateSaleTransactionTax($input: IndirectTax_TaxCalculationInput!) {
    indirectTaxCalculateSaleTransactionTax(input: $input) {
        taxCalculation {
            id
            transactionDate
            taxTotals {
                totalTaxAmountExcludingShipping {
                    value
                    currency
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
                taxAmount {
                    value
                    currency
                }
            }
            lineItems {
                edges {
                    node {
                        numberOfUnits
                        pricePerUnitExcludingTaxes {
                            value
                            currency
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
}`;


export const indirectTaxVariables = (params) => {
    const variable = {
        transactionDate: params.transactionDate,
        subject: {
            qbCustomerId: params.customerId
        },
        shipping: {},
        lineItems: []
    };
    if(params.shippingFrom) {
        variable.shipping.shipFromAddress = {
            freeFormAddressLine: params.shippingFrom
        }
    }
    if(params.shippingTo) {
        variable.shipping.shipToAddress = {
            freeFormAddressLine: params.shippingTo
        }
    }
    if(params.shippingFee && params.shippingFeeCurrency) {
        variable.shipping.shippingFee = {
            value: +params.shippingFee,
            currency: params.shippingFeeCurrency
        }
    }
    if(params.productVariantId) {
        const pvt = {
            productVariantTaxability: {
                productVariantId: params.productVariantId
            }
        };
        if(params.numberOfLines) {
            pvt.numberOfUnits = +params.numberOfLines;
        }
        if(params.pricePerUnitExcludingTaxes && params.pricePerUnitExcludingTaxesCurrency) {
            pvt.pricePerUnitExcludingTaxes = {
                value: +params.pricePerUnitExcludingTaxes,
                currency: params.pricePerUnitExcludingTaxesCurrency
            };
        }
        if(params.totalPriceExcludingTaxes && params.totalPriceExcludingTaxesCurrency) {
            pvt.totalPriceExcludingTaxes = {
                value: +params.totalPriceExcludingTaxes,
                currency: params.totalPriceExcludingTaxesCurrency
            };
        }
        variable.lineItems.push(pvt);
    }
    return {input: variable};
}