var express = require("express");
var app = express();
var router = require("./router/router.js");
session = require('express-session');
var session = require('express-session');

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
app.get("/photoAppreciate",router.appreciate);                    //佳片欣赏
app.get("/equipmentDetail",router.equipmentDetail);               //器材详情
app.get("/equipmentDetailCameraBody",router.cameraBody);        //器材详情-机身
app.get("/equipmentDetailCamera",router.camera);                //器材详情-相机
app.get("/equipmentDetailLen",router.len);                       //器材详情-
app.get("/equipmentDetailPhone",router.phone);                  //器材详情-
app.get("/photoCourse",router.course);                            //课程
app.get("/uploadImg",router.uploadImg);

// app.post("/new",router.new);                //记一笔
// app.post("/today",router.today);            //当日明细
// app.post("/week",router.week);              //最近一周的消费
// app.post("/all",router.all);                //全部消费明细
// app.post("/products",router.products);      //理财产品推荐
// app.post("/balance",router.balance);        //余额计算
// app.post("/detail",router.detail);          //单笔消费详情
// app.post("/delete",router.delete);          //删除单笔消费
app.listen(3000);
