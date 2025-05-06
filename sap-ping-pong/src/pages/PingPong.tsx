import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTournament } from '../context/TournamentContext';

const PingPong = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { player1, player2 } = location.state as { player1: string, player2: string };
	const { matches, setMatches } = useTournament();
	const [winner, setWinner] = useState<string | null>(null);

	const handleWinnerSelect = (selectedWinner: string) => {
		setWinner(selectedWinner);
		const updatedMatches = matches.map(match => {
			if (match.player1 === player1 && match.player2 === player2) {
				return { ...match, winner: selectedWinner };
			}
			return match;
		});
		setMatches(updatedMatches);
	};

	const handleGoBack = () => {
		navigate('/tournament', { replace: true });
	};

	return (
		<div>
			<h2>Ping Pong</h2>
			<p>{player1} vs {player2}</p>
			{!winner ? (
				<div>
					<p>勝者を選択してください：</p>
					<button onClick={() => handleWinnerSelect(player1)}>{player1}</button>
					<button onClick={() => handleWinnerSelect(player2)}>{player2}</button>
				</div>
			) : (
				<div>
					<p>勝者: {winner}</p>
					<button onClick={handleGoBack}>トーナメントに戻る</button>
				</div>
			)}
		</div>
	);
};

export default PingPong; 
