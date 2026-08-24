'use strict';

/* The supplied certificate is embedded directly in this file. */
const CERTIFICATE_TEMPLATE = "assets/certificate-template.jpg";
const NSS_LOGO = "assets/nss-logo.png";
const CERTIFICATE_VERSION = "2026-08-24-clay-hcaptcha-v6";
const NSS_SIGNATURE = "assets/nss-signature.png";


/* ---- Supabase (auth + submission storage) ---- */
const SUPABASE_URL = APP_CONFIG.SUPABASE_URL;
const SUPABASE_ANON_KEY = APP_CONFIG.SUPABASE_ANON_KEY;
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;
let authMode = "login";
let pendingVerificationEmail = "";

const KEYS = {
  device: "nss_certificate_device_id",
  data: "nss_certificate_device_record",
  timestamp: "nss_certificate_timestamp",
  background: "nss_certificate_background"
};

const state = {
  screen: "authScreen",
  robotChecked: false,
  processing: false,
  verified: false,
  canonicalName: "",
  normalizedName: "",
  age: "",
  className: "",
  designation: "",
  progress: 0,
  certificateData: null,
  templateImage: null,
  signatureImage: null,
  processingStartedAt: 0
};

const $ = id => document.getElementById(id);

function getDeviceId(){
  let id = localStorage.getItem(KEYS.device);
  if(!id){
    id = (crypto.randomUUID ? crypto.randomUUID() :
      "dev-" + Date.now() + "-" + Math.random().toString(36).slice(2));
    localStorage.setItem(KEYS.device,id);
  }
  return id;
}
const DEVICE_ID = getDeviceId();

function normalizeName(value){
  return String(value ?? "").trim().replace(/\s+/g," ");
}

function setWelcomeError(title,text){
  $("welcomeMsg").innerHTML =
    '<div class="error"><strong>'+escapeHtml(title)+'</strong>'+escapeHtml(text)+'</div>';
}
function setDetailsError(title,text){
  $("detailsMsg").innerHTML =
    '<div class="error"><strong>'+escapeHtml(title)+'</strong>'+escapeHtml(text)+'</div>';
}
function clearMessages(){
  $("welcomeMsg").innerHTML="";
  $("detailsMsg").innerHTML="";
  $("ageMsg").innerHTML="";
}

function showScreen(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  $(id).classList.add("active");
  state.screen=id;
  window.scrollTo({top:0,behavior:"smooth"});
}

function getDeviceRecord(){
  try{
    const all=JSON.parse(localStorage.getItem(KEYS.data)||"{}")||{};
    const record=all[DEVICE_ID];
    return record && record.generated && record.certificateData ? record : null;
  }catch(e){ return null; }
}

function saveCertificate(record){
  let all={};
  try{all=JSON.parse(localStorage.getItem(KEYS.data)||"{}")||{}}catch(e){}
  all[DEVICE_ID]=record;
  localStorage.setItem(KEYS.data,JSON.stringify(all));
  localStorage.setItem(KEYS.timestamp,record.generatedAt);
}

function populateIdentity(name){
  state.verified=true;
  state.canonicalName=normalizeName(name);
  state.normalizedName=state.canonicalName.toLowerCase().replace(/[^a-z0-9]/gi,"");
}

/* ---- Auth (Supabase email + password) ---- */
function setAuthError(title,text){
  $("authMsg").innerHTML='<div class="error"><strong>'+escapeHtml(title)+'</strong>'+escapeHtml(text)+'</div>';
}
function setAuthSuccess(title,text){
  $("authMsg").innerHTML='<div class="success"><strong>'+escapeHtml(title)+'</strong>'+escapeHtml(text)+'</div>';
}
function setAuthMode(mode){
  authMode=mode;
  $("authTabLogin").classList.toggle("selected",mode==="login");
  $("authTabSignup").classList.toggle("selected",mode==="signup");
  $("authHeading").textContent = mode==="login" ? "WELCOME BACK" : "CREATE YOUR ACCOUNT";
  $("authSubtext").textContent = mode==="login"
    ? "Log in to generate your NSS certificate."
    : "Sign up with an email and password to get started.";
  $("authSubmitBtn").innerHTML = '<span class="spinner"></span>' + (mode==="login" ? "LOG IN" : "SIGN UP");
  $("authMsg").innerHTML="";
}


let visualCaptchaAnswer="";
let hcaptchaWidgetId=null;
let hcaptchaToken="";

function randomWord(){
  const words=["APPLE","CLOUD","GREEN","RIVER","NSS","ROSE","TIGER","MANGO","STAR","LOTUS","BRAVE","SMILE"];
  return words[Math.floor(Math.random()*words.length)];
}
function resetVisualCaptcha(){
  const n=String(Math.floor(1+Math.random()*9));
  const w=randomWord();
  visualCaptchaAnswer=(n+w).toUpperCase();
  $("captchaChallenge").textContent=n+"  "+w;
  $("captchaInput").value="";
}
function verifyVisualCaptcha(){
  const answer=$("captchaInput").value.trim().replace(/\s+/g,"").toUpperCase();
  if(!answer){ setAuthError("CAPTCHA Required","Enter the number and word shown in the CAPTCHA."); $("captchaInput").focus(); return false; }
  if(answer!==visualCaptchaAnswer){ setAuthError("CAPTCHA Incorrect","The number/word CAPTCHA is incorrect. Please try again."); resetVisualCaptcha(); $("captchaInput").focus(); return false; }
  return true;
}
function loadHCaptcha(){
  if(!APP_CONFIG.SUPABASE_CAPTCHA_ENABLED) return Promise.resolve();
  if(window.hcaptcha) return Promise.resolve();
  return new Promise((resolve,reject)=>{
    const existing=document.querySelector('script[data-hcaptcha-loader]');
    if(existing){ existing.addEventListener('load',resolve,{once:true}); existing.addEventListener('error',reject,{once:true}); return; }
    const s=document.createElement('script'); s.src='https://js.hcaptcha.com/1/api.js?render=explicit'; s.async=true; s.defer=true; s.dataset.hcaptchaLoader='1'; s.onload=resolve; s.onerror=reject; document.head.appendChild(s);
  });
}
async function initHCaptcha(){
  if(!APP_CONFIG.SUPABASE_CAPTCHA_ENABLED) return;
  if(!APP_CONFIG.HCAPTCHA_SITEKEY || APP_CONFIG.HCAPTCHA_SITEKEY.includes('PASTE_')){
    $("hcaptchaBox").innerHTML='<div class="error"><strong>hCaptcha setup required</strong>Add your hCaptcha Sitekey in <b>js/config.js</b>. Do not put the Secret key in the website.</div>'; return;
  }
  try{
    await loadHCaptcha();
    if(!window.hcaptcha)return;
    hcaptchaWidgetId=window.hcaptcha.render("hcaptchaBox",{sitekey:APP_CONFIG.HCAPTCHA_SITEKEY,theme:"light",callback:(token)=>{hcaptchaToken=token;},"expired-callback":()=>{hcaptchaToken="";},"error-callback":()=>{hcaptchaToken="";}});
  }catch(e){ console.error(e); $("hcaptchaBox").innerHTML='<div class="error"><strong>Could not load hCaptcha</strong>Check your internet connection and the Sitekey/domain configuration.</div>'; }
}
function getHCaptchaToken(){ return Promise.resolve(hcaptchaToken||""); }
function resetHCaptcha(){ if(window.hcaptcha && hcaptchaWidgetId!==null){ try{window.hcaptcha.reset(hcaptchaWidgetId);}catch(e){} } hcaptchaToken=""; }

function setVerificationMessage(title,text,success=false){
  $("verificationMsg").innerHTML='<div class="'+(success?'success':'error')+'"><strong>'+escapeHtml(title)+'</strong>'+escapeHtml(text)+'</div>';
}
function showVerification(email){
  pendingVerificationEmail=email;
  $("verificationEmail").value=email;
  $("verificationOtp").value="";
  $("verificationMsg").innerHTML="";
  showScreen("verificationScreen");
  setTimeout(()=>$("verificationOtp").focus(),250);
}
async function verifySignupOtp(){
  const email=pendingVerificationEmail||$("verificationEmail").value.trim();
  const token=$("verificationOtp").value.trim();
  if(!email||!token){setVerificationMessage("OTP Required","Enter the OTP from your Supabase email.");return;}
  $("verifyOtpBtn").disabled=true;$("verifyOtpBtn").classList.add("loading");
  try{
    const {data,error}=await sb.auth.verifyOtp({email,token,type:"signup"});
    if(error)throw error;
    if(data && data.session){
      currentUser=data.user||data.session.user;
      setVerificationMessage("Email Verified","Your email has been verified. Opening the certificate portal…",true);
      setTimeout(routeAfterAuth,450);
    }else{
      setVerificationMessage("Verification Pending","The OTP was accepted, but no session was returned. Please log in with your email and password.",true);
    }
  }catch(err){setVerificationMessage("OTP Verification Failed",err&&err.message?err.message:"The OTP could not be verified. Check the code and try again.");}
  finally{$("verifyOtpBtn").disabled=false;$("verifyOtpBtn").classList.remove("loading");}
}
async function handleAuthSubmit(){
  const email=$("authEmail").value.trim();
  const password=$("authPassword").value;
  $("authMsg").innerHTML="";
  if(!email || !password){ setAuthError("Missing Details","Please enter both email and password."); return; }
  if(password.length<6){ setAuthError("Weak Password","Password must be at least 6 characters."); return; }
  if(!verifyVisualCaptcha()){ return; }
  const captchaToken=await getHCaptchaToken();
  if(APP_CONFIG.SUPABASE_CAPTCHA_ENABLED && !captchaToken){
    setAuthError("CAPTCHA Required","Please complete the hCaptcha check before continuing.");
    return;
  }
  $("authSubmitBtn").disabled=true; $("authSubmitBtn").classList.add("loading");
  try{
    const options = captchaToken ? {options:{captchaToken}} : {};
    if(authMode==="signup"){
      const {data,error}=await sb.auth.signUp({email,password,...options});
      if(error)throw error;
      if(data && data.user && !data.session){
        showVerification(email);
      }else await routeAfterAuth();
    }else{
      const {data,error}=await sb.auth.signInWithPassword({email,password,...options});
      if(error)throw error;
      await routeAfterAuth();
    }
  }catch(err){
    const msg=err && err.message ? err.message : "Something went wrong. Please try again.";
    setAuthError("Authentication Error",msg);
    if(/captcha/i.test(msg)) setAuthError("CAPTCHA Error","Supabase rejected the CAPTCHA token. Make sure the hCaptcha Sitekey in js/config.js matches the Sitekey configured in Supabase.");
  }finally{
    resetHCaptcha(); resetVisualCaptcha();
    $("authSubmitBtn").disabled=false; $("authSubmitBtn").classList.remove("loading");
  }
}

async function routeAfterAuth(){
  const {data:{session}}=await sb.auth.getSession();
  currentUser = session ? session.user : null;
  if(!currentUser){
    $("logoutBtn").classList.add("hidden");
    showScreen("authScreen");
    return;
  }
  $("logoutBtn").classList.remove("hidden");
  const record=getDeviceRecord();
  if(record){
    state.verified=true;
    state.canonicalName=record.verifiedName;
    state.normalizedName=record.normalizedName;
    state.age=record.age;
    state.className=record.class;
    state.designation=record.designation;
    upgradeSavedCertificate(record).then(updated=>showReady(updated,true)).catch(()=>showReady(record,true));
  }else{
    showScreen("welcomeScreen");
  }
}

async function handleLogout(){
  await sb.auth.signOut();
  currentUser=null;
  $("authEmail").value="";
  $("authPassword").value="";
  setAuthMode("login");
  $("logoutBtn").classList.add("hidden");
  showScreen("authScreen");
}

/* Store the certificate request in Supabase. RLS must allow authenticated inserts. */
async function submitCertificateRequest(){
  if(!currentUser) throw new Error("You must be signed in.");
  const {error}=await sb.from("certificate_submissions").insert({
    user_id:currentUser.id,
    full_name:state.canonicalName,
    age:Number(state.age),
    class_name:state.className,
    designation:state.designation
  });
  if(error)throw error;
}

function continueFromWelcome(){
  if(state.processing)return;
  clearMessages();
  const name=normalizeName($("nameInput").value);
  if(!name){
    setWelcomeError("Name Required","Please enter your full name.");
    $("nameInput").focus();
    return;
  }
  if(!state.robotChecked){
    setWelcomeError("Verification Required","Please complete the “I'm not a robot” check first.");
    return;
  }

  const existing=getDeviceRecord();
  if(existing){
    state.verified=true;
    state.canonicalName=existing.verifiedName;
    state.normalizedName=existing.normalizedName;
    state.age=existing.age;
    state.className=existing.class;
    state.designation=existing.designation;
    upgradeSavedCertificate(existing).then(updated=>showReady(updated,true)).catch(()=>showReady(existing,true));
    return;
  }

  $("verifyBtn").disabled=true;
  $("verifyBtn").classList.add("loading");
  setTimeout(()=>{
    $("verifyBtn").disabled=false;
    $("verifyBtn").classList.remove("loading");
    populateIdentity(name);
    $("detailsName").textContent=state.canonicalName;
    showScreen("detailsScreen");
    renderDesignation();
    $("ageInput").focus();
  },450);
}

function validAge(){
  const raw=$("ageInput").value.trim();
  if(raw===""){
    $("ageMsg").innerHTML='<div class="error"><strong>Age Required</strong>Please enter your age.</div>';
    return false;
  }
  if(!/^\d+$/.test(raw) || !Number.isInteger(Number(raw)) || Number(raw)<1 || Number(raw)>120){
    $("ageMsg").innerHTML='<div class="error"><strong>Invalid Age</strong>Please enter an age from 1 to 120.</div>';
    return false;
  }
  state.age=String(Number(raw));
  $("ageMsg").innerHTML='<div class="success"><strong>✓ Age Added</strong>Your age has been recorded.</div>';
  return true;
}

function allowedDesignations(cls){
  return (cls==="H.S" || cls==="B.A 1st Semester")
    ? ["NSS Member"]
    : ["NSS Volunteer","NSS Member"];
}

function renderDesignation(){
  const grid=$("designationGrid");
  const options=allowedDesignations(state.className);
  grid.className="designation-grid"+(options.length===1?" single":"");
  grid.innerHTML="";
  if(!options.includes(state.designation))state.designation="";
  options.forEach(opt=>{
    const b=document.createElement("button");
    b.type="button";
    b.className="designation"+(state.designation===opt?" selected":"");
    b.textContent=opt;
    b.setAttribute("aria-pressed",state.designation===opt);
    b.onclick=()=>{state.designation=opt;renderDesignation()};
    grid.appendChild(b);
  });
}

function selectClass(cls){
  state.className=cls;
  document.querySelectorAll("#classGrid .choice").forEach(b=>
    b.classList.toggle("selected",b.dataset.class===cls)
  );
  renderDesignation();
}

async function startProcessing(){
  if(state.processing)return;
  clearMessages();

  if(!state.verified || !state.canonicalName){
    setDetailsError("Name Required","Please return to the first step and enter your name.");
    return;
  }
  if(!validAge())return;
  if(!state.className){
    setDetailsError("Class Required","Please select your class.");
    return;
  }

  const allowed=allowedDesignations(state.className);
  if(!state.designation || !allowed.includes(state.designation)){
    setDetailsError("Designation Required","Please select a designation.");
    return;
  }

  const existing=getDeviceRecord();
  if(existing){
    upgradeSavedCertificate(existing).then(updated=>showReady(updated,true)).catch(()=>showReady(existing,true));
    return;
  }

  $("previewBtn").disabled=true;
  $("previewBtn").classList.add("loading");
  try{
    await submitCertificateRequest();
  }catch(err){
    console.error(err);
    $("previewBtn").disabled=false;
    $("previewBtn").classList.remove("loading");
    setDetailsError("Could Not Send Details","We couldn't send your details. Please check your connection and tap Preview Certificate again.");
    return;
  }
  $("previewBtn").classList.remove("loading");

  state.processing=true;
  state.progress=0;
  state.processingStartedAt=performance.now();
  showScreen("processingScreen");
  $("progressBar").style.width="0%";
  $("progressPercent").textContent="0%";
  $("progressStage").textContent="Starting";
  $("processMessage").textContent="Preparing your NSS certificate…";
  $("track").classList.remove("paused");
  requestAnimationFrame(()=>requestAnimationFrame(runProcessing));
}

const stages=[
  {p:0,msg:"Preparing your NSS certificate…",stage:"Starting"},
  {p:12,msg:"Checking your certificate details…",stage:"Student details"},
  {p:30,msg:"Preparing the official NSS certificate…",stage:"Template preparation"},
  {p:52,msg:"Applying your verified name…",stage:"Certificate information"},
  {p:72,msg:"Rendering the final certificate…",stage:"Final rendering"},
  {p:90,msg:"Checking certificate quality…",stage:"Quality check"},
  {p:99,msg:"Almost ready…",stage:"Final check"},
  {p:100,msg:"✓ Certificate Ready",stage:"Certificate Ready"}
];

function stageAt(p){
  let current=stages[0];
  for(const s of stages)if(p>=s.p)current=s;
  return current;
}

function runProcessing(){
  const start=performance.now();
  const duration=30000;
  let lastPause=-1;

  function frame(now){
    if(!state.processing)return;

    const elapsed=now-start;
    let p=Math.min(100,(elapsed/duration)*100);
    const pausePoints=[12,30,72,99];
    let pauseTarget=null;

    for(const target of pausePoints){
      if(p>=target-0.35 && p<target+0.35){pauseTarget=target;break}
    }

    if(pauseTarget!==null && lastPause!==pauseTarget){
      lastPause=pauseTarget;
      p=pauseTarget;
      $("track").classList.add("paused");
      setTimeout(()=>{
        if(state.processing)$("track").classList.remove("paused");
      },650);
    }

    const st=stageAt(p);
    $("processMessage").textContent=st.msg;
    $("progressStage").textContent=st.stage;
    $("progressBar").style.width=p+"%";
    $("progressPercent").textContent=Math.floor(p)+"%";

    const runnerPercent=Math.min(94,4+p*.90);
    $("runner").style.left=runnerPercent+"%";

    if(elapsed>=duration){
      finishProcessing();
      return;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

async function finishProcessing(){
  if(!state.processing)return;

  state.processing=false;
  $("track").classList.add("paused");
  $("progressBar").style.width="100%";
  $("progressPercent").textContent="100%";
  $("progressStage").textContent="Certificate Ready";
  $("processMessage").textContent="✓ Certificate Ready";

  try{
    const certificateData=await renderCertificate(state.canonicalName);
    if(!certificateData)throw new Error("Certificate render returned empty data");

    const record={
      verifiedName:state.canonicalName,
      normalizedName:state.normalizedName,
      age:state.age,
      class:state.className,
      designation:state.designation,
      generated:true,
      generatedAt:new Date().toISOString(),
      templateVersion:CERTIFICATE_VERSION,
      certificateData
    };

    saveCertificate(record);
    state.certificateData=certificateData;
    setTimeout(()=>showReady(record,false),500);
  }catch(err){
    console.error(err);
    $("previewBtn").disabled=false;
    showScreen("detailsScreen");
    setDetailsError("Certificate Preparation Issue","Please try the certificate preview again.");
  }
}

function loadTemplate(){
  if(state.templateImage)return Promise.resolve(state.templateImage);
  return new Promise((resolve,reject)=>{
    const img=new Image();
    img.onload=()=>{state.templateImage=img;resolve(img)};
    img.onerror=reject;
    img.src=CERTIFICATE_TEMPLATE;
  });
}

function loadSignature(){
  if(state.signatureImage)return Promise.resolve(state.signatureImage);
  return new Promise((resolve,reject)=>{
    const img=new Image();
    img.onload=()=>{state.signatureImage=img;resolve(img)};
    img.onerror=reject;
    img.src=NSS_SIGNATURE;
  });
}

async function upgradeSavedCertificate(record){
  if(record.templateVersion===CERTIFICATE_VERSION)return record;
  const certificateData=await renderCertificate(record.verifiedName);
  const upgraded={...record,certificateData,templateVersion:CERTIFICATE_VERSION};
  saveCertificate(upgraded);
  return upgraded;
}

async function renderCertificate(name){
  const canvas=$("certificateCanvas");
  const ctx=canvas.getContext("2d",{alpha:false});
  const W=1536,H=864;

  canvas.width=W;
  canvas.height=H;

  const [img,signature]=await Promise.all([loadTemplate(),loadSignature()]);
  ctx.fillStyle="#ffffff";
  ctx.fillRect(0,0,W,H);
  ctx.drawImage(img,0,0,W,H);

  /* Exact supplied 16:9 certificate:
     name sits in the dedicated blank area below "This is to certify that". */
  let size=56;
  const maxWidth=900;
  const fontFamily='"Georgia","Times New Roman",serif';
  while(size>30){
    ctx.font=`700 ${size}px ${fontFamily}`;
    if(ctx.measureText(name).width<=maxWidth)break;
    size-=2;
  }
  ctx.textAlign="center";
  ctx.textBaseline="middle";
  ctx.fillStyle="#102451";
  ctx.shadowColor="rgba(255,255,255,.35)";
  ctx.shadowBlur=1;
  ctx.shadowOffsetY=0;
  ctx.fillText(name,768,335);

  /* Clean blue NSS Programme Officer signature, placed above the
     existing signature label/line on the supplied certificate. */
  ctx.shadowColor="transparent";
  ctx.shadowBlur=0;
  ctx.shadowOffsetY=0;
  const sigW=190;
  const sigH=44;
  const sigX=1090;
  const sigY=642;
  ctx.drawImage(signature,sigX,sigY,sigW,sigH);

  return canvas.toDataURL("image/png",1.0);
}

function showReady(record,existing){
  state.certificateData=record.certificateData;
  state.age=record.age;
  state.className=record.class;
  state.designation=record.designation;
  state.canonicalName=record.verifiedName;
  state.normalizedName=record.normalizedName;

  $("readyText").textContent=existing
    ? "This device has already generated its certificate. Your saved certificate is shown below."
    : "Your certificate has been prepared successfully.";

  drawSavedCertificate(record.certificateData);

  $("certificateMeta").innerHTML=
    `<div class="meta-item"><small>Name</small><strong>${escapeHtml(record.verifiedName)}</strong></div>
     <div class="meta-item"><small>Age</small><strong>${escapeHtml(record.age)}</strong></div>
     <div class="meta-item"><small>Class</small><strong>${escapeHtml(record.class)}</strong></div>
     <div class="meta-item"><small>Designation</small><strong>${escapeHtml(record.designation)}</strong></div>`;

  showScreen("readyScreen");
}

function drawSavedCertificate(data){
  const canvas=$("certificateCanvas");
  const ctx=canvas.getContext("2d");
  const img=new Image();
  img.onload=()=>{
    canvas.width=1536;
    canvas.height=864;
    ctx.clearRect(0,0,1536,864);
    ctx.drawImage(img,0,0,1536,864);
  };
  img.src=data;
}

function downloadCertificate(){
  if(!state.certificateData)return;
  const a=document.createElement("a");
  a.href=state.certificateData;
  a.download="NSS-Participation-Certificate-"+state.canonicalName.replace(/[^a-z0-9]+/gi,"-")+".png";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g,c=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

function resetIdentity(){
  if(state.processing)return;

  state.verified=false;
  state.canonicalName="";
  state.normalizedName="";
  state.age="";
  state.className="";
  state.designation="";
  state.certificateData=null;
  state.robotChecked=false;

  $("nameInput").value="";
  $("ageInput").value="";
  $("robotBox").classList.remove("checked");
  $("robotBox").setAttribute("aria-checked","false");
  $("verifyBtn").disabled=false;
  $("previewBtn").disabled=false;

  document.querySelectorAll("#classGrid .choice").forEach(b=>b.classList.remove("selected"));
  clearMessages();
  renderDesignation();
  showScreen("welcomeScreen");
}

function applyTheme(name){
  const themes={
    "Cloud":["#dff7ef","#ffe1ef","#e6e0ff"],
    "Lavender":["#eee8ff","#f9e4f5","#dfe9ff"],
    "Peach":["#ffe6d4","#fff4dc","#f6dff0"],
    "Mint":["#d8f3e8","#eef9e9","#dff6ff"],
    "Sky":["#d9efff","#e9f7ff","#e6e0ff"],
    "Rose":["#f8dfea","#fff1f6","#e9e0ff"],
    "Cream":["#f4ead7","#fff9ed","#e9f0ff"],
    "Blue":["#dce8f7","#eef5ff","#e4ddff"]
  };
  const t=themes[name]||themes.Cloud;
  document.documentElement.style.setProperty("--bg1",t[0]);
  document.documentElement.style.setProperty("--bg2",t[1]);
  document.documentElement.style.setProperty("--bg3",t[2]);
  localStorage.setItem(KEYS.background,name);
  document.querySelectorAll(".theme").forEach(b=>
    b.classList.toggle("active",b.dataset.theme===name)
  );
}

applyTheme(localStorage.getItem(KEYS.background)||"Cloud");

$("headerNssLogo").src=NSS_LOGO;
$("welcomeNssLogo").src=NSS_LOGO;
$("authNssLogo").src=NSS_LOGO;
$("verificationNssLogo").src=NSS_LOGO;

$("authTabLogin").onclick=()=>setAuthMode("login");
$("authTabSignup").onclick=()=>setAuthMode("signup");
$("authSubmitBtn").onclick=handleAuthSubmit;
$("authPassword").addEventListener("keydown",e=>{
  if(e.key==="Enter")handleAuthSubmit();
});
$("logoutBtn").onclick=handleLogout;
$("verifyOtpBtn").onclick=verifySignupOtp;
$("verificationOtp").addEventListener("keydown",e=>{if(e.key==="Enter")verifySignupOtp();});
$("backToLoginBtn").onclick=()=>{setAuthMode("login");showScreen("authScreen");};

$("robotBox").addEventListener("click",()=>{
  state.robotChecked=!state.robotChecked;
  $("robotBox").classList.toggle("checked",state.robotChecked);
  $("robotBox").setAttribute("aria-checked",String(state.robotChecked));
});
$("robotBox").addEventListener("keydown",e=>{
  if(e.key===" "||e.key==="Enter"){
    e.preventDefault();
    $("robotBox").click();
  }
});

$("verifyBtn").onclick=continueFromWelcome;
$("nameInput").addEventListener("keydown",e=>{
  if(e.key==="Enter")continueFromWelcome();
});
$("restartBtn").onclick=resetIdentity;

document.querySelectorAll("#classGrid .choice").forEach(b=>
  b.onclick=()=>selectClass(b.dataset.class)
);

$("ageInput").addEventListener("input",()=>{
  if($("ageInput").value.trim()!=="")validAge();
});

$("previewBtn").onclick=startProcessing;
$("downloadBtn").onclick=downloadCertificate;

$("viewBtn").onclick=()=>{
  const c=$("certificateCanvas");
  if(c.requestFullscreen)c.requestFullscreen().catch(()=>{});
};

$("themeBtn").onclick=()=>showScreen("themeScreen");

$("closeThemeBtn").onclick=()=>{
  if(state.certificateData)showScreen("readyScreen");
  else if(state.verified)showScreen("detailsScreen");
  else showScreen("welcomeScreen");
};

document.querySelectorAll(".theme").forEach(b=>
  b.onclick=()=>applyTheme(b.dataset.theme)
);

$("resetThemeBtn").onclick=()=>applyTheme("Cloud");

/* On load, check the Supabase session first. Logged-out visitors land on
   the auth screen; logged-in visitors who already generated a certificate
   on this device are routed straight to it, without re-entering their name. */
resetVisualCaptcha();
$("captchaRefresh").onclick=resetVisualCaptcha;
initHCaptcha();
routeAfterAuth();

sb.auth.onAuthStateChange((_event,session)=>{
  currentUser = session ? session.user : null;
  if(!currentUser && state.screen!=="authScreen"){
    $("logoutBtn").classList.add("hidden");
    showScreen("authScreen");
  }
});

window.__NSS_TEST__={
  normalizeName,
  allowedDesignations,
  renderCertificate,
  getDeviceRecord,
  state
};
