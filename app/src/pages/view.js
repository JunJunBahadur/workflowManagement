import React, {Component} from 'react';
import { useParams } from 'react-router-dom';
import _ from 'lodash';

function withParams(Component) {
    return props => <Component {...props} params={useParams()} />;
}

class View extends Component{
    constructor(props){
        super(props);
    }

    componentDidMount(){
        const { id } = this.props.params;
        console.log(id);
    }

    render(){
        return(
            <div>Hey is here download view.</div>
        )
    }
}

export default withParams(View);