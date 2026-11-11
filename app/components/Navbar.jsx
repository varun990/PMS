"use client";

export default function Navbar() {

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    window.location.href = "/login";
  };

  return (
    <div className="bg-white shadow px-6 py-4 flex justify-between items-center">

      <h1 className="text-2xl font-bold">
        Performance Management System
      </h1>

      <div className="flex items-center gap-4">

        <div className="text-gray-600">
          Employee
        </div>

        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>

      </div>
    </div>
  );
}