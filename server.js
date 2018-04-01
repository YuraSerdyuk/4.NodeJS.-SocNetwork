var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var app = express();


//ПІДКЛЮЧИВ BODY-PARSER (МОЖЕ ПЕРЕГЛЯДАТИ ВВЕДЕНІ ДАННІ В ПОЛЕ ДЛЯ ВВОДУ)
var urlencodedParser = bodyParser.urlencoded({ extended: false });


//СТВОРИВ З'ЄДНАННЯ З СЕРВЕРОМ MYSQL
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mydatabase'
});


//ПІДКЛЮЧИВ HTML РОЗМІТКУ
app.set('view engine', 'ejs');


//БЕРЕ З ВВЕДЕНИХ ПОЛІВ ТЕКСТ ТА ЗАВОДИТЬ ЇХ В ЗМІННУ
app.get('/registration', urlencodedParser, function(req, res) { 
    res.render('registration');
    console.log('зайшло в GET submitRegist');
});

app.post('/index', urlencodedParser, function(req, res) {
    if (req.body.submitLogin) { //заходить сюда при нажатті кнопки вхід
        var warningUsers = "";
        
        console.log('зайшло в submitLogin');

        var email = req.body.email;
        var password = req.body.password;
    
        if (req.body.email === '' || req.body.password === '') {
            console.log('Поля для введення пусті');
            var warningUsers = "Поля для введення пусті";
            res.render('index', {warningUsers: warningUsers});
        } else {
            console.log('Користувач ввів: ', req.body);
    
    
            //ДОДАЄ ДО БД НОВУ ТАБЛИЦЮ
            //var new_users = {login: email, password: password};
            //var sql = 'INSERT INTO new_users SET ?';
            //var query = connection.query(sql, new_users, (err, result) => {});
    
            connection.query("SELECT * FROM new_users", function(error, rows, fields) {
                console.log('Таблиця загружена з POST');
                console.log(rows);
                for (var i = 0, length = rows.length; i < length; i++) {
                    if (rows[i].login === email && rows[i].password === password) {
                        console.log('Такий користувач знайдений: ', rows[i]);
                        res.redirect('/examp');
                    } else if (rows[i].login === email && rows[i].password != password) {
                        console.log('Неправельний пароль: ', rows[i]);
                        var warningUsers = "Неправельний пароль";
                        res.render('index', {warningUsers: warningUsers});
                    } else {
                        var warningUsers = "Такого користувача не знайдено. Зареєструйтесь!";
                        //console.log('Такого користувача не знайдено');
                        //var warningUsers = "Такого користувача не знайдено";
                        //res.render('index', {warningUsers: warningUsers});
                        //ЗАПИТАТИСЯ В МАРКІЯНА ЯК ВИВЕСТИ ОДНЕ ЕЛСЕ А НЕ КІЛЬКА 
                    }
                }
    
            });
        }
        
    } else if (req.body.submitRegist) { //заходить сюда при реєстрації  
        
            
            console.log('зайшло в submitRegist');
            var firstName = req.body.firstName;
            var lastName = req.body.lastName;
            var emailRegist = req.body.emailRegist;
            var passwordRegist = req.body.passwordRegist;
            var againPasswordRegistr = req.body.againPasswordRegistr;

            if (req.body.firstName === '' || req.body.lastName === '' || req.body.emailRegist === '' || req.body.passwordRegist === '' || req.body.againPasswordRegistr === '') {
                console.log('Поля для введення пусті');
            } else {
                console.log('Користувач ввів тут: ', req.body);
            }
            res.redirect('/registration');
    } 
    
});




//СТВОРЮЄ ТА ВИВОДИТЬ ВСЮ ТАБЛИЦЮ З PHPMYADMINE
app.get('/index', function(req, res) {
    var warningUsers = "";
    res.render('index', {warningUsers: warningUsers});

    //var users = {login: 'users2', password: '1234'};
    //var sql = 'INSERT INTO new_users SET ?';
    //var query = connection.query(sql, users, (err, result) => {});
    
    //connection.query("SELECT * FROM new_users", function(error, rows, fields) {
    //    console.log('Таблиця загружена з GET');
    //    console.log(rows);
    //});
});



//ВСІ СТАТИЧНІ ОБ'ЄКТИ ПОМІЩЕННІ В ПАПКУ /PUBLIC В ДАННОМУ ВИПАДКУ ЦЕ CSS
app.use(express.static(__dirname + '/public'));

//СТВОРЕНИЙ ПОСТ 3000 ЗА ЯКИМ МОЖНА ПЕРЕГЛЯДАТИ СТОРІНКУ 
app.listen(3000);