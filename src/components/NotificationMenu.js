import { useState, useRef, useEffect } from 'react';
import {
	ClickAwayListener,
	Grow,
	Paper,
	Popper,
	MenuItem,
	MenuList,
	Typography,
	Badge
} from '@material-ui/core';

import { MathDisplay } from '../components/MathDisplay';
import { PlainLink } from './Links';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase/fire';
import { useDocumentDataOnce, useCollectionDataOnce } from 'react-firebase-hooks/firestore';
import NotificationsIcon from '@material-ui/icons/Notifications';
import { Bookmarks } from '@material-ui/icons';

export function NotificationMenu() {
	const [open, setOpen] = useState(false);
	const anchorRef = useRef(null);
	const [user] = useAuthState(auth);
	const [userData] = useDocumentDataOnce(db.collection('users').doc(user?.uid));
	const [notifications] = useCollectionDataOnce(
		db
			.collection("notifications")
			.orderBy("timestamp", "desc")
			.limit(10),

		{ idField: 'id' },
	);

	const handleToggle = async() => {
		setOpen(prevOpen => !prevOpen);
		await db.collection('users').doc(user?.uid).update({timestamp:new Date()});
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

	const recentNotifications = notifications?.filter(notification => {
		if(notification.batch){
			return userData?.batches?.[notification.batch];
		}
		return true;
	}).filter(notification=>notification.timestamp?.toDate()>userData?.timestamp?.toDate());

	const RecentNotifications = () => recentNotifications.map( notification => (<Paper style={{ padding: '1rem', margin: '1rem' }}>
		<Typography variant='h5'>{notification.topic}</Typography>
		<MathDisplay math={notification.content} />
		<Typography style={{ fontSize:'10px', margin:'2px', textAlign: 'right' }} color='textSecondary'>{notification.timestamp.toDate().toString()}</Typography>
	</Paper>)
	

)


	return (
		<div style={{margin:'.5rem'}}>

			{user && (
				<div>
					<Badge color="secondary" badgeContent={recentNotifications?.length} overlap="circle" >
						<NotificationsIcon
						ref={anchorRef}
						aria-controls={open ? 'menu-list-grow' : undefined}
						aria-haspopup="true"
						onClick={handleToggle} style={{ color:'white', fontSize:'27', cursor:'pointer'}} />
					</Badge>
					
					<Popper
						open={open}
						anchorEl={anchorRef.current}
						role={undefined}
						transition
						disablePortal
						style={{maxWidth:'25rem'}}
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
											
											<PlainLink to="/notifications" style={{textDecoration:'none'}}>
												<MenuItem onClick={handleClose}>
													<Bookmarks style={{margin:'.5rem'}}/>All notifications
												</MenuItem>
											</PlainLink>
											<RecentNotifications />
											
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
