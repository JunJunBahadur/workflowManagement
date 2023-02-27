import { Component } from "react";
import Home from "../pages/home";
import View from "../pages/view";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';  

class Layout extends Component{
    
    constructor(props){
        super(props)
    }

    render(){
        return(
            <Router>
                <div className="app-layout">
                    <Routes>
                        <Route exact path='/' element={<Home />} />
                        <Route exact path='/share/:id' element={<View />} />
                    </Routes>
                </div>
            </Router>
        )
    }
}

export default Layout