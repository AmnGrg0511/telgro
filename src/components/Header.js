import React from 'react';
import telgroLogo from '../assets/telgroLogo.png'

const Header = ({onClick}) => {
    return (
        <div style = {{ display: 'flex', padding: '.5% 4.5%' }}>
                <img src = {telgroLogo} alt = "logo" style = {{ width: '6rem', margin: '1%' }} />
            <div style = {{ alignItems: 'center', display: 'flex' }}>
                <div className = 'nav-link'>
                    <a href = '#home' style = {{ color: '#11698e', fontSize: '1rem' }}>Home</a>
                </div>
                <div className = 'nav-link'>
                    <a href = '#about' style = {{ color: '#11698e', fontSize: '1rem' }}>About</a>
                </div>
                <div className = 'nav-link'>
                    <a href = '#contact' style = {{ color: '#11698e', fontSize: '1rem' }}>Contact</a>
                </div>
            </div>
            <div style = {{ alignItems: 'center', display: 'flex', marginLeft: 'auto' }}>
                <div className = 'nav-link'>
                    <p onClick = {onClick} style = {{ color: '#11698e', fontSize: '1.2rem', textAlign: 'center', cursor: 'pointer', margin:0 }}>Sign In</p>
                </div>
            </div>
        </div>
    );
}

export default Header; 