import Image from "next/image";
import { useState } from "react";
import { useRouter } from 'next/router';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const CustomAlert = ({ message }) => (
  <motion.div
    initial={{ opacity: 0, y: -50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -50 }}
    transition={{ duration: 0.3 }}
    className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center p-4"
  >
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full flex items-center">
      <CheckCircle className="text-green-500 mr-3" size={24} />
      <p className="text-center text-gray-800">{message}</p>
    </div>
  </motion.div>
);

export default function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const router = useRouter();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await axios.post('http://localhost:8000/signin', 
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      setAlertMessage(response.data.message);
      setTimeout(() => {
        setAlertMessage("");
        router.push('/home');
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.error || 'An error occurred during signin');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 overflow-hidden">
      <AnimatePresence>
        {alertMessage && <CustomAlert message={alertMessage} />}
      </AnimatePresence>

      <div className="w-full md:w-1/2 h-64 md:h-auto relative">
        <Image 
          src="/ImageItems/Logindoor.png" 
          alt="Nar's Storefront" 
          layout="fill"
          objectFit="cover"
          className="absolute inset-0"
        />
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white shadow-md rounded-lg p-8 w-full max-w-md"
        >
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-orange-400">Welcome Back!</h2>
            <p className="text-gray-600 mt-2">Sign in to your Nar's account</p>
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a href="#" className="font-medium text-orange-600 hover:text-orange-500">Forgot your password?</a>
              </div>
            </div>
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </motion.button>
          </form>
          <p className="mt-6 text-center text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={() => router.push('/signup')}
              className="font-medium text-orange-600 hover:text-orange-500"
            >
              Sign up
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}