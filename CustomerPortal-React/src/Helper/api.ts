export async function login(username: string, password: string) {
  const body = new URLSearchParams();
  body.append("grant_type", "password");
  body.append("username", username);
  body.append("password", password);
  body.append("client_id", "Portal_App"); // your ABP client id

  const res = await fetch("https://localhost:44338/connect/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }
  
  return res.json(); // contains access_token, expires_in, etc.
}

export async function getProducts(token: string) {
  const res = await fetch("https://localhost:44338/api/app/product", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("API request failed");
  }

  return res.json();
}
