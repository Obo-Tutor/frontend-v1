"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useGlobalContext } from "../../context/GlobalContextProvider";
import axios from "axios";
import toast from "react-hot-toast";

function Login() {
  const { isLogged, setIsLogged } = useGlobalContext();
  const [session, setSession] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("admin-token")) {
      setIsLogged(true);
      router.push("/admin/update");
    }
  }, [setIsLogged, router]);

  const handleLogin = async (e) => {
    setSession(true);
    e.preventDefault();

    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_DOMAIN_NAME_BACKEND + "/admin/login",
        { email, password }
      );

      const token = response.data.access_token;
      const user = response.data.user_details.id;

      localStorage.setItem("admin-token", token);
      localStorage.setItem("user", user);
      setIsLogged(true);
      router.push("/admin/update");
    } catch (error) {
      console.error(error);
      if (error.response?.status === 404) {
        toast.error("Invalid credentials");
      } else {
        toast.error("An error occurred. Please try again.");
      }
    } finally {
      setSession(false);
    }
  };

  return (
    <div className="h-screen grid grid-cols-1 md:grid-cols-2 w-screen bg-blue-900">
      <div className="overflow-hidden opacity-70 hidden md:block">
        <img
          className="w-full h-full object-cover"
          src="/login.webp"
          alt="login image"
        />
      </div>
      <div>
        <form onSubmit={handleLogin}>
          <div className="flex flex-col gap-5 items-center justify-center h-screen">
            <h1 className="text-xl font-bold text-white">Welcome to</h1>
            <h1 className="text-5xl animate-bounce font-bold text-white">
              Obo Tutor
            </h1>

            <input
              className="w-80 p-2 rounded-xl focus:outline-none"
              type="email"
              placeholder="Email"
              name="email"
              required
            />
            <input
              className="w-80 p-2 rounded-xl focus:outline-none"
              type="password"
              placeholder="Password"
              name="password"
              required
            />

            <button
              type="submit"
              className="w-80 p-2 bg-blue-500 rounded-xl text-white hover:bg-blue-950 disabled:bg-gray-500"
              disabled={session} // Disable button during login attempt
            >
              {session ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
