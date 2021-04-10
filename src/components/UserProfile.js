import React from 'react';
import { useState, useRef } from 'react';
import {
	Card,
	IconButton,
    Chip,
    Table,
    TableCell,
    TableBody,
    TableRow,
    ThemeProvider
} from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person';
import { useHistory } from 'react-router-dom';
import { createMuiTheme } from '@material-ui/core/styles';

const colors = ['#eff8ff','#fcf8e8','#c6ebc9','#f5f4f4','#e6e6e6','#ffe0d8','#cccccc','#f9e0ae','#fceef5','#f3eac2']
const theme = createMuiTheme({
    overrides: {
        MuiTableCell: {
            root: {  //This can be referred from Material UI API documentation. 
                padding: '4px 8px',
                backgroundColor: colors[Math.floor(Math.random()*10)],
                opacity:'.8'
            },
        },
    },
});


const UserProfile = ({userData}) => {
    const anchorRef = useRef(null);
	const location = useHistory();
    const [open, setOpen] = useState(false);
    const handleToggle = () => {
		setOpen(prevOpen => !prevOpen);
	};

    return (
        <div style = {{ margin: '1.5rem 0' }}>
            <Card style={{boxShadow: '16px 10px 18px #AAAAAA', borderRadius:'0'}}>
                <ThemeProvider theme={theme}>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell align='center' rowSpan={5} >
                                    <IconButton
                                        ref={anchorRef}
                                        aria-controls={open ? 'menu-list-grow' : undefined}
                                        aria-haspopup="true"
                                        onClick={handleToggle}
                                    >
                                        <PersonIcon style={{fontSize:'70'}} />
                                    </IconButton>
                                </TableCell>
                                <TableCell align='center' ><h5>{userData?.name && "Name"}</h5></TableCell>
                                <TableCell align='center' ><h5>{userData?.name}</h5></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align='center' ><h5>{userData?.email && "Email"}</h5></TableCell>
                                <TableCell align='center' ><h5>{userData?.email}</h5></TableCell>
                            </TableRow>
                            {userData?.batches && <TableRow>
                                <TableCell align='center' ><h5>{"Batches"}</h5></TableCell>
                                <TableCell align='center' ><h5>{Object.keys(userData?.batches ?? {}).map(batch=>(
                                                                <Chip key={batch} label={batch} style={{margin:'.2rem'}}/>
                                                            ))}</h5>
                                </TableCell>
                            </TableRow>}
                            {userData?.type && <TableRow>
                                <TableCell align='center' ><h5>{"Type"}</h5></TableCell>
                                <TableCell align='center' ><h5>{userData?.type}</h5></TableCell>
                            </TableRow>}
                            {userData?.modulePermissions && <TableRow>
                                <TableCell align='center' ><h5>{"Modules"}</h5></TableCell>
                                <TableCell align='center' ><h5>{Object.keys(userData?.modulePermissions ?? {}).map(module=>(
                                                                <Chip onClick={() => 
                                                                    location.push(`/module/${module}`)
                                                                } key={module} label={module} style={{margin:'.2rem'}} color='primary'/>
                                                            ))}</h5>
                                </TableCell>
                            </TableRow>}
                        </TableBody>
                    </Table>
                </ThemeProvider>
            </Card>
        </div>
    );
}
    


export default UserProfile;