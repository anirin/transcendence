import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTournament } from '../context/TournamentContext';

interface TournamentMatch {
	player1: string;
	player2: string;
}

const Tournament = () => {
	const navigate = useNavigate();
	const { fields, matches, setMatches } = useTournament();

	useEffect(() => {
		// 2のべき乗の計算
		const calculatePowerOfTwo = (length: number): number => {
			let power = 1;
			while (Math.pow(2, power) < length) {
				power++;
			}
			return Math.pow(2, power);
		};

		// 必要な参加者数を計算
		const requiredPlayers = calculatePowerOfTwo(fields.length);
		
		// ダミーデータを追加
		const tournamentFields = [...fields];
		while (tournamentFields.length < requiredPlayers) {
			tournamentFields.push(`dummy-${tournamentFields.length + 1}`);
		}

		// 1回戦の組み合わせを作成
		const firstRoundMatches: TournamentMatch[] = [];
		for (let i = 0; i < tournamentFields.length; i += 2) {
			firstRoundMatches.push({
				player1: tournamentFields[i],
				player2: tournamentFields[i + 1]
			});
		}

		setMatches(firstRoundMatches);
	}, [fields, setMatches]);

	const handleMatchClick = (match: TournamentMatch) => {
		navigate('/ping-pong', { state: { player1: match.player1, player2: match.player2 } });
	};

	return (
		<div>
			<h2>トーナメント</h2>
			<div>
				<h2>1回戦 対戦カード</h2>
				{matches.map((match, index) => (
					<button key={index} onClick={() => handleMatchClick(match)}>
						{match.player1} vs {match.player2}
					</button>
				))}
			</div>
		</div>
	);
};

export default Tournament; 