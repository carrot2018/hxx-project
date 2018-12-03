var express = require('express');
var router = express.Router();
var multer = require('multer');
var async = require('async');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var url = 'mongodb://127.0.0.1:27017';

var upload = multer({ dest: 'C:/tmp' });
var fs = require('fs');
var path = require('path');


router.get('/', function (req, res, next) {
    var page = parseInt(req.query.page) || 1;
    var pageSize = parseInt(req.query.pageSize) || 3;
    var totalSize = 0;
    var data = [];

    MongoClient.connect(url, { useNewUrlParser: true },
        function (err, client) {
            if (err) {
                res.render('error', {
                    message: '连接失败',
                    error: err
                })
                return;
            }

            var db = client.db('project');

            async.series([
                function (cb) {
                    db.collection('brand').find().count(function (err, num) {
                        if (err) {
                            cb(err);
                        } else {
                            totalSize = num;
                            cb(null);
                        }
                    })
                },
                function (cb) {
                    db.collection('brand').find().limit(pageSize).skip(page * pageSize - pageSize).toArray(function (err, data) {
                        if (err) {
                            cb(err)
                        } else {
                            cb(null, data)
                        }
                    })
                }
            ], function (err, results) {
                if (err) {
                    res.render('error', {
                        message: '错误',
                        error: err
                    })
                } else {
                    var totalPage = Math.ceil(totalSize / pageSize);
                    res.render('brand', {
                        list: results[1],
                        totalPage: totalPage,
                        pageSize: pageSize,
                        currentPage: page
                    })
                }
            })
        })
});

router.get('/', function (req, res) {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        if (err) {
            res.render('error', {
                message: '连接失败',
                error: err
            })
            return;
        }
        var db = client.db('project');
        db.collection('brand').find().toArray(function (err, data) {
            if (err) {
                res.render('error', {
                    message: '失败',
                    error: err
                })
                return;
            }
            res.render('brand', {
                list: data
            });
            client.close();
        })
    })
});

router.post('/addBrand', upload.single('file'), function (req, res) {
    // 如果想要通过浏览器访问到这张图片的话，是不是需要将图片放到public里面去
    var filename = 'phoneImg/' + new Date().getTime() + '_' + req.file.originalname;
    var newFileName = path.resolve(__dirname, '../public/', filename);
    try {
        // fs.renameSync(req.file.path, newFileName);
        var data = fs.readFileSync(req.file.path);
        fs.writeFileSync(newFileName, data);

        MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {

            var db = client.db('project');
            db.collection('brand').insertOne({
                brandName: req.body.brandName,
                fileName: filename,
            }, function (err) {
                res.redirect('/brand')
            })
            client.close();
        })
    } catch (error) {
        res.render('error', {
            message: '新增手机失败',
            error: error
        })
    }
});
//修改
router.post('/update', upload.single('file'), function (req, res) {
    var filename = 'phoneImg/' + new Date().getTime() + '_' + req.file.originalname;
    var newFileName = path.resolve(__dirname, '../public/', filename);
    var data = fs.readFileSync(req.file.path);
    fs.writeFileSync(newFileName, data);
    var idupdate = req.body.postId;
    var brandName1 = req.body.brandName1;
    // var brand1 = req.body.brand1;
    // var gfPrice1 = req.body.gfPrice1;
    // var esPrice1 = req.body.esPrice1;
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        if (err) {
            res, render('error', {
                message: '连接失败',
                error: err
            })
            return;
        }
        var db = client.db('project');

        db.collection('brand').updateOne({
            _id: ObjectId(idupdate)
        }, {
                $set: {
                    brandName: brandName1,
                    fileName: filename,
                    // brand: brand1,
                }
            }, function (err) {
                if (err) {
                    res.render('error', {
                        message: '修改失败',
                        error: err
                    })
                } else {
                    res.redirect('/brand');
                }
                client.close();
            })
    })
});
//删除操作
router.get('/delete', function (req, res) {
    var id = req.query.id;

    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        if (err) {
            res, render('error', {
                message: '连接失败',
                error: err
            })
            return;
        }
        var db = client.db('project');
        db.collection('brand').deleteOne({
            _id: ObjectId(id)
        }, function (err, data) {
            if (err) {
                res.render('error', {
                    message: '删除失败',
                    error: err
                })
            } else {
                res.redirect('/brand');
            }
            client.close();
        })
    })
});

module.exports = router;