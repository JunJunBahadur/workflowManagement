import path from 'path';
import {version} from '../package.json';
import _ from 'lodash';
import File from './models/file';
import { ObjectId } from 'mongodb';
import Post from './models/post';

class AppRouter {
    constructor(app) {
        this.app = app;
        this.setupRouters();
    }

    setupRouters(){
        const app = this.app;
        const db = app.get('db');
        const uploadDir = app.get('storageDir');
        const upload = app.get('upload');

        //root routing
        app.get('/', (req,res) => {
            return res.status(200).json({
                version: version
            })
        });

        //Upload
        app.post('/api/upload', upload.array('files'),(req, res) => {
            const files = _.get(req, 'files', []);

            let fileModels = [];

            _.each(files, (fileObject) => {
                const newFile = new File(app).initWithObject(fileObject).toJSON();
                fileModels.push(newFile);
            });

            if(fileModels.length){
                db.collection('files').insertMany(fileModels, (err, result) => {
                    if(err){
                        return res.status(503).json({
                            error: {message: "Unable to save your file."}
                        });
                    }

                    console.log('User request via api upload with data', req.body, result);

                    let post = new Post(app).initWithObject({
                        from: _.get(req, 'body.from'),
                        to: _.get(req, 'body.to'),
                        message: _.get(req, 'body.message'),
                        files: result.insertedIds,
                    }).toJSON();

                    //let save post to posts collection.

                    db.collection('posts').insertOne(post, (err, result) => {
                        if(err){
                            return res.status(503).json({error: {message: "Your uploac could not be saved."}});
                        }
                        return res.json(post);
                    });

                });
            }else{
                return res.status(503).json({
                    error: {message: "File Upload is required."}
                });
            }
        });

        //Download
        app.get('/api/download/:id', (req, res) => {
            const fileId = req.params.id;
            console.log(ObjectId(fileId));
            db.collection('files').find({_id: ObjectId(fileId)}).toArray((err, result) => {

                const fileName = _.get(result, '[0].name');
                if(err || !fileName){
                    return res.status(404).json({
                        error: {
                            message: "File not found."
                        }
                    })
                }

                //console.log("Find file object from db", err, result);
                
                const filePath = path.join(uploadDir, fileName);
                return res.download(filePath, fileName, (err) => {
                    if(err){
                        return res.status(404).json({
                            error: {
                                message: "File not found."
                            }
                        });
                    }else{
                        console.log("File downloaded.");
                    }
                });
            })
        });
    }
}

export default AppRouter;