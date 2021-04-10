const paddedString = num => num.toString().padStart(2, '0');

export const Time = ({ seconds }) => {
	const hr = paddedString(Math.floor(seconds / 3600));
	const min = paddedString(Math.floor((seconds % 3600) / 60));
	const sec = paddedString(Math.floor((seconds % 3600) % 60));

	return (
		<>
			{hr}:{min}:{sec}
		</>
	);
};
