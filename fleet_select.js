// ==UserScript==

// @name     过滤舰队

// @namespace  http://tampermonkey.net/

// @version   0.1

// @description 只显示指定角色的舰队，只在攻击页面生效

// @author    lyingdragon

// @include   *//typhon.astroempires.com/*

// @grant    none

// ==/UserScript==



function selectFleet(ids) {
    var all_btns = document.getElementsByClassName('input-button');
    var btns = [];
    for (var i = 0; i < all_btns.length; i++) {
        var value = all_btns[i].getAttribute("value");
        if (value == "Attack Fleet" || value == "攻击舰队") {
            btns.push(all_btns[i]);
        }
    }
    if (btns.length == 0) {
        return;
    }
    var body = btns[0].parentNode.parentNode.parentNode.parentNode;
    var trs =[];
    for (i = 0 ; i < btns.length; ++i) {
        trs.push(btns[i].parentNode.parentNode.parentNode);
    }
    var regs = [];
    for (i = 0; i < ids.length; i++) {
        regs.push(RegExp("player=" + ids[i] + "$"));
    }
    for (i = 0; i < trs.length; ++i) {
        if (trs[i].childNodes.length != 4) {
            continue;
        }
        var tags = trs[i].childNodes[1].getElementsByTagName('a');
        var str = tags[0].href.toString();
        var flag = false;
        for (var j = 0; j < regs.length; ++j) {
            if (regs[j].test(str)) {
                flag = true;
                break;
            }
        }
        if (!flag) {
            body.removeChild(trs[i]);
        }
    }
}

//selectFleet(ids);

function loadIds() {
    console.log('a');
}

function checkForm(event) {
    //var form = document.getElementById("ids-form");
    //console.log(form);
    var table = document.getElementById("ids-table");
    var id = document.getElementById("ids-form-input").value;
    event.preventDefault();
    if (id.length == 0) {
        return;
    }
    document.getElementById("ids-form-input").value = "";
    addRow(table, id);
    saveIds(table);
}



function saveIds(table) {
    var tds = table.getElementsByClassName("ids-row");
    var ids = [];
    for (var i = 0; i < tds.length; i++) {
        ids.push(tds[i].getAttribute("value"));
    }
    localStorage.setItem("ids", ids.length == 0 ? '' : ids.join(','));
}

function delRow(row) {
    var table = row.parentNode.parentNode;
    table.firstChild.removeChild(row);
    saveIds(table);
}

function addRow(table, id) {
    var row = table.insertRow();
    row.setAttribute("value", id);
    row.setAttribute("class", "ids-row");
    var cell1 = row.insertCell();
    cell1.innerHTML = id;
    cell1.style.width = "60px";
    var cell2 = row.insertCell();
    cell2.setAttribute("type", 'a');
    //cell2.setAttribute("onclick", "(function(){loadIds();})()");
    cell2.innerHTML = "删除";
    cell2.setAttribute("class", "btn-normal");
    cell2.style.cursor = "pointer";
    cell2.addEventListener("click", function(){delRow(this.parentNode);}, false);
}

var is_mouse_down;
var init_x;
var init_y;


function initUI(ids) {
    var div = document.createElement("div");
    //div.style.float = "right";
    //div.style.position = "absolute";
    div.setAttribute("id", "base_div");
    div.setAttribute("class", "ui-draggable");
    div.style.position = "fixed";
    //div.style.height = "142px";
    div.style.width = "131px";
    div.style.display = "block";
    div.style.left = "76%";
    div.style.top = "16%";
    div.style.zIndex= "9999";
    var span = document.createElement("span");
    span.setAttribute("class", "galaxy");
    span.style.cursor = "default";
    span.setAttribute("title", "在攻击页面只显示指定玩家的舰队");
    span.innerHTML = "攻击助手";
    div.appendChild(span);
    var form = document.createElement("form");
    form.setAttribute("id", "ids-form");
    form.style.width = "100%";

    var input0 = document.createElement("input");
    input0.setAttribute("type", "text");
    input0.setAttribute("id", "fleet-form-input");
    input0.setAttribute("class", "input-text");
    input0.setAttribute("title", "你的舰队ID");
    input0.setAttribute("onkeyup", "this.value=this.value.replace(/\\D/g,'');localStorage.setItem('my_fleet', this.value);");
    input0.style.width = "60px";
    if (localStorage.getItem('my_fleet')) {
        input0.value = localStorage.getItem('my_fleet');
    }
    form.appendChild(input0);
    var btn0 = document.createElement("input");
    btn0.setAttribute("type", "button");
    btn0.setAttribute("value", "攻击");
    btn0.setAttribute("class", "input-button");
    btn0.setAttribute("onclick", "var id = document.getElementById('fleet-form-input').value; if (id.length > 0) window.location.href = 'fleet.aspx?fleet=' + id + '&view=attack'");
    form.appendChild(btn0);

    span = document.createElement("span");
    span.setAttribute("class", "galaxy");
    span.style.cursor = "default";
    span.innerHTML = "敌人ID列表";
    form.appendChild(span);

    var input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("id", "ids-form-input");
    input.setAttribute("class", "input-text");
    input.setAttribute("title", "玩家的数字ID");
    input.setAttribute("onkeyup", "this.value=this.value.replace(/\\D/g,'')");
    input.style.width = "60px";
    form.appendChild(input);
    var btn = document.createElement("input");
    btn.setAttribute("type", "submit");
    btn.setAttribute("value", "增加");
    btn.setAttribute("class", "input-button");
    form.appendChild(btn);
    //form.addEventListener("submit", checkForm(this), false);
    div.appendChild(form);
    var table = document.createElement("table");
    table.style.width = form.style.width;
    table.setAttribute("id","ids-table");
    table.setAttribute("class", "layout listing btnlisting tbllisting1 sorttable");
    for (var i = 0; i < ids.length; ++i) {
        addRow(table, ids[i]);
    }
    div.appendChild(table);


    //body.insertBefore(div, body.firstElementChild);
    var x = document.getElementById("background-container");
    if (x) {
        x.appendChild(div);
    } else {
        document.body.appendChild(div);
    }
    //x.appendChild(div);
    /*
    if (x) {
        x.style.position = "absolute";
        x.style.zIndex= "1";
    }
    */
    form.addEventListener("submit", checkForm, false);
    /*
    div.addEventListener("mousedown", function(e) {
        is_mouse_down = true;
        document.body.style.userSelect = "none";
        init_x = e.offsetX;
        init_y = e.offsetY;
    });
    div.addEventListener("mousemove", function(e) {
       if (!is_mouse_down) {
           return;
       }
       div.style.left = e.clientX - init_x + "px";
       div.style.top = e.clientY - init_y + "px";
    });
    div.addEventListener("mouseup", function(e) {
        is_mouse_down = false;
        document.body.style.userSelect = "auto";
    });
    */
}

var ids_str = localStorage.getItem("ids");
var ids = ids_str ? ids_str.split(',') : [];
initUI(ids);
ids.length > 0 ? selectFleet(ids) : console.log("empty");
//dument.getElementById("ids-form").addEventListener("submit", checkForm(), false);
//initUI([1,2,3]);
