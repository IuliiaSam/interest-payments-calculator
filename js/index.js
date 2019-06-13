'use strict';

const dataForm = document.querySelector("#form");

const agreementDate = document.querySelector('#agreement-date');
const calculationDate = document.querySelector('#calculation-date');
const investedAmount = document.querySelector('#invested-amount');
const interestRate = document.querySelector('#interest-rate');
const investmentDuration = document.querySelector('#investment-duration');

const resultContainer = document.querySelector('#result-container');

class Investment {
    constructor() {
        this.agreementDate = null;
        this.calculationDate = null;
        this.investedAmount = null;
        this.interestRate = null;
        this.investmentDuration = null;

        this.performCalculation = this.performCalculation.bind(this);
    }

    performCalculation(e) {
        // Preventing page reload on form submit
        e.preventDefault();

        // Collecting form data
        this.investedAmount = Number(investedAmount.value);
        this.interestRate = Number(interestRate.value);
        this.investmentDuration = Number(investmentDuration.value);
        this.agreementDate = agreementDate.value;
        this.calculationDate = calculationDate.value;

        // Calculating monthly payment, according to this formula: https://www.hpmuseum.org/software/41/41loansv.htm (at the bottom of the page)
        const monthlyInterest = 1 + (this.interestRate / (12 * 100));
        const numberOfPeriods = this.investmentDuration * 12;
        let denominator = 1;
        for (let i = 1; i < numberOfPeriods; i++) {
            denominator += Math.pow(monthlyInterest, i);
        }
        const monthlyPayment = this.investedAmount * (Math.pow(monthlyInterest, numberOfPeriods) / denominator);

        // Creating array of payment data by month
        const arrayOfPayments = [];

        let year = this.agreementDate.slice(0, 4);
        let month = this.agreementDate.slice(5, 7);
        let day = this.agreementDate.slice(8, 10);
        const agreementStart = new Date(year, month - 1, day);
        let currentPeriodStart = new Date(agreementStart);
        let nextPeriodStart = new Date(agreementStart).setMonth(nextPeriodStart.getMonth() + 1);

        let startBalance = this.investedAmount;
        const monthlyInterestRate = this.interestRate / 100 / 12;
        let interestPayment = startBalance * monthlyInterestRate;
        let principal = monthlyPayment - interestPayment;
        let endBalance = startBalance - principal;

        for (let i = 1; i <= numberOfPeriods; i++) {
            arrayOfPayments.push({
                currentPeriodNumber: i,
                currentPeriodStart: currentPeriodStart,
                nextPeriodStart: nextPeriodStart,
                startBalance: startBalance,
                interestPayment: interestPayment,
                principal: principal,
                endBalance: endBalance,
            });
            currentPeriodStart = new Date(agreementStart).setMonth(agreementStart.getMonth() + i);
            nextPeriodStart = new Date(agreementStart).setMonth(agreementStart.getMonth() + i + 1);

            startBalance = endBalance;
            interestPayment = startBalance * monthlyInterestRate;
            principal = monthlyPayment - interestPayment;
            endBalance = startBalance - principal;
        };

        // Defining which payment period corresponds to calculation date selected by the user
        // It is assumed that the monthly payment is due on the last day of the respective payment period
        let calcYear = this.calculationDate.slice(0, 4);
        let calcMonth = this.calculationDate.slice(5, 7);
        let calcDay = this.calculationDate.slice(8, 10);
        let calcDate = new Date(calcYear, calcMonth - 1, calcDay);
        let targetObj = arrayOfPayments.find(el => el.nextPeriodStart > calcDate);

        if (!targetObj) {

            const latestPeriodEnd = new Date(currentPeriodStart - 1000);
            resultContainer.innerHTML =
                `
                <h2 class="result-text accent">
                    On the selected date, there are no more payments due.
                </h2>
                <h3 class="result-text accent">
                    The last payment is to be made by end of ${latestPeriodEnd.toDateString()}.
                </h3>
                <h3 class="result-text accent">
                    To see data from the earlier periods, please select a different 'Date of calculation' and click the 'Calculate' button again.
                </h3>`;

        } else {

            // Calculating total amount of remaining interest payments
            const totalRemainingInterest = arrayOfPayments
                .filter(obj => obj.currentPeriodNumber >= targetObj.currentPeriodNumber)
                .reduce((acc, obj) => acc + obj.interestPayment, 0)

            // Rendering results on screen
            // The amounts are rounded to 2 decimal places. The weird formula below is just a workaround for better rounding precision in JavaScript
            resultContainer.innerHTML =
                `<h2 class="result-text">
                    The total amount of all future interest payments is ${Math.round((totalRemainingInterest+0.00001)*100)/100} USD
                </h2>
                <h3 class="result-text">
                    Reference: the fixed monthly payment is ${Math.round((monthlyPayment+0.00001)*100)/100} USD (interest + principal)
                </h3>`;
        }
    };
};

let investment = new Investment();

dataForm.addEventListener('submit', e => investment.performCalculation(e));