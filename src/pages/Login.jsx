import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../assets/icon.svg'
import './Login.css'

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

   
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault(); 
        setIsLoading(true); 

       
        setTimeout(() => {
            setIsLoading(false);
            navigate('/'); 
        }, 2000);
    };

    return (

        <div className="min-h-screen bg-gray-900 flex items-center justify-center font-inter">
            <div className="bg-gray-800 rounded-xl shadow-2xl flex w-full max-w-6xl overflow-hidden border border-gray-700">

                <div className="hidden lg:flex flex-col w-1/2 p-12 bg-gradient-to-br from-gray-900 to-gray-800 rounded-l-xl justify-center items-center text-center">
                    <div className="max-w-md">
                        <div className="flex items-center justify-center mb-8">
                            <img src={Icon} alt="AptWise Logo" className="h-12 mr-3" />
                            <span className="text-3xl font-bold text-white font-orbitron">AptWise</span>
                        </div>
                        <h1 className="text-3xl font-semibold text-white mb-6">
                            Login to continue <br className="lg:hidden" /> your interview prep
                        </h1>
                    </div>
                </div>


                <div className="w-full lg:w-1/2 p-8 flex items-center justify-center">
                    <div className="w-full max-w-md">
                        <div className="flex justify-center mb-8 lg:hidden">
                            <svg
                                width="48"
                                height="48"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-12"
                            >
                                <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" fill="#06B6D4" />
                                <path d="M12 6L16 10H14L12 8L10 10H8L12 6Z" fill="#1F2937" />
                                <path d="M12 18L8 14H10L12 16L14 14H16L12 18Z" fill="#1F2937" />
                            </svg>
                        </div>

                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-white mb-1">Welcome Back</h2>
                            <p className="text-gray-400 text-sm">Login to continue your interview preparation</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors duration-200"
                                    placeholder="Email address"
                                />
                            </div>
                            <div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors duration-200"
                                    placeholder="Password"
                                />
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center text-gray-400 cursor-pointer">
                                    <input type="checkbox" className="form-checkbox h-4 w-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500" />
                                    <span className="ml-2">Remember me</span>
                                </label>
                                <button type="button" className="text-cyan-400 hover:text-cyan-300 focus:outline-none">
                                    Forgot password?
                                </button>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-2 px-4 rounded-md font-semibold transition-all duration-300 transform hover:scale-105
                  ${isLoading
                                        ? 'bg-cyan-600 cursor-not-allowed'
                                        : 'bg-cyan-500 hover:bg-cyan-600'
                                    } text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800`}
                            >
                                {isLoading ? (
                          
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-2 h-2 bg-gray-900 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-900 rounded-full animate-bounce delay-75"></div>
                                        <div className="w-2 h-2 bg-gray-900 rounded-full animate-bounce delay-150"></div>
                                    </div>
                                ) : (
                                    'Login'
                                )}
                            </button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-600"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-gray-800 text-gray-400">or</span>
                            </div>
                        </div>


                        <div className="grid grid-cols-2 gap-3">

                            <button className="flex items-center justify-center py-2 px-4 border border-gray-600 rounded-md hover:bg-gray-700 transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800 text-gray-400">

                                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google
                            </button>
       
                            <button className="flex items-center justify-center py-2 px-4 border border-gray-600 rounded-md hover:bg-gray-700 transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800 text-gray-400">
            
                                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                                </svg>
                                GitHub
                            </button>
                        </div>

   
                        <div className="mt-6 text-center text-gray-400 text-sm">
                            Don't have an account?{' '}
                            <button onClick={() => navigate('/')} className="text-cyan-400 hover:text-cyan-300 focus:outline-none">
                                Sign up
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
