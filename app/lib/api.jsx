const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:5000";

const API = {
  async post(path, data) {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const response = await fetch(`${baseURL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw Object.assign(new Error("Request failed"), {
        response: { status: response.status, data: responseData },
      });
    }

    return { data: responseData };
  },
};

export default API;