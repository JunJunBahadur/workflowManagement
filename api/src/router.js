import path from 'path';
import {version} from '../package.json';
import _ from 'lodash';
import File from './models/file';
import { ObjectId } from 'mongodb';
import Post from './models/post';
import FileArchiver from './archiver';
//import Email from './email';


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
                            return res.status(503).json({error: {message: "Your upload could not be saved."}});
                        }
                        //implement email sending to user with download link.

                        //send email
                        /*
                        const sendEmail = new Email(app);

                        sendEmail.sendDownloadLink(post, (err, info) => {
                            if(err){
                                console.log("An error sending email notify download link.", err);
                            }
                        })
                        */
                        // callback to react app with post detail
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
                return res.download(filePath, _.get(result, '[0].originalName'), (err) => {
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


        //Routing for post detail /api/posts/:id
        app.get('/api/posts/:id', (req,res) => {
            const postId = _.get(req, 'params.id');
            
            this.getPostById(postId, (err, result) => {
                if(err){
                    return res.status(404).json({error:{message: "File not found."}});
                }

                return res.json(result);
            })

        });

        // Routing Download zip files.
        app.get('/api/posts/:id/download',(req,res) => {

            const id = _.get(req, 'params.id', null);
            
            this.getPostById(id, (err, result) => {
                if(err){
                    return res.status(404).json({error:{message: "File not found."}});
                }

                const files  = _.get(result, 'files', []);
                const archiver = new FileArchiver(app, files, res).download();

                return archiver;
            })
        });
    }

    getPostById(id, callback = () => {}){

        const app = this.app;

        const db = app.get('db');
        let postObjectId = null;
        try{
            postObjectId = new ObjectId(id);
        }
        catch(err){
            return callback(err, null);
        }

        db.collection('posts').find({_id: postObjectId}).limit(1).toArray((err, results) => {
            let result = _.get(results, '[0]');

            if(err || !result){
                return callback(err ? err : new Error("File not found."));
            }

            const fileIds = _.get(result, 'files', []);

            db.collection('files').find({_id: {$in: Object.values(fileIds)}}).toArray((err,files) => {

                if(err || !files || !files.length){
                    return callback(err ? err : new Error("File not found."));
                }

                result.files = files;
                return callback(null, result);
            });
        });
    }
}

export default AppRouter;