import { useState, useRef, useEffect } from 'react';
import {
	Button,
	ClickAwayListener,
	Grow,
	Paper,
	Popper,
	MenuItem,
	MenuList,
	IconButton,
} from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person';
import { NavLink, PlainLink } from './Links';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase/fire';
import { useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import { ADMIN_ID } from '../constants/adminConstants';
import { AccountTree, Code, Comment, ExitToApp, Group, PermContactCalendar, SupervisedUserCircle } from '@material-ui/icons';


export function UserMenu() {
	const [open, setOpen] = useState(false);
	const anchorRef = useRef(null);
	const [user] = useAuthState(auth);
	const [userData] = useDocumentDataOnce(db.collection('users').doc(user?.uid));

	const handleToggle = () => {
		setOpen(prevOpen => !prevOpen);
	};

	const handleClose = event => {
		if (anchorRef.current && anchorRef.current.contains(event.target)) {
			return;
		}

		setOpen(false);
	};

	function handleListKeyDown(event) {
		if (event.key === 'Tab') {
			event.preventDefault();
			setOpen(false);
		}
	}

	// return focus to the button when we transitioned from !open -> open
	const prevOpen = useRef(open);
	useEffect(() => {
		if (prevOpen.current === true && open === false) {
			anchorRef.current.focus();
		}

		prevOpen.current = open;
	}, [open]);

	return (
		<div>
			{!user && (
				<NavLink to="/login">
					<Button color="inherit">Login</Button>
				</NavLink>
			)}

			{user && (
				<div>
					<IconButton
						ref={anchorRef}
						aria-controls={open ? 'menu-list-grow' : undefined}
						aria-haspopup="true"
						onClick={handleToggle}
					>
						<PersonIcon style={{fontSize:'40', color:'white'}} />
					</IconButton>
					<Popper
						open={open}
						anchorEl={anchorRef.current}
						role={undefined}
						transition
						disablePortal
						placement='bottom-end'
					>
						{({ TransitionProps, placement }) => (
							<Grow
								{...TransitionProps}
								style={{
									transformOrigin:
										placement === 'bottom' ? 'right top' : 'right bottom',
								}}
							>
								<Paper style={{boxShadow: '5px 10px 10px #888888'}}>
									<ClickAwayListener onClickAway={handleClose}>
										<MenuList
											autoFocusItem={open}
											id="menu-list-grow"
											onKeyDown={handleListKeyDown}
										>
											<PlainLink to="/profile" style={{textDecoration:'none'}}>
												<MenuItem onClick={handleClose}>
													<PermContactCalendar style={{margin:'.5rem'}}/> Profile
												</MenuItem>
											</PlainLink>
											<PlainLink to="/posts" style={{textDecoration:'none'}}>
												<MenuItem onClick={handleClose}>
													<Comment style={{margin:'.5rem'}}/> Posts
												</MenuItem>
											</PlainLink>
											{user?.uid === ADMIN_ID && (
												<PlainLink to="/admin" style={{textDecoration:'none'}}>
													<MenuItem onClick={handleClose}>
														<SupervisedUserCircle style={{margin:'.5rem'}}/> Admin
													</MenuItem>
												</PlainLink>
											)}
											{userData?.type === 'moderator' && (
												<PlainLink to="/moderator" style={{textDecoration:'none'}}>
													<MenuItem>
														<Group style={{margin:'.5rem'}}/> Moderator
													</MenuItem>
												</PlainLink>
											)}
											<PlainLink to="/syllabus" style={{textDecoration:'none'}}>
												<MenuItem onClick={handleClose}>
													<AccountTree style={{margin:'.5rem'}}/> Syllabus
												</MenuItem>
											</PlainLink>
											{userData?.type === 'moderator' && (
											<PlainLink to="/code" style={{textDecoration:'none'}}>
												<MenuItem onClick={handleClose}>
													<Code style={{margin:'.5rem'}}/> Code
												</MenuItem>
											</PlainLink>)}
											<MenuItem onClick={() => {auth.signOut(); window.location.reload()}}><ExitToApp style={{margin:'.5rem'}}/>Logout</MenuItem>
										</MenuList>
									</ClickAwayListener>
								</Paper>
							</Grow>
						)}
					</Popper>
				</div>
			)}
		</div>
	);
}
