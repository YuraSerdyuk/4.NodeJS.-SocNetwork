function init(config) {

    //ПІДКЛЮЧИВ BODY-PARSER (МОЖЕ ПЕРЕГЛЯДАТИ ВВЕДЕНІ ДАННІ В ПОЛЕ ДЛЯ ВВОДУ)
    var urlencodedParser = config.bodyParser.urlencoded({ extended: false });

    //СТВОРИВ З'ЄДНАННЯ З СЕРВЕРОМ MYSQL
    var connection = config.mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'mydatabase'
    });

    
    config.app.use(config.cookieParser());
    config.app.use(config.session({
        secret: 'keyboard cat',
        resave: true,
        saveUninitialized: true
    }));
    
    

    config.app.get('/account', urlencodedParser, function(req, res) {
        //console.log('ось кукі з акк: ', req.cookies['connect.sid']);
        //console.log('ось сесія з акк: ', req.session);
        
        var number_id = req.url.match(/\d+$/ig); //тримає тут айді зайшовшого користувача з url
        var session = req.cookies['connect.sid'];

        connection.query("SELECT * FROM session WHERE number_session='" + session + "'", function(error, rows, fields) {
            var owner = rows[0].id_user;
            var number_id2 = owner;
            if (number_id2 != number_id) {
                console.log("чужа сторінка бо його " + number_id + ", а мій " + owner);
            }

            connection.query("SELECT * FROM new_users WHERE id='" + number_id + "'", function(error, rows, fields) {
                //console.log(rows);
                var firstName = rows[0].firstName;
                var lastName = rows[0].lastName;
                var birth_day = rows[0].birth_day;
                var city = rows[0].city;
                var status = rows[0].status;
                var id = rows[0].id;
                var path_to_photo = rows[0].path_to_photo;

                connection.query("SELECT * FROM friends WHERE id_user='" + owner + "' AND id_friend='" + number_id +"'", function(error, rows, fields) {
                    var rows_in_friends2 = rows
                    connection.query("SELECT * FROM friends WHERE id_user='" + owner + "'", function(error, rows, fields) {
                        if (rows.length == 0) {
                            var length_friend = "Forever Alone";
                        } else {
                            var length_friend = rows.length;
                        }




                        /* var myResponse = {
                            title: 'AJAX text'
                        };
                        console.log("Зайшло в GET");
                    
                        res.send(JSON.stringify(myResponse)); */




                        res.render('account', {id: id,
                                        firstName: firstName,
                                         lastName: lastName,
                                        birth_day: birth_day,
                                             city: city,
                                           status: status,
                                    path_to_photo: path_to_photo,
                                            owner: owner,
                                       number_id2: number_id2,
                                 rows_in_friends2: rows_in_friends2,
                                    length_friend: length_friend,
                                    number_id: number_id});
                    });
                });
            });
        });
    });

    config.app.post('/account', urlencodedParser, function(req, res) {
        var sess = req.cookies['connect.sid'];

        connection.query("SELECT * FROM session WHERE number_session='" + sess + "'", function(error, rows, fields) {
            var owner = rows[0].id_user;
            if (req.body.send_message) {
                res.redirect('/dialogues');
            } else if (req.body.del_to_friend) {
                var number_id0 = req.body.del_to_friend;
                var number_id = number_id0.replace("       Видалити до друзів       ", "");
                console.log(number_id);
                connection.query("DELETE FROM friends WHERE id_user='" + owner + "' AND id_friend='" + number_id + "'", function(error, rows, fields) {
                    if (error) {
                        throw (error);
                    }
                    //console.log(rows);
                    res.redirect('/account?' + number_id); //замість рендеру сторінки воно заново заходить на сторінку(обновляє її)
                });
            } else if (req.body.add_to_friend) {
                var number_id01 = req.body.add_to_friend;
                var number_id2 = number_id01.replace("         Додати до друзів         ", "");
                console.log(number_id2);
                connection.query("SELECT * FROM friends WHERE id_user = '" + owner + "' AND id_friend = '" + number_id2 + "'", function(error, rows, fields) {
                    console.log('Користувач з id ' + number_id2 + ' добавлений в бд');
                    if (rows == 0) {
                        console.log('Користувач з id ' + number_id2 + ' добавлений в бд');
                        var friends = {id_user: owner, id_friend: number_id2};
                        var sql = 'INSERT INTO friends SET ?';
                        var query = connection.query(sql, friends, (err, result) => {
                            if (err) {
                                console.log(err);
                            }
                            res.redirect('/account?' + number_id2);
                        });
                    }
                });
            } else if (req.body.setting) {
                res.redirect('/account_settings_general');
            }
        });
    }); 



    config.app.get('/account_settings_general', urlencodedParser, function(req, res) {
        var birth_day = "";
        var id = "";
        var city = "";
        var status = "";
        var firstName = "";
        var lastName = "";
        var warningUsers = "";
        var sess = req.cookies['connect.sid'];
        //console.log('ось кукі з налаштувань: ', sess);

        connection.query("SELECT * FROM session WHERE number_session='" + sess + "'", function(error, rows, fields) {
            //console.log(rows);
            var id_user = rows[0].id_user;
            connection.query("SELECT * FROM new_users WHERE id='" + id_user + "'", function(error, rows, fields) {
                //console.log(rows);
                var id = rows[0].id;
                var birth_day = rows[0].birth_day;
                var city = rows[0].city;
                var status = rows[0].status;
                var firstName = rows[0].firstName;
                var lastName = rows[0].lastName;

                res.render('account_settings_general', {birth_day: birth_day,
                                                       id: id,
                                                     city: city,
                                                   status: status,
                                                firstName: firstName,
                                                 lastName: lastName,
                                             warningUsers: warningUsers});
            });
        });
    });

    config.app.post('/account_settings_general', urlencodedParser, function(req, res) {
        var sess = req.cookies['connect.sid'];
        connection.query("SELECT * FROM session WHERE number_session='" + sess + "'", function(error, rows, fields) {
            var id_user = rows[0].id_user;

            connection.query("SELECT * FROM new_users WHERE id='" + id_user + "'", function(error, rows, fields) {
                var id = rows[0].id;
                var birth_day = rows[0].birth_day;
                var city = rows[0].city;
                var status = rows[0].status;
                var firstName = rows[0].firstName;
                var lastName = rows[0].lastName;
                var password = rows[0].password;
                var warningUsers = "";

                if (req.body.enter_birth_day) {

                    //ОБНОВЛЯЄ СТРОКУ В БД В [] ТРИМАЮТЬСЯ ДВА ЗНАЧЕННЯ (ПЕРШЕ ЯКЕ ОНОВЛЯЄТЬСЯ, ДРУГЕ ДЕ ОНОВЛЯЄТЬСЯ)
                    var sql = "UPDATE new_users set birth_day =?  WHERE id =?";
                    var query = connection.query(sql, [req.body.setting_birth_day, id_user], function(err, result) {
                        //console.log(id_user);
                    });
                    res.render('account_settings_general', {birth_day: birth_day,
                                                        id: id,
                                                        city: city,
                                                    status: status,
                                                    firstName: firstName,
                                                    lastName: lastName,
                                                    warningUsers: warningUsers});
                } else if (req.body.enter_city) {
                    var sql = "UPDATE new_users set city =?  WHERE id = ?";
                    var query = connection.query(sql, [req.body.setting_city, id_user], function(err, result) {
                        //console.log(result);
                    });
                    res.render('account_settings_general', {birth_day: birth_day,
                                                        id: id,
                                                        city: city,
                                                    status: status,
                                                    firstName: firstName,
                                                    lastName: lastName,
                                                    warningUsers: warningUsers});
                } else if (req.body.enter_status) {
                    var sql = "UPDATE new_users set status =?  WHERE id = ?";
                    var query = connection.query(sql, [req.body.setting_status, id_user], function(err, result) {
                        //console.log(result);
                    });
                    res.render('account_settings_general', {birth_day: birth_day,
                                                            id: id,
                                                        city: city,
                                                    status: status,
                                                    firstName: firstName,
                                                    lastName: lastName,
                                                    warningUsers: warningUsers});
                } else if (req.body.enter_firstName) {
                    var sql = "UPDATE new_users set firstName =?  WHERE id = ?";
                    var query = connection.query(sql, [req.body.setting_firstName, id_user], function(err, result) {
                        //console.log(result);
                    });
                    res.render('account_settings_general', {birth_day: birth_day,
                                                        id: id,
                                                        city: city,
                                                    status: status,
                                                    firstName: firstName,
                                                    lastName: lastName,
                                                    warningUsers: warningUsers});
                } else if (req.body.enter_lastName) {
                    var sql = "UPDATE new_users set lastName =?  WHERE id = ?";
                    var query = connection.query(sql, [req.body.setting_lastName, id_user], function(err, result) {
                        //console.log(result);
                    });
                    res.render('account_settings_general', {birth_day: birth_day,
                                                        id: id,
                                                        city: city,
                                                    status: status,
                                                    firstName: firstName,
                                                    lastName: lastName,
                                                    warningUsers: warningUsers});
                } else if (req.body.enter_newPassword) {
                    if (req.body.setting_oldPassword == password && req.body.setting_newPassword) {
                        var sql = "UPDATE new_users set password =?  WHERE id = ?";
                        var query = connection.query(sql, [req.body.setting_newPassword, id_user], function(err, result) {
                            //console.log(result);
                            //console.log(err);
                        });
                        res.render('account_settings_general', {birth_day: birth_day,
                                                                       id: id,
                                                                     city: city,
                                                                   status: status,
                                                                firstName: firstName,
                                                                 lastName: lastName,
                                                             warningUsers: warningUsers});
                    } else if (req.body.setting_oldPassword !== password) {
                        var warningUsers = "Старий пароль не вірний. Повторіть ще раз.";
                        res.render('account_settings_general', {birth_day: birth_day,
                                                                       id: id,
                                                                     city: city,
                                                                   status: status,
                                                                firstName: firstName,
                                                                 lastName: lastName,
                                                                warningUsers: warningUsers});
                    }
                }
            });
        });   
    });



    config.app.get('/account_settings_mail', urlencodedParser, function(req, res) {
        var sess = req.cookies['connect.sid'];
        connection.query("SELECT * FROM session WHERE number_session='" + sess + "'", function(error, rows, fields) {
            //console.log(rows);
            var id_user = rows[0].id_user;
            var id = id_user;
            connection.query("SELECT * FROM new_users WHERE id='" + id_user + "'", function(error, rows, fields) {
                //console.log(rows);
                var warningUsers = "Введіть свою нову електронну пошту, на вашу пошту прийде підтвердження цієї дії та в подальшому ви зможете заходити під цим логіном на свою сторінку.";
                var warningUsersRed = "";

                var mail = rows[0].login;
                var nickName = mail.split("@", 1)[0];
                var eMail = mail.split("@", 2)[1];
                var half = nickName.length / 2;

                var mail_2 = nickName.substr(half, nickName.length);
                var mail_1 = nickName.substr(0, half);
                var new_mail_2 = mail_2.replace(/./g, "*");
                var readyMail = mail_1 + new_mail_2 + "@" + eMail;

                res.render('account_settings_mail', {readyMail: readyMail,
                                                  warningUsers: warningUsers,
                                               warningUsersRed: warningUsersRed,
                                                            id: id});
            });
        });
    });

    config.app.post('/account_settings_mail', urlencodedParser, function(req, res) {
        var sess = req.cookies['connect.sid'];
        connection.query("SELECT * FROM session WHERE number_session='" + sess + "'", function(error, rows, fields) {
            //console.log(rows);
            var id_user = rows[0].id_user;
            var id = id_user;
            connection.query("SELECT * FROM new_users WHERE id='" + id_user + "'", function(error, rows, fields) {
                var rows_users = rows;
                //console.log(rows_users);

                var mail = rows_users[0].login;
                var nickName = mail.split("@", 1)[0];
                var eMail = mail.split("@", 2)[1];
                var half = nickName.length / 2;

                var mail_2 = nickName.substr(half, nickName.length);
                var mail_1 = nickName.substr(0, half);
                var new_mail_2 = mail_2.replace(/./g, "*");
                var readyMail = mail_1 + new_mail_2 + "@" + eMail;

                var warningUsers = "";
                var warningUsersRed = "";

                connection.query("SELECT * FROM new_users WHERE login='" + req.body.setting_mail + "'", function(error, rows, fields) {
                    //console.log(rows);
                    if (rows != 0 && rows[0].id != id) {
                        console.log("Користувач з такою поштою вже є")
                        var warningUsersRed = "Введена Вами електронна пошта вже зайнята іншим користувачем. Будь ласка спробуйте ще раз!"
                        res.render('account_settings_mail', {readyMail: readyMail,
                                                          warningUsers: warningUsers,
                                                       warningUsersRed: warningUsersRed,
                                                                    id: id});
                    } else {
                        if (rows_users[0].login == req.body.setting_mail) {
                            console.log("та сама ел. адреса")
                            var warningUsersRed = "Ви намагаєтесь змінити Вашу теперішню електронну пошту. Будь ласка спробуйте ще раз!"
                            res.render('account_settings_mail', {readyMail: readyMail,
                                                              warningUsers: warningUsers,
                                                           warningUsersRed: warningUsersRed,
                                                                        id: id});
                        } else {
                            
                            connection.query("SELECT * FROM new_users WHERE id='" + id_user + "'", function(error, rows, fields) {
                                var sql = "UPDATE new_users set login =?  WHERE id = ?";
                                var query = connection.query(sql, [req.body.setting_mail, id_user], function(err, result) {
                                    //console.log(result);
                                    //console.log(err);
                                });
                            });

                            // Use Smtp Protocol to send Email
                            var smtpTransport = config.mailer.createTransport({
                                service: 'gmail',
                                port: 587,
                                secure: false,
                                auth: {
                                    user: "yurko7203@gmail.com",
                                    pass: "11111998"
                                }
                            });
                            
                            var mail = {
                                from: '"Globus services" yurko7203@gmail.com',
                                to: req.body.setting_mail,
                                subject: 'Привязка email до сторінки',
                                html: '<b>Ваш email був успішно прив`язаний</b> <br> <p> З повагою, Адміністатор Globus.</p>'
                            }

                            smtpTransport.sendMail(mail, (error, result) => {
                                if(error){
                                    console.log(error);
                                    var warningUsersRed = "Не визначено електронну пошту, будь ласка перевірьте правильність вводу данних: " + error;
                                } else if (result) {
                                    //console.log(result);
                                    var warningUsers = "На вашу нову електронну пошту прийшло повідомлення про зміну електронної пошти."
                                }
                                res.render('account_settings_mail', {readyMail: readyMail,
                                    warningUsers: warningUsers,
                                    warningUsersRed: warningUsersRed,
                                                                            id: id});
                            });
                        
                        }
                    }
                });
            });
        });
    });
    

    
    config.app.get('/account_settings_photo', urlencodedParser, function(req, res) {
        var sess = req.cookies['connect.sid'];
        connection.query("SELECT * FROM session WHERE number_session='" + sess + "'", function(error, rows, fields) {
            //console.log(rows);
            var id_user = rows[0].id_user;
            var id = id_user;
            connection.query("SELECT * FROM new_users WHERE id='" + id_user + "'", function(error, rows, fields) {
                /* var sql = "UPDATE new_users set path_to_photo =?  WHERE id =?";
                var query = connection.query(sql, [req.body.setting_birth_day, id_user], function(err, result) {
                    console.log(id_user);
                }); */
                res.render('account_settings_photo', {id: id});
            });
        });
    });

    config.app.post('/account_settings_photo', config.upload.single('image'), urlencodedParser, function(req, res) {
        var sess = req.cookies['connect.sid'];
        connection.query("SELECT * FROM session WHERE number_session='" + sess + "'", function(error, rows, fields) {
            //console.log(rows);
            var id_user = rows[0].id_user;
            var id = id_user;
            connection.query("SELECT * FROM new_users WHERE id='" + id_user + "'", function(error, rows, fields) {
                console.log(req.file.path);
                var path0 = req.file.path;
                var path = path0.replace(/public/, "")
                //console.log(path); 
                var sql = "UPDATE new_users set path_to_photo =?  WHERE id =?";
                var query = connection.query(sql, [path, id_user], function(err, result) {
                    //console.log();
                });
                res.render('account_settings_photo', {id: id});
            });
        });
    });



    config.app.get('/all_friends', urlencodedParser, function(req, res) {
        var sess = req.cookies['connect.sid'];
        connection.query("SELECT * FROM session WHERE number_session='" + sess + "'", function(error, rows, fields) {
            var id_user = rows[0].id_user;
            var id = id_user;

            connection.query("SELECT * FROM new_users", function(error, rows, fields) {
                //console.log(rows.length);
                var rows_in_users = rows;
                for (var i = 0; i < rows_in_users.length; i++) {
                    var result = rows_in_users[i].login;
                    var firstName = rows_in_users[i].firstName;
                    var lastName = rows_in_users[i].lastName;
                    var path_to_photo = rows_in_users[i].path_to_photo;
                    //console.log(firstName);
                }
                connection.query("SELECT * FROM friends WHERE id_user = '" + id + "'", function(error, rows, fields) {
                    //console.log(rows[1].id_friend);
                    var rows_in_friends = rows;
                    res.render('all_friends', {rows_in_users: rows_in_users,
                                             rows_in_friends: rows_in_friends,
                                                   firstName: firstName,
                                                    lastName: lastName,
                                               path_to_photo: path_to_photo,
                                                          id: id});
                });
            });
        });
    });

    config.app.post('/all_friends', urlencodedParser, function(req, res) {
        var sess = req.cookies['connect.sid'];
        connection.query("SELECT * FROM session WHERE number_session='" + sess + "'", function(error, rows, fields) {
            var id_user = rows[0].id_user;
            var id = id_user;
            connection.query("SELECT * FROM new_users", function(error, rows, fields) {
                //console.log(rows);
                var rows_in_users = rows;

                for (var i = 0; i < rows.length; i++) {
                var result = rows[i].login;
                var firstName = rows[i].firstName;
                var lastName = rows[i].lastName;
                var path_to_photo = rows[i].path_to_photo;
                }

                var name_submit = req.body.add;
                var id_submit = name_submit.replace("     Долучити до друзів     ", "");
                console.log(id_submit);

                connection.query("SELECT * FROM friends WHERE id_user = '" + id + "' AND id_friend = '" + id_submit + "'", function(error, rows, fields) { //так тоже можна писати але що зв'язано з таблицею обводити в `` такі скобки а все що не з таблицею ''
                    if (rows == 0) {
                        console.log('Користувач з id ' + id_submit + ' добавлений в бд');
                        var friends = {id_user: id, id_friend: id_submit};
                        var sql = 'INSERT INTO friends SET ?';
                        var query = connection.query(sql, friends, (err, result) => {
                            if (err) {
                                console.log(err);
                            }
                            
                        });
                        connection.query("SELECT * FROM friends WHERE id_user = '" + id + "'", function(error, rows, fields) {
                            var rows_in_friends = rows;
                            res.render('all_friends', {rows_in_users: rows_in_users,
                                                     rows_in_friends: rows_in_friends,
                                                           firstName: firstName,
                                                            lastName: lastName,
                                                       path_to_photo: path_to_photo,
                                                                  id: id});
                        });
                    }
                });
            });
        });
    });



    config.app.get('/my_friends', urlencodedParser, function(req, res) {
        var sess = req.cookies['connect.sid'];
        connection.query("SELECT * FROM session WHERE number_session='" + sess + "'", function(error, rows, fields) {
            var id_user = rows[0].id_user;
            var id = id_user;
            connection.query("SELECT * FROM new_users", function(error, rows, fields) {
                var rows_in_users = rows;
                for (var k = 0; k < rows_in_users.length; k++) {
                    var result = rows_in_users[k].login;
                    var firstName = rows_in_users[k].firstName;
                    var lastName = rows_in_users[k].lastName;
                    var path_to_photo = rows_in_users[k].path_to_photo;
                }
                connection.query("SELECT * FROM friends WHERE id_user='" + id + "'", function(error, rows, fields) {
                    var rows_in_myFriends = rows;
                    if (rows_in_myFriends == 0) {
                        res.render('my_friends', {id: id,
                                       rows_in_users: rows_in_users,
                                   rows_in_myFriends: rows_in_myFriends,
                                       path_to_photo: path_to_photo,
                                           firstName: firstName,
                                            lastName: lastName});
                    } else {
                        res.render('my_friends', {id: id,
                                       rows_in_users: rows_in_users,
                                   rows_in_myFriends: rows_in_myFriends,
                                       path_to_photo: path_to_photo,
                                           firstName: firstName,
                                            lastName: lastName});
                    }
                });
            });
        });
    });

    config.app.post('/my_friends', urlencodedParser, function(req, res) {
        var sess = req.cookies['connect.sid'];
        connection.query("SELECT * FROM session WHERE number_session='" + sess + "'", function(error, rows, fields) {
            var id_user = rows[0].id_user;
            var id = id_user;
            connection.query("SELECT * FROM new_users", function(error, rows, fields) {
                var rows_in_users = rows;
                for (var k = 0; k < rows_in_users.length; k++) {
                    var result = rows_in_users[k].login;
                    var firstName = rows_in_users[k].firstName;
                    var lastName = rows_in_users[k].lastName;
                    var path_to_photo = rows_in_users[k].path_to_photo;
                }
                connection.query("SELECT * FROM friends WHERE id_user='" + id + "'", function(error, rows, fields) {
                    var rows_in_myFriends = rows;
                    if (rows_in_myFriends == 0) {
                        res.render('my_friends', {id: id,
                                       rows_in_users: rows_in_users,
                                   rows_in_myFriends: rows_in_myFriends,
                                       path_to_photo: path_to_photo,
                                           firstName: firstName,
                                            lastName: lastName});
                    } else {
                        var name_submit = req.body.add;
                        var id_submit = name_submit.replace("         Видалити з друзів              ", "");
                        //console.log(id_submit);

                        connection.query("DELETE FROM friends WHERE id_user='" + id + "' AND id_friend='" + id_submit + "'", function(error, rows, fields) {
                            res.redirect('/my_friends'); //замість рендеру сторінки воно заново заходить на сторінку(обновляє її)
                        });
                    }
                });
            });
        });
    });



    config.app.get('/dialogues', urlencodedParser, function(req, res) {
        var sess = req.cookies['connect.sid'];
        connection.query("SELECT * FROM session WHERE number_session='" + sess + "'", function(error, rows, fields) {
            var owner = rows[0].id_user;
            connection.query("SELECT * FROM dialogues WHERE owner='" + owner + "' OR interlocutor='" + owner + "' ORDER BY time_last_message DESC", function(error, rows, fields) {
                var rows_dialogue = rows;
                //console.log(rows_dialogue);
                connection.query("SELECT * FROM new_users", function(error, rows, fields) {
                    var rows_users = rows;
                    connection.query("SELECT * FROM new_users WHERE id='" + owner + "'", function(error, rows, fields) {
                        var path_to_photo_owner = rows[0].path_to_photo;
                        
                        res.render('dialogues', {rows_dialogue: rows_dialogue,
                                                    rows_users: rows_users,
                                           path_to_photo_owner: path_to_photo_owner,
                                                         owner: owner});
                    });

                });
            });
        });
    });

    config.app.post('dialogues', urlencodedParser, function(req, res) {
        res.render('dialogues');
    });



    config.app.get('/new_dialogues', urlencodedParser, function(req, res) {
        var sess = req.cookies['connect.sid'];
        connection.query("SELECT * FROM session WHERE number_session='" + sess + "'", function(error, rows, fields) {
            var owner = rows[0].id_user;
            connection.query("SELECT * FROM friends WHERE id_user='" + owner + "'", function(error, rows, fields) {
                var rows_friend = rows;
                    connection.query("SELECT * FROM new_users", function(error, rows, fields) {
                        var rows_users = rows;
                        res.render('new_dialogues', {rows_friend: rows_friend,
                                                      rows_users: rows_users,
                                                           owner: owner});
                    });
            });
        });
                
    });

    config.app.post('/new_dialogues', urlencodedParser, function(req, res) {
        res.render('new_dialogues');
    });



    config.app.get('/message', urlencodedParser, function(req, res) {
        var interlocutor = req.url.match(/\d+$/ig);
        //console.log(interlocutor);
        var friend_id = "6"; // тут буде айді бесіди друга
        var sess = req.cookies['connect.sid'];

        connection.query("SELECT * FROM session WHERE number_session='" + sess + "'", function(error, rows, fields) {
            var owner_id = rows[0].id_user;
            //console.log(owner_id);

            connection.query("SELECT * FROM dialogues WHERE owner='" + owner_id + "' AND interlocutor ='" + interlocutor + "'", function(error, rows, fields) {
                var rows_dialogues = rows;

                connection.query("SELECT * FROM new_users", function(error, rows, fields) {
                    var rows_friend = rows;
                    for (var i = 0; i < rows_friend.length; i++) {
                        if (rows_friend[i].id == interlocutor) {
                            var friend0 = rows_friend[i].login;
                            var friend = friend0.split("@")[0];
                            //console.log();
                        } else if (rows_friend[i].id == owner_id) {
                            var path_to_photo_owner = rows_friend[i].path_to_photo;
                            var owner0 = rows_friend[i].login;
                            var owner = owner0.split("@")[0];
                            //console.log();
                        }
                    }
                        
                    var total_name = friend + "-" + owner;
                    var total_name2 = owner + "-" + friend;
                    //console.log(total_name);

                    connection.query("SELECT * FROM messages WHERE name='" + total_name + "' OR name='" + total_name2 + "' ORDER BY time DESC", function(error, rows, fields) {
                        var rows_friend_owner = rows;
                        //console.log(rows_friend_owner);
                        for (var i = 0; i < rows_friend_owner.length; i++) {
                            var time = rows_friend_owner[i].time;
                            var text = rows_friend_owner[i].message; 
                            //console.log(text);
                        }
                        var date = new Date();

                        var Date0 = date.getDate();
                        if (Date0 < 10) Date0 = '0' + Date0
                        //console.log(Date0);

                        var Month = date.getMonth() + 1;
                        if (Month < 10) Month = '0' + Month
                        //console.log(Month);

                        var Date2 = date.getFullYear() + '-' + Month + '-' + Date0

                        
                        
                        res.render('message', {path_to_photo_owner: path_to_photo_owner,
                                                 rows_friend_owner: rows_friend_owner,
                                                       rows_friend: rows_friend,
                                                          owner_id: owner_id,
                                                      interlocutor: interlocutor,
                                                              date: date,
                                                             Date2: Date2,
                                                             Date0: Date0});
                        /* var last_number_msg = rows_friend_owner.length;
                        var timerId = setInterval(function() {
                            
                            connection.query("SELECT * FROM messages WHERE name='" + total_name + "' OR name='" + total_name2 + "' ORDER BY time DESC", function(error, rows, fields) {
                                
                                var rows_interval_new_messages = rows;
                                var number_msg = rows_interval_new_messages.length;
                                if (number_msg != last_number_msg) {
                                    console.log("Добавилось ще одне повідомлення!");  
                                }
                                
                            });

                        }, 2000); */
                    });
                });
            });
        });
    });
    
    config.app.post('/message', urlencodedParser, function(req, res) {
        var interlocutor0 = req.body.send_button;
        var interlocutor = interlocutor0.replace("           ", "");
        console.log(interlocutor);
        var sess = req.cookies['connect.sid'];

        connection.query("SELECT * FROM session WHERE number_session='" + sess + "'", function(error, rows, fields) {
            var owner_id = rows[0].id_user;
            //console.log(owner_id);

            connection.query("SELECT * FROM new_users", function(error, rows, fields) {
                var rows_friend = rows;
                for (var i = 0; i < rows_friend.length; i++) {
                    if (rows_friend[i].id == interlocutor) {
                        var friend0 = rows_friend[i].login;
                        var friend = friend0.split("@")[0];
                        //console.log();
                    } else if (rows_friend[i].id == owner_id) {
                        var path_to_photo_owner = rows_friend[i].path_to_photo;
                        var owner0 = rows_friend[i].login;
                        var owner = owner0.split("@")[0];
                        //console.log();
                    }
                }
                    
                var total_name = friend + "-" + owner;
                //console.log(total_name);

                connection.query("SELECT * FROM messages WHERE name='" + total_name + "' ORDER BY time DESC", function(error, rows, fields) {
                    var rows_friend_owner = rows;
                    //console.log(rows_friend_owner);
                    for (var i = 0; i < rows_friend_owner.length; i++) {
                        var time = rows_friend_owner[i].time;
                        var text = rows_friend_owner[i].message; 
                        //console.log(text);
                    }
                    var date = new Date();
                    //console.log(date);

                    var Month = date.getMonth() + 1;
                    if (Month < 10) Month = '0' + Month
                    //console.log(Month);

                    var Date0 = date.getDate();
                    if (Date0 < 10) Date0 = '0' + Date0
                    //console.log(Date0);

                    var Hours = date.getHours();
                    if (Hours < 10) Hours = '0' + Hours
                    //console.log(Hours);

                    var Minutes = date.getMinutes();
                    if (Minutes < 10) Minutes = '0' + Minutes
                    //console.log(Minutes);

                    var Seconds = date.getSeconds();
                    if (Seconds < 10) Seconds = '0' + Seconds
                    //console.log(Seconds);


                    var time = date.getFullYear() + '-' + Month + '-' + Date0 + ', ' + Hours + ':' + Minutes + ':' + Seconds;
                    //console.log(time);

                    var friends = {owner: owner_id, friend: interlocutor, message: req.body.text, time: time, name: total_name};
                    var sql = 'INSERT INTO messages SET ?';
                    var query = connection.query(sql, friends, (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                        
                    });

                    connection.query("SELECT * FROM dialogues WHERE owner='" + owner_id + "' AND interlocutor='" + interlocutor + "' OR owner='" + interlocutor + "' AND interlocutor='" + owner_id + "'", function(error, rows, fields) {
                        var rows_dialogues = rows;
                        connection.query("SELECT * FROM new_users WHERE id='" + interlocutor + "'", function(error, rows, fields) {
                            var rows_users = rows;
                            var firstName = rows_users[0].firstName;
                            var lastName = rows_users[0].lastName;
                            var path_to_photo = rows_users[0].path_to_photo;

                            if (rows_dialogues == 0 ) {
                                var friends = {owner: owner_id, interlocutor: interlocutor, time_last_message: time, message: req.body.text, firstName: firstName, lastName: lastName, path_to_photo: path_to_photo};
                                var sql = 'INSERT INTO dialogues SET ?';
                                var query = connection.query(sql, friends, (err, result) => {
                                    if (err) {
                                        //console.log(err);
                                    }
                                });
                            } else {

                                var sql = "UPDATE dialogues set owner=?, interlocutor=?, time_last_message =?, message =?  WHERE owner =? AND interlocutor =? OR owner =? AND interlocutor =?";
                                var query = connection.query(sql, [owner_id, interlocutor, time, req.body.text, owner_id, interlocutor, interlocutor, owner_id], function(err, result) {
                                    //console.log(err);
                                });
                            }
                        }); 
                    });
                    res.redirect('/message?' + interlocutor,);    
                });
            });
        });
    });
    
    

}

module.exports = init;
