var formidable = require("formidable");
var db = require("../model/db.js");
var md5 = require("../model/md5.js");
var path=require("path");
var fs = require("fs");
var gm = require("gm");
var sd = require("silly-datetime");
var  ObjectId = require('mongodb').ObjectID;
var express=require("express");
var app=express();
session = require('express-session');

//使用session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));


//主页
exports.index=function (req,res,next) {
    if (req.session.login == "1") {
        //如果登陆了
        var username = req.session.username;
        var login = true;
    } else {
        //没有登陆
        var username = "未登录";  //制定一个空用户名
        var login = false;
    }
    res.render("index",{
        "login":login,
        "username":username,
        // "active": "首页"
    });
}

//退出
exports.exit=function (req,res) {
    delete req.session.username;
    req.session.login="-1";
    res.redirect('/');
}


//执行登录
exports.dologin=function (req,res,next) {
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
        var dengluming = fields.dengluming;
        var mima = fields.mima;
        mima = md5(md5(mima).substr(4,7) + md5(mima));

        //检索数据库，按登录名检索数据库，查看密码是否匹配
        db.find("users",{"dengluming":dengluming},function(err,result){
            // console.log(fields);
            if(result.length == 0){
                res.send("-2");  //-2没有这个人
                return;
            }
            var shujukuzhongdemima = result[0].mima;
            //要对用户这次输入的密码，进行相同的加密操作。然后与
            //数据库中的密码进行比对
            if(mima == shujukuzhongdemima){
                req.session.login = "1";
                req.session.username = dengluming;
                res.send("1");  //成功
            }else{
                res.send("-1"); //密码不匹配
            }
        });
    });
    return;
}

//管理员验证登录
exports.doManagerLogin=function (req,res,next) {
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
        // console.log(fields);
        var dengluming = fields.dengluming;
        var mima = fields.mima;

        //检索数据库，按登录名检索数据库，查看密码是否匹配
        db.find("manager",{"dengluming":dengluming},function(err,result){
            if(result.length == 0){
                res.send("-2");  //-2没有这个人
                return;
            }
            var shujukuzhongdemima = result[0].mima;
            //要对用户这次输入的密码，进行相同的加密操作。然后与
            //数据库中的密码进行比对
            if(mima == shujukuzhongdemima){
                req.session.login = "1";
                req.session.username = dengluming;
                res.send("1");  //成功
            }else{
                res.send("-1"); //密码不匹配
            }
        });
    });
    return;
}

//执行注册
exports.doregist=function (req,res,next) {
    var dengluming = req.query.dengluming;
    var mima = req.query.mima;
    //加密
    console.log("111111");
    mima = md5(md5(mima).substr(4,7) + md5(mima));

    db.find("users", {"dengluming": dengluming}, function (err, result) {
        if (err) {
            res.send("-3"); //服务器错误
            return;
        }
        if (result.length != 0) {
            res.send("-1"); //被占用
            return;
        }
        //没有相同的人，就可以执行接下来的代码了：

        //现在可以证明，用户名没有被占用
        //把用户名和密码存入数据库
        db.insertOne("users",{
            "dengluming" : dengluming,
            "mima" : mima
        },function(err,result){
            if(err){
                res.send("-1");
                return;
            }
            req.session.login = "1";
            req.session.username = dengluming;

            res.send("1"); //注册成功，写入session
        })
    });
}


//用户页面
exports.user=function (req,res,next) {
    res.render("user");
};

//佳片欣赏
exports.appreciate=function (req,res,next) {
    res.render("photoAppreciate");
}

//器材推荐
exports.equipmentDetail=function (req,res,next) {
    res.render("equipmentDetail");
}

//器材推荐下-机身
exports.cameraBody=function (req,res,next) {
    res.render("equipmentDetailCameraBody");
}

//器材推荐下-相机
exports.camera=function (req,res,next) {
    res.render("equipmentDetailCamera");
}

//器材推荐下-镜头
exports.len=function (req,res,next) {
    res.render("equipmentDetailLen");
}

//器材推荐下-手机
exports.phone=function (req,res,next) {
    res.render("equipmentDetailPhone");
}

exports.course=function (req,res,next) {
    res.render("photoCourse");
}

exports.uploadImg=function (req,res,next) {
    //必须保证登陆
    // if (req.session.login != "1") {
    //     res.end("非法闯入，这个页面要求登陆！");
    //     return;
    // }
    res.render("uploadImg",{
        "login": req.session.login == "1" ? true : false,
        "username": req.session.login == "1" ? req.session.username : ""
    });
}

//上传图片
exports.post("/upImg",function (req,res,next) {
    //必须保证登陆
    if (req.session.login != "1") {
        res.end("非法闯入，这个页面要求登陆！");
        return;
    }
    var form = new formidable.IncomingForm();
    form.uploadDir = path.normalize(__dirname + "/public/uploadImg");
    form.parse(req, function (err, fields, files) {
        console.log(files);
        var ttt = sd.format(new Date(), 'YYYY-MM-DD');
        var ran = parseInt(Math.random() * 89999 + 10000);
        var oldpath = files.touxiang.path;
        var name=files.touxiang.name;
        var newpath = path.normalize(__dirname + "/public/uploadImg") + "/" +name;
        var optionPath=newpath;
        req.session.optionPath="http://127.0.0.1:3000/uploadImg"+"/"+name;
        fs.rename(oldpath, newpath, function (err) {
            if (err) {
                res.send("失败");
                return;
            }
            res.redirect("/uploadImg");
        });
    });
})