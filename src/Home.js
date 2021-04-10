import React, { useState } from 'react';
import Content from './components/Content';
import Login from './Login';
import './Home.css'

const Home = () => {

    const [clicked, setClicked] = useState(false);

    const handleClick = () => {
        setClicked(true);
    }

    if(clicked){
        return (
            <Login />
        )
    } else{
    return (
        <div style={{overflow: 'hidden'}}>
            <Content onClick= {handleClick}/>
        </div>
    );
    }
}

export default Home;