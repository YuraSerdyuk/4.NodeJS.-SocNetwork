var express = require('express');
var http = require('http');
var app = express();

var mysql = require('mysql');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mailer = require('nodemailer');
var multer = require('multer');

var server = http.Server(app);
var io = require('socket.io')(server);

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept-Type');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
})

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/img');
    }, 
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

var upload = multer({storage: storage});

//ЗВ`ЯЗУЄТЬСЯ З СТОРІНКОЮ page.js І ЕКСПОРТУЄ ВСІ ЗМІННІ З ЦІЄЇ СТОРІНКИ В page.js
var config = {
    app: app,
    mysql: mysql,
    cookieParser: cookieParser,
    bodyParser: bodyParser,
    session: session,
    connection: connection,
    mailer: mailer,
    multer: multer,
    upload: upload
}
var page = require('./page');

page(config);

//ПІДКЛЮЧИВ BODY-PARSER (МОЖЕ ПЕРЕГЛЯДАТИ ВВЕДЕНІ ДАННІ В ПОЛЕ ДЛЯ ВВОДУ)
var urlencodedParser = bodyParser.urlencoded({ extended: false });

//ВСІ СТАТИЧНІ ОБ'ЄКТИ ПОМІЩЕННІ В ПАПКУ /PUBLIC В ДАННОМУ ВИПАДКУ ЦЕ CSS
app.use(express.static(__dirname + '/public'));


//СТВОРИВ З'ЄДНАННЯ З СЕРВЕРОМ MYSQL
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mydatabase'
});


//ПІДКЛЮЧИВ HTML РОЗМІТКУ
app.set('view engine', 'ejs');


//ЗАХОДИТЬ СЮДА ПО ДЕФОЛТУ ЯК ГРУЗИТЬСЯ СТОРІНКА
app.get('/registration', urlencodedParser, function(req, res) {
    var warningUsers = "";
    var warningUsers_password = "";
    var warningUsers_email = "";
    var warningUsers_error = "";

    res.render('registration', {warningUsers: warningUsers,
                       warningUsers_password: warningUsers_password,
                          warningUsers_email: warningUsers_email,
                          warningUsers_error: warningUsers_error});
    console.log('зайшло в GET submitRegist'); 
    
});

//ЗАХОДИТЬ СЮДА ПРИ БУДЬ ЯКОЮ ДІЄЮ З ФОРМОЮ В ЯКІЙ Є МЕТОД В ДАННОМУ ВИПАДКУ ЦЕ МЕТОД POST І ACTION /REGISTRATION
app.post('/registration', urlencodedParser, function(req, res) {
    if (req.body.signUp) {
        var warningUsers = "";
        var warningUsers_password = "";
        var warningUsers_email = "";
        var warningUsers_error = "";
        console.log('зайшло в POST submitRegist'); 

        var firstName = req.body.firstName;
        var lastName = req.body.lastName;
        var emailRegist = req.body.emailRegist;
        var passwordRegist = req.body.passwordRegist;
        var againPasswordRegistr = req.body.againPasswordRegistr;

        if (req.body.firstName === '' || req.body.lastName === '' || req.body.emailRegist === '' || req.body.passwordRegist === '' || req.body.againPasswordRegistr === '') {
            console.log('Поля для введення пусті');
            var warningUsers = "Поля для введення пусті";
            return res.render('registration', {warningUsers: warningUsers,
                                      warningUsers_password: warningUsers_password,
                                         warningUsers_email: warningUsers_email,
                                         warningUsers_error: warningUsers_error});

        } else if (req.body.passwordRegist != req.body.againPasswordRegistr) {
            console.log('Паролі не збігаються');
            var warningUsers_password = "Паролі не збігаються";
            res.render('registration', {warningUsers: warningUsers,
                               warningUsers_password: warningUsers_password,
                                  warningUsers_email: warningUsers_email,
                                  warningUsers_error: warningUsers_error});

        } else if (req.body.passwordRegist.length < 4) {
            console.log('Малий пароль!');
            var warningUsers_password = "Малий пароль!";
            res.render('registration', {warningUsers: warningUsers,
                               warningUsers_password: warningUsers_password,
                                  warningUsers_email: warningUsers_email,
                                  warningUsers_error: warningUsers_error});

        } else {
            console.log('Користувач ввів: ', req.body);
            
            connection.query("SELECT * FROM new_users WHERE login='" + emailRegist + "'", function(error, rows, fields) { // WHERE email='" + email + "'  ----написати це після new_users щоб воно перевіряло тільки введені користувачем данні
                if (rows == 0) { //тобто якщо введеного логіна не знайдено в базі тоді реєструвати нового користувача

                    //ДОДАЄ ДО БД НОВУ ТАБЛИЦЮ(СТРУКТУРУ)
                    var new_users = {login: emailRegist, password: passwordRegist, firstName: firstName, lastName: lastName, birth_day: "", city: "", status: "", path_to_photo: "/\img/\ava.jpg"};
                    var sql = 'INSERT INTO new_users SET ?';
                    var query = connection.query(sql, new_users, (err, result) => {
                        if (err) {
                            console.log(err);
                            var warningUsers_error = err;
                            res.render('registration', {warningUsers: warningUsers,
                                               warningUsers_password: warningUsers_password,
                                                  warningUsers_email: warningUsers_email,
                                                  warningUsers_error: warningUsers_error});
                        } else if (result) {
                            res.redirect('/login');
                        }
                    });   
                
                } else {
                    console.log('Такий користувач вже зареєстрований: ', rows);
                    var warningUsers_email = "Такий користувач вже зареєстрований!";
                    res.render('registration', {warningUsers: warningUsers,
                                       warningUsers_password: warningUsers_password,
                                          warningUsers_email: warningUsers_email,
                                          warningUsers_error: warningUsers_error});
                }

            });

        }

    } else if (req.body.signIn) {
        res.redirect('/login');
    }
});

app.post('/login', urlencodedParser, function(req, res) {
    if (req.body.submitLogin) { //заходить сюда при нажатті кнопки вхід
        var warningUsers = "";

        var email = req.body.email;
        var password = req.body.password;
    
        if (req.body.email === '' || req.body.password === '') {
            console.log('Поля для введення пусті');
            var warningUsers = "Поля для введення пусті.";
            res.render('login', {warningUsers: warningUsers});
        } else {
            console.log('Користувач ввів: ', req.body);
            


            connection.query("SELECT * FROM new_users WHERE login='" + email + "'", function(error, rows, fields) { // WHERE email='" + email + "'  ----написати це після new_users щоб воно перевіряло тільки введені користувачем данні
                //console.log(rows);
                if (rows == 0) {
                    console.log('Такого користувача не знайдено');
                    var warningUsers = "Такого користувача не знайдено.";
                    res.render('login', {warningUsers: warningUsers});
                } else {
                    for (var i = 0, length = rows.length; i < length; i++) {
                        if (rows[i].login === email && rows[i].password === password) {
                            console.log('Такий користувач знайдений: ', rows)
                            
                            var number_id = rows[i].id; //тримає тут айді зайшовшого користувача з url
                            var session = req.cookies['connect.sid'];

                            connection.query("SELECT * FROM session WHERE number_session='" + session + "'", function(error, rows, fields) {
                                //console.log(rows[0]); //undefined
                                if (rows[0] == undefined) {
                                    var session = {number_session: req.cookies['connect.sid'], id_user: number_id};
                                    var sql = 'INSERT INTO session SET ?';
                                    var query = connection.query(sql, session, (err, result) => {
                                        if (err) {
                                            console.log(err);
                                        }
                                    });
                                }
                            });

                            //console.log('ось кукі: ', req.cookies);
                            //console.log('ось сесія: ', req.session);
                            res.redirect('/account?' + rows[i].id);
                        } else if (rows[i].login === email && rows[i].password != password) {
                            console.log('Неправильний пароль: ', rows[i]);
                            var warningUsers = "Неправильний пароль.";
                            res.render('login', {warningUsers: warningUsers});
                        }
                    }
                }
                
    
            });
            
        }
        
    } else if (req.body.submitRegist) { //заходить сюда при реєстрації  
        res.redirect('/registration');
    } 
    
});


app.get('/login', function(req, res) {
    req.session.destroy();
    res.clearCookie('connect.sid');

    console.log('рандомна сесія з входу: ', req.cookies['connect.sid']);
    var warningUsers = "";

    var owner_id = "8";
    var interlocutor = "6";
    res.render('login', {warningUsers: warningUsers});
});


io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('disconnect', function(){
      console.log('user disconnected');
    });
  });



//СТВОРЕНИЙ ПОСТ 3000 ЗА ЯКИМ МОЖНА ПЕРЕГЛЯДАТИ СТОРІНКУ 
app.listen(3000);





































