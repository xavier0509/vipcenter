var numericalValue = null;   //成长值，当前用户的积分值
var rank = null;             //等级，当前用户的等级
var accesstoken = null;      //存储用户的token值
var avatar = null;           //存储用户的头像地址
var external = [];           //拓展信息
var face = null;             //qqface
var i =1;
var interval = null;
var app = {

  canonical_uri:function(src, base_path) 
  {
    var root_page = /^[^?#]*\//.exec(location.href)[0],
    root_domain = /^\w+\:\/\/\/?[^\/]+/.exec(root_page)[0],
    absolute_regex = /^\w+\:\/\//;
        // is `src` is protocol-relative (begins with // or ///), prepend protocol  
        if (/^\/\/\/?/.test(src)) 
        {  
          src = location.protocol + src; 
        }  
    // is `src` page-relative? (not an absolute URL, and not a domain-relative path, beginning with /)  
    else if (!absolute_regex.test(src) && src.charAt(0) != "/")  
    {  
            // prepend `base_path`, if any  
            src = (base_path || "") + src; 
          }
    // make sure to return `src` as absolute  
    return absolute_regex.test(src) ? src : ((src.charAt(0) == "/" ? root_domain : root_page) + src);  
  },
  
  rel_html_imgpath:function(iconurl)
  {
        // console.log(app.canonical_uri(iconurl.replace(/.*\/([^\/]+\/[^\/]+)$/, '$1')));
        return app.canonical_uri(iconurl.replace(/.*\/([^\/]+\/[^\/]+)$/, '$1'));
      },


    // Application Constructor
    initialize: function() {
      this.bindEvents();
    },

    bindEvents: function() {
      document.addEventListener('deviceready', this.onDeviceReady, false);
      // document.addEventListener("backbutton", this.handleBackButton, false);
    },
    handleBackButton: function() {
        console.log("Back Button Pressed!");
        // experience();
        
    },

    onDeviceReady: function() {
      cordova.require("coocaa-plugin-coocaaosapi.coocaaosapi");
      // console.log("分辨率高:"+window.screen.height);
      // console.log("分辨率宽:"+window.screen.width);
      // console.log("可见宽:"+document.body.clientWidth);
      // console.log("可见高:"+document.body.clientHeight);
      coocaaosapi.hasCoocaaUserLogin(function(message) {
        loginstatus = message.haslogin;
        console.log("haslogin " + loginstatus);
        if (loginstatus == "false") {
            document.getElementById('showMain').style.display="none";
            document.getElementById('goLoad').style.display="block";
            document.getElementById("loading").focus();
        }
        else{    
              document.getElementById('showMain').style.display="block";   
            }
        },function(error) { console.log(error);});

      app.receivedEvent('deviceready');
      app.triggleButton();

      },
      receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelectorAll('.received');

        // listeningElement.setAttribute('style', 'display:none;');
        for( var i = 0 , j = receivedElement.length ; i < j ; i++ ){
          receivedElement[i].setAttribute('style', 'display:block;');
        }
        /*receivedElement.setAttribute('style', 'display:block;');*/
        console.log('Received Event: ' + id);
        sendHTTP();
        getNumValue();
        // reckon();
      },
      triggleButton:function(){
        cordova.require("coocaa-plugin-coocaaosapi.coocaaosapi");
        document.getElementById("loading").addEventListener("click",experienceonclick ,false);        
      }
    };

    app.initialize();

function experienceonclick(){
  coocaaosapi.startUserSettingAndFinish(function(message)  {console.log(message); },function(error){console.log(error);});
  coocaaosapi.addUserChanggedListener(function(message){
    document.getElementById('showMain').style.display="block";
    document.getElementById('goLoad').style.display="none";
    sendHTTP();
    getNumValue();
  });
}

function sendHTTP() {      //http请求，获取到当前登录用户的成长值
  coocaaosapi.getUserInfo(function(message) { //获取用户信息，取得用户头像
    external = JSON.parse(message.external_info);
    // if ("face" in external[0]) {          //酷开账号登陆的情况下没有face
    //   console.log("your account has face");
    //   face = external[0].face;
    // };
    avatar = message.avatar;  //qq登陆的情况下
    console.log("userInfo:"+JSON.stringify(message));
    console.log("url:"+avatar);
    console.log("face:"+face);
    if (avatar != undefined && avatar != "") {
      document.getElementById("headImg").src=avatar;
    }
    else {
      face = external[0].face;
      console.log("face:"+face);
      document.getElementById("headImg").src=face;
    }
  },function(error) { console.log(error);});

  coocaaosapi.getUserAccessToken(function(message) {
    accesstoken = message.accesstoken;
    console.log("usertoken " + accesstoken);
    $.ajax({     
      type: "GET",
      async: true,
      url: "https://member.coocaa.com/jsonp/api/user-grade-info",
      data: {accessToken:accesstoken},
      dataType:"jsonp",
      jsonp:"callback",
      jsonpCallback: "receive",
      success: function(data){
      },
      error: function(){ 
        console.log("error"); 
      } 
    });
  },function(error) { console.log(error);});
  
}

function getNumValue(){    //http请求，获取各个不同项目的积分增加值
  $.ajax({     
    type: "GET",
    async: true,
    url: "https://member.coocaa.com/jsonp/api/grade-config",
    data: {},
    dataType:"jsonp",
    jsonp:"callback",
    jsonpCallback: "showValue",
    success: function(data){
    },
    error: function(){ 
      console.log("error"); 
    } 
  });
}

function showValue(data){         //显示不同项目的积分值，后台可配置
  console.log("#####showValue####");
  var down = data.data.APP_DOWNLOAD_INSTALL.points;
  var firstLogin = data.data.FIRST_LOGIN.points;
  var openApp = data.data.OPERATION_OPEN.points;
  var signUp = data.data.SIGN_UP.points;
  var update = data.data.SYSTEM_UPDATE.points;
  var viewMovie = data.data.VIEW_MOVIE.points;
  console.log("down=="+down+"firstLogin=="+firstLogin+"openApp=="+openApp+"signUp=="+signUp+"update=="+update+"viewMovie=="+viewMovie);
  document.getElementById("APP_DOWNLOAD_INSTALL").innerHTML="+"+down;
  document.getElementById("FIRST_LOGIN").innerHTML="+"+firstLogin;
  document.getElementById("OPERATION_OPEN").innerHTML="+"+openApp;
  document.getElementById("SIGN_UP").innerHTML="+"+signUp;
  document.getElementById("SYSTEM_UPDATE").innerHTML="+"+update;
  document.getElementById("VIEW_MOVIE").innerHTML="+"+viewMovie;
}

function receive(data) {        //http返回结果
  console.log("********callback*********");
  console.log(JSON.stringify(data));
  rank = data.data.levelEntity.gradeLevel;
  numericalValue = data.data.grades[0].points;
  // rank = 5;
  // numericalValue = 4700;
  console.log("rank=="+rank+"numericalValue=="+numericalValue);
  reckon();
}


function hh(){
  i += Math.floor(numericalValue/10);
  console.log("输入的I:"+i);
  if (i<numericalValue) {document.getElementById('lowvalue').innerHTML=i;}
  else{
      document.getElementById('lowvalue').innerHTML=numericalValue;
      clearInterval(interval)};           
}
function reckon(){         //通过获取到的积分值及等级，对不同的效果做出显示
  // i=Math.floor(numericalValue/1000);
  interval = setInterval(hh,200);
  // document.getElementById('lowvalue').innerHTML=numericalValue;
  document.getElementById('nameCount').innerHTML=rank;
  console.log(rank);
  if (rank<4) {
    document.getElementById('main1').style.display="block";
    document.getElementById("main2").style.display="none";
  }
  else{
    document.getElementById('main2').style.display="block";
    document.getElementById("main1").style.display="none";
    document.getElementById("levelstar2-11").innerHTML="Lv"+(rank-2);
    document.getElementById("levelstar2-22").innerHTML="Lv"+(rank-1);
    document.getElementById("levelstar2-33").innerHTML="Lv"+rank;
    document.getElementById("levelstar2-44").innerHTML="Lv"+(rank+1);
    document.getElementById("levelstar2-55").innerHTML="Lv"+(rank+2);
    document.getElementById("levelstar2-66").innerHTML="Lv"+(rank+3);
    document.getElementById("levelstar2-111").innerHTML=((rank-2)*(rank-2)+4*(rank-2)-5)*100;
    document.getElementById("levelstar2-222").innerHTML=((rank-1)*(rank-1)+4*(rank-1)-5)*100;
    document.getElementById("levelstar2-333").innerHTML=(rank*rank+4*rank-5)*100;
    document.getElementById("levelstar2-444").innerHTML=((rank+1)*(rank+1)+4*(rank+1)-5)*100;
    document.getElementById("levelstar2-555").innerHTML=((rank+2)*(rank+2)+4*(rank+2)-5)*100;
    document.getElementById("levelstar2-666").innerHTML=((rank+3)*(rank+3)+4*(rank+3)-5)*100;
  }
  showStar();
}

function showStar(){         //根据等级，计算出徽章的数量，以及等级进度条的位置
  var starDiv = document.getElementById("star"); //徽章div
  var Gold = null;//金牌数量
  var Argentum = null;//银牌数量
  var Cuprum = null;//铜牌数量
  var sum = null;//徽章总数
  Gold = parseInt(rank/16);
  Argentum = parseInt((rank%16)/4);
  Cuprum = (rank%16)%4;
  sum = Gold + Argentum + Cuprum;
  console.log("金牌：" + Gold +"银牌：" + Argentum +"铜牌：" + Cuprum + "总数：" + sum);
  for (var i = 0; i < Gold; i++) {
    var img = document.createElement("img");
    img.setAttribute("src",app.rel_html_imgpath(__uri("../img/jin.png")));
    starDiv.appendChild(img);
  }
  for (var i = 0; i < Argentum; i++) {
    var img = document.createElement("img");
    img.setAttribute("src",app.rel_html_imgpath(__uri("../img/yin.png")));
    starDiv.appendChild(img);
  }
  for (var i = 0; i < Cuprum; i++) {
    var img = document.createElement("img");
    img.setAttribute("src",app.rel_html_imgpath(__uri("../img/tong.png")));
    starDiv.appendChild(img);
  }
  if (rank>3) {
    console.log("startChangeTheWidthOfRank----------");
    var beforeV = (rank*rank+4*rank-5)*100;//当前等级的经验值
    var afterV = ((rank+1)*(rank+1)+4*(rank+1)-5)*100;//当前等级后一级的经验值
    var width = ((numericalValue - beforeV) / (afterV - beforeV))*14.6;//等级大于3的情况下进度长度
    var width2 = ((numericalValue - beforeV) / (afterV - beforeV))*10.6;
    var planeWidth = 35+width2;
    console.log("beforeV:"+beforeV+"afterV:"+afterV+"width:"+width);
    // document.getElementById("level2-3").style.width = width+"%";
    $("#level2-1").animate({width:"15.81%"},700,function(){$("#level2-2").animate({width:"14.18%"},1000,function(){$("#level2-3").animate({width:width+"%"},500);});});
    $("#plane").animate({left:planeWidth+"%"},2300,function(){$("#planerand").addClass("addw").addClass("add");});
  }else{
    if (rank==1) {
      document.getElementById("level2").style.width ="0%";
      document.getElementById("level3").style.width ="0%";
      var width = ((numericalValue) / (700))*9.5;
      var width2 = ((numericalValue) / (700))*6;
      var planeWidth = 9.5+width2;
      // document.getElementById("level1").style.width =width+"%";
      $("#level1").animate({width:width+"%"},1000);
      $("#plane").animate({left:planeWidth+"%"},1000,function(){$("#planerand").addClass("addw").addClass("add");});
    }
    else if(rank==2){
      // document.getElementById("level1").style.width ="9.5%";
      document.getElementById("level3").style.width ="0%";
      var width = ((numericalValue - 700) / (1600 - 700))*15;
      var width2 = ((numericalValue - 700) / (1600 - 700))*10.5;
      console.log("width:"+width);
      var planeWidth = 19.5+width2;
      // document.getElementById("level2").style.width =width+"%";
      $("#level1").animate({width:"9.5%"},1150,function(){$("#level2").animate({width:width+"%"},1150);});
      $("#plane").animate({left:planeWidth+"%"},2300,function(){$("#planerand").addClass("addw").addClass("add");});
    }
    else if(rank==3){
      // document.getElementById("level1").style.width ="9.5%";
      // document.getElementById("level2").style.width ="15%";
      var width = ((numericalValue - 1600) / (2700 - 1600))*15.6;
      var width2 = ((numericalValue - 1600) / (2700 - 1600))*11.6;
      var planeWidth = 33.5+width2;
      // document.getElementById("level3").style.width =width+"%";
      $("#level1").animate({width:"9.5%"},700,function(){$("#level2").animate({width:"15%"},800,function(){$("#level3").animate({width:width+"%"},600);});});
      $("#plane").animate({left:planeWidth+"%"},2300,function(){$("#planerand").addClass("addw").addClass("add");});
    }
  }
}

function showplane(){
  $("#planeinfo").style.display="block";
}