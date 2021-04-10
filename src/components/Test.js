import React, { Component } from 'react';
import 'firebase/firestore';
import { db } from '../firebase/fire';
//import {useParams} from 'react-router-dom'

class Test extends Component{
    state={
        quest:[  ]
    }
     

    componentDidMount(){
        let quest=this.props.match.params.questions;
        
        let subtopics=this.props.match.params.Subtopics;
        db.collection('topics').doc(subtopics).get().then((snapshot)=>{
            console.log(snapshot.docs);
        })

        
        this.setState({quest:quest}  ) 
          
     
    }
    
   
    
    


    // }
 
    render(){
        
          
            return (
              <div>
                <h3>{this.state.quest}</h3>
              </div>
            );
          }
        
}
export default Test;