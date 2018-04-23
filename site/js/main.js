/* начало костылей */
function isEmpty(str) {
  if (str.trim() == '') 
    return true;
    
  return false;
}
/* конец костылей */

/* начало функций использования API */
getCategories = function() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'getCategories', false);
    xhr.send();
    return JSON.parse(xhr.responseText); 
};

getGoods = function() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'getGoods', false);
    xhr.send();
    return JSON.parse(xhr.responseText); 
};


logged = function() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'getUser', false);
    xhr.send();
    return xhr.responseText == "Not logged" ? false : true; 
}

getUsername = function() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'getUser', false);
    xhr.send();
    return xhr.responseText;  
}

isAdmin = function() {
    if (getUsername() != "Not logged")
    {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'userIsAdmin', false);
        xhr.send();
        return xhr.responseText;
    }     
}

getItem = function(id) {
    if (!isEmpty(id))
    {    
        var xhr = new XMLHttpRequest();
        var param = "id=" + encodeURIComponent(id);
        xhr.open('POST', 'getItem', false);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(param);
        return JSON.parse(xhr.responseText);   
    }
}

getBasketID = function() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/getBasketID', false);
    xhr.send();
    return xhr.responseText;      
}

addItemToBasket = function() {
    var xhr = new XMLHttpRequest();

    var param = "count=" + encodeURIComponent($('#count').val()) 
              + "&goodID=" + encodeURIComponent(window.location.href.split("?")[1]) 
              + "&basketID=" + encodeURIComponent(getBasketID());
    xhr.open('POST', 'addToBasket', false);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(param);
    return JSON.parse(xhr.responseText);   
}

getItemsInBasket = function() {
    if (logged())
    {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'getItemsInBasket', false);
        xhr.send();
        if (xhr.responseText != 'Not logged')
            return JSON.parse(xhr.responseText); 
        else
            return false; 
    } return false;
}
/* конец функций использования API */

$(document).ready(function() {
    NProgress.start();
    var id = "";
    var arr = [];

    if (window.location.href.indexOf("?") != -1)
    {
        id = window.location.href.split("?")[1];
    }

    window.onscroll = function() {
        if (window.pageYOffset >= document.getElementById('user').clientHeight+100 && screen.height >= 700)
            document.getElementById('user').classList = "activeMenu"
        else  document.getElementById('user').classList = ""
    }

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'settings', false);
    xhr.send();
    var res = JSON.parse(xhr.responseText);
    document.title = res[0].pageTitle;
    

    var app = new Vue({
      el: '#wrap',
      data: {
        settings: res[0],
        userName: getUsername(),
        admin: isAdmin(),
        ok: true,
        items: getCategories(),
        goods: getGoods(),
        auth: logged(),
        item: getItem(id),
        bGoods: getItemsInBasket(), // Basket goods
        profileURL: "/profile.html",
        basketURL: "/basket.html",
        siteSettingsURL: "/siteSettings.html",
        logoutURL: "/logout",
        adminURL: "/sett.html"
      },
      methods: {
        register: function() {
            if (isEmpty($('#email').val()) || 
                    isEmpty($('#password').val()) || 
                        $('#email').val().indexOf("@") == -1 ||
                            $('#password').val().length < 6)
            {
                $('.logText').animate({"color":"red"}, 200);
            }
            else {
                $('.logText').animate({"color":"yellow"}, 200);
                $.post("/register", { 
                    "login": $('#email').val(), 
                    "password": $('#password').val(),
                    "haveAdminRights": false 
                }, function(data) {
                    if (data == "OK")
                    {
                        $('.logText').animate({"color":"green"}, 200);
                        setTimeout(function() {
                            window.location = '/';
                        }, 1500);
                    }
                    else {
                        $('.logText').animate({"color":"red"}, 200);
                    }
                });
            }
        },
        login: function() {
            $('.logText').animate({"color":"yellow"}, 200);
            $.post("/login", { 
                "login": $('#email').val(), 
                "password": $('#password').val(), 
            }, function(data) {
                if (data == "logged")
                {
                    $('.logText').animate({"color":"green"}, 200);
                    setTimeout(function() {
                        window.location = '/';
                    }, 1500);
                }
                else {
                    $('.logText').animate({"color":"red"}, 200);
                }
            });
        },
        isAdministrator: function() {
            return isAdmin();
        }
      }
    });

    $('.product').click( function () { 
        document.location = "/product.html?" + $(this).attr('id');
    });    

    $('#addToBasket').click(function() {
        addItemToBasket();
    });


    $("#sign-in").fadeOut(0);

    $("#close").click(function() {
        $("#sign-in").fadeOut(200);
    });

    $("#login").click(function() {
        $('#sign-in').fadeIn(200);
    });

    $("#my").click(function() {
        $('#sign-in').fadeIn(200);
    });

    $('.slider').bxSlider({
        captions: true,
        ticker: false,
        auto: true,
        pause: 3000
    });

    $(".itemInBasket").each(function(item) {
        arr.push(getItem($(this).attr("gid")));
    }); 

    var counter = 0;
    $('.goodName').each(function() {
        $(this).html(arr[counter++].name);
    });
    counter = 0;

    $('.basketGoodImg').each(function() {
        $(this).attr("src", arr[counter++].imageURL);
    });

    $('.removeItem').each(function() {
        $(this).click(function() {
            alert($(this).attr("gid"));
            $.post('/removeItemFromBasket', {
                goodID: $(this).attr("gid")
            }, function (data){ if (data == "OK") $(this).html(""); });
        });
    });

    NProgress.done();
});