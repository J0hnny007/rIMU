window.mobileAndTabletCheck = function() {
    let check = "desktop";
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = "mobile";})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};

function getElement(elm){
    return document.getElementById(elm);
}

function disable(elm){
    return getElement(elm).setAttribute("disabled", "");
}

function enable(elm){
    return getElement(elm).removeAttribute("disabled");
}

function hide(elm){
    return getElement(elm).setAttribute("hide", "");
}

function unhide(elm){
    return getElement(elm).removeAttribute("hide");
}

function setEnv()  {
    let env = mobileAndTabletCheck();
    console.log(env);
    return env;
}

function filter() {
    let searchValueTitle = getElement("searchbar").value.toLowerCase();
    let searchValueAuthor = getElement("author-select").value.toLowerCase();
    let messages = document.querySelectorAll(".message");

    messages.forEach(function(message) {
        let titleElement = message.querySelector(".title");
        let titleText = titleElement.textContent.toLowerCase();
        let authorElement = message.querySelector(".author");
        let authorText = authorElement.textContent.toLowerCase();

        if (titleText.includes(searchValueTitle) && authorText.includes(searchValueAuthor)) {
            message.style.display = "block";
        } else {
            message.style.display = "none";
        }
    });
    calcReadUnreadRatio()
}

function genInbox(cache) {
    const env = mobileAndTabletCheck();
    const container = getElement("container");
    const inbox = document.createElement("div");
    const msg_id = cache.msg_id, l_ch = cache.l_ch;
    const r_stat = {"read": "Unread", "unread": "Read"}; // stupid... plz fix
    let view = ""
    inbox.id = "inbox"
    inbox.className = "inbox";
    container.append(inbox);
    if (env === "desktop") view = "hidden";
    for (let id in msg_id) {
    let msg_body = `
    <div class="message `+l_ch[msg_id[id]].status+`" id="`+msg_id[id]+`">
        <div class="title">`+l_ch[msg_id[id]].title+`</div>
        <div class="msg-id" hidden>`+msg_id[id]+`</div>
        <div class="author">`+l_ch[msg_id[id]].author+`</div>
        <div class="control">
        <button id="status" onclick="changeStatus(this.innerText.toLowerCase(), '`+msg_id[id]+`')" class="btn">`+r_stat[l_ch[msg_id[id]].status]+`</button>
        <div class="link-box">
            <input id="rlink" type="button" value="Open to Reddit" class="link" onclick="window.location.href='`+l_ch[msg_id[id]].r_link+`';">
            <input id="alink" type="button" value="Open to Apollo" class="link" `+view+` onclick="window.location.href='`+l_ch[msg_id[id]].a_link+`';">
        </div>
        <div class="msg-options">...</div>
  </div>
    `;
    inbox.insertAdjacentHTML("beforeend", msg_body);
    }
}

function genAuthorFilter(cache) {
    const selector = getElement("authors");
    const authors = cache.l_authors.sort((a, b) => a.localeCompare(b));
    selector.innerHTML = "";
    for (let a in authors) {
        let option = "<option value='" + authors[a] + "'></option>";
        selector.insertAdjacentHTML("beforeend", option);
    }
}

function calcReadUnreadRatio() {
    let messages = document.querySelectorAll(".message");
    let read = 0;
    let unread = 0;
    let all = 0;
    messages.forEach(function (message){
        let status = message.className.split(" ")[1];
        let view = window.getComputedStyle(message, null).display;
        if (view === "block"){
            if (status === "read") read++;
            else if (status === "unread") unread++;
            all++;
        }
    });
    getElement("ratio").innerText = read + " / " + all + " (" + unread + " Unread)";
}

function changeLocalStatus(status, id) {
    let stat = {"read": "Unread", "unread": "Read"}
    let message = getElement(id);
    message.className = "message " + status;
    message.querySelector("#status").innerText = stat[status];
}

function getInbox(dest) {
    disable(dest)
    fetch('/inbox/' + dest)
    .then((response) => {
      if (response.ok) {
            return response.json();
        } else {
            throw new Error('Request failed');
        }
    })
    .then((myJson) => {
        const container = getElement("container")
        if (getElement("inbox")) container.removeChild(getElement("inbox"));
        genInbox(myJson);
        genAuthorFilter(myJson)
        filter()
        enable(dest)
    }).catch((error) => {
    	console.log(error)
    });
}

function changeStatus(status, id) {
    console.log('mark-' + status + " " + id)
    fetch('/chapter/' + id + '/mark-' + status)
        .then((response) => {
            if (response.ok) {
                console.log("status changed on server")
                changeLocalStatus(status, id)
                filter()
            } else {
                throw new Error('Request failed');
            }
        })
        .catch((error) => {
            console.log(error)
        });
}

getInbox("fetch")


getElement("searchbar").addEventListener("input", filter);
getElement("author-select").addEventListener("change", filter);

getElement("fetch").addEventListener("click", function(e) {
    getInbox("fetch")
});

getElement("reload").addEventListener("click", function(e) {
    getInbox("reload")
});