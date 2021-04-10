import MathJax from 'react-mathjax-preview';
export function MathDisplay({ math, preview, style={} }) {
	return (
		<div style={{ margin: '1rem auto', userSelect: 'none', ...style }}  onContextMenu={(e)=>e.preventDefault()}>
			{preview && 'Preview:'}
			<MathJax math={math} />
		</div>
	);
}
