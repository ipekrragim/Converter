 const APIURL = "https://v6.exchangerate-api.com/v6/fdbae4130ae0fedddc2aa063/latest/";
let fromCurrency = "RUB";
let toCurrency = "USD";
let exchangeRate = null;

const leftInput = document.querySelector(".left-side input");
const rightInput = document.querySelector(".right-side input");
const leftButtons = document.querySelectorAll(".left-units button");
const rightButtons = document.querySelectorAll(".right-units button");
const leftUnitValue = document.querySelector(".left-side .oneunit");
const rightUnitValue = document.querySelector(".right-side .oneunit");
const connectionMsg = document.querySelector("#connection-msg");
const burger = document.querySelector('.burger');
const menu = document.querySelector('.menu ul');
const defaultAmount = 5000;
leftInput.value = defaultAmount;
function selectActive(buttons, selectedCurrency) {
    buttons.forEach(button => {
        button.classList.toggle("default", button.textContent === selectedCurrency);
    });
}
function getExchangeRate(from, to, callback) {
    if (!navigator.onLine) {
        connectionMsg.textContent = "No Connection!";
        connectionMsg.style.display = "block";
        return;  
    }
    const url = `${APIURL}${from}`;
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("Məzənnə yüklənmədi.");
            return response.json();
        })
        .then(data => {
            const rate = data.conversion_rates[to];
            callback(rate);
        })
        .catch(error => {
             connectionMsg.textContent = "No Connection!"
            connectionMsg.style.display = "block";
        });
}
function updateConversion(side) {
    const leftValue = leftInput.value.trim();
    const rightValue = rightInput.value.trim();

    if (side === "right" && leftValue === "") {
        rightInput.value = "";
        return;
    } else if (side === "left" && rightValue === "") {
        leftInput.value = "";
        return;
    }

    if (toCurrency === fromCurrency) {
        if (side === "right") {
            rightInput.value = leftInput.value;
        } else {
            leftInput.value = rightInput.value;
        }
        leftUnitValue.textContent = `1 ${toCurrency} = 1 ${fromCurrency}`;
        rightUnitValue.textContent = `1 ${fromCurrency} = 1 ${toCurrency}`;
        return;
    }

    if (!exchangeRate) {
        getExchangeRate(fromCurrency, toCurrency, rate => {
            exchangeRate = rate;
            convert(side);
            leftUnitValue.textContent = `1 ${fromCurrency} = ${(1 / exchangeRate).toFixed(5)} ${toCurrency}`;
            rightUnitValue.textContent = `1 ${toCurrency} = ${exchangeRate.toFixed(5)} ${fromCurrency}`;
            selectActive(leftButtons, fromCurrency);
            selectActive(rightButtons, toCurrency);
        });
    } else {
        convert(side);
    }
}
function convert(side) {
    let amount;
    if (side === "right") {
        amount = Number(leftInput.value);
        amount = isNaN(amount) ? 0 : amount; 
        rightInput.value = amount === 0 ? "0" : (amount * exchangeRate).toFixed(5).replace(/\.?0+$/, "");
    } else if (side === "left") {
        amount = Number(rightInput.value);
        amount = isNaN(amount) ? 0 : amount;
        leftInput.value = amount === 0 ? "0" : (amount / exchangeRate).toFixed(5).replace(/\.?0+$/, "");
    }
}

function changeCurrency(side, currency) {
    if (side === "left") {
        fromCurrency = currency;
    } else {
        toCurrency = currency;
    }
    exchangeRate = null;
    updateConversion(side === "left" ? "left" : "right");
}

function validateInput(event) {
    const input = event.target;
    let value = input.value;

    value = value.replace(/,/g, '.'); 
    value = value.replace(/[^0-9.]/g, ''); 
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }
    if (/^0[0-9]/.test(value)) {
        value = parseInt(value, 10).toString();
    }

    if (parts[1] && parts[1].length > 5) {
        value = parts[0] + '.' + parts[1].slice(0, 5);
    }
    if (value.startsWith(".")) {
        value = "0" + value;
    }
    if (value === "0") {
        input.value = "0";
        return;
    }
    input.value = value;

}

burger.addEventListener('click', () => {
    menu.classList.toggle('active');
});

leftInput.addEventListener("input", (event) => {
    validateInput(event);
    updateConversion("right");
});

rightInput.addEventListener("input", (event) => {
    validateInput(event);
    updateConversion("left");
});

leftButtons.forEach(button => {
    button.addEventListener("click", () => {
        selectActive(leftButtons, button.textContent);
        changeCurrency("left", button.textContent);
    });
});

rightButtons.forEach(button => {
    button.addEventListener("click", () => {
        selectActive(rightButtons, button.textContent);
        changeCurrency("right", button.textContent);
    });
});

updateConversion("right");
getExchangeRate(fromCurrency, toCurrency, rate => {
    exchangeRate = rate;
    leftUnitValue.textContent = `1 ${fromCurrency} = ${rate.toFixed(5)} ${toCurrency}`;
    rightUnitValue.textContent = `1 ${toCurrency} = ${(1 / rate).toFixed(5)} ${fromCurrency}`;
});
selectActive(leftButtons, fromCurrency);
selectActive(rightButtons, toCurrency);
