"ui";

// =================================-------------------------------------------
// 🚀 DRIVER APP (v51.0 ULTRA SPEED, DEVICE BINDING SECURED & PERFECT SKIP) - NURA AUTO CLICKER
// © 2026 - 2027
// =================================-------------------------------------------
var CURRENT_VERSION_CODE = 51; 
var CURRENT_VERSION_NAME = "51.0"; 

var UPDATE_JSON_URL = "https://raw.githubusercontent.com/420arunbanu-oss/Nura-auto-clicker-pro/main/version.json";
var FIREBASE_URL = "https://nuraautoclicker-default-rtdb.firebaseio.com";

var APP_SECRET_KEY = "MySuperSecretAutoxToken2026_2027";
var WHATSAPP_NUMBER = "917708271310"; 
var RAZORPAY_PAYMENT_LINK = "https://rzp.io/rzp/4kU5NoEk"; 

var storage = storages.create("PREMIUM_LOGIN_DATA");

var minPrice = storage.get("minPrice", 40);
var maxPrice = storage.get("maxPrice", 10000);
var usePriceFilter = storage.get("usePriceFilter", false);
var useSkipBelowMin = storage.get("useSkipBelowMin", false); 
var useAreaFilter = storage.get("useAreaFilter", false);
var selectedAreas = storage.get("selectedAreas", []);
var useSearchAreaFilter = storage.get("useSearchAreaFilter", false);
var customAreaSearchStr = storage.get("customAreaSearchStr", "");
var userVehicleType = storage.get("userVehicleType", "Auto");
var allowAreaPermission = storage.get("allow_area_perm", false);  
var allowPricePermission = storage.get("allow_price_perm", false);

var isUpdateAvailableGlobal = false;
var updateTxtGlobal = "UPDATE v51.0 🚀";

var now = new Date();
var todayDateStr = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();
var lastSavedDate = storage.get("today_date_key", "");

if (lastSavedDate !== todayDateStr) {
    storage.put("today_date_key", todayDateStr);
    storage.put("today_earnings", 0);
    storage.put("today_orders_count", 0);
}

var areaList = [
    "Saravanampatti", "Idikarai", "Thudiyalur", "Keeranatham", "Ganapathy", 
    "Sanganoor", "Nallampalayam", "Chinnavedampatti", "Vellakinar", "Koundampalayam", 
    "Rathinapuri", "Gn Mills", "SNS", "Murugan Nagar", "Periyanaikenpalayam", 
    "Nayakkan Palyam", "Ganapathypudur", "Kalapatti", "Vellalore", "Nanjundapuram", 
    "PSG", "R.S. Puram", "Sai Baba Colony", "Vadavalli", "Edayarpalayam", 
    "Vilankurichi", "Kanuvai", "Pannimadai", "Gandhipuram", "Tatabad",
    "Vedapatty", "Peelamedu", "Railway Jn CBT", "Railway Station"
];

var isRunning = false; 
var workerThread = null; 
var killSwitchThread = null;

function getSafeAndroidId() {
    try {
        var id = device.getAndroidId();
        if (id && id.length > 3) return id;
    } catch(e) {}
    var altId = storage.get("fallback_device_id", "");
    if (!altId) {
        altId = "DEV_" + Date.now() + "_" + Math.floor(Math.random() * 899999 + 100000);
        storage.put("fallback_device_id", altId);
    }
    return altId;
}

function getFirebaseEmailKey(email) {
    if (!email) return "";
    return email.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
}

function getCleanUrl(path) {
    if (!path || path === "" || path === "/") {
        return FIREBASE_URL + "/.json";
    }
    if (path.indexOf("/") !== 0) {
        path = "/" + path;
    }
    if (path.endsWith(".json")) {
        return FIREBASE_URL + path;
    }
    return FIREBASE_URL + path + ".json";
}

function firebaseGet(path) {
    var url = getCleanUrl(path);
    return http.get(url, { timeout: 8000 });
}

function firebasePut(path, data) {
    var url = getCleanUrl(path);
    return http.request(url, {
        method: "PUT",
        body: JSON.stringify(data),
        contentType: "application/json",
        timeout: 15000
    });
}

function firebasePatch(path, data) {
    var url = getCleanUrl(path);
    return http.request(url, {
        method: "PATCH",
        body: JSON.stringify(data),
        contentType: "application/json",
        timeout: 15000
    });
}

function firebaseGetUser(emailKey) {
    try {
        var res = firebaseGet("/users/" + emailKey);
        if (res && res.statusCode == 200) {
            var d = res.body.json();
            if (d && (d.email || d.status !== undefined || d.approved !== undefined)) {
                return { data: d, path: "/users/" + emailKey };
            }
        }
    } catch(e) {}
    return null;
}

// 🛡️ செக்யூரிட்டி: இந்த மொபைல் ஐடி ஏற்கனவே வேறு எந்த அக்கவுண்டுக்காவது கொடுக்கப்பட்டுள்ளதா எனச் சரிபார்க்கும் முறை
function checkDeviceAlreadyUsed() {
    try {
        var currentAndroidId = getSafeAndroidId();
        var res = firebaseGet("/users");
        if (res && res.statusCode == 200) {
            var list = res.body.json();
            if (list) {
                for (var k in list) {
                    if (list.hasOwnProperty(k)) {
                        var user = list[k];
                        if (user && user.androidId && String(user.androidId).trim() === currentAndroidId) {
                            return user.email || "Registered Account";
                        }
                    }
                }
            }
        }
    } catch(e) {}
    return null;
}

function getNextDriverIndex() {
    try {
        var res = firebaseGet("/users");
        if (res && res.statusCode == 200) {
            var list = res.body.json();
            if (list) {
                var count = 0;
                for (var k in list) {
                    if (list.hasOwnProperty(k)) count++;
                }
                return count + 1;
            }
        }
    } catch(e) {}
    return Math.floor(Math.random() * 800) + 10;
}

function openWhatsAppSupport(reason, planDetails) {
    var email = storage.get("email", "Not Logged In");
    var pass = storage.get("user_password", "******");
    var dIdx = storage.get("driver_index", "--");
    
    var msg = "வணக்கம் Admin, நான் பணம் செலுத்திவிட்டேன். ஸ்கிரீன்ஷாட் அனுப்பியுள்ளேன்.\n" +
              "Email: " + email + "\n" +
              "Password: " + pass + "\n" +
              "Driver No: #" + dIdx + "\n" +
              "Reason: " + (reason || "General Support");
              
    if (planDetails) {
        msg += "\nSelected Plan: " + planDetails;
    }

    try {
        var waUrl = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(msg);
        app.openUrl(waUrl);
        toastLog("💬 Opening WhatsApp Support...");
    } catch(e) {
        toastLog("❌ Could not open WhatsApp: " + e);
    }
}

var htmlFilePath = files.path("./ui.html");

var htmlLinesPart1 = [
'<!DOCTYPE html>',
'<html lang="en">',
'<head>',
'    <meta charset="UTF-8">',
'    <meta name="viewport" content="width=device-width, initial-scale=1.0">',
'    <style>',
'        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; user-select: none; }',
'        body { background-color: #0d121f; color: #ffffff; padding: 12px; font-size: 13px; max-width: 450px; margin: 0 auto; }',
'        .card { background: #151d30; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; padding: 14px; margin-bottom: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.4); }',
'        .card-highlight { border: 1px solid rgba(56, 189, 248, 0.3); background: linear-gradient(145deg, #151d30, #0f172a); }',
'        .flex { display: flex; align-items: center; }',
'        .flex-between { display: flex; justify-content: space-between; align-items: center; }',
'        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }',
'        .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }',
'        .admin-nav { background: linear-gradient(135deg, #10172a, #1e293b); padding: 12px 14px; border-radius: 16px; margin-bottom: 12px; border: 1px solid rgba(56, 189, 248, 0.2); }',
'        .header-logo { background: linear-gradient(135deg, #0284c7, #2563eb); width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-right: 10px; box-shadow: 0 4px 12px rgba(37,99,235,0.4); }',
'        .badge-version { border: 1px solid #10b981; background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 4px 10px; border-radius: 14px; font-size: 10px; font-weight: bold; cursor: pointer; }',
'        .badge-update-glow { border: 2px solid #ef4444 !important; background: rgba(239, 68, 68, 0.4) !important; color: #ffffff !important; font-weight: 900 !important; animation: intenseBlink 0.8s infinite alternate; }',
'        @keyframes intenseBlink { 0% { opacity: 0.3; transform: scale(0.98); } 100% { opacity: 1; transform: scale(1.02); } }',
'        .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 6px; }',
'        .dot-green { background: #10b981; box-shadow: 0 0 6px #10b981; }',
'        .dot-red { background: #e11d48; box-shadow: 0 0 8px #e11d48; }',
'        .perm-card { background: #111827; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 14px; margin-bottom: 10px; }',
'        .perm-title { font-weight: bold; font-size: 13px; color: #ffffff; }',
'        .perm-desc { color: #94a3b8; font-size: 10px; margin-top: 2px; }',
'        .perm-btn { background: #0284c7; color: white; border: none; padding: 8px 12px; border-radius: 10px; font-size: 11px; font-weight: bold; cursor: pointer; }',
'        .perm-btn-active { background: #10b981; color: #000; }',
'        .user-panel-card { background: #141c2e; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 18px; padding: 14px; margin-bottom: 12px; }',
'        .user-header { border-bottom: 1px solid rgba(255, 255, 255, 0.06); padding-bottom: 10px; margin-bottom: 12px; }',
'        .user-avatar { width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, #10b981, #059669); display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; color: #fff; margin-right: 12px; }',
'        .user-details-text { font-size: 11px; color: #94a3b8; line-height: 1.5; }',
'        .user-details-text span { color: #f1f5f9; font-weight: 600; }',
'        .control-box { background: #0c1220; border-radius: 14px; padding: 10px; border: 1px solid rgba(255, 255, 255, 0.05); text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: space-between; }',
'        .control-title { font-size: 10px; font-weight: bold; color: #94a3b8; margin-bottom: 6px; }',
'        .toggle-pill { width: 62px; height: 30px; border-radius: 20px; display: flex; align-items: center; justify-content: space-between; padding: 0 4px; transition: all 0.3s; position: relative; box-shadow: inset 0 2px 4px rgba(0,0,0,0.5); }',
'        .toggle-pill-on { background: #10b981; border: 2px solid #34d399; }',
'        .toggle-pill-off { background: #ef4444; border: 2px solid #f87171; }',
'        .toggle-knob { width: 22px; height: 22px; background: #ffffff; border-radius: 50%; box-shadow: 0 2px 5px rgba(0,0,0,0.3); transition: all 0.3s; position: absolute; }',
'        .knob-on { right: 3px; }',
'        .knob-off { left: 3px; }',
'        .toggle-text { font-size: 10px; font-weight: 900; color: #ffffff; letter-spacing: 0.5px; }',
'        .text-on { margin-left: 8px; }',
'        .text-off { margin-left: 26px; }',
'        .badge-status { padding: 3px 8px; border-radius: 8px; font-size: 9px; font-weight: 800; text-transform: uppercase; margin-bottom: 6px; display: inline-block; }',
'        .badge-approved { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid #10b981; }',
'        .badge-pending { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid #f59e0b; }',
'        .start-btn-container { width: 85px; height: 85px; border-radius: 50%; background: radial-gradient(circle, rgba(225,29,72,0.4) 0%, rgba(15,23,42,0.8) 100%); border: 2px solid #e11d48; box-shadow: 0 0 25px rgba(225, 29, 72, 0.7); display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s; }',
'        .start-btn-running { background: radial-gradient(circle, rgba(16,185,129,0.4) 0%, rgba(15,23,42,0.8) 100%); border: 2px solid #10b981; box-shadow: 0 0 25px rgba(16, 185, 129, 0.7); }',
'        .sub-card { background: #0c1220; border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 12px; }',
'        .progress-bar { width: 100%; height: 6px; background: #1e293b; border-radius: 4px; overflow: hidden; margin: 8px 0; }',
'        .progress-fill { height: 100%; background: #10b981; width: 85%; }',
'        .btn-glow-blue { background: linear-gradient(135deg, #0284c7, #0369a1); color: white; border: none; padding: 10px; border-radius: 12px; font-weight: bold; font-size: 11px; width: 100%; cursor: pointer; }',
'        .btn-glow-purple { background: linear-gradient(135deg, #4c1d95, #2e1065); border: 1px solid #c084fc; color: #c084fc; padding: 10px; border-radius: 12px; font-weight: bold; font-size: 11px; width: 100%; cursor: pointer; }',
'        .btn-green { background: #10b981; color: #030712; border: none; padding: 10px 16px; font-weight: bold; border-radius: 12px; cursor: pointer; }',
'        .btn-red { background: #be123c; color: #ffffff; border: none; padding: 10px 16px; font-weight: bold; border-radius: 12px; cursor: pointer; }',
'        .btn-whatsapp { background: linear-gradient(135deg, #25d366, #128c7e); color: #ffffff; border: none; padding: 12px; border-radius: 12px; font-weight: bold; font-size: 12px; width: 100%; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 15px rgba(37,211,102,0.3); }',
'        .quick-action-item { background: #0c1220; border: 1px solid rgba(255,255,255,0.05); border-radius: 14px; padding: 12px; cursor: pointer; }',
'        .checkbox-container { display: flex; align-items: center; margin: 8px 0; font-size: 13px; cursor: pointer; }',
'        .checkbox-container input { width: 18px; height: 18px; margin-right: 8px; accent-color: #10b981; }',
'        input[type="text"], input[type="password"], input[type="number"], select { width: 100%; background: #030712; border: 1px solid #1e293b; color: #fff; padding: 12px; border-radius: 12px; outline: none; font-size: 13px; margin-top: 4px; }',
'        .bottom-nav { background: #10172a; border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 20px; padding: 10px; display: flex; justify-around; margin-top: 10px; }',
'        .nav-item { text-align: center; color: #64748b; font-size: 10px; cursor: pointer; }',
'        .nav-item.active { color: #38bdf8; font-weight: bold; }',
'        .plan-card { background: #090E1F; border-radius: 18px; padding: 12px 8px; text-align: center; position: relative; display: flex; flex-direction: column; justify-content: space-between; cursor: pointer; }',
'        .plan-card-active { transform: scale(1.03); border-width: 2px !important; }',
'        .plan-card-green { border: 1px solid #10b981; opacity: 0.5; }',
'        .plan-card-blue { border: 1px solid #0284c7; opacity: 0.5; }',
'        .plan-card-purple { border: 1px solid #a855f7; }',
'        .plan-badge { font-size: 10px; font-weight: bold; padding: 3px 8px; border-radius: 12px; display: inline-block; margin-bottom: 8px; }',
'        .plan-icon { width: 44px; height: 42px; border-radius: 50%; margin: 4px auto 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; }',
'        .best-choice-ribbon { position: absolute; top: -10px; right: -6px; background: #eab308; color: #000; font-weight: bold; font-size: 8px; padding: 2px 6px; border-radius: 6px; transform: rotate(12deg); }',
'        .divider { border-bottom: 1px solid rgba(255,255,255,0.1); margin: 14px 0; position: relative; text-align: center; }',
'        .divider-text { position: absolute; top: -9px; left: 50%; transform: translateX(-50%); background: #0b1329; padding: 0 8px; color: #64748b; font-size: 10px; }',
'        .hidden { display: none !important; }',
'    </style>',
'</head>'
];

var htmlLinesPart2 = [
'<body>',
'    <!-- LOGIN VIEW -->',
'    <div id="loginView">',
'        <div class="card" style="padding:20px;">',
'            <div class="flex" style="margin-bottom:14px;">',
'                <div style="background:#1e293b; width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center; margin-right:12px; font-size:20px;">🔒</div>',
'                <div>',
'                    <div style="font-size:18px; font-weight:bold; color:#fff;">PREMIUM LOGIN</div>',
'                    <div style="color:#64748b; font-size:11px;">Authorization required to run the script.</div>',
'                </div>',
'            </div>',
'            <label style="color:#38bdf8; font-size:11px; font-weight:bold;">Email Address:</label>',
'            <input type="text" id="emailInput" placeholder="Enter your email ID">',
'            <label style="color:#38bdf8; font-size:11px; font-weight:bold; margin-top:12px; display:block;">Password:</label>',
'            <input type="password" id="passInput" placeholder="Enter your password">',
'            <button class="btn-green" style="width:100%; padding:14px; margin-top:16px; font-size:13px;" onclick="doLogin()">➔ LOGIN</button>',
'            <div class="divider"><span class="divider-text">OR</span></div>',
'            <div style="text-align:center; color:#94a3b8; font-size:11px; margin-bottom:8px;">Don\'t have an account?</div>',
'            <button class="btn-glow-purple" style="padding:12px;" onclick="showRegisterPage()">➕ CREATE NEW ACCOUNT (1-DAY FREE TRIAL)</button>',
'            <button class="btn-whatsapp" style="margin-top:10px;" onclick="sendToAutoJS(\'SUPPORT\')">💬 CONTACT ADMIN VIA WHATSAPP</button>',
'        </div>',
'    </div>',

'    <!-- REGISTER NEW ACCOUNT VIEW -->',
'    <div id="registerView" class="hidden">',
'        <div class="card" style="padding:20px;">',
'            <div class="flex" style="margin-bottom:14px;">',
'                <div style="background:#1e293b; width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center; margin-right:12px; font-size:20px;">📝</div>',
'                <div>',
'                    <div style="font-size:18px; font-weight:bold; color:#fff;">CREATE NEW ACCOUNT</div>',
'                    <div style="color:#64748b; font-size:11px;">Register for 1-Day Automatic Free Trial Access!</div>',
'                </div>',
'            </div>',
'            <label style="color:#38bdf8; font-size:11px; font-weight:bold;">Email Address:</label>',
'            <input type="text" id="regEmailInput" placeholder="Enter email ID">',
'            <label style="color:#38bdf8; font-size:11px; font-weight:bold; margin-top:12px; display:block;">Password:</label>',
'            <input type="password" id="regPassInput" placeholder="Create new password">',
'            <label style="color:#38bdf8; font-size:11px; font-weight:bold; margin-top:12px; display:block;">Vehicle Type:</label>',
'            <select id="regVehicleInput">',
'                <option value="Auto">🛺 Auto</option>',
'                <option value="Bike">🏍️ Bike</option>',
'                <option value="Cab">🚗 Cab / Car</option>',
'            </select>',
'            <div style="color:#10b981; font-size:11px; font-weight:bold; margin: 12px 0;">🎁 1-Day Automatic Free Trial will be activated instantly on registration!</div>',
'            <div class="grid-2">',
'                <button class="btn-red" onclick="showLoginPage()">⬅️ BACK</button>',
'                <button class="btn-green" onclick="doRegister()">SUBMIT ➔</button>',
'            </div>',
'        </div>',
'    </div>',

'    <!-- SUBSCRIPTION / WAIT VIEW -->',
'    <div id="waitView" class="hidden">',
'        <div style="text-align:center; margin-bottom:12px; font-size:12px; font-weight:bold; color:#fbbf24;">👑 Select Premium Plan & Pay via Razorpay</div>',
'        <div class="card" style="padding:16px;">',
'            <div class="flex-between">',
'                <label style="color:#38bdf8; font-size:12px; font-weight:bold;">Driver Email ID:</label>',
'                <span id="driverIndexBadge" style="background:#0284c7; color:#fff; font-size:10px; font-weight:bold; padding:2px 8px; border-radius:10px;">ID: --</span>',
'            </div>',
'            <input type="text" id="waitDriverEmail" readonly style="background:#090d16; color:#e2e8f0; font-weight:bold; margin-top:6px; border:1px solid #1e293b;">',
'            <div style="text-align:center; font-weight:bold; font-size:13px; color:#ffffff; margin:16px 0 10px;">✦ SUBSCRIPTION PLANS ✦</div>',
'            <div class="grid-3" style="margin-bottom: 14px;">',
'                <div id="pCard1" class="plan-card plan-card-green" onclick="disabledPlanMsg(\'Price Filter (Rs. 200) is disabled. Please select Premium All Options (Rs. 300).\')">',
'                    <div>',
'                        <span class="plan-badge" style="background:#064e3b; color:#34d399;">DISABLED</span>',
'                        <div class="plan-icon" style="background:rgba(16,185,129,0.2); color:#10b981;">🍸</div>',
'                        <div style="font-weight:bold; font-size:11px; color:#fff;">PRICE FILTER</div>',
'                        <div style="color:#10b981; font-size:9px; margin-top:4px;">✖ Disabled</div>',
'                    </div>',
'                    <div style="margin-top:10px;"><div style="font-size:15px; font-weight:bold; color:#10b981;">Rs. 200</div><button class="btn-red" style="width:100%; padding:4px; font-size:9px; margin-top:4px;">OFF</button></div>',
'                </div>',
'                <div id="pCard2" class="plan-card plan-card-blue" onclick="disabledPlanMsg(\'Area Filter (Rs. 200) is disabled. Please select Premium All Options (Rs. 300).\')">',
'                    <div>',
'                        <span class="plan-badge" style="background:#0c4a6e; color:#38bdf8;">DISABLED</span>',
'                        <div class="plan-icon" style="background:rgba(2,132,199,0.2); color:#38bdf8;">📍</div>',
'                        <div style="font-weight:bold; font-size:11px; color:#fff;">AREA FILTER</div>',
'                        <div style="color:#38bdf8; font-size:9px; margin-top:4px;">✖ Disabled</div>',
'                    </div>',
'                    <div style="margin-top:10px;"><div style="font-size:15px; font-weight:bold; color:#38bdf8;">Rs. 200</div><button class="btn-red" style="padding:4px; font-size:9px; margin-top:4px;">OFF</button></div>',
'                </div>',
'                <div id="pCard3" class="plan-card plan-card-purple plan-card-active" onclick="choosePlan(\'All Options (Premium)\', 300, 3)">',
'                    <span class="best-choice-ribbon">⭐ OFFER</span>',
'                    <div>',
'                        <span class="plan-badge" style="background:#581c87; color:#c084fc;">PREMIUM</span>',
'                        <div class="plan-icon" style="background:rgba(168,85,247,0.2); color:#c084fc;">⭐</div>',
'                        <div style="font-weight:bold; font-size:11px; color:#fff;">ALL OPTIONS</div>',
'                        <div style="color:#c084fc; font-size:9px; margin-top:4px;">✔ Price + Area Both</div>',
'                    </div>',
'                    <div style="margin-top:10px;"><div style="font-size:15px; font-weight:bold; color:#c084fc;">Rs. 300</div><button class="btn-glow-purple" style="padding:4px; font-size:9px; margin-top:4px;">SELECT ›</button></div>',
'                </div>',
'            </div>',
'            <div style="text-align:center; font-size:12px; color:#fbbf24; font-weight:bold; margin-bottom:12px;">Selected Plan: <span id="selectedPlanLbl" style="color:#c084fc;">All Options (Premium) (Rs. 300)</span></div>',
'            <button class="btn-green" style="width:100%; padding:14px; margin-top:4px; font-size:13px; font-weight:bold;" onclick="payViaUniversalUPI()">💳 PAY RS. 300 VIA RAZORPAY</button>',
'            <button class="btn-whatsapp" style="margin-top:10px;" onclick="contactAdminWhatsApp()">💬 CONTACT ADMIN VIA WHATSAPP</button>',
'            <button class="btn-glow-blue" style="width:100%; padding:12px; margin-top:10px; font-size:12px; font-weight:bold;" onclick="checkStatusAction()">🔄 CHECK STATUS (அப்ரூவ் ஆனதா எனச் சரிபார்க்க)</button>',
'            <button class="btn-red" style="width:100%; padding:12px; margin-top:10px; font-size:12px;" onclick="sendToAutoJS(\'LOGOUT\')">🚪 LOGOUT</button>',
'        </div>',
'    </div>',

'    <!-- VERIFY / PENDING VIEW -->',
'    <div id="verifyView" class="hidden">',
'        <div class="card" style="text-align:center; padding:24px;">',
'            <div style="font-size:48px; margin-bottom:12px;">⏳</div>',
'            <div style="font-size:22px; font-weight:900; color:#ffffff;">கணக்கு சரிபார்ப்பு</div>',
'            <div style="color:#fbbf24; font-size:13px; font-weight:bold; margin-top:4px;">Server Verification In Progress</div>',
'            <div style="color:#94a3b8; font-size:12px; margin-top:14px; line-height:1.6;">',
'                பணம் செலுத்தி ஸ்கிரீன்ஷாட் அனுப்பிய பின் அட்மின் அப்ரூவ் செய்வார். பின் கீழே உள்ள <b style="color:#38bdf8;">CHECK STATUS</b> பட்டனை அழுத்தவும்.',
'            </div>',
'            <div class="grid-2" style="margin-top:16px;">',
'                <button class="btn-red" style="padding:12px;" onclick="sendToAutoJS(\'LOGOUT\')">LOGOUT</button>',
'                <button class="btn-glow-blue" style="padding:12px;" onclick="sendToAutoJS(\'CHECK_STATUS\')">CHECK STATUS 🔄</button>',
'            </div>',
'            <button class="btn-whatsapp" style="margin-top:10px;" onclick="sendToAutoJS(\'SUPPORT\')">💬 CONTACT ADMIN (WHATSAPP)</button>',
'        </div>',
'    </div>',

'    <!-- PERMISSIONS VIEW -->',
'    <div id="permissionView" class="hidden">',
'        <div class="card card-highlight flex-between" style="margin-bottom:12px;">',
'            <div>',
'                <div style="font-weight:bold; font-size:15px; color:#ffffff;">⚙️ PERMISSION SETTINGS</div>',
'                <div style="color:#38bdf8; font-size:10px;">Enable required system permissions below</div>',
'            </div>',
'            <button class="btn-glow-blue" style="width:auto; padding:6px 14px;" onclick="showDashboardView()">⬅️ BACK</button>',
'        </div>',
'        <div class="card" style="padding:16px;">',
'            <div class="perm-card flex-between">',
'                <div><div class="perm-title">1. Accessibility Service</div><div class="perm-desc">Required to perform auto-clicks on orders</div></div>',
'                <button id="btnAccessibility" class="perm-btn" onclick="sendToAutoJS(\'REQ_ACCESSIBILITY\')">ENABLE ➔</button>',
'            </div>',
'            <div class="perm-card flex-between">',
'                <div><div class="perm-title">2. Display Over Other Apps</div><div class="perm-desc">Required to render floating UI widgets</div></div>',
'                <button id="btnOverlay" class="perm-btn" onclick="sendToAutoJS(\'REQ_OVERLAY\')">ENABLE ➔</button>',
'            </div>',
'            <div class="perm-card flex-between">',
'                <div><div class="perm-title">3. Battery Optimization</div><div class="perm-desc">Required to keep app running in background</div></div>',
'                <button id="btnBattery" class="perm-btn" onclick="sendToAutoJS(\'REQ_BATTERY\')">ENABLE ➔</button>',
'            </div>',
'            <button class="btn-green" style="width:100%; padding:12px; font-size:12px; font-weight:bold; margin-top:6px;" onclick="sendToAutoJS(\'CHECK_PERMISSIONS\')">RE-CHECK PERMISSIONS 🔄</button>',
'        </div>',
'    </div>',

'    <!-- DASHBOARD VIEW -->',
'    <div id="dashboardView" class="hidden">',
'        <div class="admin-nav flex-between">',
'            <div class="flex">',
'                <div class="header-logo">⚡</div>',
'                <div>',
'                    <div style="font-weight:900; font-size:14px; color:#ffffff; letter-spacing:0.5px;">NURA <span style="color:#38bdf8;">AUTO CLICKER</span></div>',
'                    <div style="color:#10b981; font-size:9px; font-weight:bold; display:flex; align-items:center; margin-top:2px;">',
'                        <span class="dot dot-green" style="width:6px; height:6px;"></span> Rapido Exclusive Supported',
'                    </div>',
'                </div>',
'            </div>',
'            <div id="updateBadge" class="badge-version flex" onclick="sendToAutoJS(\'UPDATE\')">',
'                <span id="updateDot" class="dot dot-green"></span>',
'                <span id="updateTxt">V51.0 RAPIDO ✓</span>',
'            </div>',
'        </div>',
'        <div class="card card-highlight flex-between" style="padding:10px 14px; margin-bottom:12px;">',
'            <div class="flex">',
'                <div style="font-size:20px; margin-right:10px;">⚡</div>',
'                <div>',
'                    <div style="font-weight:bold; color:#10b981; font-size:11px;">AUTO JX v7 ULTRA ENGINE (v51.0)</div>',
'                    <div style="color:#94a3b8; font-size:9px;">Realtime Sync & Rapido Auto Protect</div>',
'                </div>',
'            </div>',
'            <div style="background:rgba(16,185,129,0.15); border:1px solid #10b981; color:#34d399; padding:4px 8px; border-radius:8px; font-size:9px; font-weight:bold;">100% READY</div>',
'        </div>',
'        <div id="statusCard" class="card flex-between" style="padding: 16px 14px;">',
'            <div>',
'                <div class="flex" style="margin-bottom: 4px;">',
'                    <span id="statusDot" class="dot dot-red"></span>',
'                    <span style="color:#94a3b8; font-size:11px; font-weight:bold;">AUTO ACCEPT</span>',
'                </div>',
'                <div id="statusTxt" style="color:#e11d48; font-size:22px; font-weight:bold;">OFFLINE</div>',
'                <div id="statusSub" style="color:#64748b; font-size:10px; margin-top: 4px;">Tap <span style="color:#10b981;">START</span> to begin auto-accepting orders</div>',
'            </div>',
'            <div id="startBtnBox" class="start-btn-container" onclick="sendToAutoJS(\'TOGGLE_START\')">',
'                <div id="startBtnLabel" style="font-size:14px; font-weight:bold; color:#fff;">START</div>',
'                <div id="startBtnIcon" style="font-size:10px; color:#e11d48; margin-top:2px;">▶</div>',
'            </div>',
'        </div>',
'        <div class="user-panel-card">',
'            <div class="user-header flex-between">',
'                <div class="flex">',
'                    <div id="userAvatar" class="user-avatar">A</div>',
'                    <div>',
'                        <div id="userEmailTitle" style="font-weight:bold; font-size:13px; color:#ffffff;">user_gmail_com</div>',
'                        <div id="userEmailSub" style="color:#38bdf8; font-size:10px;">user@gmail.com</div>',
'                    </div>',
'                </div>',
'                <div id="userStatusBadge" class="badge-status badge-approved">APPROVED</div>',
'            </div>',
'            <div class="user-details-text" style="margin-bottom:12px;">',
'                <div>Android ID : <span id="userAndroidId">--</span></div>',
'                <div>Driver No : <span id="userDriverIndex" style="color:#38bdf8; font-weight:bold;">--</span></div>',
'                <div>Vehicle Type : <span id="userVehicleTxt" style="color:#fbbf24; font-weight:bold;">🛺 Auto</span></div>',
'                <div>Device Lock : <span style="color:#10b981; font-weight:bold;">🔒 LOCKED (1 Device)</span></div>',
'            </div>',
'            <div class="grid-3">',
'                <div class="control-box"><div class="control-title">Area Filter</div><div id="areaFilterPill" class="toggle-pill toggle-pill-on"><span id="areaText" class="toggle-text text-on">ON</span><div id="areaKnob" class="toggle-knob knob-on"></div></div></div>',
'                <div class="control-box"><div class="control-title">Price Filter</div><div id="priceFilterPill" class="toggle-pill toggle-pill-on"><span id="priceText" class="toggle-text text-on">ON</span><div id="priceKnob" class="toggle-knob knob-on"></div></div></div>',
'                <div class="control-box"><div class="control-title">Status</div><div id="statusFilterPill" class="toggle-pill toggle-pill-on"><span id="statusText" class="toggle-text text-on">ON</span><div id="statusKnob" class="toggle-knob knob-on"></div></div></div>',
'            </div>',
'        </div>',
'        <div class="grid-2" style="margin-bottom: 12px;">',
'            <div class="sub-card card" style="margin-bottom:0;">',
'                <div class="flex-between" style="margin-bottom:6px;">',
'                    <span style="color:#64748b; font-size:9px; font-weight:bold;">LAST ACCEPTED ORDER</span>',
'                    <span id="lastTimeTxt" style="color:#38bdf8; font-size:9px;">🕒 --:--</span>',
'                </div>',
'                <div id="lastPriceTxt" style="font-size:20px; font-weight:bold; color:#ffffff; margin-bottom:4px;">Rs. 0</div>',
'                <div class="flex-between"><div style="color:#f43f5e; font-size:10px;">📍 Area: <span id="lastAreaTxt" style="color:#94a3b8;">None</span></div></div>',
'            </div>',
'            <div class="sub-card card" style="margin-bottom:0;">',
'                <div style="color:#64748b; font-size:9px; font-weight:bold; margin-bottom:6px;">TODAY\'S EARNINGS</div>',
'                <div id="todayEarningsTxt" style="font-size:22px; font-weight:bold; color:#10b981; margin-bottom:4px;">Rs. 0</div>',
'                <div id="todayOrdersTxt" style="color:#38bdf8; font-size:10px; font-weight:bold;">0 Orders Completed</div>',
'            </div>',
'        </div>',
'        <div class="card">',
'            <div class="grid-2" style="margin-bottom: 12px;">',
'                <div>',
'                    <div style="color:#64748b; font-size:10px; font-weight:bold;">LICENSE STATUS</div>',
'                    <div style="color:#10b981; font-size:15px; font-weight:bold; margin-top:2px;">APPROVED ✓</div>',
'                    <div style="margin-top:10px;">',
'                        <span style="color:#64748b; font-size:9px; font-weight:bold;">PLAN VALIDITY</span>',
'                        <div id="validityDaysTxt" style="color:#ffffff; font-size:13px; font-weight:bold;">30 DAYS LEFT</div>',
'                        <div class="progress-bar"><div class="progress-fill"></div></div>',
'                        <div style="color:#64748b; font-size:9px;">EXPIRES ON: <span id="expiresOnTxt" style="color:#94a3b8;">--/--/----</span></div>',
'                    </div>',
'                </div>',
'                <div>',
'                    <div class="flex" style="margin-bottom: 8px;">',
'                        <div style="background:#1e293b; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-right:6px; font-size:12px;">👤</div>',
'                        <div>',
'                            <div style="color:#38bdf8; font-size:9px; font-weight:bold;">USER ACCOUNT</div>',
'                            <div id="userEmailTxt" style="color:#ffffff; font-size:10px; word-break:break-all;">User</div>',
'                        </div>',
'                    </div>',
'                    <div style="background:#0c1220; padding:8px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">',
'                        <div style="color:#38bdf8; font-size:9px; font-weight:bold;">PLAN</div>',
'                        <div style="color:#c084fc; font-size:11px; font-weight:bold;">⭐ PREMIUM</div>',
'                    </div>',
'                </div>',
'            </div>',
'            <div class="grid-2">',
'                <button class="btn-glow-blue" onclick="showPlansView()">🚀 RENEW PLAN</button>',
'                <button class="btn-glow-purple" onclick="showPlansView()">👑 MANAGE PLAN</button>',
'            </div>',
'        </div>',
'        <div class="card" style="padding:10px;">',
'            <div class="quick-action-item flex-between" style="margin-bottom:8px;" onclick="showFilterPage()">',
'                <div class="flex">',
'                    <span style="font-size:18px; margin-right:10px; color:#38bdf8;">🎛️</span>',
'                    <div>',
'                        <div style="font-weight:bold; color:#ffffff;">FILTER SETTINGS</div>',
'                        <div style="color:#64748b; font-size:10px;">Price (<span id="summaryPrice">OFF</span>) & Area (<span id="summaryArea">OFF</span>)</div>',
'                    </div>',
'                </div>',
'                <span style="color:#38bdf8; font-size:18px; font-weight:bold;">›</span>',
'            </div>',
'            <div class="quick-action-item flex-between" style="margin-bottom:8px;" onclick="showPermissionSettingsView()">',
'                <div class="flex">',
'                    <span style="font-size:18px; margin-right:10px; color:#10b981;">🔑</span>',
'                    <div>',
'                        <div style="font-weight:bold; color:#ffffff;">PERMISSION SETTINGS</div>',
'                        <div style="color:#64748b; font-size:10px;">Accessibility, Overlay & Battery Saver</div>',
'                    </div>',
'                </div>',
'                <span style="color:#10b981; font-size:18px; font-weight:bold;">›</span>',
'            </div>',
'            <div class="grid-2">',
'                <div class="quick-action-item flex" onclick="sendToAutoJS(\'SUPPORT\')">',
'                    <span style="font-size:16px; margin-right:8px;">💬</span>',
'                    <div><div style="font-weight:bold; font-size:11px;">SUPPORT</div><div style="color:#64748b; font-size:9px;">WhatsApp Admin</div></div>',
'                </div>',
'                <div class="quick-action-item flex" onclick="sendToAutoJS(\'LOGOUT\')">',
'                    <span style="font-size:16px; margin-right:8px;">🚪</span>',
'                    <div><div style="font-weight:bold; font-size:11px; color:#f43f5e;">LOGOUT</div><div style="color:#64748b; font-size:9px;">Secure Exit</div></div>',
'                </div>',
'            </div>',
'        </div>',
'        <div class="bottom-nav">',
'            <div class="nav-item active" onclick="showDashboardView()"><div style="font-size:16px;">🏠</div><div>Home</div></div>',
'            <div class="nav-item" onclick="showPlansView()"><div style="font-size:16px;">📊</div><div>Plans</div></div>',
'            <div class="nav-item" onclick="sendToAutoJS(\'SUPPORT\')"><div style="font-size:16px;">💬</div><div>Support</div></div>',
'            <div class="nav-item" onclick="showPermissionSettingsView()"><div style="font-size:16px;">⚙️</div><div>Settings</div></div>',
'        </div>',
'    </div>',

'    <div id="plansView" class="hidden">',
'        <button class="btn-glow-blue" style="margin-bottom: 12px; padding: 8px 14px;" onclick="showDashboardView()">⬅️ BACK TO DASHBOARD</button>',
'        <div class="card" style="text-align: center; padding: 16px;">',
'            <div style="background: rgba(16,185,129,0.1); width: 60px; height: 60px; border-radius: 50%; border: 1px solid #10b981; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; font-size: 28px;">🛺</div>',
'            <div style="font-size: 20px; font-weight: bold; color: #ffffff;">NURA <span style="color:#38bdf8;">AUTO CLICKER</span></div>',
'            <div style="color:#38bdf8; font-size:11px; margin-top: 2px;">✦ Smart Auto Order Assistant ✦</div>',
'        </div>',
'        <div class="grid-3" style="margin-bottom: 14px;">',
'            <div class="plan-card plan-card-green" onclick="disabledPlanMsg(\'Price Filter (Rs. 200) is disabled. Please select Premium All Options (Rs. 300).\')">',
'                <div>',
'                    <span class="plan-badge" style="background:#064e3b; color:#34d399;">DISABLED</span>',
'                    <div class="plan-icon" style="background:rgba(16,185,129,0.2); color:#10b981;">🍸</div>',
'                    <div style="font-weight:bold; font-size:11px; color:#fff;">PRICE FILTER</div>',
'                    <div style="color:#10b981; font-size:9px; margin-top:4px;">✖ Disabled</div>',
'                </div>',
'                <div style="margin-top:10px;"><div style="font-size:15px; font-weight:bold; color:#10b981;">Rs. 200</div><button class="btn-red" style="width:100%; padding:4px; font-size:9px; margin-top:4px;">OFF</button></div>',
'            </div>',
'            <div class="plan-card plan-card-blue" onclick="disabledPlanMsg(\'Area Filter (Rs. 200) is disabled. Please select Premium All Options (Rs. 300).\')">',
'                <div>',
'                    <span class="plan-badge" style="background:#0c4a6e; color:#38bdf8;">DISABLED</span>',
'                    <div class="plan-icon" style="background:rgba(2,132,199,0.2); color:#38bdf8;">📍</div>',
'                    <div style="font-weight:bold; font-size:11px; color:#fff;">AREA FILTER</div>',
'                    <div style="color:#38bdf8; font-size:9px; margin-top:4px;">✖ Disabled</div>',
'                </div>',
'                <div style="margin-top:10px;"><div style="font-size:15px; font-weight:bold; color:#38bdf8;">Rs. 200</div><button class="btn-red" style="padding:4px; font-size:9px; margin-top:4px;">OFF</button></div>',
'            </div>',
'            <div class="plan-card plan-card-purple plan-card-active" onclick="choosePlan(\'All Options (Premium)\', 300, 3)">',
'                <span class="best-choice-ribbon">⭐ OFFER</span>',
'                <div>',
'                    <span class="plan-badge" style="background:#581c87; color:#c084fc;">PREMIUM</span>',
'                    <div class="plan-icon" style="background:rgba(168,85,247,0.2); color:#c084fc;">⭐</div>',
'                    <div style="font-weight:bold; font-size:11px; color:#fff;">ALL OPTIONS</div>',
'                    <div style="color:#c084fc; font-size:9px; margin-top:4px;">✔ Price + Area Both</div>',
'                </div>',
'                <div style="margin-top:10px;"><div style="font-size:15px; font-weight:bold; color:#c084fc;">Rs. 300</div><button class="btn-glow-purple" style="padding:4px; font-size:9px; margin-top:4px;" onclick="payPlan(\'All Options\', 300)">SELECT ›</button></div>',
'            </div>',
'        </div>',
'    </div>',

'    <div id="filterView" class="hidden">',
'        <div class="card card-highlight flex-between">',
'            <div><div style="font-weight:bold; font-size:15px; color:#ffffff;">⚙️ FILTER SETTINGS (v51.0)</div><div style="color:#38bdf8; font-size:10px;">Configure Preferences</div></div>',
'            <button class="btn-glow-blue" style="width:auto; padding:6px 14px;" onclick="showDashboardView()">⬅️ BACK</button>',
'        </div>',
'        <div class="card">',
'            <label class="checkbox-container"><input type="checkbox" id="usePriceCb" onclick="checkPriceCheckbox(this)"><span style="font-weight:bold; color:#10b981; font-size:14px;">💰 Enable Price Filter</span></label>',
'            <div class="grid-2" style="margin-top:10px;">',
'                <div><span style="color:#94a3b8; font-size:10px; font-weight:bold;">Min Price (Rs.):</span><input type="number" id="minPriceInput" value="40"></div>',
'                <div><span style="color:#94a3b8; font-size:10px; font-weight:bold;">Max Price (Rs. Max 10000):</span><input type="number" id="maxPriceInput" value="10000"></div>',
'            </div>',
'            <label class="checkbox-container" style="margin-top:14px; border-top:1px solid rgba(255,255,255,0.08); padding-top:10px;"><input type="checkbox" id="useSkipBelowMinCb"><span style="font-weight:bold; color:#f43f5e; font-size:13px;">🚫 Skip Orders Below Min Price (Auto Skip)</span></label>',
'            <div style="color:#94a3b8; font-size:10px; margin-left:26px;">குறிப்பிட்ட குறைந்த விலைக்கு கீழே வரும் ஆர்டர்களை (Minus பட்டன் மூலம்) ஆட்டோமேட்டிக்காக ஸ்கிப் செய்யும்.</div>',
'        </div>',
'        <div class="card" style="border: 1px solid rgba(56, 189, 248, 0.2);">',
'            <label class="checkbox-container"><input type="checkbox" id="useSearchAreaCb" onclick="toggleSearchAreaCb(this)"><span style="font-weight:bold; color:#38bdf8; font-size:14px;">🔍 Search Area by Name</span></label>',
'            <div style="margin-top:8px;"><span style="color:#94a3b8; font-size:10px;">Area Names (Comma separated):</span><input type="text" id="customAreaInput" placeholder="e.g. Saravanampatti,Railway Jn CBT"></div>',
'        </div>',
'        <div class="card" style="border: 1px solid rgba(245, 158, 11, 0.2);">',
'            <label class="checkbox-container"><input type="checkbox" id="useAreaCb" onclick="toggleAreaCb(this)"><span style="font-weight:bold; color:#f59e0b; font-size:14px;">📍 Area Filter (Checkbox Selection)</span></label>',
'            <div class="grid-2" style="margin:10px 0;"><button class="btn-green" style="padding:8px; font-size:11px;" onclick="toggleAllAreas(true)">SELECT ALL (34)</button><button class="btn-red" style="padding:8px; font-size:11px;" onclick="toggleAllAreas(false)">CLEAR ALL</button></div>',
'            <div id="areaContainer" style="max-height:180px; overflow-y:auto; border:1px solid #1e293b; padding:8px; border-radius:12px; background:#030712;"></div>',
'        </div>',
'        <button class="btn-green" style="width:100%; padding:14px; font-size:14px; margin-top:8px; box-shadow:0 0 15px rgba(16,185,129,0.4);" onclick="saveAndApplyFilters()">✓ SAVE & APPLY FILTERS</button>',
'    </div>',

'    <script>',
'        var areaList = ["Saravanampatti", "Idikarai", "Thudiyalur", "Keeranatham", "Ganapathy", "Sanganoor", "Nallampalayam", "Chinnavedampatti", "Vellakinar", "Koundampalayam", "Rathinapuri", "Gn Mills", "SNS", "Murugan Nagar", "Periyanaikenpalayam", "Nayakkan Palyam", "Ganapathypudur", "Kalapatti", "Vellalore", "Nanjundapuram", "PSG", "R.S. Puram", "Sai Baba Colony", "Vadavalli", "Edayarpalayam", "Vilankurichi", "Kanuvai", "Pannimadai", "Gandhipuram", "Tatabad", "Vedapatty", "Peelamedu", "Railway Jn CBT", "Railway Station"];',
'        var serverAllowPrice = false; var serverAllowArea = false; var savedSelectedAreas = [];',
'        var activePlanName = "All Options (Premium)"; var activePlanAmount = 300;',
'        function sendToAutoJS(act, data) { var payload = { action: act, data: data || {} }; console.log("NATIVE_ACTION:" + JSON.stringify(payload)); }',
'        function doLogin() { var email = document.getElementById(\'emailInput\').value.trim(); var pass = document.getElementById(\'passInput\').value.trim(); if (!email || !pass) { alert("Email and Password are required!"); return; } sendToAutoJS(\'LOGIN\', { email: email, pass: pass }); }',
'        function showRegisterPage() { document.getElementById(\'loginView\').classList.add(\'hidden\'); document.getElementById(\'registerView\').classList.remove(\'hidden\'); }',
'        function showLoginPage() { document.getElementById(\'registerView\').classList.add(\'hidden\'); document.getElementById(\'loginView\').classList.remove(\'hidden\'); }',
'        function doRegister() { var email = document.getElementById(\'regEmailInput\').value.trim(); var pass = document.getElementById(\'regPassInput\').value.trim(); var vehicleType = document.getElementById(\'regVehicleInput\').value; if (!email || !pass) { alert("Email and Password are required!"); return; } sendToAutoJS(\'REGISTER\', { email: email, pass: pass, vehicleType: vehicleType }); }',
'        function choosePlan(name, amt, num) {',
'            if(num !== 3) { alert("This plan is disabled. Please select Premium All Options (Rs. 300)."); return; }',
'            activePlanName = name; activePlanAmount = amt;',
'            document.getElementById(\'pCard3\').classList.add(\'plan-card-active\');',
'            document.getElementById(\'selectedPlanLbl\').innerHTML = \'<span style="color:#c084fc">\' + name + \' (Rs. \' + amt + \')</span>\';',
'        }',
'        function disabledPlanMsg(msg) { alert(msg); }',
'        function contactAdminWhatsApp() { sendToAutoJS(\'CONTACT_WHATSAPP\', { planName: activePlanName, amount: activePlanAmount }); }',
'        function payViaUniversalUPI() { sendToAutoJS(\'START_UNIVERSAL_UPI\', { planName: activePlanName, amount: activePlanAmount }); }',
'        function checkStatusAction() { sendToAutoJS(\'CHECK_STATUS\'); }',
'        function hideAllViews() { document.getElementById(\'loginView\').classList.add(\'hidden\'); document.getElementById(\'registerView\').classList.add(\'hidden\'); document.getElementById(\'waitView\').classList.add(\'hidden\'); document.getElementById(\'verifyView\').classList.add(\'hidden\'); document.getElementById(\'dashboardView\').classList.add(\'hidden\'); document.getElementById(\'plansView\').classList.add(\'hidden\'); document.getElementById(\'filterView\').classList.add(\'hidden\'); document.getElementById(\'permissionView\').classList.add(\'hidden\'); }',
'        function showPermissionSettingsView() { hideAllViews(); document.getElementById(\'permissionView\').classList.remove(\'hidden\'); sendToAutoJS(\'CHECK_PERMISSIONS\'); }',
'        function showFilterPage() { hideAllViews(); document.getElementById(\'filterView\').classList.remove(\'hidden\'); renderAreaList(); }',
'        function showPlansView() { hideAllViews(); document.getElementById(\'plansView\').classList.remove(\'hidden\'); }',
'        function showDashboardView() { hideAllViews(); document.getElementById(\'dashboardView\').classList.remove(\'hidden\'); }',
'        function payPlan(planName, amount) { payViaUniversalUPI(); }',
'        function checkPriceCheckbox(cb) { if (!serverAllowPrice) { cb.checked = false; sendToAutoJS(\'SHOW_TOAST\', "Price filter is not enabled by admin!"); } }',
'        function toggleSearchAreaCb(cb) { if (!serverAllowArea) { cb.checked = false; sendToAutoJS(\'SHOW_TOAST\', "Area filter is not enabled by admin!"); return; } if (cb.checked) { document.getElementById(\'useAreaCb\').checked = false; } }',
'        function toggleAreaCb(cb) { if (!serverAllowArea) { cb.checked = false; sendToAutoJS(\'SHOW_TOAST\', "Area filter is not enabled by admin!"); return; } if (cb.checked) { document.getElementById(\'useSearchAreaCb\').checked = false; } }',
'        function renderAreaList() { var html = ""; for(var i=0; i<areaList.length; i++) { var isChecked = savedSelectedAreas.indexOf(areaList[i]) !== -1 ? "checked" : ""; html += \'<label class="checkbox-container"><input type="checkbox" class="area-checkbox" \' + isChecked + \' \' + (!serverAllowArea ? \'onclick="checkAreaListClick(event)"\' : \'\') + \' value="\' + areaList[i] + \'"> \' + (i+1) + \'. \' + areaList[i] + \'</label>\'; } document.getElementById(\'areaContainer\').innerHTML = html; }',
'        function checkAreaListClick(e) { if (!serverAllowArea) { e.preventDefault(); e.target.checked = false; sendToAutoJS(\'SHOW_TOAST\', "Area filter is not enabled by admin!"); } }',
'        function toggleAllAreas(status) { if (!serverAllowArea && status) { sendToAutoJS(\'SHOW_TOAST\', "Area filter is not enabled by admin!"); return; } var cbs = document.querySelectorAll(\'.area-checkbox\'); for(var i=0; i<cbs.length; i++) cbs[i].checked = status; }',
'        function saveAndApplyFilters() { var priceChecked = document.getElementById(\'usePriceCb\').checked; var skipBelowChecked = document.getElementById(\'useSkipBelowMinCb\').checked; var areaChecked = document.getElementById(\'useAreaCb\').checked; var searchAreaChecked = document.getElementById(\'useSearchAreaCb\').checked; var customSearchStr = document.getElementById(\'customAreaInput\').value.trim(); if (priceChecked && !serverAllowPrice) { sendToAutoJS(\'SHOW_TOAST\', "Price filter is disabled by admin!"); return; } if ((areaChecked || searchAreaChecked) && !serverAllowArea) { sendToAutoJS(\'SHOW_TOAST\', "Area filter is disabled by admin!"); return; } var minP = document.getElementById(\'minPriceInput\').value; var maxP = document.getElementById(\'maxPriceInput\').value; var selAreas = []; var cbs = document.querySelectorAll(\'.area-checkbox\'); for(var i=0; i<cbs.length; i++) { if(cbs[i].checked) selAreas.push(cbs[i].value); } savedSelectedAreas = selAreas; sendToAutoJS(\'SAVE_FILTERS\', { usePriceFilter: priceChecked, useSkipBelowMin: skipBelowChecked, useAreaFilter: areaChecked, useSearchAreaFilter: searchAreaChecked, customAreaSearchStr: customSearchStr, minPrice: parseInt(minP) || 40, maxPrice: parseInt(maxP) || 10000, selectedAreas: selAreas }); showDashboardView(); }',
'        function updatePillState(pillId, textId, knobId, isOn) { var pill = document.getElementById(pillId); var text = document.getElementById(textId); var knob = document.getElementById(knobId); if (pill && text && knob) { if (isOn) { pill.className = "toggle-pill toggle-pill-on"; text.className = "toggle-text text-on"; text.innerText = "ON"; knob.className = "toggle-knob knob-on"; } else { pill.className = "toggle-pill toggle-pill-off"; text.className = "toggle-text text-off"; text.innerText = "OFF"; knob.className = "toggle-knob knob-off"; } } }',
'        function updateDashboard(data) { var btnAcc = document.getElementById(\'btnAccessibility\'); var btnOvl = document.getElementById(\'btnOverlay\'); var btnBat = document.getElementById(\'btnBattery\'); if (btnAcc && btnOvl && btnBat) { btnAcc.className = data.hasAccessibility ? "perm-btn perm-btn-active" : "perm-btn"; btnAcc.innerText = data.hasAccessibility ? "✓ ENABLED" : "ENABLE ➔"; btnOvl.className = data.hasOverlay ? "perm-btn perm-btn-active" : "perm-btn"; btnOvl.innerText = data.hasOverlay ? "✓ ENABLED" : "ENABLE ➔"; btnBat.className = data.hasBattery ? "perm-btn perm-btn-active" : "perm-btn"; btnBat.innerText = data.hasBattery ? "✓ ENABLED" : "ENABLE ➔"; } serverAllowPrice = data.allowPrice; serverAllowArea = data.allowArea; if (data.minPrice) document.getElementById(\'minPriceInput\').value = data.minPrice; if (data.maxPrice) document.getElementById(\'maxPriceInput\').value = data.maxPrice; if (data.selectedAreas) savedSelectedAreas = data.selectedAreas; if (data.customAreaSearchStr !== undefined) document.getElementById(\'customAreaInput\').value = data.customAreaSearchStr; document.getElementById(\'usePriceCb\').checked = serverAllowPrice && data.usePriceFilter; document.getElementById(\'useSkipBelowMinCb\').checked = data.useSkipBelowMin; document.getElementById(\'useAreaCb\').checked = serverAllowArea && data.useAreaFilter; document.getElementById(\'useSearchAreaCb\').checked = serverAllowArea && data.useSearchAreaFilter; var summaryText = "OFF"; if (serverAllowArea && data.useSearchAreaFilter && data.customAreaSearchStr) { summaryText = "🔍 Search: " + data.customAreaSearchStr; } else if (serverAllowArea && data.useAreaFilter) { summaryText = "📍 " + (data.selectedAreas ? data.selectedAreas.length : 0) + \' Selected\'; } document.getElementById(\'summaryPrice\').innerText = (serverAllowPrice && data.usePriceFilter) ? (\'Rs. \' + data.minPrice + \' - Rs. \' + data.maxPrice) : \'OFF\'; document.getElementById(\'summaryArea\').innerText = summaryText; if (data.driverIndex) { var badgeEl = document.getElementById(\'driverIndexBadge\'); if(badgeEl) badgeEl.innerText = "வரிசை எண்: #" + data.driverIndex; var uInd = document.getElementById(\'userDriverIndex\'); if(uInd) uInd.innerText = "#" + data.driverIndex; }',
'        if (data.hasUpdate) { var upd = document.getElementById(\'updateBadge\'); if(upd) { upd.className = "badge-version flex badge-update-glow"; } var uTxt = document.getElementById(\'updateTxt\'); if(uTxt) { uTxt.innerText = data.updateTxt || "UPDATE v51.0 🚀"; } }',
'        if (data.view === \'LOGIN\') { hideAllViews(); document.getElementById(\'loginView\').classList.remove(\'hidden\'); } else if (data.view === \'REGISTER\') { hideAllViews(); document.getElementById(\'registerView\').classList.remove(\'hidden\'); } else if (data.view === \'WAIT\') { hideAllViews(); if(data.email) document.getElementById(\'waitDriverEmail\').value = data.email; document.getElementById(\'waitView\').classList.remove(\'hidden\'); } else if (data.view === \'VERIFY\') { hideAllViews(); document.getElementById(\'verifyView\').classList.remove(\'hidden\'); } else if (data.view === \'DASHBOARD\') { if (document.getElementById(\'permissionView\').classList.contains(\'hidden\') && document.getElementById(\'filterView\').classList.contains(\'hidden\') && document.getElementById(\'plansView\').classList.contains(\'hidden\')) { hideAllViews(); document.getElementById(\'dashboardView\').classList.remove(\'hidden\'); } if (data.email) { var emailStr = data.email; var keyStr = emailStr.replace(/[^a-zA-Z0-9]/g, \'_\'); document.getElementById(\'userEmailTxt\').innerText = emailStr; document.getElementById(\'userEmailTitle\').innerText = keyStr; document.getElementById(\'userEmailSub\').innerText = emailStr; document.getElementById(\'userAvatar\').innerText = emailStr.charAt(0).toUpperCase(); } if (data.vehicleType) { var vIcon = "🛺 Auto"; if (data.vehicleType === "Bike") vIcon = "🏍 Bike"; if (data.vehicleType === "Cab") vIcon = "🚗 Cab (Car)"; document.getElementById(\'userVehicleTxt\').innerText = vIcon; } if (data.androidId) document.getElementById(\'userAndroidId\').innerText = data.androidId; if (data.daysLeft) document.getElementById(\'validityDaysTxt\').innerText = data.daysLeft; if (data.expiresOn) document.getElementById(\'expiresOnTxt\').innerText = data.expiresOn; if (data.lastPrice) document.getElementById(\'lastPriceTxt\').innerText = data.lastPrice; if (data.lastArea) document.getElementById(\'lastAreaTxt\').innerText = data.lastArea; if (data.lastTime) document.getElementById(\'lastTimeTxt\').innerText = \'🕒 \' + data.lastTime; if (data.todayEarnings) document.getElementById(\'todayEarningsTxt\').innerText = data.todayEarnings; if (data.todayOrdersCount) document.getElementById(\'todayOrdersTxt\').innerText = data.todayOrdersCount; updatePillState(\'areaFilterPill\', \'areaText\', \'areaKnob\', data.allowArea); updatePillState(\'priceFilterPill\', \'priceText\', \'priceKnob\', data.allowPrice); var isApproved = (data.status === "APPROVED" || data.status === "SUCCESS" || data.status === "OK"); updatePillState(\'statusFilterPill\', \'statusText\', \'statusKnob\', isApproved); var statusTxt = document.getElementById(\'statusTxt\'); var statusDot = document.getElementById(\'statusDot\'); var statusSub = document.getElementById(\'statusSub\'); var startBtnBox = document.getElementById(\'startBtnBox\'); var startBtnLabel = document.getElementById(\'startBtnLabel\'); var startBtnIcon = document.getElementById(\'startBtnIcon\'); if (data.isRunning) { statusTxt.innerText = "ONLINE"; statusTxt.style.color = "#10b981"; statusDot.className = "dot dot-green"; statusSub.innerText = "Scanning for rides 24/7"; startBtnBox.className = "start-btn-container start-btn-running"; startBtnLabel.innerText = "STOP"; startBtnIcon.innerText = "■"; startBtnIcon.style.color = "#10b981"; } else { statusTxt.innerText = "OFFLINE"; statusTxt.style.color = "#e11d48"; statusDot.className = "dot dot-red"; statusSub.innerText = "Tap START to begin auto-accepting orders"; startBtnBox.className = "start-btn-container"; startBtnLabel.innerText = "START"; startBtnIcon.innerText = "▶"; startBtnIcon.style.color = "#e11d48"; } } }',
'    </script>',
'</body>',
'</html>'
];

var htmlContent = htmlLinesPart1.concat(htmlLinesPart2).join("\n");

ui.layout(
    '<vertical w="*" h="*"><webview id="web" w="*" h="*"/></vertical>'
);

ui.run(function() {
    try {
        var settings = ui.web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setDatabaseEnabled(true);
    } catch(e) {}
});

files.write(htmlFilePath, htmlContent);
ui.web.loadUrl("file://" + htmlFilePath);

var WebChromeClient = android.webkit.WebChromeClient;
ui.web.setWebChromeClient(new JavaAdapter(WebChromeClient, {
    onConsoleMessage: function(msg) {
        try {
            var text = msg.message();
            if (text && text.indexOf("NATIVE_ACTION:") === 0) {
                var jsonStr = text.replace("NATIVE_ACTION:", "");
                var packet = JSON.parse(jsonStr);
                handleNativeAction(packet);
                return true;
            }
        } catch(e) {}
        return false;
    }
}));

var globalCachedApkUrl = null;
var globalLatestVersionName = null;

function checkSystemPermissions() {
    var hasAcc = auto.service != null;
    var hasOvl = true;
    try {
        hasOvl = android.provider.Settings.canDrawOverlays(context);
    } catch(e) {}
    
    var pm = context.getSystemService(android.content.Context.POWER_SERVICE);
    var hasBat = pm.isIgnoringBatteryOptimizations(context.getPackageName());

    return {
        hasAccessibility: hasAcc,
        hasOverlay: hasOvl,
        hasBattery: hasBat,
        allGranted: (hasAcc && hasOvl && hasBat)
    };
}

function handleNativeAction(packet) {
    switch (packet.action) {
        case "REQ_ACCESSIBILITY":
            try { app.startActivity({ action: "android.settings.ACCESSIBILITY_SETTINGS" }); } catch(e) {}
            break;

        case "REQ_OVERLAY":
            try {
                var intent = new android.content.Intent(android.provider.Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    android.net.Uri.parse("package:" + context.getPackageName()));
                intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(intent);
            } catch(e) {
                try { floaty.requestPermission(); } catch(err) {}
            }
            break;

        case "REQ_BATTERY":
            try {
                var intent = new android.content.Intent(android.provider.Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS,
                    android.net.Uri.parse("package:" + context.getPackageName()));
                intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(intent);
            } catch(e) {}
            break;

        case "CHECK_PERMISSIONS":
            var pStatus = checkSystemPermissions();
            if (pStatus.allGranted) {
                toastLog("✅ All permissions granted successfully!");
            } else {
                toastLog("⚠️ Please enable missing permissions!");
            }
            syncUIState();
            break;

        case "COPY_UPI":
            try {
                var clipboard = context.getSystemService(android.content.Context.CLIPBOARD_SERVICE);
                var clip = android.content.ClipData.newPlainText("Razorpay Link", RAZORPAY_PAYMENT_LINK);
                clipboard.setPrimaryClip(clip);
                toastLog("📋 Razorpay Link Copied!");
            } catch(e) { toastLog("❌ Copy failed: " + e); }
            break;

        case "CONTACT_WHATSAPP":
            openWhatsAppSupport("Subscription Plan Purchase", packet.data ? (packet.data.planName + " - Rs. " + packet.data.amount) : "General");
            break;

        case "START_UNIVERSAL_UPI":
            var pName = packet.data ? packet.data.planName : "All Options (Premium)";
            var pAmt = packet.data ? packet.data.amount : 300;
            
            ui.run(function() {
                confirm("💳 Razorpay Payment", "பணம் செலுத்திய பிறகு ஸ்கிரீன்ஷா트를 எடுத்துக்கொண்டு வாட்ஸ்அப்பில் அட்மினுக்கு அனுப்பவும்.\n\nபணம் செலுத்த 'OK' அழுத்தவும்.", function(confirmed) {
                    if (confirmed) {
                        try {
                            app.openUrl(RAZORPAY_PAYMENT_LINK);
                            toastLog("🌐 Opening Razorpay Payment Page...");
                        } catch(e) {
                            toastLog("❌ Error opening payment link: " + e);
                        }
                    }
                });
            });
            break;

        case "LOGIN":
            processLogin(packet.data.email, packet.data.pass);
            break;

        case "REGISTER":
            processRegister(packet.data.email, packet.data.pass, packet.data.vehicleType);
            break;

        case "CHECK_STATUS":
            processCheckStatus();
            break;

        case "TOGGLE_START":
            toggleAutoClicker();
            break;

        case "SAVE_FILTERS":
            var data = packet.data;
            usePriceFilter = data.usePriceFilter;
            useSkipBelowMin = data.useSkipBelowMin;
            useAreaFilter = data.useAreaFilter;
            useSearchAreaFilter = data.useSearchAreaFilter;
            customAreaSearchStr = data.customAreaSearchStr || "";
            minPrice = data.minPrice;
            maxPrice = data.maxPrice;
            selectedAreas = data.selectedAreas;

            storage.put("usePriceFilter", usePriceFilter);
            storage.put("useSkipBelowMin", useSkipBelowMin);
            storage.put("useAreaFilter", useAreaFilter);
            storage.put("useSearchAreaFilter", useSearchAreaFilter);
            storage.put("customAreaSearchStr", customAreaSearchStr);
            storage.put("minPrice", minPrice);
            storage.put("maxPrice", maxPrice);
            storage.put("selectedAreas", selectedAreas);
            toastLog("✅ Filters saved successfully!");
            syncUIState();
            break;

        case "SHOW_TOAST":
            toastLog(packet.data);
            break;

        case "SUPPORT":
            openWhatsAppSupport("Customer Support", "Help Enquiry");
            break;

        case "UPDATE":
            if (globalCachedApkUrl) {
                toastLog("⏳ Downloading update in background...");
                downloadAndInstallAPKDirect(globalCachedApkUrl);
            } else {
                checkForAppUpdates(true);
            }
            break;

        case "LOGOUT":
            logoutAction();
            break;

        case "EXIT":
            stopAndExit();
            exit();
            break;
    }
}

function processLogin(email, pass) {
    if (!email || !pass) {
        toastLog("❌ Email and password required!");
        return;
    }
    
    email = email.trim(); 
    pass = pass.trim();

    storage.put("is_approved", false);
    storage.remove("email");

    toastLog("⏳ Verifying login credentials...");
    var emailKey = getFirebaseEmailKey(email);
    var currentAndroidId = getSafeAndroidId();

    threads.start(function() {
        try {
            // 🛡️️ பாதுகாப்பு சோதனை: இந்த மொபைல் ஐடி ஏற்கனவே வேறு அக்கவுண்டுக்கு உள்ளதா?
            var existingEmailForDevice = checkDeviceAlreadyUsed();
            if (existingEmailForDevice && existingEmailForDevice.toLowerCase() !== email.toLowerCase()) {
                ui.run(function() { 
                    alert("❌ Device Lock Blocked!", "இந்த மொபைல் ஏற்கனவே மற்றொரு கணக்குடன் (`" + existingEmailForDevice + "`) இணைக்கப்பட்டுள்ளது. புதிய கணக்கை உருவாக்க முடியாது!"); 
                });
                syncUIState();
                return;
            }

            var userObj = firebaseGetUser(emailKey);

            if (userObj && userObj.data) {
                var userData = userObj.data;

                if (!userData || !userData.email) {
                    ui.run(function() { alert("❌ Login Error!", "This account does not exist."); });
                    syncUIState();
                    return;
                }

                if (String(userData.password).trim() !== pass) {
                    ui.run(function() { alert("❌ Login Error!", "Incorrect password."); });
                    syncUIState();
                    return;
                }

                var registeredAndroidId = userData.androidId ? String(userData.androidId).trim() : "";
                if (registeredAndroidId !== "" && registeredAndroidId !== currentAndroidId) {
                    ui.run(function() { alert("❌ Login Blocked!", "This account is bound to another device. Please contact admin."); });
                    syncUIState();
                    return;
                }

                var statusStr = String(userData.status || "PENDING").toUpperCase().trim();
                var isApprovedFlag = (statusStr === "APPROVED" || statusStr === "SUCCESS" || statusStr === "OK") && (userData.approved !== false) && (userData.isApproved !== false);

                if (userData.driverIndex) {
                    storage.put("driver_index", userData.driverIndex);
                }

                if (isApprovedFlag) {
                    if (userData.expiryDate && Number(userData.expiryDate) > 0) {
                        storage.put("firebase_expiry_ms", Number(userData.expiryDate));
                        
                        if (Date.now() >= Number(userData.expiryDate)) {
                            ui.run(function() { alert("🚫 Subscription Expired!", "Your plan has expired! Please contact Admin on WhatsApp to renew."); });
                            storage.put("email", email);
                            storage.put("user_password", pass);
                            storage.put("is_approved", false);
                            syncUIState();
                            return;
                        }
                    }

                    try {
                        firebasePatch(userObj.path, { androidId: currentAndroidId, lastLogin: Date.now() });
                    } catch(e) {}

                    storage.put("email", email);
                    storage.put("user_password", pass);
                    storage.put("is_approved", true);
                    if (userData.vehicleType) {
                        storage.put("userVehicleType", userData.vehicleType);
                        userVehicleType = userData.vehicleType;
                    }

                    allowAreaPermission = (userData.allowArea === true || userData.allowArea === "true" || userData.allowArea === "YES");
                    allowPricePermission = (userData.allowPrice === true || userData.allowPrice === "true" || userData.allowPrice === "YES");
                    storage.put("allow_area_perm", allowAreaPermission);
                    storage.put("allow_price_perm", allowPricePermission);

                    startRemoteKillSwitch(email);
                    syncUIState();
                    toastLog("✅ Login successful!");
                    return;
                } 
                else if (statusStr === "PENDING" || userData.approved === false) {
                    storage.put("email", email);
                    storage.put("user_password", pass);
                    storage.put("is_approved", false);
                    startRemoteKillSwitch(email);
                    syncUIState();
                } 
                else if (statusStr === "REJECTED" || statusStr === "SUSPENDED") {
                    ui.run(function() { alert("❌ Account Suspended!", "Your account has been suspended by the administrator."); });
                } 
                else {
                    ui.run(function() { alert("❌ Login Error!", "Account not found."); });
                }
            } else {
                toastLog("❌ Account not found! Please register.");
            }
        } catch(e) {
            toastLog("❌ Error: " + e);
        }

        syncUIState();
    });
}

function processRegister(email, pass, vehicleType) {
    if (!email || !pass) {
        toastLog("❌ Email and password required!");
        return;
    }
    
    email = email.trim(); 
    pass = pass.trim();
    vehicleType = vehicleType || "Auto";

    toastLog("⏳ Registering account & activating 1-Day Free Trial...");
    var currentAndroidId = getSafeAndroidId();

    threads.start(function() {
        try {
            // 🛡️ பாதுகாப்பு சோதனை: இந்த மொபைல் ஐடி ஏற்கனவே வேறு அக்கவுண்டுக்கு உள்ளதா?
            var existingEmailForDevice = checkDeviceAlreadyUsed();
            if (existingEmailForDevice) {
                ui.run(function() { 
                    alert("❌ Device Lock Blocked!", "இந்த மொபைல் ஏற்கனவே மற்றொரு கணக்குடன் (`" + existingEmailForDevice + "`) இணைக்கப்பட்டுள்ளது. புதிய இலவச ட்ரையல் கணக்கை உருவாக்க முடியாது!"); 
                });
                return;
            }

            var emailKey = getFirebaseEmailKey(email);
            var checkRes = firebaseGetUser(emailKey);
            if (checkRes && checkRes.data && checkRes.data.email) {
                ui.run(function() { alert("⚠️ Account Exists!", "This email ID is already registered. Please login."); });
                return;
            }

            var assignedIndex = getNextDriverIndex();
            var trialExpiryMs = Date.now() + (24 * 60 * 60 * 1000);

            var newUserObj = {
                email: email,
                password: pass,
                vehicleType: vehicleType,
                status: "APPROVED",
                approved: true,
                isApproved: true,
                allowArea: true,
                allowPrice: true,
                plan: "1-Day Free Trial",
                requestedPlan: "1-Day Free Trial",
                expiryDate: trialExpiryMs,
                androidId: currentAndroidId,
                driverIndex: assignedIndex,
                registeredAt: Date.now()
            };

            firebasePut("/users/" + emailKey, newUserObj);

            storage.put("email", email);
            storage.put("user_password", pass);
            storage.put("userVehicleType", vehicleType);
            storage.put("is_approved", true);
            storage.put("allow_area_perm", true);
            storage.put("allow_price_perm", true);
            storage.put("firebase_expiry_ms", trialExpiryMs);
            storage.put("driver_index", assignedIndex);
            userVehicleType = vehicleType;

            allowAreaPermission = true;
            allowPricePermission = true;

            startRemoteKillSwitch(email);
            syncUIState();
            
            ui.run(function() {
                alert("🎉 1-Day Free Trial Activated!", "உங்களுக்கு 1 நாள் இலவச அனுமதி வழங்கப்பட்டுள்ளது! Driver No: #" + assignedIndex);
            });
            toastLog("✅ Registration complete! 1-Day Free Trial Active.");
        } catch(e) {
            toastLog("❌ Registration failed: " + e);
        }
    });
}

function processCheckStatus() {
    var email = storage.get("email", "");
    if (!email) { syncUIState(); return; }
    email = email.trim();
    toastLog("🔍 Checking server approval status...");
    threads.start(function() {
        var status = checkUserStatus(email);
        if (status === "APPROVED") {
            storage.put("is_approved", true);
            startRemoteKillSwitch(email);
            fetchPermissionsFromFirebase(email);
            syncUIState();
            toastLog("✅ Account approved! Welcome.");
        } else if (status === "DELETED") {
            logoutAction();
            ui.run(function() { alert("❌ Account Removed", "Your account has been deleted by Admin."); });
        } else {
            toastLog("❌ Server approval is still pending!");
            ui.run(function() { alert("⏳ Still Pending", "அட்மின் இன்னும் அப்ரூவ் செய்யவில்லை. தயவுசெய்து சிறிது நேரம் காத்திருக்கவும் அல்லது வாட்ஸ்அப்பில் ஸ்கிரீன்ஷாட் அனுப்பவும்."); });
            syncUIState();
        }
    });
}

function checkUserStatus(email) {
    try {
        var emailKey = getFirebaseEmailKey(email);
        var userObj = firebaseGetUser(emailKey);
        if (!userObj || !userObj.data || !userObj.data.email) {
            return "DELETED";
        }
        var d = userObj.data;
        var s = String(d.status || "").toUpperCase().trim();
        if ((s === "APPROVED" || s === "SUCCESS" || s === "OK") && d.approved !== false && d.isApproved !== false) {
            return "APPROVED";
        }
        return "PENDING";
    } catch(e) { return "ERROR"; }
}

function fetchPermissionsFromFirebase(email) {
    threads.start(function() {
        try {
            var emailKey = getFirebaseEmailKey(email);
            var userObj = firebaseGetUser(emailKey);
            if (userObj && userObj.data) {
                var data = userObj.data;
                allowAreaPermission = (data.allowArea === true || data.allowArea === "true" || data.allowArea === "YES");
                allowPricePermission = (data.allowPrice === true || data.allowPrice === "true" || data.allowPrice === "YES");
                
                if (data.vehicleType) {
                    storage.put("userVehicleType", data.vehicleType);
                    userVehicleType = data.vehicleType;
                }

                if (data.driverIndex) {
                    storage.put("driver_index", data.driverIndex);
                }

                if (data.expiryDate && Number(data.expiryDate) > 0) {
                    storage.put("firebase_expiry_ms", Number(data.expiryDate));
                }

                storage.put("allow_area_perm", allowAreaPermission);
                storage.put("allow_price_perm", allowPricePermission);
                syncUIState();
            }
        } catch(e) {}
    });
}

function startRemoteKillSwitch(email) {
    if (killSwitchThread && killSwitchThread.isAlive()) { killSwitchThread.interrupt(); }
    killSwitchThread = threads.start(function() {
        while (storage.get("email", "") !== "") {
            sleep(120000); 
            try {
                var currentEmail = storage.get("email", "");
                if (!currentEmail) break;

                var emailKey = getFirebaseEmailKey(currentEmail);
                var userObj = firebaseGetUser(emailKey);

                if (!userObj || !userObj.data || !userObj.data.email) {
                    ui.run(function() { alert("⚠️ Account Deleted", "Your account has been deleted by Admin."); });
                    logoutAction();
                    break;
                }

                var data = userObj.data;
                var statusStr = String(data.status || "PENDING").toUpperCase().trim();
                var wasApproved = storage.get("is_approved", false);
                
                var isNowApproved = (statusStr === "APPROVED" || statusStr === "SUCCESS" || statusStr === "OK") && (data.approved !== false) && (data.isApproved !== false);

                if (data.expiryDate && Number(data.expiryDate) > 0) {
                    var expMs = Number(data.expiryDate);
                    storage.put("firebase_expiry_ms", expMs);
                    
                    if (Date.now() >= expMs) {
                        if (wasApproved) {
                            ui.run(function() { alert("🚫 Trial / Plan Expired!", "உங்கள் ட்ரையல்/பிளான் காலம் முடிந்துவிட்டது! சப்ஸ்கிரைப் செய்ய வாட்ஸ்அப்பில் அட்மினைத் தொடர்புகொள்ளவும்."); });
                        }
                        storage.put("is_approved", false);
                        stopAndExit();
                        syncUIState();
                        continue;
                    }
                }

                var newArea = (data.allowArea === true || data.allowArea === "true" || data.allowArea === "YES");
                var newPrice = (data.allowPrice === true || data.allowPrice === "true" || data.allowPrice === "YES");

                if (allowAreaPermission !== newArea || allowPricePermission !== newPrice) {
                    allowAreaPermission = newArea;
                    allowPricePermission = newPrice;
                    storage.put("allow_area_perm", allowAreaPermission);
                    storage.put("allow_price_perm", allowPricePermission);
                    
                    if (!allowAreaPermission && !allowPricePermission && isRunning) {
                        stopAndExit();
                    }
                    syncUIState();
                }

                if (isNowApproved) {
                    if (!wasApproved) {
                        storage.put("is_approved", true);
                        toastLog("🎉 Account Approved by Admin!");
                        syncUIState();
                    }
                } else {
                    if (wasApproved) {
                        storage.put("is_approved", false);
                        stopAndExit();
                        syncUIState();
                        toastLog("⚠ Admin Approval Revoked!");
                        ui.run(function() {
                            alert("⚠️ அணுகல் நிறுத்தப்பட்டது (Access Blocked)", "அட்மின் மூலம் உங்கள் அனுமதி நிறுத்தப்பட்டுள்ளது. புதுப்பிக்க வாட்ஸ்அப்பில் தொடர்புகொள்ளவும்.");
                        });
                    }
                }
            } catch(e) {}
        }
    });
}

function getSubscriptionDetails(email) {
    var expiryTimestamp = storage.get("firebase_expiry_ms", 0);
    
    if (!expiryTimestamp || expiryTimestamp <= 0) {
        if (!email) email = storage.get("email", "");
        var key = "approved_ts_" + email.replace(/[^a-zA-Z0-9]/g, "_");
        var approvedTimestamp = storage.get(key, 0);
        if (!approvedTimestamp) {
            approvedTimestamp = Date.now();
            storage.put(key, approvedTimestamp);
        }
        expiryTimestamp = approvedTimestamp + (30 * 24 * 60 * 60 * 1000);
    }

    var diffMs = expiryTimestamp - Date.now();
    var daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) daysLeft = 0;

    var expDate = new Date(expiryTimestamp);
    var day = expDate.getDate() < 10 ? "0" + expDate.getDate() : expDate.getDate();
    var month = (expDate.getMonth() + 1) < 10 ? "0" + (expDate.getMonth() + 1) : (expDate.getMonth() + 1);
    var year = expDate.getFullYear();

    return { 
        daysLeft: daysLeft + " DAYS LEFT", 
        expiryDateStr: day + "/" + month + "/" + year, 
        isExpired: (diffMs <= 0) 
    };
}

function syncUIState() {
    var email = storage.get("email", "");
    var approved = storage.get("is_approved", false);
    var sub = getSubscriptionDetails(email);

    var viewStr = "LOGIN";

    if (email && approved && !sub.isExpired) {
        viewStr = "DASHBOARD";
    } else if (email) {
        viewStr = "WAIT";
    } else {
        viewStr = "LOGIN";
    }

    var pStatus = checkSystemPermissions();
    var p = storage.get("last_order_price", "Rs. 0");
    var a = storage.get("last_order_area", "None");
    var t = storage.get("last_order_time", "--:--");

    var todayEarnVal = storage.get("today_earnings", 0);
    var todayCountVal = storage.get("today_orders_count", 0);
    var dIdx = storage.get("driver_index", 1);

    var payload = {
        view: viewStr,
        email: email,
        hasAccessibility: pStatus.hasAccessibility,
        hasOverlay: pStatus.hasOverlay,
        hasBattery: pStatus.hasBattery,
        androidId: getSafeAndroidId(),
        driverIndex: dIdx,
        vehicleType: userVehicleType,
        status: (approved && !sub.isExpired) ? "APPROVED" : "PENDING",
        daysLeft: sub.daysLeft,
        expiresOn: sub.expiryDateStr,
        isRunning: isRunning,
        lastPrice: p,
        lastArea: a,
        lastTime: t,
        todayEarnings: "Rs. " + todayEarnVal.toLocaleString(),
        todayOrdersCount: todayCountVal + " Orders Completed",
        allowArea: allowAreaPermission,
        allowPrice: allowPricePermission,
        usePriceFilter: usePriceFilter,
        useSkipBelowMin: useSkipBelowMin,
        useAreaFilter: useAreaFilter,
        useSearchAreaFilter: useSearchAreaFilter,
        customAreaSearchStr: customAreaSearchStr,
        minPrice: minPrice,
        maxPrice: maxPrice,
        selectedAreas: selectedAreas,
        hasUpdate: isUpdateAvailableGlobal,
        updateTxt: updateTxtGlobal
    };

    var js = "updateDashboard(" + JSON.stringify(payload) + ")";
    ui.run(function() {
        ui.web.evaluateJavascript(js, null);
    });
}

function checkForAppUpdates(isManual) {
    if (isManual) toastLog("🔍 Checking for updates...");
    threads.start(function() {
        try {
            var res = firebaseGet("/app_version");
            if (res && res.statusCode == 200) {
                var updateData = res.body.json();
                if (updateData) {
                    var latestCode = updateData.latestVersionCode || updateData.versionCode || 0;
                    var latestName = updateData.latestVersionName || updateData.versionName || "New";
                    var apkUrl = updateData.apkUrl || updateData.downloadUrl || "";

                    if (parseInt(latestCode) > CURRENT_VERSION_CODE) {
                        globalCachedApkUrl = apkUrl;
                        globalLatestVersionName = latestName;
                        isUpdateAvailableGlobal = true;
                        updateTxtGlobal = "UPDATE v" + latestName + " 🚀";

                        syncUIState();

                        ui.run(function() {
                            if (isManual) {
                                toastLog("⏳ Downloading update in background...");
                                downloadAndInstallAPKDirect(apkUrl);
                            }
                        });
                        return;
                    }
                }
            }

            var checkUrl = UPDATE_JSON_URL + "?t=" + Date.now();
            var resGit = http.get(checkUrl, { timeout: 6000 });
            if (resGit && resGit.statusCode == 200) {
                var updateDataGit = resGit.body.json();
                var latestCodeG = updateDataGit.latestVersionCode || updateDataGit.versionCode || 0;
                var latestNameG = updateDataGit.latestVersionName || updateDataGit.versionName || "New";
                var apkUrlG = updateDataGit.apkUrl || updateDataGit.downloadUrl || "";

                if (parseInt(latestCodeG) > CURRENT_VERSION_CODE) {
                    globalCachedApkUrl = apkUrlG;
                    globalLatestVersionName = latestNameG;
                    isUpdateAvailableGlobal = true;
                    updateTxtGlobal = "UPDATE v" + latestNameG + " 🚀";
                    syncUIState();
                    return;
                }
            }

            globalCachedApkUrl = null;
            isUpdateAvailableGlobal = false;
            updateTxtGlobal = "V" + CURRENT_VERSION_NAME + " LATEST ✓";
            syncUIState();
            if (isManual) toastLog("✅ App is up to date!");

        } catch(e) {
            if (isManual) toastLog("❌ Check update failed!");
        }
    });
}

function downloadAndInstallAPKDirect(apkUrl) {
    if (!apkUrl) return;
    toastLog("⏳ டவுன்லோட் செய்யப்படுகிறது...");
    threads.start(function() {
        try {
            var downloadManager = context.getSystemService(android.content.Context.DOWNLOAD_SERVICE);
            var uri = android.net.Uri.parse(apkUrl);
            var request = new android.app.DownloadManager.Request(uri);
            
            request.setTitle("Nura Auto Clicker Update");
            request.setDescription("Downloading latest version...");
            request.setNotificationVisibility(android.app.DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            
            var targetFile = new java.io.File(context.getExternalFilesDir(android.os.Environment.DIRECTORY_DOWNLOADS), "Nura_Update.apk");
            if (targetFile.exists()) {
                targetFile.delete();
            }
            request.setDestinationUri(android.net.Uri.fromFile(targetFile));
            
            var downloadId = downloadManager.enqueue(request);
            
            var filter = new android.content.IntentFilter(android.app.DownloadManager.ACTION_DOWNLOAD_COMPLETE);
            var receiver = new JavaAdapter(android.content.BroadcastReceiver, {
                onReceive: function(ctx, intent) {
                    var id = intent.getLongExtra(android.app.DownloadManager.EXTRA_DOWNLOAD_ID, -1);
                    if (downloadId === id) {
                        try {
                            var intentInstall = new android.content.Intent(android.content.Intent.ACTION_VIEW);
                            intentInstall.setFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
                            
                            if (android.os.Build.VERSION.SDK_INT >= 24) {
                                var apkUri = androidx.core.content.FileProvider.getUriForFile(ctx, ctx.getPackageName() + ".provider", targetFile);
                                intentInstall.setDataAndType(apkUri, "application/vnd.android.package-archive");
                                intentInstall.addFlags(android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
                            } else {
                                intentInstall.setDataAndType(android.net.Uri.fromFile(targetFile), "application/vnd.android.package-archive");
                            }
                            ctx.startActivity(intentInstall);
                            toastLog("✅ இன்ஸ்டாலேஷன் தொடங்குகிறது...");
                        } catch(err) {
                            toastLog("❌ இன்ஸ்டால் செய்வதில் பிழை: " + err);
                        }
                    }
                }
            });
            
            if (android.os.Build.VERSION.SDK_INT >= 33) {
                context.registerReceiver(receiver, filter, android.content.Context.RECEIVER_EXPORTED);
            } else {
                context.registerReceiver(receiver, filter);
            }
            
        } catch(e) {
            toastLog("❌ டவுன்லோட் எரர்: " + e);
            try {
                app.openUrl(apkUrl);
            } catch(err) {}
        }
    });
}

function logoutAction() {
    stopAndExit();
    storage.remove("email"); 
    storage.remove("is_approved");
    storage.remove("session_token");
    storage.remove("allow_area_perm");
    storage.remove("allow_price_perm");
    storage.remove("firebase_expiry_ms");
    toastLog("🚪 Logged out successfully");
    syncUIState();
}

function toggleAutoClicker() {
    var email = storage.get("email", "");
    if (!email) return;

    threads.start(function() {
        try {
            var emailKey = getFirebaseEmailKey(email);
            var userObj = firebaseGetUser(emailKey);
            if (userObj && userObj.data) {
                var data = userObj.data;
                var statusStr = String(data.status || "PENDING").toUpperCase().trim();
                var isNowApproved = (statusStr === "APPROVED" || statusStr === "SUCCESS" || statusStr === "OK") && (data.approved !== false) && (data.isApproved !== false);
                
                if (!isNowApproved) {
                    storage.put("is_approved", false);
                    stopAndExit();
                    syncUIState();
                    ui.run(function() {
                        alert("⚠️ Access Blocked", "அட்மின் மூலம் உங்கள் அனுமதி நிறுத்தப்பட்டுள்ளது. (Approval Revoked)");
                    });
                    return;
                }

                var newArea = (data.allowArea === true || data.allowArea === "true" || data.allowArea === "YES");
                var newPrice = (data.allowPrice === true || data.allowPrice === "true" || data.allowPrice === "YES");
                if (!newArea && !newPrice) {
                    toastLog("⚠️ Access Blocked! Filters disabled by Admin.");
                    storage.put("allow_area_perm", false);
                    storage.put("allow_price_perm", false);
                    stopAndExit();
                    syncUIState();
                    return;
                }
            }
        } catch(e) {}

        ui.run(function() {
            var pStatus = checkSystemPermissions();
            if (!pStatus.hasAccessibility) {
                toastLog("🔑 Please enable Accessibility Service to start Auto Clicker!");
                try { app.startActivity({ action: "android.settings.ACCESSIBILITY_SETTINGS" }); } catch(e) {}
                return;
            }
            if (!pStatus.hasOverlay) {
                toastLog("🔑 Please enable Display over other apps permission!");
                try {
                    var intent = new android.content.Intent(android.provider.Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                        android.net.Uri.parse("package:" + context.getPackageName()));
                    intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
                    context.startActivity(intent);
                } catch(e) {}
                return;
            }

            var sub = getSubscriptionDetails(email);
            if (sub.isExpired) {
                alert("🚫 Trial / Plan Expired!", "உங்கள் காலம் முடிந்துவிட்டது! புதுப்பிக்க வாட்ஸ்அப்பில் அட்மினைத் தொடர்புகொள்ளவும்.");
                storage.put("is_approved", false);
                stopAndExit();
                syncUIState();
                return;
            }

            if (!isRunning) {
                fetchPermissionsFromFirebase(email);
                startBackgroundService();
            } else {
                stopAndExit();
                toastLog("🛑 Auto Clicker Stopped");
            }
            syncUIState();
        });
    });
}

function checkDropAreaAndGetKm(areasToCheck, isFilterActive) {
    var dropKm = "--";
    var matchedArea = "";
    var isMatched = false;
    var fullDropText = "";

    try {
        var allTextNodes = textMatches(/.+/).find();
        var allDescNodes = descMatches(/.+/).find();
        var allElements = [];
        var devH = device.height || 1280;
        
        if (allTextNodes) {
            for(var i=0; i<allTextNodes.length; i++) {
                var b = allTextNodes[i].bounds();
                if (b && b.centerY() > 0 && b.centerY() <= devH) allElements.push({ y: b.centerY(), txt: allTextNodes[i].text() });
            }
        }
        if (allDescNodes) {
            for(var i=0; i<allDescNodes.length; i++) {
                var b = allDescNodes[i].bounds();
                if (b && b.centerY() > 0 && b.centerY() <= devH) allElements.push({ y: b.centerY(), txt: allDescNodes[i].desc() });
            }
        }
        
        allElements.sort(function(a, b) { return a.y - b.y; });
        
        var distRegex = /\d+(\.\d+)?\s*(km|m)/i;
        var dropKmY = -1;
        
        for (var i = 0; i < allElements.length; i++) {
            var t = String(allElements[i].txt).trim();
            var match = t.match(distRegex);
            if (match) {
                dropKm = match[0]; 
                dropKmY = allElements[i].y;
            }
        }
        
        if (!isFilterActive) {
            return { matched: true, areaName: "General", dropKm: dropKm };
        }

        for (var i = 0; i < allElements.length; i++) {
            if (dropKmY !== -1 && allElements[i].y > dropKmY) {
                fullDropText += " " + allElements[i].txt;
            } else if (dropKmY === -1) {
                fullDropText += " " + allElements[i].txt;
            }
        }
        
        var lowerDropText = fullDropText.toLowerCase();
        for(var i = 0; i < areasToCheck.length; i++) {
            var cleanA = areasToCheck[i].trim();
            if(cleanA.length > 0 && lowerDropText.indexOf(cleanA.toLowerCase()) !== -1) {
                matchedArea = cleanA;
                isMatched = true;
                break;
            }
        }
    } catch(e) {}
    
    return { matched: isMatched, areaName: matchedArea, dropKm: dropKm };
}

function startBackgroundService() {
    try { device.keepScreenOn(24 * 60 * 60 * 1000); } catch(e) {}
    toastLog("🚀 Auto JX v7 Ultra Engine v51.0 Started!");
    isRunning = true;

    if (workerThread && workerThread.isAlive()) workerThread.interrupt();
    workerThread = threads.start(function() {
        while (isRunning) {
            try {
                var currentPkg = currentPackage();
                if (currentPkg == context.getPackageName()) {
                    sleep(50); 
                    continue;
                }

                if (currentPkg.indexOf("rapido") === -1 && currentPkg.indexOf("ola") === -1) {
                    sleep(400);
                    continue;
                }

                var autoNode = textContains("Auto").findOnce() || descContains("Auto").findOnce() ||
                               textContains("Bike").findOnce() || descContains("Bike").findOnce() ||
                               textContains("Cab").findOnce()  || descContains("Cab").findOnce()  ||
                               textContains("OLA").findOnce()  || descContains("OLA").findOnce()  ||
                               textContains("Ola").findOnce()  || descContains("Ola").findOnce()  ||
                               textContains("ACCEPT IN").findOnce() || descContains("ACCEPT IN").findOnce();

                if (autoNode) {
                    var priceNode = textContains("₹").findOnce() || descContains("₹").findOnce();
                    var basePrice = 0;
                    var tipPrice = 0;
                    var totalPrice = 0;
                    var priceDisplayStr = "Rs. 0";

                    if (priceNode) {
                        var priceTextRaw = priceNode.text() || priceNode.desc() || "";
                        
                        var multiPriceMatch = priceTextRaw.match(/₹\s*(\d+)\s*\+\s*₹\s*(\d+)/) || priceTextRaw.match(/(\d+)\s*\+\s*(\d+)/);
                        if (multiPriceMatch) {
                            basePrice = parseInt(multiPriceMatch[1]);
                            tipPrice = parseInt(multiPriceMatch[2]);
                            totalPrice = basePrice + tipPrice;
                            priceDisplayStr = "Rs. " + basePrice + " + Rs. " + tipPrice;
                        } else {
                            var singleMatch = priceTextRaw.match(/₹\s*(\d+)/) || priceTextRaw.match(/(\d+)/);
                            basePrice = singleMatch ? parseInt(singleMatch[1]) : 0;
                            tipPrice = 0;
                            totalPrice = basePrice;
                            priceDisplayStr = "Rs. " + basePrice;
                        }
                    }

                    if (useSkipBelowMin && allowPricePermission && basePrice > 0 && basePrice < minPrice) {
                        var skipBtn = text("-").findOnce() || desc("-").findOnce() || 
                                      className("android.widget.Button").clickable(true).filter(function(btn) {
                                          var b = btn.bounds();
                                          var acceptBtnB = textContains("ACCEPT").findOnce() ? textContains("ACCEPT").findOnce().bounds() : null;
                                          return b && acceptBtnB && b.centerX() < acceptBtnB.centerX() && b.width() < 140;
                                      }).findOnce() ||
                                      className("android.widget.ImageView").clickable(true).filter(function(img) {
                                          var b = img.bounds();
                                          var acceptBtnB = textContains("ACCEPT").findOnce() ? textContains("ACCEPT").findOnce().bounds() : null;
                                          return b && acceptBtnB && b.centerX() < acceptBtnB.centerX() && b.width() < 120 && b.height() < 120;
                                      }).findOnce();

                        if (skipBtn) {
                            var sb = skipBtn.bounds();
                            if (sb && sb.width() > 0) {
                                press(sb.centerX(), sb.centerY(), 10);
                                toastLog("🚫 Skipped Low Price Order: " + priceDisplayStr);
                                sleep(300);
                                continue;
                            }
                        }
                    }

                    var priceConditionMet = true;
                    var areaConditionMet = true;
                    var matchedAreaName = "General";
                    var foundDropKm = "--";

                    if (usePriceFilter && allowPricePermission) {
                        priceConditionMet = (basePrice >= minPrice && basePrice <= maxPrice);
                    } else {
                        priceConditionMet = true;
                    }

                    var activeAreasToCheck = [];
                    var isAreaFilterActive = false;
                    
                    if (useSearchAreaFilter && allowAreaPermission && customAreaSearchStr.trim().length > 0) {
                        activeAreasToCheck = customAreaSearchStr.split(",");
                        isAreaFilterActive = true;
                    } else if (useAreaFilter && allowAreaPermission && selectedAreas && selectedAreas.length > 0) {
                        activeAreasToCheck = selectedAreas;
                        isAreaFilterActive = true;
                    }

                    var dropResult = checkDropAreaAndGetKm(activeAreasToCheck, isAreaFilterActive);
                    areaConditionMet = dropResult.matched;
                    matchedAreaName = dropResult.areaName || "General";
                    foundDropKm = dropResult.dropKm || "--";

                    if (priceConditionMet && areaConditionMet) {
                        var acceptBtn = textContains("ACCEPT IN").findOnce() || descContains("ACCEPT IN").findOnce() ||
                                        text("ACCEPT").findOnce()    || desc("ACCEPT").findOnce()    ||
                                        text("Accept").findOnce()            || desc("Accept").findOnce()            || 
                                        className("android.widget.Button").clickable(true).findOnce();
                        
                        if (acceptBtn) {
                            var b = acceptBtn.bounds();
                            if (b && b.width() > 0) {
                                press(b.centerX(), b.centerY(), 10);

                                var nowTime = new Date();
                                var hours = nowTime.getHours();
                                var minutes = nowTime.getMinutes();
                                var ampm = hours >= 12 ? 'PM' : 'AM';
                                hours = hours % 12; hours = hours ? hours : 12;
                                minutes = minutes < 10 ? '0'+minutes : minutes;

                                var oldEarn = storage.get("today_earnings", 0);
                                var oldOrdersCount = storage.get("today_orders_count", 0);

                                storage.put("today_earnings", oldEarn + totalPrice);
                                storage.put("today_orders_count", oldOrdersCount + 1);
                                storage.put("last_order_price", priceDisplayStr);
                                storage.put("last_order_area", matchedAreaName + " (" + foundDropKm + ")");
                                storage.put("last_order_time", hours + ':' + minutes + ' ' + ampm);
                                
                                syncUIState();
                                sleep(200); 
                            }
                        }
                    }
                }
            } catch (e) {}
            sleep(5); 
        }
    });
}

function stopAndExit() {
    isRunning = false; 
    if (workerThread) workerThread.interrupt();
    if (killSwitchThread) killSwitchThread.interrupt();
    try { device.cancelKeepingAwake(); } catch(e) {}
}

setTimeout(function() {
    var email = storage.get("email", "");
    if (email) {
        startRemoteKillSwitch(email);
        fetchPermissionsFromFirebase(email);
    }
    syncUIState();
    checkForAppUpdates(false);
}, 1000);
