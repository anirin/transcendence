import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Input はプレイヤー名と人数 tournament に渡すための機能を持つ

const Input = () => {
	const [fields, setFields] = useState<string[]>(["太郎", "二郎", "三郎", "四郎", "吾郎"]);
	const navigate = useNavigate();

	const handleChange = (index: number, value: string) => {
		const newFields = [...fields];
		newFields[index] = value;
		setFields(newFields);
	};

	const handleDelete = (index: number) => {
		const newFields = [...fields];
		newFields.splice(index, 1);
		setFields(newFields);
	};

	const handleSubmit = () => {
		navigate("/tournament", { state: { fields } });
	};

	return (
		<div>
			<h2>プレイヤー登録</h2>
			{fields.map((field, index) => (
				<div key={index}>
					<input type="text" value={field} onChange={(e) => handleChange(index, e.target.value)} />
					<button onClick={() => handleDelete(index)}>削除</button>
				</div>
			))}
			<button onClick={() => setFields([...fields, ""])}>追加</button>
			<button onClick={handleSubmit}>確定</button>
		</div>
	);
};

export default Input;