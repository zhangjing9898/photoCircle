var express = require("express");
var app = express();
var router = require("./router/router.js");
session = require('express-session');
var session = require('express-session');
var formidable=require("formidable");
var db=require("./model/db");
var path=require("path");
var fs = require("fs");
var md5=require("./model/md5");
var sd = require("silly-datetime");
//使用session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

//模板引擎
app.set("view engine","ejs");
//静态页面
app.use(express.static("./public"));
app.use("/avatar",express.static("./avatar"));
//路由表
app.get("/",router.index);                                          //显示主页
app.get("/exit",router.exit);                                       //退出
app.post("/dologin",router.dologin);                               //执行登录
app.get("/doregist",router.doregist);                              //执行注册
app.get("/user",router.user);                                       //显示个人页面
app.get("/userOtherPage",router.userOtherPage);                   //显示个人其他页面
app.get("/photoAppreciate",router.appreciate);                    //佳片欣赏
app.get("/equipmentDetail",router.equipmentDetail);               //器材详情
app.get("/equipmentDetailCameraBody",router.cameraBody);        //器材详情-机身
app.get("/equipmentDetailCamera",router.camera);                //器材详情-相机
app.get("/equipmentDetailLen",router.len);                       //器材详情-
app.get("/equipmentDetailPhone",router.phone);                  //器材详情-
app.get("/photoCourse",router.course);                            //课程
app.get("/uploadImg",router.uploadImg);
app.get("/showImg",router.showImg);                                 //显示用户上传的图片
app.get("/userInfoData",router.userInfoData);
app.get("/articleData",router.articleData);
app.get("/deleteImg",router.deleteImg);
app.get("/hotImgData",router.hotImgData);
app.post("/upImg",function (req, res, next) {
    //必须保证登陆
    if (req.session.login != "1") {
        res.end("非法闯入，这个页面要求登陆！");
        return;
    }
    var form = new formidable.IncomingForm();
    form.uploadDir = path.normalize(__dirname + "/public/download");
    form.parse(req, function (err, fields, files) {
        //--form detail
        var ImgTitle = fields.title;
        var ImgContent = fields.content;
        var ImgStyle=fields.tagInput;
        //----file
        var ttt = sd.format(new Date(), 'YYYY-MM-DD');
        var ran = parseInt(Math.random() * 89999 + 10000);
        var oldpath = files.touxiang.path;
        var name = files.touxiang.name;
        var newpath = path.normalize(__dirname + "/public/download") + "/" + name;
        var optionPath = newpath;
        req.session.optionPath = "http://127.0.0.1:3000/download" + "/" + name;
        fs.rename(oldpath, newpath, function (err) {
            if (err) {
                res.send("失败");
                return;
            }
            db.insertOne("Img",{
                "dengluming":req.session.username,
                "ImgTitle" : ImgTitle,
                "ImgContent" :ImgContent,
                "ImgStyle":ImgStyle,
                "ImgPath":req.session.optionPath
            },function(err,result){
                if(err){
                    res.send("失败");
                    return;
                }
                res.send("图片上传成功！<a href='/'>回到首页</a>");
            })
        });
    });
});
app.get("/detail/:id",router.newDetail);                           //新闻详情

//测试
app.get("/api/userList",router.userList);

app.listen(3000);
