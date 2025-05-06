import React, { createContext, useContext, useState, ReactNode } from 'react';

// トーナメントの基本情報を定義
interface TournamentContextType {
  // プレイヤー名のリスト
  fields: string[];
  // 対戦カードとその結果
  matches: TournamentMatch[];
  // 状態更新用の関数
  setFields: (fields: string[]) => void;
  setMatches: (matches: TournamentMatch[]) => void;
}

// 対戦情報の型定義
interface TournamentMatch {
  player1: string;
  player2: string;
  // TODO: 将来的に追加する可能性のある情報
  // winner?: string;
  // score?: { player1: number, player2: number };
  // round?: number;
}

// コンテキストの作成
const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

// プロバイダーコンポーネント
export const TournamentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 状態の初期化
  const [fields, setFields] = useState<string[]>(["太郎", "二郎", "三郎", "四郎", "吾郎"]);
  const [matches, setMatches] = useState<TournamentMatch[]>([]);

  // TODO: 将来的に追加する可能性のある機能
  // - トーナメントの進行状況
  // - 勝者情報の管理
  // - 対戦履歴の保存

  return (
    <TournamentContext.Provider value={{ fields, matches, setFields, setMatches }}>
      {children}
    </TournamentContext.Provider>
  );
};

// コンテキストを使用するためのカスタムフック
export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (context === undefined) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
}; 