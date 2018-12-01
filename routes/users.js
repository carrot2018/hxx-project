var express = require('express');
var MongoClient = require('mongodb').MongoClient;
//MongoDB的id获取方法
var ObjectId = require('mongodb').ObjectId;
var async = require('async');
var router = express.Router();

var url = 'mongodb://127.0.0.1:27017';



//分页
router.get('/', function (req, res, next) {
  var page = parseInt(req.query.page) || 1;
  var pageSize = parseInt(req.query.pageSize) || 5;
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
          db.collection('user').find().count(function (err, num) {
            if (err) {
              cb(err);
            } else {
              totalSize = num;
              cb(null);
            }
          })
        },
        function (cb) {
          db.collection('user').find().limit(pageSize).skip(page * pageSize - pageSize).toArray(function (err, data) {
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
          res.render('users', {
            list: results[1],
            totalPage: totalPage,
            pageSize: pageSize,
            currentPage: page
          })
        }
      })
    })
});
/* GET users listing. */
router.get('/', function (req, res, next) {

  MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {

    if (err) {
      console.log('链接数据库失败', err);
      res.render('error', {
        message: '链接数据库失败',
        error: err
      });
      return;
    }
    var db = client.db('project');
    db.collection('user').find().toArray(function (err, data) {
      if (err) {
        console.log('查询用户失败', err);
        res.render('error', {
          message: '查询失败',
          error: err
        })
      } else {
        console.log(data);
        res.render('users', {
          list: data
        });

      }
      client.close();
    });
  });
});

//登录
router.post('/login', function (req, res) {
  //获取前端传递过来的参数
  var username = req.body.name;
  var password = req.body.pwd;
  //验证参数的有效性
  if (!username) {
    res.render('error', {
      message: '用户名不能为空',
      error: new Error('用户名不能为空')
    })
    return;
  }

  if (!password) {
    res.render('error', {
      message: '密码不能为空',
      error: new Error('密码不能为空')
    })
    return;
  }

  MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
    if (err) {
      console.log('连接失败', err);
      res.render('error', {
        message: '连接失败',
        error: err
      })
      return;
    }
    var db = client.db('project');
    db.collection('user').find({
      username: username,
      password: password
    }).toArray(function (err, data) {
      if (err) {
        console.log('查询失败', err);
        res.render('error', {
          message: '查询失败',
          error: err
        })
      } else if (data.length <= 0) {
        res.render('error', {
          message: '登录失败',
          error: new Error('登录失败')
        })
      } else {
        res.cookie('nickname', data[0].nickname, {
          maxAge: 100 * 60 * 1000
        });
        res.cookie('isAdmin', data[0].isAdmin, {
          maxAge: 100 * 60 * 1000
        });
        res.redirect('/');
      }
      // var userStr = req.cookies.nickname;
      // console.log(userStr);
      client.close();
    })
  })
});

//注册
router.post('/register', function (req, res) {
  var name = req.body.name;
  var pwd = req.body.pwd;
  var nickname = req.body.nickname;
  var age = parseInt(req.body.age);
  var sex = req.body.sex;
  var isAdmin = req.body.isAdmin === '是' ? true : false;

  MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
    if (err) {
      res.render('error', {
        message: '链接失败',
        error: err
      })
      return;
    }
    //获得数据库
    var db = client.db('project');

    async.series([
      function (cb) {
        db.collection('user').find({
          username: name
        }).count(function (err, num) {
          if (err) {
            cb(err)
          } else if (num > 0) {
            cb(new Error('已经注册'));
          } else {
            cb(null);
          }
        })
      },
      function (cb) {
        db.collection('user').insertOne({
          username: name,
          password: pwd,
          nickname: nickname,
          age: age,
          sex: sex,
          isAdmin: isAdmin
        }, function (err) {
          if (err) {
            cb(err);
          } else {
            cb(null);
          }
        })
      }
    ], function (err, result) {
      if (err) {
        res.render('error', {
          message: '错误',
          error: err
        })
      } else {
        res.redirect('/login.html');
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
    db.collection('user').deleteOne({
      _id: ObjectId(id)
    }, function (err, data) {
      if (err) {
        res.render('error', {
          message: '删除失败',
          error: err
        })
      } else {
        res.redirect('/users');
      }
      client.close();
    })
  })
});

//修改：根据id来修改
router.post('/update', function (req, res) {
  var idupdate = req.body.postId;
  var nickname = req.body.nickname;
  var age = parseInt(req.body.age);
  var sex = req.body.sex;
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
    if (err) {
      res, render('error', {
        message: '连接失败',
        error: err
      })
      return;
    }
    var db = client.db('project');

    db.collection('user').updateOne({
      _id: ObjectId(idupdate)
    }, {
        $set: {
          nickname: nickname,
          age: age,
          sex: sex
        }
      }, function (err) {
        if (err) {
          res.render('error', {
            message: '修改失败',
            error: err
          })
        } else {
          res.redirect('/users');
        }
        client.close();
      })
  })
});

//搜索：模糊搜索nickname
router.get('/search', function (req, res, next) {
  var name = req.query.name;
  var page = parseInt(req.query.page) || 1;
  var pageSize = parseInt(req.query.pageSize) || 5;
  var totalSize = 0;
  var data = [];
  var filter = new RegExp(name);

  MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
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
        db.collection('user').find({ nickname: filter }).count(function (err, num) {
          if (err) {
            cb(err);
          } else {
            totalSize = num;
            cb(null);
          }
        })
      }, function (cb) {
        db.collection('user').find({ nickname: filter }).limit(pageSize).skip(page * pageSize - pageSize).toArray(function (err, data) {
          if (err) {
            cb(err)
          } else {
            cb(null, data)
          }
        })
      }
    ], function (error, results) {
      if (err) {
        res.render('error', {
          message: '错误',
          error: err
        })
      } else {
        var totalPage = Math.ceil(totalSize / pageSize); // 总页数
        res.render('users', {
          list: results[1],
          totalPage: totalPage,
          pageSize: pageSize,
          currentPage: page
        })
        // res.redirect('/users');
      }
      client.close();
    })
  })
})
module.exports = router;
