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
                    db.collection('phone').find().count(function (err, num) {
                        if (err) {
                            cb(err);
                        } else {
                            totalSize = num;
                            cb(null);
                        }
                    })
                },
                function (cb) {
                    db.collection('phone').find().limit(pageSize).skip(page * pageSize - pageSize).toArray(function (err, data) {
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
                    res.render('phone', {
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
        db.collection('phone').find().toArray(function (err, data) {
            if (err) {
                res.render('error', {
                    message: '失败',
                    error: err
                })
                return;
            }
            res.render('phone', {
                list: data
            });
            client.close();
        })
    })
});

router.post('/addPhone', upload.single('file'), function (req, res) {
    // 如果想要通过浏览器访问到这张图片的话，是不是需要将图片放到public里面去
    var filename = 'phoneImg/' + new Date().getTime() + '_' + req.file.originalname;
    var newFileName = path.resolve(__dirname, '../public/', filename);
    var brand = req.body.brand;
    var gfPrice = req.body.gfPrice;
    var esPrice = req.body.esPrice;
    try {
        // fs.renameSync(req.file.path, newFileName);
        var data = fs.readFileSync(req.file.path);
        fs.writeFileSync(newFileName, data);

        MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {

            var db = client.db('project');
            db.collection('phone').insertOne({
                phoneName: req.body.phoneName,
                fileName: filename,
                brand: brand,
                price: gfPrice,
                second: esPrice
            }, function (err) {
                res.redirect('/phone')
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

router.post('/update', upload.single('file'), function (req, res) {
    var filename = 'phoneImg/' + new Date().getTime() + '_' + req.file.originalname;
    var newFileName = path.resolve(__dirname, '../public/', filename);
    var idupdate = req.body.postId;
    var phoneName1 = req.body.phoneName1;
    var brand1 = req.body.brand1;
    var gfPrice1 = req.body.gfPrice1;
    var esPrice1 = req.body.esPrice1;
    console.log(idupdate, phoneName1, brand1, gfPrice1)
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        if (err) {
            res, render('error', {
                message: '连接失败',
                error: err
            })
            return;
        }
        var db = client.db('project');

        db.collection('phone').updateOne({
            _id: ObjectId(idupdate)
        }, {
                $set: {
                    phoneName: phoneName1,
                    brand: brand1,
                    gfPrice: gfPrice1,
                    esPrice: esPrice1
                }
            }, function (err) {
                if (err) {
                    res.render('error', {
                        message: '修改失败',
                        error: err
                    })
                } else {
                    res.redirect('/phone');
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
        db.collection('phone').deleteOne({
            _id: ObjectId(id)
        }, function (err, data) {
            if (err) {
                res.render('error', {
                    message: '删除失败',
                    error: err
                })
            } else {
                res.redirect('/phone');
            }
            client.close();
        })
    })
});

module.exports = router;