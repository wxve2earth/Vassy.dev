
const errors = {
    400: "The cat got confused.",
    401: "You need permission to enter this territory.",
    403: "Paws off! you're not allowed here.",
    404: "Nothing here. just an empty cardboard box.",
    429: "Easy there, too many paw taps!",
    500: "The cat knocked something over.",
    502: "The cat couldn't reach the server.",
    503: "The cat is taking a little break.",
    504: "The cat waited too long for a response."
};

const params = new URLSearchParams(window.location.search);

const requestedCode =
    params.get("code") ||
    document.body.dataset.errorCode ||
    "404";

const parsedCode = Number.parseInt(requestedCode, 10);

const errorCode =
    Number.isInteger(parsedCode) &&
    errorCodeIsValid(parsedCode)
        ? parsedCode
        : 404;

function errorCodeIsValid(code) {
    return code >= 400 && code <= 599;
}

const errorMessage =
    errors[errorCode] ||
    "The cat ran into an unexpected problem.";

document.querySelector(".error-code").textContent =
    `${errorCode} Error`;

document.querySelector("#error-title").textContent =
    errorMessage;

document.title =
    `${errorCode} - Paws! Something went wrong :c`;
