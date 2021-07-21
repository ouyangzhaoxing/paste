var jsonbinKey = "$2b$10$697g8AXov/FYkmk/ANEqceueNAVkVKTaAWfWlBG/Up45A5H./Lrbu";

var host = "https://paste.blinking.fun";

var editor;

var supportLanguage = {
    "C/C++": "c_cpp", "C#": "csharp", "Java": "java",
    "JavaScript": "javascript", "TypeScript": "typescript", "Lua": "lua",
    "Go": "golang", "Ruby": "ruby", "PHP": "php",
    "Rust": "rust", "Python": "python", "R": "r", "Haskell": "haskell", "F#": "fsharp",
    "HTML": "html", "CSS": "css", "XML": "xml", "JSON": "json",
};

var expiration = { "永久": "forever" };

function init() {

    var urlFlag = (location.search.indexOf("?id") !== -1);

    if (browserCheck() !== "pc" && !urlFlag) { document.getElementById("mobile-tips").style.display = "inline-block"; return; }

    document.getElementById("title").addEventListener("click", function () { location.href = host; });

    document.getElementById("code-main").style.display = "inline-block";

    initEdit();

    if (urlFlag) {
        viewCode(location.search.substr(1).split("&")[0].split("=")[1]);
    } else {
        document.getElementById("select-and-submit").style.display = "inline";
        addLanguageAndExpiration();
    }

}

function initEdit() {
    ace.config.set("basePath", "src/js");
    editor = ace.edit("editor");
    editor.setOptions({ showFoldWidgets: false });
    editor.session.setMode("ace/mode/c_cpp");
}

function addLanguageAndExpiration() {

    var language = document.getElementById("language");

    for (var languageKey in supportLanguage) {
        var option = document.createElement("option");
        option.textContent = languageKey;
        option.setAttribute("value", supportLanguage[languageKey]);
        language.appendChild(option);
    }

    var language = document.getElementById("expiration");

    for (var expirationKey in expiration) {

        var option = document.createElement("option");
        option.textContent = expirationKey;
        option.setAttribute("value", expiration[expirationKey]);
        language.appendChild(option);
    }

    language.addEventListener("change", function () {
        editor.session.setMode("ace/mode/" + language.value);
    });

}

function viewCode(codeID) {

    var req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (req.readyState === XMLHttpRequest.DONE) {
            var codeData = JSON.parse(req.response);
            editor.session.setValue(codeData.code);
            editor.session.setMode("ace/mode/" + codeData.language);
        }
    };
    req.open("GET", "https://api.jsonbin.io/v3/b/" + codeID, true);
    req.setRequestHeader("X-Master-Key", jsonbinKey);
    req.setRequestHeader("X-BIN-META", false);
    req.send();

    if (browserCheck() === "pc") {

        document.getElementById("copy-link").style.display = "inline";

        var clipboard = new ClipboardJS("#copy-link", {
            text: function () { return window.location.href; }
        });

        clipboard.on('success', function (e) { alert("已成功复制分享链接到剪切板！"); });
        clipboard.on('error', function (e) { console.log("设置剪切板失败，请手动复制顶部分享链接。"); });

    } else { editor.setReadOnly(true); }

}

function pasteCode() {

    var language = document.getElementById("language").value;
    var code = editor.session.getValue();

    if (code == "") { alert("请先粘贴代码！"); return; }

    document.getElementById("submit").setAttribute("disabled", true);

    var uploadData = { language: language, code: code };
    var strUploadDataJSON = JSON.stringify(uploadData);

    var req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (req.readyState === XMLHttpRequest.DONE && req.status === 200) {
            var codeID = JSON.parse(req.response).metadata.id.toString();
            var resUrl = host + "?id=" + codeID;
            setTimeout(function () { location.href = resUrl; }, 100);
        }
    };
    req.open("POST", "https://api.jsonbin.io/v3/b", true);
    req.setRequestHeader("Content-Type", "application/json");
    req.setRequestHeader("X-Master-Key", jsonbinKey);
    req.setRequestHeader("X-Collection-Id", "60ed520da917050205c65741");
    req.send(strUploadDataJSON);

}

function JumpDoc() {
    window.open("https://zh.cppreference.com");
}

function JumpRun() {
    window.open("https://tech.io/snippet?l=c");
}

function JoinQGroup() {
    window.open("https://qm.qq.com/cgi-bin/qm/qr?k=qyc88rKN05A-FBmfFe2c656Fof2OyAEK&jump_from=webapi");
}

function browserCheck() {
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf("android") !== -1) { return "android"; } else if (ua.indexOf("iphone") !== -1) { return "ios"; } else if (ua.indexOf("ipad") !== -1) { return "ipad"; } else { return "pc"; }
}