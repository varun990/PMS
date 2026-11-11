/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import API from "../../lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const login = async () => {
    try {
      const res = await API.post("/login", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      if (res.data.role === "admin") {
        router.push("/admin");
      }

      if (res.data.role === "manager") {
        router.push("/manager");
      }

      if (res.data.role === "employee") {
        router.push("/employee");
      }
    } catch (err) {
      if (!err?.response) {
        alert("The login service is unavailable. Start the backend and try again.");
      } else if (err.response.status === 401) {
        alert("Email or password is incorrect.");
      } else {
        alert(`Login failed (HTTP ${err.response.status}). Please try again.`);
      }
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-96">
        <h2 className="text-2xl font-bold mb-6">
          Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full mb-4"
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-4"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <button
          onClick={login}
          className="bg-blue-500 text-white w-full p-2"
        >
          Login
        </button>
      </div>
    </div>
  );
}