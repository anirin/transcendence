import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface TournamentMatch {
	player1: string;
	player2: string;
}

const Tournament = () => {
	const location = useLocation();
	const { fields } = location.state as { fields: string[] };
	const [matches, setMatches] = useState<TournamentMatch[]>([]);

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
	}, [fields]);

	return (
		<div>
			<h2>トーナメント</h2>
			<div>
				<h2>1回戦 対戦カード</h2>
				{matches.map((match, index) => (
					<button key={index}>
						{match.player1} vs {match.player2}
					</button>
				))}
			</div>
		</div>
	);
};

export default Tournament; 