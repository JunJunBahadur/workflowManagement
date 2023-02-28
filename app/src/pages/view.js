import React, {Component} from 'react';
import { useParams } from 'react-router-dom';
import _ from 'lodash';
import { getDownloadInfo } from '../helpers/download';
import { apiUrl } from '../config';

function withParams(Component) {
    return props => <Component {...props} params={useParams()} />;
}

class View extends Component{
    constructor(props){
        super(props);
    }

    componentDidMount(){
        const { id } = this.props.params;
        getDownloadInfo(id).then((response) => {

            this.setState({
                post: _.get(response, 'data')
            });
            
        }).catch((err)=>{
            console.log("Error fetching data: ", err);
        })
    }

    render(){
        return(
            <div className='app-page-download'>
            <div className='app-top-header'>
                <h1><i className="icon-paper-plane" />SHARE</h1>
            </div>
                <div className='app-card app-card-download'>
                    <div className='app-card-content'>
                        <div className='app-card-content-inner'>
                            <div className='app-download-icon'>
                                <i className='icon-download' />
                            </div>

                            <div className='app-download-message app-text-center'>
                                <h2>Ready to download</h2>
                                <ul>
                                    <li>3 files</li>
                                    <li>5M</li>
                                    <li>Expires in 30 days</li>
                                </ul>
                            </div>
                            <div className='app-download-file-list'>
                                <div className='app-download-file-list-item'>
                                    <div className='filename'>ABC.jpg</div>
                                    <div className='download-action'><a href={`${apiUrl}/download/`}>Download</a></div>
                                </div>
                                <div className='app-download-file-list-item'>
                                    <div className='filename'>ABC.jpg</div>
                                    <div className='download-action'><a href={`${apiUrl}/download/`}>Download</a></div>
                                </div>
                            </div>
                            
                            <div className='app-download-action app-form-action'>
                                <button className='app-button primary' type='button'>Download All</button>
                                <button className='app-button' type='button'>Share</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default withParams(View);