import { Link } from 'react-router-dom';
import { Fab } from '@material-ui/core';
import styled from 'styled-components';

export const PlainLink = styled(Link)`
	color: currentColor;
`;

export const NavLink = styled(PlainLink)`
	color: currentColor;
	margin-left: 1rem;
`;

const InternalFabLink = ({ to, children, ...props }) => (
	<PlainLink to={to}>
		<Fab color="primary" {...props}>
			{children}
		</Fab>
	</PlainLink>
);

export const FabLink = styled(InternalFabLink)`
	position: fixed;
	bottom: 2rem;
	right: 2rem;
`;
