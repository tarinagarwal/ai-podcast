const url = "https://api.heygen.com/v2/avatars";

const response = await fetch(url, {
  headers: {
    Accept: "application/json",
    "X-Api-Key": "YmMxNGUwNmQ5MTA4NGE1MDkyZjk1OTE3MzA2ZDYyZWYtMTc1Mjk5MDQwNw==",
  },
});

const text = await response.text();

console.log(text);
