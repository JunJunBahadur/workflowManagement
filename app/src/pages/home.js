import React, {Component} from 'react';
import Header from '../component/header';
import HomeForm from '../component/home-form';
import HomeUploading from '../component/home-uploading';
import HomeUploadSent from '../component/home-upload-sent';
import _ from 'lodash';

class Home extends Component{

    constructor(props){
        super(props);

        this.state = {
            componentName: 'HomeForm',
            data: null,
            uploadEvent: null,
        }

        this._renderComponent = this._renderComponent.bind(this)
    }

    _renderComponent(){
        const {componentName, data, uploadEvent}= this.state;

        switch(componentName){

            case 'HomeUploading':

                return <HomeUploading event={uploadEvent} data={data} />

            case 'HomeUploadSent':

                return <HomeUploadSent onSendAnotherFile={() => {
                    this.setState({
                        componentName: 'HomeForm'
                    })
                }} data={data} />

            default:
                return <HomeForm 
                
                onUploadEvent={(event)=>{
                    /*
                    let componentNameToSet = componentName;
                    if(_.get(event, 'type') === 'success'){
                        componentNameToSet = 'HomeUploadSent'
                    }
                    */
                    this.setState({
                        uploadEvent: event,
                        componentName: (_.get(event, 'type')==='success') ? 'HomeUploadSent': this.state.componentName,
                        });
                }}

                onUploadBegin={(data)=>{
                    this.setState({
                        data: data,
                        componentName: 'HomeUploading',
                    });
                }} />
                
        }
    }

    render(){
        return (
            <div className="app-container">
                <Header />
                <div className="app-content">
                    {this._renderComponent()}
                </div>
            </div>
        )
    }
}

//{this._renderComponent()}
export default Home