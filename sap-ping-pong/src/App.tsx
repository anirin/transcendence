import React from 'react';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Input from './pages/Input';
import Tournament from './pages/Tournament';
import PingPong from './pages/PingPong';
import { TournamentProvider } from './context/TournamentContext';

const App = () => {
	return (
		<TournamentProvider>
			<div>
				<h1>Ping Pong Game</h1>
				<BrowserRouter>
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/input" element={<Input />} />
						<Route path="/tournament" element={<Tournament />} />
						<Route path="/ping-pong" element={<PingPong />} />
					</Routes>
				</BrowserRouter>
			</div>
		</TournamentProvider>
	);
};

export default App; 