import { Avatar as MatAvatar } from '@material-ui/core';
import styled from 'styled-components';
import defaultImage from '../assets/user.png';

const LetterAvatar = styled(MatAvatar)`
	background-color: ${props => props.theme.palette.secondary.main};
	color: ${props => props.theme.palette.secondary.contrastText};
`;

export const Avatar = ({ imageURL, name }) => {
	if (imageURL) {
		return <MatAvatar src={imageURL} />;
	}

	if (name) {
		const letter = name[0].toUpperCase();
		return <LetterAvatar>{letter}</LetterAvatar>;
	}

	return <MatAvatar src={defaultImage} />;
};
