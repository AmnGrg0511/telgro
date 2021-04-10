import React from 'react';
import {
    Button
} from '@material-ui/core';
import { Link } from 'react-router-dom';


export const PastTests = ({submissions}) => {
    submissions?.sort((a, b) => b.timestamp?.toDate() - a.timestamp?.toDate())
    return (
        <div style = {{ margin: '1.5rem 0' }}>
            {submissions?.map( (test,idx) => (
                    test.timestamp && <Button key={idx} component={Link} to={`test/${test.id}`} variant='contained' color='primary' style={{ margin:'3px', textTransform:'none', borderRadius:'0', boxShadow: '3px 4px 1px #888888', color:'#fff', opacity:'.9' }}>{test.timestamp.toDate().toString().substring(4,25)}</Button>
            ))}
        </div>
    );
}
    
