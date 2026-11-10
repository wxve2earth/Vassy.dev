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

async function getErrorCode() {
    const requestedCode =
        params.get("code") ||
        document.body.dataset.errorCode;

    if (requestedCode) {
        return Number.parseInt(requestedCode, 10);
    }

    try {
        const response = await fetch(window.location.href, {
            method: "HEAD",
            cache: "no-store"
        });

        return response.status;
    } catch {
        return 404;
    }
}

async function displayError() {
    const parsedCode = await getErrorCode();

    const errorCode =
        Number.isInteger(parsedCode) &&
        parsedCode >= 400 &&
        parsedCode <= 599
            ? parsedCode
            : 404;

    const errorMessage =
        errors[errorCode] ||
        "The cat ran into an unexpected problem.";

    document.querySelector(".error-code").textContent =
        `${errorCode} Error`;

    document.querySelector("#error-title").textContent =
        errorMessage;

    document.title =
        `${errorCode} - Paws! Something went wrong :c`;
}

displayError();