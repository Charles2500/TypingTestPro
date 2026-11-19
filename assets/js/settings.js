const theme=document.documentElement;
const themeSetting=document.getElementById('themeSetting');
const duration=document.getElementById('defaultDuration');
const difficulty=document.getElementById('defaultDifficulty');
const saved=JSON.parse(localStorage.getItem('typingPreferences')||'{}');
function applyTheme(dark){theme.setAttribute('data-theme',dark?'dark':'light');themeSetting.checked=dark;localStorage.setItem('typingTheme',dark?'dark':'light');}
applyTheme((localStorage.getItem('typingTheme')||'light')==='dark');
duration.value=saved.duration||'60';difficulty.value=saved.difficulty||'medium';
themeSetting.addEventListener('change',()=>applyTheme(themeSetting.checked));
document.getElementById('saveSettings').addEventListener('click',()=>{
 localStorage.setItem('typingPreferences',JSON.stringify({duration:duration.value,difficulty:difficulty.value}));
 const status=document.getElementById('settingsStatus');status.textContent='Preferences saved on this device.';
});
