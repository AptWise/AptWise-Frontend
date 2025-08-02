import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../assets/icon.svg';
import linkedinService from '../services/linkedinService.js';
import githubService from '../services/githubService.js';
import Navbar from '../components/Navbar';
import './Login.css';

const Login = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [linkedinLoading, setLinkedinLoading] = useState(false);
    const [githubLoading, setGithubLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setIsLoading(true); 

        const credentials = { email, password };
        
        try {
            const response = await login(credentials);
            console.log('Login successful:', response);
            setIsLoading(false);
            navigate('/dashboard');
        } catch (error) {
            console.error('Login failed:', error);
            setIsLoading(false);
            alert(`Login failed: ${error.message}`);
        }
    };

    const handleLinkedInLogin = async () => {
        setLinkedinLoading(true);
        try {
            const result = await linkedinService.authenticate(false);
            console.log('LinkedIn login successful:', result);
            navigate('/dashboard');
        } catch (error) {
            console.error('LinkedIn login failed:', error);
            alert(`LinkedIn login failed: ${error.message}`);
        } finally {
            setLinkedinLoading(false);
        }
    };

    const handleGitHubLogin = async () => {
        setGithubLoading(true);
        try {
            const result = await githubService.authenticate(false);
            console.log('GitHub login successful:', result);
            navigate('/dashboard');
        } catch (error) {
            console.error('GitHub login failed:', error);
            alert(`GitHub login failed: ${error.message}`);
        } finally {
            setGithubLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#0D0D0D', minHeight: '100vh' }}>
            <Navbar />
            <div className="min-h-screen bg-gray-900 flex items-center justify-center font-inter" style={{ paddingTop: '0', minHeight: 'calc(100vh - 80px)' }}>
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
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-2 pr-12 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors duration-200"
                                        placeholder="Password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300 focus:outline-none"
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
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
                        </div>                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                type="button"
                                onClick={handleLinkedInLogin}
                                disabled={linkedinLoading}
                                className={`flex items-center justify-center py-2 px-4 border border-gray-600 rounded-md hover:bg-gray-700 transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800 text-gray-400 ${linkedinLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {linkedinLoading ? (
                                    <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-gray-400 border-top-transparent"></div>
                                ) : (
                                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                        <path fill="#0077B5" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                    </svg>
                                )}
                                LinkedIn
                            </button>
       
                            <button 
                                type="button"
                                onClick={handleGitHubLogin}
                                disabled={githubLoading}
                                className={`flex items-center justify-center py-2 px-4 border border-gray-600 rounded-md hover:bg-gray-700 transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800 text-gray-400 ${githubLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {githubLoading ? (
                                    <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-gray-400 border-top-transparent"></div>
                                ) : (
                                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                                    </svg>
                                )}
                                GitHub
                            </button>
                        </div>

   
                        <div className="mt-6 text-center text-gray-400 text-sm">
                            Don't have an account?{' '}
                            <button onClick={() => navigate('/registration')} className="text-cyan-400 hover:text-cyan-300 focus:outline-none">
                                Sign up
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
};

export default Login;